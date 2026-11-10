# Proposal

## Why

块内的 `**修改要求:**` 上方有一条 `---`。现在块与块之间也有分割线（上一版加的），两条线在提示词里挨着出现，显得重复；而 `---` 在「目标列表」和「用户要求」之间本来就不承担结构作用——空行已经能把两者分开。

## What Changes

- 块内 `**修改要求:**` 上方不再输出 `---`，只保留空行。
- 块与块之间的分隔（`\n\n---\n\n`）不变：分割线从此只表示「两段标注的分界」。
- 版本 `0.12.0` → `0.13.0`。

## Capabilities

### New Capabilities

（无。）

### Modified Capabilities

- `page-annotation/prompt`: 要求段仍由空行与目标列表分开，但不再有 `---` 行。

## Impact

- `lib/client.js`：`formatAnnotation()` 少 push 一行。
- `test/toolbar.test.mjs`、`test/injection.test.mjs`、`test/payload.test.mjs` 的期望文本同步。
- `README.md` 的示例与版本说明；`AGENTS.md` 里对块结构的描述。
