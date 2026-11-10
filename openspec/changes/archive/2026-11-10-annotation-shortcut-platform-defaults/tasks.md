# Tasks

## 1. 修正默认键位

- [x] 1.1 `defaults` 只保留 `desktop:macos` 与 `desktop:windows`，Linux 桌面端不再声明；验证：`node test/toolbar.test.mjs` 断言键名集合恰为这两项。

## 2. 注册失败不再连坐

- [x] 2.1 用 `try/catch` 包住 `register()`，失败时 `console.warn` 并跳过；验证：同一用例里用一个会抛错的 `shortcuts` 服务再 `apply()` 一次，断言按钮仍然挂载且告警出现。

## 3. 文档与版本

- [x] 3.1 `README.md` 的快捷键行改成 macOS / Windows，并说明 Linux 需自行指定；验证：文档与实现一致。
- [x] 3.2 `package.json` 版本 `0.11.0` → `0.11.1`；验证：`for f in test/*.test.mjs; do node "$f" || break; done` 全量通过。
