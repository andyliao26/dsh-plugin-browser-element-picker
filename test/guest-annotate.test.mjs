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
assert.equal(await evaluate(client, `${SR}.querySelectorAll('[data-role="chip"]').length`), 1, "one chip for one target");
assert.equal(await evaluate(client, `${SR}.querySelector('[data-role="send"]') === null`), true, "a single submit button, no separate send button");
assert.equal(await evaluate(client, `(${SR}.querySelector('[data-role="card"]').textContent || "").includes("已选择")`), false, "no selected-count line");
assert.match(await evaluate(client, `${SR}.querySelector('[data-role="fill"]').title`), /⌘\/Ctrl\+Enter/, "hover title carries the send shortcut");
assert.equal(await evaluate(client, `${SR}.querySelectorAll('[data-mark="badge"]').length`), 1, "one mark for one target");
assert.equal(await evaluate(client, `${SR}.querySelectorAll('[data-mark="box"]').length`), 1);

// Replacing the selection must clear the previous mark, not leave it orphaned.
await clickPage(".tags span.hot");
assert.equal(await evaluate(client, `${SR}.querySelectorAll('[data-mark="badge"]').length`), 1, "replacing the target clears the old mark");
assert.equal(await evaluate(client, `${SR}.querySelectorAll('[data-mark="box"]').length`), 1);
assert.equal(await evaluate(client, `${SR}.querySelectorAll('[data-role="chip"]').length`), 1, "replacing the target keeps one chip");
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
assert.equal(await evaluate(client, `${SR}.querySelectorAll('[data-role="chip"]').length`), 2, "two chips for two targets");
await typeComment("这两个一起改");
await keyInCard("Enter", '{ metaKey: true }');
await sleep(80);
const multi = await evaluate(client, "window.__r");
assert.equal(multi.submit, true, "Cmd+Enter asks the host to send");
assert.equal(multi.targets.length, 2);
assert.deepEqual(multi.targets.map((target) => target.tag), ["button", "span"]);
assert.equal(multi.comment, "这两个一起改");

// ---------------------------------------------------------------- 3. design mode records intent
assert.equal(await evaluate(client, START), "started");
await clickPage("#target");
await role("design", "click");
assert.equal(await role("design-panel"), "flex", "design panel opens");
assert.equal(await role("card"), "none", "the comment card yields to the panel");
assert.equal(await evaluate(client, `${SR}.querySelectorAll('[data-field]').length`), 16, "every design field renders");

assert.equal(await evaluate(client, `${SR}.querySelector('[data-role="design-comment"]').placeholder`), GUEST_TEXTS.designPlaceholder, "the panel carries a description field");

const dragged = await evaluate(client, `(() => {
  const panel = ${SR}.querySelector('[data-role="design-panel"]');
  const handle = ${SR}.querySelector('[data-role="design-drag"]');
  const frame = handle.getBoundingClientRect();
  const before = panel.getBoundingClientRect();
  const point = (type, x, y) => handle.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 7, button: 0, clientX: x, clientY: y }));
  point("pointerdown", frame.left + 12, frame.top + 8);
  point("pointermove", frame.left + 52, frame.top + 48);
  point("pointerup", frame.left + 52, frame.top + 48);
  const after = panel.getBoundingClientRect();
  return { dx: Math.round(after.left - before.left), dy: Math.round(after.top - before.top) };
})();`);
assert.deepEqual(dragged, { dx: 40, dy: 40 }, "dragging the header moves the panel");

