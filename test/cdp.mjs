// Shared Chromium driver for the annotation tests: serve a fixture, launch the
// cached headless shell, expose evaluate() and a page-click helper.
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const CHROME = process.env.PICKER_CHROME ??
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell`;

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Extract a top-level function source (brace-matched) from the shipped bundle. */
export async function functionSource(file, name) {
  const text = await readFile(file, "utf8");
  const start = text.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`${name} not found in ${file}`);
  let depth = 0;
  let quote = null;
  for (let index = text.indexOf("{", start); index < text.length; index += 1) {
    const char = text[index];
    if (quote !== null) {
      if (char === "\\") { index += 1; continue; }
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") { quote = char; continue; }
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }
  throw new Error(`unbalanced ${name} source`);
}

function serve(htmlPath) {
  return new Promise((resolve) => {
    const server = createServer(async (request, response) => {
      const body = await readFile(htmlPath);
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(body);
    });
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    const pending = new Map();
    let nextId = 1;
    socket.addEventListener("error", reject);
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      const waiter = pending.get(message.id);
      if (!waiter) return;
      pending.delete(message.id);
      if (message.error) waiter.reject(new Error(`${message.error.message} (${message.error.code})`));
      else waiter.resolve(message.result);
    });
    socket.addEventListener("open", () => resolve({
      send(method, params = {}) {
        const id = nextId++;
        socket.send(JSON.stringify({ id, method, params }));
        return new Promise((accept, decline) => pending.set(id, { resolve: accept, reject: decline }));
      },
      close() { socket.close(); },
    }));
  });
}

/**
 * Serve `htmlPath` and open it in headless Chromium.
 * @returns {Promise<{ evaluate: (expression: string) => Promise<any>, clickAt: (selector: string, shift?: boolean) => Promise<any>, close: () => void }>}
 */
export async function launchPage(htmlPath) {
  const { server, port } = await serve(htmlPath);
  const chrome = spawn(CHROME, [
    "--headless", "--no-sandbox", "--disable-gpu", "--remote-debugging-port=0",
    "--window-size=1200,900", `http://127.0.0.1:${port}/`,
  ], { stdio: ["ignore", "pipe", "pipe"] });

  let wsUrl = "";
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("chromium did not report a devtools endpoint")), 15000);
    chrome.stderr.on("data", (chunk) => {
      const match = String(chunk).match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match && wsUrl === "") { wsUrl = match[1]; clearTimeout(timer); resolve(); }
    });
    chrome.on("exit", (code) => reject(new Error(`chromium exited early: ${code}`)));
  });

  const httpPort = new URL(wsUrl).port;
  let pageSocket = "";
  for (let attempt = 0; attempt < 40 && pageSocket === ""; attempt += 1) {
    const list = await (await fetch(`http://127.0.0.1:${httpPort}/json/list`)).json();
    const page = list.find((target) => target.type === "page" && target.url.startsWith("http://127.0.0.1:"));
    if (page) pageSocket = page.webSocketDebuggerUrl;
    else await sleep(100);
  }
  if (pageSocket === "") throw new Error("page target unavailable");

  const client = await connect(pageSocket);
  await client.send("Runtime.enable");
  await sleep(150);

  const evaluate = async (expression) => {
    const result = await client.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text + " " + JSON.stringify(result.exceptionDetails.exception?.description ?? ""));
    }
    return result.result.value;
  };

  const clickAt = (selector, shift = false) => evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    document.body.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: x, clientY: y }));
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: x, clientY: y, shiftKey: ${shift ? "true" : "false"} }));
    return { x, y };
  })();`);

  return {
    evaluate,
    clickAt,
    close() {
      client.close();
      chrome.kill("SIGKILL");
      server.close();
    },
  };
}

/** Localized guest copy used by the tests. */
export const GUEST_TEXTS = {
  hint: "点击选择元素 · Shift 点击可多选 · Enter 填入 · ⌘Enter 直接发送 · Esc 退出",
  cardHint: "Shift 多选 · Enter 填入 · ⌘Enter 发送",
  placeholder: "添加评论…",
  design: "设计模式",
  designHint: "只改行内样式，取消即还原",
  cancel: "取消",
  apply: "应用",
  fill: "填入输入框",
  send: "直接发送",
  close: "关闭",
  selected: "已选择 {count} 项",
  remove: "移除",
  empty: "（无可见文本）",
  labels: {
    color: "文本颜色", background: "背景", opacity: "不透明度", fontSize: "字号", fontWeight: "字重",
    radius: "边框圆角半径", borderColor: "边框颜色", borderWidth: "边框宽度", width: "宽度", height: "高度",
    padding: "内边距", margin: "外边距", direction: "布局方向", justify: "分布", align: "对齐", gap: "间距",
  },
  directions: [["row", "水平"], ["column", "垂直"], ["row-reverse", "水平（反向）"], ["column-reverse", "垂直（反向）"]],
  justifyOptions: [["flex-start", "起始"], ["center", "居中"], ["flex-end", "末尾"], ["space-between", "两端对齐"], ["space-around", "环绕分布"]],
  alignOptions: [["stretch", "拉伸"], ["flex-start", "起始"], ["center", "居中"], ["flex-end", "末尾"]],
};

/** Start a session on the current page and return the promise handle. */
export function startSession(guestSource, texts = GUEST_TEXTS) {
  return `window.__r = undefined; window.__p = (${guestSource})({ texts: ${JSON.stringify(texts)} }); window.__p.then((value) => { window.__r = value; }); "started";`;
}
