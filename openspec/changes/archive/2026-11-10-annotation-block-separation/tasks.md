# Tasks

## 1. 分隔

- [x] 1.1 `inject()` 组装块前读 `shell.caretSpan()`，非零插入点加 `\n\n---\n\n` 前缀；`caretSpan` 缺失或抛错时退回不加前缀。验证：`node test/injection.test.mjs` 两条新断言。
- [x] 1.2 测试 mock 的光标位置改成可变值，新增「已有内容 → 带分割线」「空草稿 → 不带」两例；验证：去掉前缀实现时该用例失败（变异检查）。

## 2. 文档与版本

- [x] 2.1 `README.md` 补一句连续标注时块之间自动分隔；验证：文档与实现一致。
- [x] 2.2 `package.json` 版本 `0.11.1` → `0.12.0`；验证：`for f in test/*.test.mjs; do node "$f" || break; done` 全量通过。