const echoed = await evaluate(client, `(() => {
  const field = (name, selector = "input") => ${SR}.querySelector('[data-field="' + name + '"] ' + selector);
  return {
    width: field("width").value,
    color: field("color").value,
    justify: field("justify", "select").value,
    justifyOptions: Array.from(field("justify", "select").options).map((option) => option.value),
    gapPlaceholder: field("gap").placeholder,
    padding: Array.from(${SR}.querySelectorAll('[data-field="padding"] input')).map((input) => input.value),
    computedWidth: getComputedStyle(document.querySelector("#target")).width
  };
})()`);
assert.equal(echoed.width, "91.3", "width echoes the rendered value with one decimal");
assert.equal(echoed.color, "#ffffff", "color echoes the computed color");
assert.equal(echoed.justify, "normal", "a value missing from the option list is preserved");
assert.ok(echoed.justifyOptions.includes("normal"), "the current value is inserted as an option");
assert.equal(echoed.gapPlaceholder, "normal", "a non-numeric value stays visible as a placeholder");
assert.deepEqual(echoed.padding, ["10", "18", "10", "18"], "all four computed padding sides are echoed");
assert.equal(echoed.computedWidth, "91.3281px", "the panel baseline is the page's rendered width");
assert.equal(await evaluate(client, "document.querySelector('#target').getAttribute('style')"), null, "opening the panel writes no inline style");

await evaluate(client, `(() => {
  const set = (name, value) => {
    const input = ${SR}.querySelector('[data-field="' + name + '"] input');
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };
  set("width", "500");
  set("color", "#112233");
  const padding = ${SR}.querySelectorAll('[data-field="padding"] input');
  padding[0].value = "20";
  padding[0].dispatchEvent(new Event("input", { bubbles: true }));
  const justify = ${SR}.querySelector('[data-field="justify"] select');
  justify.value = "flex-end";
  justify.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
})();`);

const rows = await evaluate(client, `(() => {
  const width = ${SR}.querySelector('[data-field="width"]');
  const height = ${SR}.querySelector('[data-field="height"]');
  const strip = ${SR}.querySelector('[data-role="design-drag"]');
  const stripStyle = getComputedStyle(strip);
  return {
    changed: width.style.background,
    untouched: height.style.background,
    rowMargin: getComputedStyle(width).marginTop,
    stripLeft: stripStyle.marginLeft,
    stripRight: stripStyle.marginRight
  };
})()`);
assert.notEqual(rows.changed, rows.untouched, "changed rows are tinted apart from untouched rows");
assert.equal(rows.untouched, "transparent", "untouched rows keep the plain background");
assert.equal(rows.rowMargin, "2px", "rows keep vertical breathing room");
assert.deepEqual([rows.stripLeft, rows.stripRight], ["0px", "0px"], "the drag strip spans the full panel width");

const untouched = await evaluate(client, `(() => {
  const element = document.querySelector("#target");
  return {
    inline: element.getAttribute("style") || "",
    width: getComputedStyle(element).width,
    color: getComputedStyle(element).color,
    box: element.getBoundingClientRect().width
  };
})()`);
assert.equal(untouched.inline, "", "editing writes no inline style");
assert.equal(untouched.width, "91.3281px", "the rendered width is untouched");
assert.equal(untouched.color, "rgb(255, 255, 255)", "the rendered color is untouched");
assert.equal(untouched.box, 91.328125, "the geometry is untouched");

await evaluate(client, `(() => {
  const note = ${SR}.querySelector('[data-role="design-comment"]');
  note.value = "宽度和颜色一起调";
  note.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
})();`);

