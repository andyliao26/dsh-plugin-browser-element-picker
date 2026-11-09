// The floating fallback (a tab body with no address field): the button anchors to
// the guest box, a cancelled session writes nothing, and a design delta reaches the
// prompt as a single-target line.
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const source = await readFile(new URL("../lib/client.js", import.meta.url), "utf8");

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
  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(handler);
  }
  removeEventListener() {}
  getBoundingClientRect() { return this.box; }
  querySelectorAll() { return []; }
  closest() { return null; }
}

let guestResult = {
  ok: true,
  submit: false,
  page: { url: "http://localhost:5173/orders", title: "订单列表", width: 1440, height: 900, scrollX: 0, scrollY: 120 },
  targets: [{
    tag: "button",
    selector: "#app > div.list > button.btn.primary:nth-of-type(2)",
    matches: 1,
    text: "提交订单",
    html: '<button class="btn primary" data-testid="submit">提交订单</button>',
    attrs: { "data-testid": "submit" },
    rect: { x: 512, y: 340, width: 120, height: 36 },
    docRect: { x: 512, y: 460 },
    styles: ["display: inline-flex", "background-color: rgb(64, 86, 255)"],
  }],
  comment: "背景换成品牌绿",
  design: [],
};

const BASE = guestResult;

// A tab body whose content container is not a toolbar (no address input).
const body = new FakeNode("body");
const tab = new FakeNode("div", { top: 0, left: 0, right: 900, bottom: 800, width: 900, height: 800 });
const content = new FakeNode("div", { top: 100, left: 100, right: 900, bottom: 800, width: 800, height: 700 });
const viewport = new FakeNode("div", { top: 100, left: 100, right: 900, bottom: 800, width: 800, height: 700 });
const frame = new FakeNode("webview", { top: 100, left: 100, right: 900, bottom: 800, width: 800, height: 700 });
const panel = { getAttribute: (name) => (name === "data-sidebar-right-session" ? "sess-1" : null) };
body.append(tab);
tab.append(content);
content.append(viewport);
viewport.append(frame);
tab.querySelectorAll = () => [];
Object.assign(frame, {
  getURL: () => "http://localhost:5173/orders",
  closest: (selector) => (selector === "[data-sidebar-right-session]" ? panel : null),
  executeJavaScript: async () => guestResult,
});

globalThis.document = {
  body,
  documentElement: new FakeNode("html"),
  createElement: (tag) => new FakeNode(tag),
  querySelectorAll: (selector) => (selector === "webview[data-sidebar-browser-frame]" ? [frame] : []),
};

const windowMock = {
  __ModuleLoader__: { load: (entry) => { windowMock.__entry = entry; } },
  innerWidth: 1400,
  innerHeight: 900,
  CSS: null,
  addEventListener() {},
  removeEventListener() {},
};
new Function("window", source)(windowMock);
globalThis.window = windowMock;

globalThis.ResizeObserver = class { constructor() {} observe() {} disconnect() {} };
globalThis.MutationObserver = class { observe() {} disconnect() {} };

const drafts = [];
const quotes = [];
let quoteAccepted = true;
const disposers = [];
const binding = { sessionId: "sess-1" };
const dictionaries = [];
const ctx = {
  locale: {
    register: (ns, dicts) => { dictionaries.push([ns, dicts]); return () => {}; },
    bind: (ns) => (key, params) => {
      const table = dictionaries.find((entry) => entry[0] === ns)?.[1].zh ?? {};
      return String(table[key] ?? key).replace(/\{(\w+)\}/g, (match, name) => (params && name in params ? String(params[name]) : match));
    },
  },
  effect: (fn) => {
    const disposer = fn();
    if (typeof disposer === "function") disposers.push(disposer);
    return disposer;
  },
  get: (name) => {
    if (name === "sessions") return { binding: (id) => (id === "sess-1" ? binding : undefined) };
    if (name === "conversation") {
      return {
        input: {
          requestDraftInitialization: (target, options) => { drafts.push(options); return "applied"; },
          shellFor: () => ({
            insertQuote: (text) => { if (!quoteAccepted) return false; quotes.push(text); return true; },
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
assert.equal(root.children.length, 2, "toast and button share the floating container");
assert.equal(root.style.display, "flex");
assert.equal(root.style.top, "108px", "pinned below the guest top edge");
assert.equal(root.style.right, "508px", "pinned inside the guest right edge");
assert.equal(root.children[1].attributes["aria-label"], "标注页面元素");
assert.equal(root.children[1].attributes["aria-pressed"], "false");

// --- fill ---------------------------------------------------------------------------
root.children[1].listeners.get("click")[0]({ preventDefault() {}, stopPropagation() {} });
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(drafts.length, 0, "quote block preferred over plain text");
assert.equal(quotes.length, 1);
const prompt = quotes[0];
assert.match(prompt, /^【页面标注】/);
assert.match(prompt, /- 页面：订单列表（http:\/\/localhost:5173\/orders）/);
assert.match(prompt, /- 选择器：#app > div\.list > button\.btn\.primary:nth-of-type\(2\)（页面内匹配 1 个元素）/);
assert.match(prompt, /- 元素：<button> 提交订单/);
assert.match(prompt, /- 位置：左 512、上 340，尺寸 120×36；页面视口 1440×900，滚动 \(0, 120\)/);
assert.match(prompt, /- 计算样式：display: inline-flex; background-color: rgb\(64, 86, 255\)/);
assert.match(prompt, /- 我的意见：背景换成品牌绿/);
assert.match(prompt, /说明改了哪些文件。$/);
assert.equal(prompt.includes("修改要求"), false, "the quote block has no request lead-in");
assert.equal(prompt.includes("设计调整"), false, "no design line without design edits");

// --- design delta on a single target -------------------------------------------------
guestResult = {
  ...guestResult,
  design: [{ index: 0, selector: "ignored", changes: ["width: 466px", "border-radius: 12px"] }],
  submit: true,
};
root.children[1].listeners.get("click")[0]({ preventDefault() {}, stopPropagation() {} });
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(quotes.length, 2);
assert.match(quotes[1], /- 设计调整：width: 466px; border-radius: 12px/, "single-target design line");

// --- cancellation writes nothing ------------------------------------------------------
guestResult = { ok: false, reason: "cancel" };
root.children[1].listeners.get("click")[0]({ preventDefault() {}, stopPropagation() {} });
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(quotes.length, 2, "a cancelled session leaves the composer alone");

// --- fallback: no quote support, plain text still lands ---------------------------------
quoteAccepted = false;
guestResult = { ...BASE, submit: false, design: [] };
root.children[1].listeners.get("click")[0]({ preventDefault() {}, stopPropagation() {} });
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(quotes.length, 2);
assert.equal(drafts.length, 1, "plain draft fallback");
assert.match(drafts[0].prompt, /修改要求：$/, "fallback keeps the request lead-in");

// --- teardown -------------------------------------------------------------------------
for (const disposer of disposers) disposer();
assert.equal(root.parentNode, null, "dispose removes the floating container");

console.log("injection OK");
