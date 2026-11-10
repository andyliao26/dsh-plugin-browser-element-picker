# Tasks

## 1. 命令注册

- [x] 1.1 在 `install()` 里取 `ctx.shortcuts`，注册 `browser-element-picker.annotate`：区分桌面三平台的默认键位、区域 `page` + `editable`、空模态列表、本地化标签与英文别名；验证：`node test/toolbar.test.mjs` 断言注册形状。
- [x] 1.2 用 `resolve()` 判定可见页面（已连接 + 有实际宽高 + http(s)），无页面时返回 `pass`，有页面时返回 `handled` 并在 `run()` 里开始/结束会话；验证：同一用例断言两条分叉，且“取消会话”沿既有 `start()` 的切换语义。

## 2. 提示与可见性

- [x] 2.1 按钮 `paint()` 读 `ctx.shortcuts.catalog` 快照，把当前生效键位写进 tooltip 与 `aria-keyshortcuts`，并订阅目录变化重绘；未绑定时回退标签并移除属性；验证：`node test/toolbar.test.mjs` 的 tooltip/属性断言。
- [x] 2.2 `zh` / `en` 两套字典新增 `shortcut.annotate`；验证：`node test/bundle-contract.test.mjs` 的键位一致性。

## 3. 文档与版本

- [x] 3.1 `README.md` 交互表补一行并说明改键入口与生效范围；验证：文档与实现一致。
- [x] 3.2 `package.json` 版本 `0.10.0` → `0.11.0`；验证：`for f in test/*.test.mjs; do node "$f" || break; done` 全量通过。