await role("design-apply", "click");
assert.equal(await role("design-panel"), "none", "apply closes the panel");
assert.equal(await role("card"), "block", "the comment card returns");
assert.equal(await evaluate(client, `${SR}.querySelector('[data-role="comment"]').value`), "宽度和颜色一起调", "the panel description carries back to the card comment");
const deltaText = await evaluate(client, `${SR}.querySelector('[data-role="deltas"]').textContent`);
assert.match(deltaText, /width: 91\.3px → 500px/);
assert.match(deltaText, /color: #ffffff → #112233/);
assert.match(deltaText, /padding-top: 10px → 20px/);
assert.match(deltaText, /justify-content: normal → flex-end/);
assert.equal(await evaluate(client, "document.querySelector('#target').getAttribute('style')"), null, "apply still writes no inline style");
assert.equal(await evaluate(client, "getComputedStyle(document.querySelector('#target')).width"), "91.3281px", "apply leaves computed styles untouched");
assert.equal(await evaluate(client, "document.querySelector('#target').getBoundingClientRect().width"), 91.328125, "apply leaves geometry untouched");

// Reopening keeps the committed target values and the original baseline.
await role("design", "click");
assert.equal(await evaluate(client, `${SR}.querySelector('[data-field="width"] input').value`), "500", "reopen seeds the committed value");
await evaluate(client, `(() => {
  const input = ${SR}.querySelector('[data-field="width"] input');
  input.value = "460";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
})();`);
await role("design-cancel", "click");
assert.match(await evaluate(client, `${SR}.querySelector('[data-role="deltas"]').textContent`), /width: 91\.3px → 500px/, "cancelling a later draft keeps the committed delta");

// Applying a later draft still reports the page baseline as `from`.
await role("design", "click");
await evaluate(client, `(() => {
  const input = ${SR}.querySelector('[data-field="width"] input');
  input.value = "460";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
})();`);
await role("design-apply", "click");
assert.match(await evaluate(client, `${SR}.querySelector('[data-role="deltas"]').textContent`), /width: 91\.3px → 460px/, "a new draft is measured against the baseline, not the last commit");

await keyInCard("Enter");
await sleep(80);
const designed = await evaluate(client, "window.__r");
assert.equal(designed.ok, true);
assert.equal(designed.comment, "宽度和颜色一起调", "the panel description reaches the host payload");
assert.deepEqual(designed.design[0].changes, [
  { property: "width", from: "91.3px", to: "460px" },
  { property: "color", from: "#ffffff", to: "#112233" },
  { property: "padding-top", from: "10px", to: "20px" },
  { property: "justify-content", from: "normal", to: "flex-end" }
]);

// ---------------------------------------------------------------- 3b. the first baseline sticks
assert.equal(await evaluate(client, START), "started");
await clickPage("#target");
await role("design", "click");
await evaluate(client, `(() => {
  const input = ${SR}.querySelector('[data-field="width"] input');
  input.value = "480";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
})();`);
await role("design-apply", "click");
await evaluate(client, 'document.querySelector("#target").style.width = "200px"; true');
await role("design", "click");
assert.equal(await evaluate(client, `${SR}.querySelector('[data-field="width"] input').value`), "480", "reopen seeds the committed value");
await evaluate(client, `(() => {
  const input = ${SR}.querySelector('[data-field="width"] input');
  input.value = "";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("blur"));
  return input.value;
})();`);
assert.equal(await evaluate(client, `${SR}.querySelector('[data-field="width"] input').value`), "91.3", "clearing and blurring restores the baseline, not the committed value");

// A rejected negative value must not leave a hidden committed delta behind.
await role("design-cancel", "click");
await role("design", "click");
await evaluate(client, `(() => {
  const input = ${SR}.querySelector('[data-field="width"] input');
  input.value = "-5";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("blur"));
  return input.value;
})();`);
assert.equal(await evaluate(client, `${SR}.querySelector('[data-field="width"] input').value`), "91.3", "a rejected negative falls back to the baseline");
await role("design-apply", "click");
assert.equal(await evaluate(client, `${SR}.querySelector('[data-role="deltas"]').style.display`), "none", "the rejected value clears the committed delta");

await role("design", "click");
await evaluate(client, `(() => {
  const input = ${SR}.querySelector('[data-field="width"] input');
  input.value = "400";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
})();`);
await role("design-apply", "click");
assert.match(await evaluate(client, `${SR}.querySelector('[data-role="deltas"]').textContent`), /width: 91\.3px → 400px/, "the from value is the first baseline even after the page changed");
await keyInCard("Enter");
await sleep(80);
const rebased = await evaluate(client, "window.__r");
assert.deepEqual(rebased.design[0].changes, [{ property: "width", from: "91.3px", to: "400px" }]);
await evaluate(client, 'document.querySelector("#target").style.removeProperty("width"); true');

// ---------------------------------------------------------------- 4. cancel and invalid input leave no delta
assert.equal(await evaluate(client, START), "started");
await clickPage(".tags span.hot");
await role("design", "click");
assert.equal(await evaluate(client, `${SR}.querySelector('[data-field="background"] [data-role="color-value"]').textContent`), "transparent", "a transparent background is echoed as transparent");
assert.match(await evaluate(client, `${SR}.querySelector('[data-field="background"] [data-role="swatch"]').style.backgroundImage`), /repeating-conic-gradient/, "a transparent swatch is not painted black");
await evaluate(client, `(() => {
  const input = ${SR}.querySelector('[data-field="width"] input');
  input.value = "420";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
})();`);
assert.equal(await evaluate(client, `${SR}.querySelector('[data-role="deltas"]').style.display`), "none", "no delta is shown before apply");
await role("design-cancel", "click");
assert.equal(await evaluate(client, "document.querySelector('.tags span.hot').getAttribute('style')"), null, "cancel leaves the page untouched");
assert.equal(await evaluate(client, `${SR}.querySelector('[data-role="deltas"]').style.display`), "none", "cancel shows no delta on the card");

// Clearing and out-of-range input must not manufacture deltas.
await role("design", "click");
await evaluate(client, `(() => {
  const width = ${SR}.querySelector('[data-field="width"] input');
  width.value = "420";
  width.dispatchEvent(new Event("input", { bubbles: true }));
  width.value = "";
  width.dispatchEvent(new Event("input", { bubbles: true }));
  width.value = "-5";
  width.dispatchEvent(new Event("input", { bubbles: true }));
  const opacity = ${SR}.querySelector('[data-field="opacity"] input');
  opacity.value = "2";
  opacity.dispatchEvent(new Event("input", { bubbles: true }));
  const color = ${SR}.querySelector('[data-field="color"] input');
  color.value = "#000000";
  color.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
})();`);
await role("design-apply", "click");
assert.equal(await evaluate(client, `${SR}.querySelector('[data-role="deltas"]').style.display`), "none", "invalid input produces no delta");
await keyInCard("Enter");
await sleep(80);
const cancelled = await evaluate(client, "window.__r");
assert.equal(cancelled.ok, true);
assert.equal(cancelled.design.length, 0, "a discarded or invalid draft never reaches the payload");

// ---------------------------------------------------------------- 4b. design Esc discards the draft
assert.equal(await evaluate(client, START), "started");
await clickPage(".tags span.hot");
await role("design", "click");
await evaluate(client, `(() => {
  const input = ${SR}.querySelector('[data-field="width"] input');
  input.value = "420";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
  return true;
})();`);
assert.equal(await role("design-panel"), "none", "Esc leaves design mode");
assert.equal(await role("card"), "block", "Esc returns to the card");
assert.equal(await evaluate(client, `${SR}.querySelector('[data-role="deltas"]').style.display`), "none", "Esc discards the draft");
assert.equal(await evaluate(client, "getComputedStyle(document.querySelector('.tags span.hot')).width"), "31.7656px");
await evaluate(client, "window.__dshAnnotationState.cancel(); true");

// ---------------------------------------------------------------- 4c. many deltas scroll; alpha colors echo faithfully
assert.equal(await evaluate(client, START), "started");
await evaluate(client, 'document.querySelector("#target").style.backgroundColor = "rgba(0, 0, 0, 0.5)"; true');
await clickPage("#target");
await role("design", "click");
assert.equal(await evaluate(client, `${SR}.querySelector('[data-field="background"] [data-role="color-value"]').textContent`), "rgba(0, 0, 0, 0.5)", "a translucent background keeps its alpha value");
await evaluate(client, `(() => {
  const set = (name, value) => {
    const input = ${SR}.querySelector('[data-field="' + name + '"] input');
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };
  set("width", "300");
  set("height", "50");
  set("font-size", "16");
  set("border-radius", "10");
  set("border-width", "2");
  set("gap", "8");
  const padding = ${SR}.querySelectorAll('[data-field="padding"] input');
  padding[0].value = "12";
  padding[0].dispatchEvent(new Event("input", { bubbles: true }));
  const margin = ${SR}.querySelectorAll('[data-field="margin"] input');
  margin[0].value = "12";
  margin[0].dispatchEvent(new Event("input", { bubbles: true }));
  set("opacity", "0.9");
  return true;
})();`);
await role("design-apply", "click");
const cardScroll = await evaluate(client, `(() => {
  const area = ${SR}.querySelector('[data-role="deltas"]');
  area.scrollTop = area.scrollHeight;
  const apply = ${SR}.querySelector('[data-role="design"]').getBoundingClientRect();
  return { client: area.clientHeight, total: area.scrollHeight, top: area.scrollTop, visible: apply.top >= 0 && apply.bottom <= innerHeight };
})()`);
assert.ok(cardScroll.total > cardScroll.client, "the card's delta area scrolls when there are many deltas");
assert.ok(cardScroll.top > 0, "the delta area scrolls to the end");
assert.ok(cardScroll.visible, "the card's edit action stays reachable");
await evaluate(client, "window.__dshAnnotationState.cancel(); true");
await evaluate(client, 'document.querySelector("#target").style.removeProperty("background-color"); true');

// ---------------------------------------------------------------- 5. Esc walks back
assert.equal(await evaluate(client, START), "started");
await clickPage("#target");
await keyInCard("Escape");
assert.equal(await role("card"), "none", "Esc drops the selection first");
assert.equal(await evaluate(client, "window.__r === undefined"), true, "the session is still running");
await evaluate(client, `document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })); true;`);
await sleep(80);
assert.equal((await evaluate(client, "window.__r")).reason, "cancel");

// ---------------------------------------------------------------- 6. deltas stay bound to their element
assert.equal(await evaluate(client, START), "started");
await clickPage("#first");
await clickPage("#target", true);
await clickPage(".tags span.hot", true);
assert.equal(await evaluate(client, `${SR}.querySelectorAll('[data-role="chip"]').length`), 3, "three chips for three targets");
for (const index of [0, 1, 2]) {
  await evaluate(client, `${SR}.querySelectorAll('[data-role="chip"]')[${index}].click(); true;`);
  await role("design", "click");
  await evaluate(client, `(() => {
    const input = ${SR}.querySelector('[data-field="width"] input');
    input.value = "${300 + index * 10}";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  })();`);
  await role("design-apply", "click");
}
await evaluate(client, `${SR}.querySelectorAll('[data-role="chip-remove"]')[0].click(); true;`);
assert.equal(await evaluate(client, `${SR}.querySelectorAll('[data-role="chip"]').length`), 2, "removing one chip leaves two");
await keyInCard("Enter");
await sleep(80);
const bound = await evaluate(client, "window.__r");
assert.equal(bound.targets.length, 2);
assert.equal(bound.design.length, 2);
assert.equal(bound.design[0].index, 0);
assert.equal(bound.design[0].selector, bound.targets[0].selector);
assert.equal(bound.design[0].changes[0].to, "310px", "the middle target keeps its own delta");
assert.equal(bound.design[1].index, 1);
assert.equal(bound.design[1].selector, bound.targets[1].selector, "the delta follows the element, not the old index");
assert.equal(bound.design[1].changes[0].to, "320px", "the last target keeps its own delta");

// ---------------------------------------------------------------- 7. short viewport scrolls
assert.equal(await evaluate(client, START), "started");
await clickPage("#target");
await role("design", "click");
await evaluate(client, "window.resizeTo(1000, 520); true");
await sleep(120);
const scroll = await evaluate(client, `(() => {
  const body = ${SR}.querySelector('[data-role="design-body"]');
  body.scrollTop = body.scrollHeight;
  const footer = ${SR}.querySelector('[data-role="design-apply"]').getBoundingClientRect();
  const cancel = ${SR}.querySelector('[data-role="design-cancel"]').getBoundingClientRect();
  const last = ${SR}.querySelector('[data-field="gap"]').getBoundingClientRect();
  return {
    client: body.clientHeight,
    total: body.scrollHeight,
    top: body.scrollTop,
    footerTop: footer.top,
    footerBottom: footer.bottom,
    cancelTop: cancel.top,
    cancelBottom: cancel.bottom,
    lastTop: last.top,
    lastBottom: last.bottom,
    viewport: innerHeight
  };
})()`);
assert.ok(scroll.total > scroll.client, "the panel body is scrollable at a short viewport");
assert.ok(scroll.top > 0, "the panel body scrolls to the end");
assert.ok(scroll.footerTop >= 0 && scroll.footerBottom <= scroll.viewport, "apply stays reachable");
assert.ok(scroll.cancelTop >= 0 && scroll.cancelBottom <= scroll.viewport, "cancel stays reachable");
assert.ok(scroll.lastTop >= 0 && scroll.lastBottom <= scroll.viewport, "the last field is reachable");
await evaluate(client, "window.__dshAnnotationState.cancel(); true");
await evaluate(client, "window.resizeTo(1200, 900); true");
await sleep(120);

// ---------------------------------------------------------------- 8. keyboard keeps buttons, IME and design mode intact
assert.equal(await evaluate(client, START), "started");
await clickPage("#target");
await evaluate(client, `(() => {
  ${SR}.querySelector('[data-role="design"]').dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
  return true;
})();`);
assert.equal(await evaluate(client, "window.__r === undefined"), true, "a synthetic Enter on a button does not submit the session");

// A real Enter on the focused edit button activates it instead of submitting.
await evaluate(client, `${SR}.querySelector('[data-role="design"]').focus(); true`);
const focusInfo = await evaluate(client, `${SR}.activeElement ? ${SR}.activeElement.tagName + ":" + ${SR}.activeElement.getAttribute("data-role") : "none"`);
const down = await client.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", text: "\r", unmodifiedText: "\r", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
await client.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 });
await sleep(80);
assert.equal(await role("design-panel"), "flex", `Enter on the focused edit button opens the design panel (focus=${focusInfo}, down=${JSON.stringify(down)})`);
assert.equal(await evaluate(client, "window.__r === undefined"), true, "the session stays open");
await role("design-cancel", "click");

