// End-to-end payload contract: a REAL descriptor produced by the guest in Chromium
// is fed to the REAL host formatter. Unit tests with hand-written fixtures cannot
// catch a missing descriptor field; this one can.
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { functionSource, launchPage, startSession } from "./cdp.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CLIENT = path.join(HERE, "../lib/client.js");
const FIXTURE = path.join(HERE, "fixture.html");

// ---------------------------------------------------------------- 1. real guest run
const guest = await functionSource(CLIENT, "guestAnnotate");
const page = await launchPage(FIXTURE);
let payload;
try {
  assert.equal(await page.evaluate(startSession(guest)), "started");
  await page.clickAt("#target");
  await page.evaluate(`(() => {
    const sr = document.querySelector('[data-dsh-annotation]').shadowRoot;
    sr.querySelector('[data-role="design"]').click();
    const input = sr.querySelector('[data-field="width"] input');
    input.value = "466";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    sr.querySelector('[data-role="design-apply"]').click();
    return true;
  })();`);
  await page.evaluate(`(() => {
    const area = document.querySelector('[data-dsh-annotation]').shadowRoot.querySelector('[data-role="comment"]');
    area.value = "按钮换成品牌绿";
    area.dispatchEvent(new Event("input", { bubbles: true }));
    area.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    return true;
  })();`);
  await new Promise((resolve) => setTimeout(resolve, 80));
  payload = await page.evaluate("window.__r");
} finally {
  page.close();
}
assert.equal(payload.ok, true, "the guest session finished");

// The descriptor has to carry every field the formatter reads.
assert.deepEqual(
  Object.keys(payload.targets[0]).sort(),
  ["attrs", "docRect", "html", "matches", "react", "rect", "selector", "styles", "tag", "text"],
  "descriptor fields",
);
assert.equal(payload.targets[0].react, null, "a page without React metadata reports no identity");
assert.ok(Array.isArray(payload.targets[0].styles) && payload.targets[0].styles.length > 0, "computed styles captured");
assert.deepEqual(payload.design, [{
  index: 0,
  selector: "#target",
  changes: [{ property: "width", from: "91.3px", to: "466px" }],
}], "the real guest hands structured design deltas to the host");

// ---------------------------------------------------------------- 2. real host format
class FakeNode {
  constructor(tag, box) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.style = {};
    this.attributes = {};
    this.listeners = new Map();
    this.isConnected = true;
    this.textContent = "";
    this.innerHTML = "";
    this.box = box ?? { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
  }
  get parentElement() { return this.parentNode; }
  append(...nodes) { for (const node of nodes) { node.parentNode = this; this.children.push(node); } }
  remove() {
    if (this.parentNode !== null) {
      this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
      this.parentNode = null;
    }
    this.isConnected = false;
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  removeAttribute(name) { delete this.attributes[name]; }
  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(handler);
  }
  removeEventListener() {}
  getBoundingClientRect() { return this.box; }
  querySelectorAll() { return []; }
  closest() { return null; }
}

const body = new FakeNode("body");
const content = new FakeNode("div", { top: 0, left: 0, right: 900, bottom: 800, width: 900, height: 800 });
const viewport = new FakeNode("div", { top: 0, left: 0, right: 900, bottom: 800, width: 900, height: 800 });
const frame = new FakeNode("webview", { top: 0, left: 0, right: 900, bottom: 800, width: 900, height: 800 });
body.append(content);
content.append(viewport);
viewport.append(frame);
Object.assign(frame, {
  getURL: () => payload.page.url,
  closest: (selector) => (selector === "[data-sidebar-right-session]" ? { getAttribute: () => "sess-1" } : null),
  executeJavaScript: async () => payload,
});

globalThis.document = {
  body,
  documentElement: new FakeNode("html"),
  createElement: (tag) => new FakeNode(tag),
  querySelectorAll: (selector) => (selector === "webview[data-sidebar-browser-frame]" ? [frame] : []),
};
const windowMock = {
  __ModuleLoader__: { load: (entry) => { windowMock.__entry = entry; } },
  innerWidth: 1200,
  innerHeight: 900,
  CSS: null,
  addEventListener() {},
  removeEventListener() {},
};
new Function("window", await readFile(CLIENT, "utf8"))(windowMock);
globalThis.window = windowMock;
globalThis.ResizeObserver = class { constructor() {} observe() {} disconnect() {} };
globalThis.MutationObserver = class { observe() {} disconnect() {} };

const quotes = [];
const drafts = [];
const dictionaries = [];
const binding = { sessionId: "sess-1" };
const ctx = {
  locale: {
    register: (ns, dicts) => { dictionaries.push([ns, dicts]); return () => {}; },
    bind: (ns) => (key, params) => {
      const table = dictionaries.find((entry) => entry[0] === ns)?.[1].zh ?? {};
      return String(table[key] ?? key).replace(/\{(\w+)\}/g, (match, name) => (params && name in params ? String(params[name]) : match));
    },
  },
  effect: (fn) => fn(),
  get: (name) => {
    if (name === "sessions") return { binding: () => binding };
    if (name === "conversation") {
      return {
        input: {
          requestDraftInitialization: (target, options) => { drafts.push(options); return "applied"; },
          shellFor: () => ({
            insertQuote: (text) => { quotes.push(text); return true; },
            submit: () => {},
          }),
        },
      };
    }
    return undefined;
  },
};

const exportsObject = windowMock.__entry.factory(() => { throw new Error("no shared modules"); });
exportsObject.apply(ctx);

const root = body.children.find((node) => node.attributes["data-dsh-browser-element-picker"] !== undefined);
assert.ok(root, "floating container mounted");
root.children[1].listeners.get("click")[0]({ preventDefault() {}, stopPropagation() {} });
await new Promise((resolve) => setTimeout(resolve, 0));

assert.equal(drafts.length, 0, "the annotation went through the quote path");
assert.equal(quotes.length, 1, "one quote block was produced");
const block = quotes[0];

assert.equal(block.includes("undefined"), false, `no undefined leaks into the prompt:\n${block}`);
assert.match(block, /^页面：拾取测试页 \| http:\/\/127\.0\.0\.1:\d+\//, "the page line starts the block");
assert.match(block, /1\. #target \| <button> 提交订单/, "numbered target line");
assert.match(block, /设计：\n {2}- width: 91\.3px → 466px/, "design delta nests under the target");
assert.equal(block.includes("计算样式"), false, "no computed styles in the prompt");
assert.equal(block.includes("外部 HTML"), false, "no HTML in the prompt");
assert.equal(block.includes("位置"), false, "no geometry in the prompt");
assert.equal(block.includes("[object Object]"), false, "no object leaks into the prompt");
assert.match(block, /\n\n---\n\*\*修改要求:\*\* 按钮换成品牌绿$/);
assert.equal(block.slice(block.indexOf("---")).match(/修改要求/g).length, 1, "exactly one request label");

console.log("payload contract OK");
