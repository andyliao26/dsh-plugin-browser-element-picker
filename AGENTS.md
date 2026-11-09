# AGENTS.md

Guidance for agents working on `dsh-plugin-browser-element-picker` — a single DSH
bundle that adds Codex-style page annotation to the Desktop sidebar browser:
pick elements → comment (optionally record design adjustments) → Enter fills the
prompt as a short reference chip that expands to the full annotation on send,
⌘/Ctrl+Enter fills and sends.

## Project context

- This is an **independent DSH plugin package**: this directory is the project
  root and `package.json` is its manifest. It is not part of any marketplace or
  monorepo, so surrounding parent directories and their workspace files (root
  `CLAUDE.md`, pnpm workspaces, sibling plugins) do not apply to it — ignore them.
- There is no build system, package manager, or dependency graph: `package.json`
  has no `scripts` and no `dependencies`, and `lib/client.js` ships as written.
- Consumers only need the package contents; installation goes through a DSH
  profile (see Dev loop), never through a repo-level bundling step.

## Commands

Node ≥ 22. Tests resolve fixtures from their own location, so any cwd works.

```bash
for f in test/*.test.mjs; do node "$f" || break; done
```

Individual layers, fast → slow:

```bash
node test/bundle-contract.test.mjs   # loader contract, i18n key parity, prompt placeholders
node test/toolbar.test.mjs           # mocked DOM: toolbar embedding, re-render self-heal, quote + send
node test/injection.test.mjs         # mocked DOM: floating fallback, single/multi payloads, cancel writes nothing
node test/payload.test.mjs           # real guest in Chromium → real host formatter (field-level end-to-end)
node test/guest-annotate.test.mjs    # real Chromium: multi-select, card, design mode, Enter/⌘Enter, Esc
```

The last two launch a headless Chromium from
`~/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell`.
Override with `PICKER_CHROME=/path/to/chrome-headless-shell`. Each test prints one
`... OK` line; failures throw on an assertion. Full suite takes ~5 s.

## Layout

```
package.json           # dsh.bundle.patch + dsh.client + exports/files whitelist
cordis.patch.yml       # one Host row: browser-element-picker (insert, enabled)
lib/index.js           # Host half: intentionally empty apply()
lib/client.js          # everything else: toolbar button, guest session, prompt builder
test/cdp.mjs           # shared Chromium driver + duplicated zh guest copy (GUEST_TEXTS)
test/fixture.html      # page the browser tests annotate
openspec/              # spec-driven workflow: specs/, changes/, config.yaml
.agents/skills/        # OpenSpec skills from `openspec init --tools agents`
docs/*.svg|png         # README assets
```

Spec workflow (OpenSpec): `openspec list` / `openspec validate`, plus the
`/openspec-propose` and `/openspec-apply-change` skills in `.agents/skills/`.

`lib/client.js` is a hand-written client bundle wrapped in
`window.__ModuleLoader__.load({ id, factory })`, deliberately free of React and any
imports. The host row exists only so `dsh-client-modules` has something to attach
`dsh.client` to.

## How it works (where to look)

| Step | Location |
| --- | --- |
| Toolbar button, fallback, self-heal | `install()` in `lib/client.js` (~1348) |
| Resolve owning Session / fill / send | `inject()` (~1475) |
| Guest session (pick, card, design mode, keys) | `guestAnnotate()` (~155) |
| Serialize guest + localized copy | `annotateScript()` (~1228) |
| Prompt block text | `formatAnnotation()` (~1297) |
| Plugin entry, locale registration | `apply()` (~1696) |

## Contracts that must not break

### 1. `guestAnnotate` is serialized source, not a normal function

`annotateScript()` embeds `guestAnnotate.toString()` into
`webview.executeJavaScript`, and `test/cdp.mjs:functionSource()` re-extracts it by
matching balanced braces from the literal text `function guestAnnotate(`.

- Keep it self-contained: no outer/module references, no imports. Everything it
  needs (UI copy, options) arrives through the single `options` argument.
- Keep it ES5-ish (`var`, `function`, no arrow/`const`/`?.`): it executes in
  arbitrary visited pages with no build step.
- Do not rename it, minify it, convert it to an arrow function, or wrap it — both
  the embedder and the tests locate it by that exact source shape.
- New guest-visible copy must be threaded through **all** of: the `zh`/`en`
  dictionaries, the `texts` object in `annotateScript()`, and `GUEST_TEXTS` in
  `test/cdp.mjs` (the browser tests pass their own copy; a missing key silently
  renders an empty label).

### 2. Loader / bundle contract

- Module id equals the package name; `factory(require)` must not require shared
  modules; exports are `apply` and `inject = ["locale", "inputTriggers"]`.
- The Host half stays empty. Do not register tools, services, or commands here.
- `package.json` `files` and `exports` list every shipped runtime file. Anything
  added at runtime must be added there or installed copies break.

### 3. i18n and prompt text

- Namespace is `browser-element-picker`; the two dictionaries must keep identical
  key sets (asserted), and every user-facing string goes through `t()`.
- `formatAnnotation()` fills `{placeholders}` from the dictionaries.
  `bundle-contract` asserts the exact parameter names for `prompt.headerMany`,
  `prompt.page`, `prompt.target`, `prompt.ambiguous`, `prompt.designChange`, and
  `prompt.comment`: change a template and the assertion, or keep the names stable.