await evaluate(client, `(() => {
  const area = ${SR}.querySelector('[data-role="comment"]');
  const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
  Object.defineProperty(event, "isComposing", { value: true });
  area.dispatchEvent(event);
  return true;
})();`);
assert.equal(await evaluate(client, "window.__r === undefined"), true, "an overlay IME Enter is ignored");
await evaluate(client, `(() => {
  const modern = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
  Object.defineProperty(modern, "isComposing", { value: true });
  document.body.dispatchEvent(modern);
  const legacy = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
  Object.defineProperty(legacy, "keyCode", { value: 229 });
  document.body.dispatchEvent(legacy);
  return true;
})();`);
assert.equal(await evaluate(client, "window.__r === undefined"), true, "a page-level IME Enter is ignored");
await keyInCard("Escape");
await sleep(60);
await evaluate(client, `document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })); true;`);
await sleep(80);

assert.equal(await evaluate(client, START), "started");
await clickPage("#target");
await role("design", "click");
await evaluate(client, `(() => {
  const input = ${SR}.querySelector('[data-field="width"] input');
  input.value = "333";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
  return true;
})();`);
assert.equal(await role("design-panel"), "flex", "page-level Enter leaves design mode open");
assert.equal(await evaluate(client, "window.__r === undefined"), true, "page-level Enter does not finish the session");
await role("design-apply", "click");
await keyInCard("Enter");
await sleep(80);
const afterEnter = await evaluate(client, "window.__r");
assert.ok(afterEnter.design[0].changes.some((delta) => delta.to === "333px"), "the draft survived the page-level Enter");

