// Verify the hand-written client bundle against the DSH module-loader contract.
// No browser: this only exercises registration, exports, dictionaries and the
// install() wiring with a mocked Cordis context and DOM.
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const source = await readFile(
  new URL("../lib/client.js", import.meta.url),
  "utf8",
);

let captured;
const windowMock = {
  __ModuleLoader__: { load: (entry) => { captured = entry; } },
  innerWidth: 1400,
  innerHeight: 900,
  CSS: null,
  addEventListener() {},
  removeEventListener() {},
};
new Function("window", source)(windowMock);

assert.ok(captured, "bundle registers through window.__ModuleLoader__.load");
assert.equal(captured.id, "dsh-plugin-browser-element-picker", "module id equals the package name");
assert.equal(typeof captured.factory, "function", "factory is a function");

const exportsObject = captured.factory(() => { throw new Error("this bundle requests no shared modules"); });
assert.equal(typeof exportsObject.apply, "function", "apply is exported");
assert.deepEqual(exportsObject.inject, ["locale", "inputTriggers"], "locale and the reference roster gate mounting");

// Mount against a mocked context + DOM, then assert the button behaviour.
const registered = [];
const effects = [];
const ctx = {
  locale: {
    register: (ns, dicts) => {
      registered.push([ns, dicts]);
      return () => {};
    },
    bind: (ns) => (key, params) => {
      const table = registered.find((entry) => entry[0] === ns)?.[1].zh ?? {};
      const template = table[key] ?? key;
      return String(template).replace(/\{(\w+)\}/g, (match, name) => (params && name in params ? String(params[name]) : match));
    },
  },
  effect: (fn) => {
    const dispose = fn();
    effects.push(dispose);
    return dispose;
  },
  get: () => undefined,
};

// --- minimal DOM -----------------------------------------------------------------
class Node {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.style = { cssText: "", setProperty() {}, removeProperty() {} };
    this.dataset = {};
    this._attrs = {};
    this.listeners = {};
    this.isConnected = true;
  }
  append(...nodes) { for (const node of nodes) { node.parentNode = this; this.children.push(node); } return this; }
  remove() { if (this.parentNode) { this.parentNode.children = this.parentNode.children.filter((child) => child !== this); this.parentNode = null; } this.isConnected = false; }
  setAttribute(name, value) { this._attrs[name] = String(value); }
  getAttribute(name) { return this._attrs[name] ?? null; }
  addEventListener() {}
  removeEventListener() {}
  attachShadow() { return new Node("#shadow"); }
  getBoundingClientRect() { return { top: 100, left: 100, right: 900, bottom: 800, width: 800, height: 700 }; }
  closest() { return null; }
  querySelectorAll() { return []; }
}

const documentBody = new Node("body");
const documentElement = new Node("html");
globalThis.document = {
  body: documentBody,
  documentElement,
  createElement: (tag) => new Node(tag),
  querySelectorAll: () => [],
};
globalThis.window = windowMock;
globalThis.MutationObserver = class { observe() {} disconnect() {} };
globalThis.ResizeObserver = class { constructor() {} observe() {} disconnect() {} };
globalThis.setTimeout = (fn) => 0;
globalThis.clearTimeout = () => {};

exportsObject.apply(ctx);
assert.equal(registered.length, 1, "dictionaries registered once");
assert.equal(registered[0][0], "browser-element-picker", "namespace");
assert.ok(registered[0][1].zh && registered[0][1].en, "both locales shipped");
assert.ok(documentBody.children.length === 0, "no button without a browser tab");

// Locale copy is complete in both languages.
const keys = Object.keys(registered[0][1].zh).sort();
assert.deepEqual(keys, Object.keys(registered[0][1].en).sort(), "zh/en key sets match");
for (const key of keys) assert.ok(registered[0][1].zh[key].length > 0 && registered[0][1].en[key].length > 0, `non-empty copy for ${key}`);

// Every prompt placeholder the formatter fills must exist in the template that
// uses it, so a renamed key cannot silently ship a literal "{selector}".
const zhDict = registered[0][1].zh;
const needed = ["prompt.headerSingle", "prompt.headerMany", "prompt.page", "prompt.target",
  "prompt.ambiguous", "prompt.designHeader", "prompt.designChange", "prompt.comment",
  "prompt.designFallback", "prompt.footer", "prompt.emptyText"];
for (const key of needed) assert.ok(typeof zhDict[key] === "string" && zhDict[key].length > 0, `prompt key ${key}`);

// The compact format no longer ships the verbose evidence or a plain-text suffix.
for (const key of ["prompt.selector", "prompt.element", "prompt.geometry", "prompt.styles",
  "prompt.html", "prompt.designHeaderMany", "prompt.footerSingle", "prompt.footerMany", "prompt.fillSuffix"]) {
  assert.equal(zhDict[key], undefined, `removed prompt key ${key}`);
}

const placeholders = (key) => new Set([...zhDict[key].matchAll(/\{(\w+)\}/g)].map((match) => match[1]));
assert.deepEqual([...placeholders("prompt.headerMany")].sort(), ["count"]);
assert.deepEqual([...placeholders("prompt.page")].sort(), ["title", "url"]);
assert.deepEqual([...placeholders("prompt.target")].sort(), ["ambiguous", "index", "selector", "tag", "text"]);
assert.deepEqual([...placeholders("prompt.ambiguous")].sort(), ["matches"]);
assert.deepEqual([...placeholders("prompt.designChange")].sort(), ["from", "property", "to"]);
assert.deepEqual([...placeholders("prompt.comment")].sort(), ["comment"]);
for (const key of ["prompt.headerSingle", "prompt.designHeader", "prompt.designFallback", "prompt.footer", "prompt.emptyText"]) {
  assert.equal(placeholders(key).size, 0, `no placeholders in ${key}`);
}

// Dispose everything; no throw.
for (const dispose of effects) if (typeof dispose === "function") dispose();
console.log("bundle contract OK");
