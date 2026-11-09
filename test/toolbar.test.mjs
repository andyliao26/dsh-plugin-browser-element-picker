// The toolbar path: the button must live inside the tab's address row (not float
// over the page), keep its place across React re-renders, fill the prompt, and
// hand a "send now" session to the composer.
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

/** One guest session result; mutated per scenario below. */
let guestResult = {
  ok: true,
  submit: false,
  page: { url: "http://localhost:5173/login", title: "登录", width: 900, height: 700, scrollX: 0, scrollY: 0 },
  targets: [{
    tag: "button",
    selector: "#login",
    matches: 1,
    text: "登录",
    html: '<button id="login">登录</button>',
    attrs: {},
    rect: { x: 10, y: 20, width: 120, height: 36 },
    docRect: { x: 10, y: 20 },
    styles: ["background-color: rgb(64, 96, 80)"],
  }],
  comment: "按钮换成深绿",
  design: [],
};

// tab body > [toolbar > addressBox > input, content > viewport > webview]
const body = new FakeNode("body");
const tab = new FakeNode("div", { top: 0, left: 0, right: 900, bottom: 800, width: 900, height: 800 });
const toolbar = new FakeNode("div", { top: 0, left: 0, right: 900, bottom: 38, width: 900, height: 38 });
const content = new FakeNode("div", { top: 38, left: 0, right: 900, bottom: 800, width: 900, height: 762 });
const viewport = new FakeNode("div", { top: 38, left: 0, right: 900, bottom: 800, width: 900, height: 762 });
const frame = new FakeNode("webview", { top: 38, left: 0, right: 900, bottom: 800, width: 900, height: 762 });
const addressBox = new FakeNode("div");
const input = new FakeNode("input");
body.append(tab);
tab.append(toolbar, content);
content.append(viewport);
viewport.append(frame);
toolbar.append(addressBox);
addressBox.append(input);
tab.querySelectorAll = (selector) => (selector === "input" ? [input] : []);

Object.assign(frame, {
  getURL: () => "http://localhost:5173/login",
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

const resizeObservers = [];
globalThis.ResizeObserver = class {
  constructor(callback) { this.callback = callback; resizeObservers.push(this); }
  observe() {}
  disconnect() {}
};
globalThis.MutationObserver = class { observe() {} disconnect() {} };

const drafts = [];
const quotes = [];
const submissions = [];
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
          shellFor: (target) => {
            assert.equal(target, binding, "the composer shell is resolved for the same Session binding");
            return {
              insertQuote: (text) => {
                if (!quoteAccepted) return false;
                quotes.push(text);
                return true;
              },
              submit: (mode) => submissions.push(mode),
            };
          },
        },
      };
    }
    if (name === "sidebarRight") return { mounted: { getSnapshot: () => "sess-1" } };
    return undefined;
  },
};

const exportsObject = windowMock.__entry.factory(() => { throw new Error("no shared modules"); });
exportsObject.apply(ctx);

// --- placement ---------------------------------------------------------------------
const root = body.children.find((node) => node.attributes["data-dsh-browser-element-picker"] !== undefined);
assert.ok(root, "the plugin mounted its toast container into the app body");
const button = toolbar.children[toolbar.children.length - 1];
assert.equal(button.tagName, "BUTTON", "the button is appended to the toolbar");
assert.equal(toolbar.children.length, 2, "toolbar keeps its own address box and gains one button");
assert.equal(root.children.length, 1, "the floating container holds only the toast now");
assert.match(button.style.cssText, /width:28px/, "matches the toolbar control size");
assert.match(button.style.cssText, /border:0/, "toolbar controls carry no border");
assert.match(button.style.cssText, /dsw-alias-label-secondary/, "theme variables drive the idle color");
assert.equal(button.attributes["aria-label"], "标注页面元素");
assert.equal(root.style.top, "44px", "toast sits under the toolbar");
assert.equal(root.style.right, "506px", "toast right-aligns with the toolbar");

// --- React re-render: the strip drops our node, the next sync puts it back ----------
button.remove();
assert.equal(button.parentNode, null);
for (const observer of resizeObservers) observer.callback();
assert.equal(button.parentNode, toolbar, "sync re-attaches the button after a re-render");

// --- fill the prompt -----------------------------------------------------------------
button.listeners.get("click")[0]({ preventDefault() {}, stopPropagation() {} });
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(drafts.length, 0, "the annotation rides as a quote block, not as plain text");
assert.equal(quotes.length, 1, "exactly one quote block");
const block = quotes[0];
assert.match(block, /^【页面标注】/, "annotation header");
assert.match(block, /- 选择器：#login（页面内匹配 1 个元素）/, "selector line");
assert.match(block, /- 元素：<button> 登录/, "element line");
assert.match(block, /- 我的意见：按钮换成深绿/, "comment line");
assert.match(block, /说明改了哪些文件。$/, "block ends with the instruction sentence");
assert.equal(block.includes("修改要求"), false, "the block leaves the request line to the person");
assert.equal(submissions.length, 0, "Enter does not send");
assert.equal(button.attributes["aria-pressed"], "false", "the session state cleared");

// --- send now ------------------------------------------------------------------------
guestResult = {
  ...guestResult,
  submit: true,
  targets: [
    { ...guestResult.targets[0], selector: "#login" },
    { ...guestResult.targets[0], tag: "span", selector: ".hint", text: "忘记密码", matches: 1 },
  ],
  design: [{ index: 1, selector: ".hint", changes: [
    { property: "color", from: "#101828", to: "#112233" },
    { property: "font-size", from: "14px", to: "12px" },
  ] }],
};
button.listeners.get("click")[0]({ preventDefault() {}, stopPropagation() {} });
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(quotes.length, 2, "each session adds one block");
assert.equal(submissions.length, 1, "Cmd+Enter reaches the composer submit action");
assert.equal(submissions[0], "queue", "the default delivery mode");
assert.match(quotes[1], /^【页面标注】共 2 个元素/, "multi-target header");
assert.match(quotes[1], /1\. <button> 登录 — #login/, "first target line");
assert.match(quotes[1], /2\. <span> 忘记密码 — \.hint/, "second target line");
assert.match(quotes[1], /- 设计调整（第 2 个元素）：\n {2}- color: #101828 → #112233\n {2}- font-size: 14px → 12px/, "design deltas");

// --- fallback: a composer that refuses the quote node gets plain text ----------------
quoteAccepted = false;
guestResult = { ...guestResult, submit: false };
button.listeners.get("click")[0]({ preventDefault() {}, stopPropagation() {} });
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(quotes.length, 2, "no quote block was added");
assert.equal(drafts.length, 1, "the annotation fell back to plain draft text");
assert.equal(drafts[0].whenDraftExists, "append");
assert.match(drafts[0].prompt, /修改要求：$/, "the plain fallback keeps the request lead-in");

// --- teardown ------------------------------------------------------------------------
for (const disposer of disposers) disposer();
assert.equal(button.parentNode, null, "dispose removes the toolbar button");
assert.equal(root.parentNode, null, "dispose removes the toast container");

console.log("toolbar placement OK");