// ---------------------------------------------------------------- 9. the page's cursor is restored
await evaluate(client, 'document.documentElement.style.cursor = "pointer"; document.documentElement.style.userSelect = "text"; true');
assert.equal(await evaluate(client, START), "started");
assert.equal(await evaluate(client, "document.documentElement.style.cursor"), "crosshair", "picking uses the crosshair cursor");
await clickPage("#target");
assert.equal(await evaluate(client, "document.documentElement.style.cursor"), "pointer", "the page cursor returns outside picking");
await keyInCard("Enter");
await sleep(80);
assert.equal(await evaluate(client, "document.documentElement.style.cursor"), "pointer", "the session restores the page cursor");
assert.equal(await evaluate(client, "document.documentElement.style.userSelect"), "text", "the page user-select is restored");
await evaluate(client, 'document.documentElement.style.removeProperty("cursor"); document.documentElement.style.removeProperty("user-select"); true');

// ---------------------------------------------------------------- 10. detached targets are dropped
assert.equal(await evaluate(client, START), "started");
await clickPage("#first");
await clickPage("#target", true);
await role("design", "click");
await evaluate(client, `(() => {
  const input = ${SR}.querySelector('[data-field="width"] input');
  input.value = "300";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
})();`);
await role("design-apply", "click");
await evaluate(client, 'document.querySelector("#target").remove(); true');
await keyInCard("Enter");
await sleep(80);
const detached = await evaluate(client, "window.__r");
assert.equal(detached.ok, true);
assert.equal(detached.targets.length, 1, "the detached target is omitted");
assert.equal(detached.targets[0].selector, "#first");
assert.equal(detached.design.length, 0);