- Quote mode and plain-text fallback render the same block; there is no
  `prompt.fillSuffix` and no trailing `修改要求：` line. Do not reintroduce one
  without a spec change.

### 4. Guest session result and injection precedence

The guest resolves exactly one of:

```js
{ ok: true, submit: boolean,
  page: { url, title, width, height, scrollX, scrollY },
  targets: [{ tag, selector, matches, text, html, attrs, styles[], rect, docRect }],
  comment: string,
  design: [{ index, selector, changes: [{ property, from, to }] }] }

{ ok: false, reason: "cancel" }   // also the only "nothing to write" signal
```

Design deltas are stored per element (a parallel array kept in step with
`targets`), not by array index; removing a target removes its deltas, and
targets that are no longer connected are dropped when the session finishes.
The design baseline is captured once per element (a second parallel array) and
reused on every reopen, so `from` never drifts when the page changes; clearing a
field and blurring resets it to that baseline, not to the last committed value.
`formatAnnotation()` renders each delta as an indented
`property: from → to` line under its target, below a `设计：` header.

The prompt block is: header, one `页面：{title} | {url}` line, numbered targets
`{index}. {selector}[（匹配 N）] | <{tag}> {text}`, nested design lines, an
optional `要求：`, and the footer. It deliberately carries no computed styles,
outer HTML, geometry, viewport, scroll position, or per-unique-target match
count. Do not re-add those without a spec change. `formatAnnotation(t, result)`
has no quote flag; the quote-node path and the plain-text fallback share it.

Host-side precedence in `inject()`, in order:

1. `shell.insertReference(insert, span)` → one short reference chip. `apply()`
   registers the owning source (`browser-element-picker`) with `inputTriggers`
   before the button mounts: the chip shows `annotationChipLabel()` (e.g.
   `<button> 背景换成品牌绿`, i.e. the tag plus the user's comment) while
   `codec.serialize(ref)` returns the full block, so display and model text stay
   separate. Never insert a chip unless the source
   registered — an unowned source blocks the send. `span` is
   `{ ...shell.caretSpan(), draftRev: shell.rev }`. Clicking the chip opens the
   plugin's own full-block preview (`openReference`); a small injected style
   hides the native reference marker.
2. Fallback `shell.insertQuote(block)` → one removable quote node when the
   chip path is unavailable.
3. Fallback `conversation.input.requestDraftInitialization(binding, { prompt,
   whenDraftExists: "append" })` → plain text; `"blocked"` means the composer is
   busy, so toast and stop.
4. Only when `result.submit === true`, `shell.submit("queue")` — the same
   transaction as the composer's own Enter.

All three insertion paths deliver the same block text. Never synthesize
keystrokes or write into the composer DOM; go through these services. A
cancelled session must write nothing.

### 5. DOM integration is heuristic and must self-heal

- Attach to `webview[data-sidebar-browser-frame]`; the tab's toolbar is the body
  child that owns an `<input>` (address field), else fall back to the floating
  button. Never assume the integrated layout exists.
- React re-renders replace the toolbar row: `sync()` re-parents the button and
  repositions the toast, and must be idempotent. `MutationObserver` is coalesced
  with `requestAnimationFrame`; disposal must disconnect observers, listeners,
  and remove every injected node.
- The guest overlay lives in a shadow root on `[data-dsh-annotation]`; its events
  are captured on `window` and identified by `composedPath()` (keep new UI inside
  that shadow root). Page clicks are swallowed only during a session, and
  cleanup must remove the host, restore the page's original `cursor` /
  `user-select`, and delete `window.__dshAnnotationState` — `CANCEL_SCRIPT`
  calls the latter to close a running session.
- Keyboard handling MUST ignore IME composition (`event.isComposing ||
  event.keyCode === 229`). Enter on a focused button stays a native click, and a
  page-level Enter while design mode is open must not finish the session. Escape
  walks back one step: design panel → card → clear selection → end session.

### 6. Scope limits (do not over-claim)

Desktop `webview` only (Web builds sandbox cross-origin pages, so injection is
impossible); top-level document only — clicks inside iframes/Shadow DOM resolve to
the host node. Design mode never writes page styles: it snapshots computed styles
into a string baseline, records `{property, from, to}` deltas, and only the
prompt/card carry them. The panel body and the card's delta area scroll rather
than growing past the viewport.

## Conventions

- `lib/client.js`: tabs, double quotes, `var`/`function`; English comments;
  theme via `var(--dsw-*)` tokens with literal fallbacks.
- `test/*.mjs`: two spaces, double quotes, plain `node:assert/strict`; mocked-DOM
  tests keep their own `FakeNode` rather than adding a DOM dependency.
- `README.md` is the user-facing doc, in Chinese: keep the interaction table,
  prompt examples, and 自检 list in sync when behavior changes; screenshots live in
  `docs/`.
- Bump `version` in `package.json` for shipped behavior changes.

## Dev loop

The plugin is installed into `~/.dsh/profiles/desktop` as a `link:` dependency
(see that profile's `package.json`/`pnpm-lock.yaml`). Edits under `lib/` take
effect on reload — no DSH rebuild, because `dsh-client-modules` mounts the bundle
from the profile. If the UI doesn't change: switch sidebar tab away/back, toggle
the plugin Off/On in Plugins, restart the app as a last resort. This package is
not part of any tsdown/HMR pipeline.
