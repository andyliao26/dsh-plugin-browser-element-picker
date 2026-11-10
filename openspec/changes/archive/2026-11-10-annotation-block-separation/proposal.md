# Proposal

## Why

连续标注两次时，两段块在 composer 里被一个空格连着，发出去是这样的：

```
**修改要求:** 是否使用了 Radix 控件？ 页面：环境目录 | EnvoyOps | http://127.0.0.1:5273/environments
```

第二块的 `页面：` 直接粘在第一块的评论后面，模型看到的是一句断不开的长句，两段标注的边界完全消失。

## What Changes

- 当插入点前面已经有内容（`caretSpan().start > 0`）时，块前面补一段「空行 + `---` + 空行」，让每段标注成为独立小节。
- 插入点为空（空草稿的开头）时行为不变：块仍然以 `页面：` 开头，不带多余分割线。
- 三条注入路径（引用 chip / 引用节点 / 纯文本）共用同一段文本，因此都生效。
- 版本 `0.11.1` → `0.12.0`。

## Capabilities

### New Capabilities

（无。）

### Modified Capabilities

- `page-annotation/prompt`: 块自身的首行仍是 `页面：`，但「插在已有内容之后」时整段前面会多一个空行、一条分割线与一个空行。

## Impact

- `lib/client.js`：`inject()` 组装块前读 `shell.caretSpan()`，非零插入点加前缀。
- 测试：`test/injection.test.mjs` 的 shell mock 把光标位置变成可变值，新增「已有内容时带分割线、空草稿不带」的两条断言。
- `README.md`：补一句连续标注时块之间自动分隔。