// ---------------------------------------------------------------- 11. React-shaped markup
assert.equal(await evaluate(client, START), "started");
await clickPage('[data-testid="reanalyze"]');
await keyInCard("Enter");
await sleep(80);
const byAttribute = await evaluate(client, "window.__r");
assert.equal(byAttribute.targets[0].selector, 'button[data-testid="reanalyze"]', "a stable data-* attribute beats hashed classes");
assert.deepEqual(
  byAttribute.targets[0].react,
  { component: "Toolbar", source: "src/components/Toolbar.tsx:42" },
  "component and source come from the fiber chain",
);

assert.equal(await evaluate(client, START), "started");
await clickPage("#first");
await keyInCard("Enter");
await sleep(80);
const noMetadata = await evaluate(client, "window.__r");
assert.equal(noMetadata.targets[0].react, null, "a page without React metadata reports no identity");

assert.equal(await evaluate(client, START), "started");
await clickPage("#source-only");
await keyInCard("Enter");
await sleep(80);
const sourceOnly = await evaluate(client, "window.__r");
assert.equal(sourceOnly.targets[0].react, null, "a source location without a component name is dropped");

assert.equal(await evaluate(client, START), "started");
await clickPage("#minified-name");
await keyInCard("Enter");
await sleep(80);
const minified = await evaluate(client, "window.__r");
assert.equal(minified.targets[0].react, null, "a minified component name is rejected");

