// Drives a real Chromium through a full annotation session: pick, shift-multi,
// the comment card, design mode, and both finish gestures (Enter / Cmd+Enter).
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { GUEST_TEXTS, startSession } from "./cdp.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHROME = process.env.PICKER_CHROME ??
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Extract the guestAnnotate function source from the shipped bundle. */
async function guestSource() {
  const text = await readFile(path.join(HERE, "../lib/client.js"), "utf8");
  const start = text.indexOf("function guestAnnotate(");
  assert.ok(start > 0, "guestAnnotate found in the bundle");
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
  throw new Error("unbalanced guestAnnotate source");
}

function serve() {
  return new Promise((resolve) => {
    const server = createServer(async (request, response) => {
      const body = await readFile(path.join(HERE, "fixture.html"));
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

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text + " " + JSON.stringify(result.exceptionDetails.exception?.description ?? ""));
  }
  return result.result.value;
}

const guest = await guestSource();
const { server, port } = await serve();
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
assert.ok(pageSocket !== "", "page target available");

const client = await connect(pageSocket);
await client.send("Runtime.enable");
await sleep(150);

const SR = `document.querySelector('[data-dsh-annotation]').shadowRoot`;
const START = startSession(guest, GUEST_TEXTS);

const clickPage = (selector, shift = false) => evaluate(client, `(() => {
  const element = document.querySelector(${JSON.stringify(selector)});
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  document.body.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: x, clientY: y }));
  document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: x, clientY: y, shiftKey: ${shift ? "true" : "false"} }));
  return { x, y };
})();`);

const typeComment = (text) => evaluate(client, `(() => {
  const area = ${SR}.querySelector('[data-role="comment"]');
  area.value = ${JSON.stringify(text)};
  area.dispatchEvent(new Event("input", { bubbles: true }));
  return area.value;
})();`);

const keyInCard = (key, options = "{}") => evaluate(client, `(() => {
  const area = ${SR}.querySelector('[data-role="comment"]');
  area.dispatchEvent(new KeyboardEvent("keydown", Object.assign({ key: ${JSON.stringify(key)}, bubbles: true, cancelable: true }, ${options})));
  return true;
})();`);

const role = (name, method = "") => evaluate(client, `(() => {
  const element = ${SR}.querySelector('[data-role="${name}"]');
  if (!element) return "missing";
  ${method === "click" ? "element.click();" : ""}
  return element.style.display;
})();`);

// ---------------------------------------------------------------- 1. pick + comment
assert.equal(await evaluate(client, START), "started");
await clickPage("#target");
assert.equal(await role("card"), "block", "the comment card opens on the first pick");
assert.match(await evaluate(client, `${SR}.querySelector('[data-role="card"]').textContent`), /已选择 1 项/);
assert.equal(await evaluate(client, `${SR}.querySelectorAll('[data-mark="badge"]').length`), 1, "one mark for one target");
assert.equal(await evaluate(client, `${SR}.querySelectorAll('[data-mark="box"]').length`), 1);

// Replacing the selection must clear the previous mark, not leave it orphaned.
await clickPage(".tags span.hot");
assert.equal(await evaluate(client, `${SR}.querySelectorAll('[data-mark="badge"]').length`), 1, "replacing the target clears the old mark");
assert.equal(await evaluate(client, `${SR}.querySelectorAll('[data-mark="box"]').length`), 1);
assert.match(await evaluate(client, `${SR}.querySelector('[data-role="card"]').textContent`), /已选择 1 项/);
await clickPage("#target");
assert.equal(await evaluate(client, `document.querySelector('#target').getBoundingClientRect().width > 0`), true);

await typeComment("把按钮改成品牌蓝");
assert.equal(await keyInCard("Enter"), true);
await sleep(80);

const single = await evaluate(client, "window.__r");
assert.equal(single.ok, true);
assert.equal(single.submit, false, "Enter fills the prompt instead of sending");
assert.equal(single.targets.length, 1);
assert.equal(single.targets[0].selector, "#target");
assert.equal(single.targets[0].text, "提交订单");
assert.equal(single.comment, "把按钮改成品牌蓝");
assert.equal(single.design.length, 0);
assert.equal(await evaluate(client, "document.querySelector('[data-dsh-annotation]') === null"), true, "overlay removed after the session");
assert.equal(await evaluate(client, "window.__pageClicks"), 0, "page clicks stay swallowed for the whole session");

// ---------------------------------------------------------------- 2. shift multi-select
assert.equal(await evaluate(client, START), "started");
await clickPage("#target");
await clickPage(".tags span.hot", true);
assert.match(await evaluate(client, `${SR}.querySelector('[data-role="card"]').textContent`), /已选择 2 项/);
await typeComment("这两个一起改");
await keyInCard("Enter", '{ metaKey: true }');
await sleep(80);
const multi = await evaluate(client, "window.__r");
assert.equal(multi.submit, true, "Cmd+Enter asks the host to send");
assert.equal(multi.targets.length, 2);
assert.deepEqual(multi.targets.map((target) => target.tag), ["button", "span"]);
assert.equal(multi.comment, "这两个一起改");

// ---------------------------------------------------------------- 3. design mode
assert.equal(await evaluate(client, START), "started");
await clickPage("#target");
await role("design", "click");
assert.equal(await role("design-panel"), "flex", "design panel opens");
assert.equal(await role("card"), "none", "the comment card yields to the panel");
assert.equal(await evaluate(client, `${SR}.querySelectorAll('[data-field]').length`), 16, "every design field renders");

await evaluate(client, `(() => {
  const width = ${SR}.querySelector('[data-field="width"] input');
  width.value = "500";
  width.dispatchEvent(new Event("input", { bubbles: true }));
  const color = ${SR}.querySelector('[data-field="color"] input');
  color.value = "#112233";
  color.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
})();`);

const applied = await evaluate(client, `({
  width: document.querySelector('#target').style.width,
  color: document.querySelector('#target').style.color
})`);
assert.equal(applied.width, "500px", "design edits apply live to the page");
assert.equal(applied.color, "rgb(17, 34, 51)", "color edits apply live to the page");

await role("design-apply", "click");
assert.equal(await role("design-panel"), "none", "apply closes the panel");
assert.equal(await role("card"), "block", "the comment card returns");
await keyInCard("Enter");
await sleep(80);
const designed = await evaluate(client, "window.__r");
assert.equal(designed.ok, true);
assert.equal(designed.design.length, 1);
assert.equal(designed.design[0].index, 0);
assert.ok(designed.design[0].changes.some((entry) => entry === "width: 500px"), `width delta recorded: ${designed.design[0].changes}`);

// ---------------------------------------------------------------- 4. design cancel reverts
assert.equal(await evaluate(client, START), "started");
await clickPage(".tags span.hot");
await role("design", "click");
await evaluate(client, `(() => {
  const input = ${SR}.querySelector('[data-field="width"] input');
  input.value = "420";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
})();`);
assert.equal(await evaluate(client, "document.querySelector('.tags span.hot').style.width"), "420px");
await role("design-cancel", "click");
assert.equal(await evaluate(client, "document.querySelector('.tags span.hot').style.width"), "", "cancel restores the inline style");
await keyInCard("Escape");
await sleep(60);
await evaluate(client, `document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })); true;`);
await sleep(80);
assert.deepEqual(await evaluate(client, "window.__r"), { ok: false, reason: "cancel" }, "a second Esc ends the session");

// ---------------------------------------------------------------- 5. Esc walks back
assert.equal(await evaluate(client, START), "started");
await clickPage("#target");
await keyInCard("Escape");
assert.equal(await role("card"), "none", "Esc drops the selection first");
assert.equal(await evaluate(client, "window.__r === undefined"), true, "the session is still running");
await evaluate(client, `document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })); true;`);
await sleep(80);
assert.equal((await evaluate(client, "window.__r")).reason, "cancel");

client.close();
chrome.kill("SIGKILL");
server.close();
console.log("guest annotation OK");
