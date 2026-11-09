# Proposal

## Why

当前设计模式会在选中元素上即时写入行内样式（`style.setProperty(..., "important")`），把「记录意图」做成了「修改页面」。这与标注功能的定位冲突：用户想要的是一次可回看、可编辑的细节调整说明，由 Agent 决定如何落到源码，而不是插件直接改页面。即时写入还带来三个具体问题：取消变成回滚、会话结束时采集的 computed 样式被自己的改动污染、提示词里只有新值没有旧值（`width: 500px` 而不是 `120px → 500px`），Agent 无法理解改动的方向。

同时，设计面板内容在矮视口下超出可视区域，macOS 覆盖式滚动条平时不可见，用户看不出还能继续滚动；多选场景下设计数据以数组下标为键，删除元素会让调整错挂到别的元素上。

## What Changes

- **设计模式改为纯意图记录**：打开面板时读取一次 computed style 作为 baseline（字符串快照），控件回显当前值；用户改动只进入 draft，不写 DOM；Apply 提交为 `{property, from, to}` delta，Cancel/Esc 丢弃 draft；重开回填已提交的 `to`，`from` 始终是 baseline。
- **回显保真**：透明/半透明颜色保留原值（`transparent` / `rgba(...)`），不先转 hex；下拉框动态补上当前值（`normal`、`space-evenly`、`safe center`、任意字重）；数值最多保留一位小数；padding/margin 按实际触碰的 longhand 记录；空输入表示清除该字段。
- **提示词按属性逐行输出**：单元素为 `- 设计调整：` 加缩进的 `property: from → to` 行；多元素为 `- 设计调整（第 N 个元素）：`。`design[].changes` 由 `string[]` 改为 `{property, from, to}[]`，由 host 侧格式化。
- **评论卡片展示待发送的 delta**（只读），铅笔按钮显式携带元素引用回到该元素的设计面板。
- **多目标按元素身份绑定**：设计数据不再用数组下标存储，删除/重选/清空时随元素同步；提交时丢弃已脱离文档的目标。
- **面板可滚动且可感知**：面板正文加常显细滚动条、`scrollbar-gutter`、底部渐隐；卡片 delta 区加高度上限。
- **键盘与覆盖层边界**：焦点在按钮上时 Enter 不再被全局劫持（铅笔按钮可用键盘激活）；设计模式下页面级 Enter 不结束会话；页面级按键补 IME 判断；覆盖层临时修改的 `cursor` / `user-select` 保存并还原原值。

**BREAKING**（仅内部契约）：guest 结果中的 `design[].changes` 由字符串数组变为对象数组，提示词排版随之变化。消费方只有 host 侧 `formatAnnotation()` 与本仓库测试，没有外部 API 或 Host 服务受影响。

## Capabilities

### New Capabilities

- `page-annotation/design-intent`: 设计模式如何采集并表达「从当前样式到目标样式」的调整意图，包括回显、草稿/提交状态、按元素绑定、提示词输出与卡片展示。

### Modified Capabilities

无（项目此前没有已归档的 spec）。

## Impact

- `lib/client.js`：`guestAnnotate()` 的设计面板、`designList()`、`formatAnnotation()`、双语字典与 `annotateScript()`、`setMode()` / `onKey()` / `onOverlayKey()`、评论卡片。
- 测试：`test/guest-annotate.test.mjs`（live-style 断言重写）、`test/injection.test.mjs`（提示词排版）、`test/payload.test.mjs`（端到端）、`test/bundle-contract.test.mjs`（新增占位符断言）、`test/cdp.mjs`（`GUEST_TEXTS`）。
- 文档与版本：`README.md` 设计模式与提示词示例、`AGENTS.md` 契约 #4/#6、`package.json` `0.2.2 → 0.3.0`。
- 无新增依赖，无 Host 侧改动，安装方式不变。