assert.equal(await evaluate(client, START), "started");
await clickPage("._label_4f8c");
await keyInCard("Enter");
await sleep(80);
const byFallback = await evaluate(client, "window.__r");
const fallbackSelector = byFallback.targets[0].selector;
assert.equal(fallbackSelector.includes("_label_"), false, "a generated class is dropped");
assert.match(fallbackSelector, / span$/, "the generated class falls back to the element path");

assert.equal(await evaluate(client, START), "started");
await clickPage("div.flex.items-center");
await keyInCard("Enter");
await sleep(80);
const utilityOnly = await evaluate(client, "window.__r");
const utilitySelector = utilityOnly.targets[0].selector;
assert.equal(/\.(flex|items-center|gap-2)\b/.test(utilitySelector), false, "utility class names are dropped");

assert.equal(await evaluate(client, START), "started");
await clickPage("div.order-card");
await keyInCard("Enter");
await sleep(80);
const mixedClasses = await evaluate(client, "window.__r");
const mixedSelector = mixedClasses.targets[0].selector;
assert.match(mixedSelector, /\.order-card/, "a semantic class survives");
assert.equal(/\.(flex|p-4)\b/.test(mixedSelector), false, "utilities next to it are dropped");

client.close();
chrome.kill("SIGKILL");
server.close();
console.log("guest annotation OK");
