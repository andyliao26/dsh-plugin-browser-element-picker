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

const documentListeners = new Map();
globalThis.document = {
  body,
  head: new FakeNode("head"),
  documentElement: new FakeNode("html"),
  createElement: (tag) => new FakeNode(tag),
  querySelectorAll: (selector) => (selector === "webview[data-sidebar-browser-frame]" ? [frame] : []),
  addEventListener: (type, handler) => {
    if (!documentListeners.has(type)) documentListeners.set(type, []);
    documentListeners.get(type).push(handler);
  },
  removeEventListener: (type, handler) => {
    const list = documentListeners.get(type) ?? [];
    documentListeners.set(type, list.filter((entry) => entry !== handler));
  },
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
const submits = [];
const quotes = [];
const references = [];
const sources = [];
let quoteAccepted = true;
let referenceAccepted = false;
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
    if (name === "inputTriggers") {
      return {
        registerSource: (source) => {
          sources.push(source);
          return () => sources.splice(sources.indexOf(source), 1);
        },
      };
    }
    if (name === "conversation") {
      return {
        input: {
          requestDraftInitialization: (target, options) => { drafts.push(options); return "applied"; },
          shellFor: () => ({
            rev: 3,
            caretSpan: () => ({ start: 7, end: 7 }),
            insertReference: (reference, span) => {
              if (!referenceAccepted) return false;
              references.push({ ref: reference, span });
              return true;
            },
            insertQuote: (text) => { if (!quoteAccepted) return false; quotes.push(text); return true; },
            submit: () => { submits.push(1); },
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

// --- A. single annotation + request -------------------------------------------------
const click = async () => {
  root.children[1].listeners.get("click")[0]({ preventDefault() {}, stopPropagation() {} });
  await new Promise((resolve) => setTimeout(resolve, 0));
};
const pageLine = "页面：订单列表 | http://localhost:5173/orders";
const targetLine = "1. #app > div.list > button.btn.primary:nth-of-type(2) | <button> 提交订单";
// The request section is a delimiter line, a rule, then the user's own words.
const request = (text) => `\n\n---\n**修改要求:** ${text}`;

await click();
assert.equal(quotes.length, 1);
const single = [pageLine, targetLine].join("\n") + request("背景换成品牌绿");
assert.equal(quotes[0], single, "single-target block matches the compact form");
assert.equal(quotes[0].includes("计算样式"), false, "no computed styles in the prompt");
assert.equal(quotes[0].includes("外部 HTML"), false, "no HTML in the prompt");
assert.equal(quotes[0].includes("位置"), false, "no geometry in the prompt");
assert.equal(quotes[0].includes("（匹配"), false, "a unique selector has no match marker");

// --- C. design deltas nest under their target ---------------------------------------
guestResult = {
  ...guestResult,
  design: [{ index: 0, selector: "ignored", changes: [
    { property: "width", from: "120px", to: "466px" },
    { property: "border-radius", from: "8px", to: "12px" },
  ] }],
  submit: true,
};
await click();
assert.equal(quotes.length, 2);
assert.equal(quotes[1], [pageLine, targetLine,
  "设计：",
  "  - width: 120px → 466px",
  "  - border-radius: 8px → 12px",
].join("\n") + request("背景换成品牌绿"), "design lines follow their target");
assert.equal(quotes[1].includes("[object Object]"), false, "design deltas are formatted, not stringified");

// --- B. multiple annotations + request, design on the second ------------------------
guestResult = {
  ...BASE,
  targets: [BASE.targets[0], { ...BASE.targets[0], selector: "#cancel", text: "取消" }],
  design: [{ index: 1, selector: "ignored", changes: [
    { property: "border-radius", from: "8px", to: "12px" },
  ] }],
  comment: "两个按钮的高度统一为40px。",
};
await click();
assert.equal(quotes.length, 3);
assert.equal(quotes[2], [pageLine, targetLine,
  "2. #cancel | <button> 取消",
  "设计：",
  "  - border-radius: 8px → 12px",
].join("\n") + request("两个按钮的高度统一为40px。"), "multi-target block keeps each delta under its element");

// --- ambiguous selector keeps the match marker --------------------------------------
guestResult = {
  ...BASE,
  targets: [{ ...BASE.targets[0], matches: 3 }],
  design: [],
  comment: "把这一组按钮统一成次要按钮。",
};
await click();
assert.equal(quotes.length, 4);
assert.match(quotes[3], /1\. #app > div\.list > button\.btn\.primary:nth-of-type\(2\)（匹配 3） \| <button> 提交订单/);

// --- empty comment: design-only fallback --------------------------------------------
guestResult = {
  ...BASE,
  comment: "",
  design: [{ index: 0, selector: "ignored", changes: [
    { property: "width", from: "120px", to: "466px" },
  ] }],
};
await click();
assert.equal(quotes.length, 5);
assert.equal(quotes[4], [pageLine, targetLine,
  "设计：",
  "  - width: 120px → 466px",
].join("\n"), "a design-only block ends on its last delta line");

// --- empty comment and no design ----------------------------------------------------
guestResult = { ...BASE, comment: "", design: [] };
await click();
assert.equal(quotes.length, 6);
assert.equal(quotes[5], [pageLine, targetLine].join("\n"), "a bare location block has no separator and no request");

// --- component identity nests under its target --------------------------------------
guestResult = {
  ...BASE,
  targets: [
    { ...BASE.targets[0], react: { component: "Toolbar", source: "src/components/Toolbar.tsx:42" } },
    { ...BASE.targets[0], selector: "#cancel", text: "取消", react: { component: "Toolbar", source: "" } },
    { ...BASE.targets[0], selector: "#more", text: "更多", react: null },
  ],
  design: [],
  comment: "",
};
await click();
assert.equal(quotes.length, 7);
assert.equal(quotes[6], [pageLine, targetLine,
  "组件：Toolbar src/components/Toolbar.tsx:42",
  "2. #cancel | <button> 取消",
  "组件：Toolbar",
  "3. #more | <button> 更多",
].join("\n"), "each target carries its own component line, or none");

// --- fallback: no quote support, identical plain text --------------------------------
quoteAccepted = false;
guestResult = { ...BASE, submit: false, design: [], comment: "背景换成品牌绿" };
await click();
assert.equal(quotes.length, 7, "no quote block was added");
assert.equal(drafts.length, 1, "plain draft fallback");
assert.equal(drafts[0].prompt, single, "plain-text fallback matches the quote block");
assert.equal(drafts[0].prompt.endsWith("**修改要求:** 背景换成品牌绿"), true, "the request appears once, at the end");

// --- reference chip: short label, full block in the codec -----------------------------
assert.equal(sources.length, 1, "the annotation reference source registers once");
assert.equal(sources[0].name, "browser-element-picker");
assert.equal(sources[0].trigger, "\u0001", "the trigger is not typeable");
assert.equal(await sources[0].codec.serialize(single), single, "the codec expands the stored block as-is");

referenceAccepted = true;
quoteAccepted = true;
guestResult = { ...BASE, submit: false, design: [], comment: "背景换成品牌绿" };
await click();
assert.equal(references.length, 1, "the chip path wins over the quote node");
assert.equal(quotes.length, 7, "no quote block was appended for the chip path");
const chip = references[0].ref;
assert.equal(chip.source, "browser-element-picker");
assert.equal(chip.label, "<button> 背景换成品牌绿", "the chip shows the user's own text");
assert.equal(chip.clipboardText, chip.label, "the draft text is the short label");
assert.equal(chip.ref, single, "the full block rides in the reference");
assert.deepEqual(references[0].span, { start: 7, end: 7, draftRev: 3 }, "the caret span and revision guard the insert");

guestResult = {
  ...BASE,
  targets: [BASE.targets[0], { ...BASE.targets[0], selector: "#cancel", text: "取消" }],
  design: [],
  comment: "两个按钮的高度统一为40px。",
};
await click();
assert.equal(references.length, 2);
assert.equal(references[1].ref.label, "<button> 等 2 项 · 两个按钮的高度统一为40px。", "multi-target chip carries the count and the comment");
assert.match(references[1].ref.ref, /^页面：订单列表 \| http:\/\/localhost:5173\/orders\n/);

referenceAccepted = false;
guestResult = { ...BASE, submit: false, design: [], comment: "背景换成品牌绿" };
await click();
assert.equal(references.length, 2, "a refused chip inserts nothing");
assert.equal(quotes.length, 8, "a refused chip falls back to the quote node");

// --- cancellation writes nothing ------------------------------------------------------
guestResult = { ok: false, reason: "cancel" };
await click();
assert.equal(quotes.length, 8, "a cancelled session leaves the composer alone");
assert.equal(drafts.length, 1);

// --- an unfinished session writes nothing ---------------------------------------------
const settled = { references: references.length, quotes: quotes.length, drafts: drafts.length, submits: submits.length };
frame.executeJavaScript = () => new Promise(() => {});
await click();
assert.equal(references.length, settled.references, "an unfinished session inserts no reference");
assert.equal(quotes.length, settled.quotes, "an unfinished session inserts no quote");
assert.equal(drafts.length, settled.drafts, "an unfinished session writes no draft");
assert.equal(submits.length, settled.submits, "an unfinished session never submits");

// --- teardown -------------------------------------------------------------------------
for (const disposer of disposers) disposer();
assert.equal(root.parentNode, null, "dispose removes the floating container");

console.log("injection OK");
