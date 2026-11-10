# Proposal

## Why

现在只有一种开始标注的方式：点侧边栏浏览器地址栏那一行的准星按钮。要在页面上反复标注时，鼠标要先离开页面去够按钮；而应用本身已经有一套完整的快捷键系统（可改键、冲突校验、录制界面），插件此前没有接入。

## What Changes

- 注册一个可改键的命令，默认 macOS 为 `⌘⇧C`、Windows / Linux 为 `Ctrl+Shift+C`，默认只声明桌面端（Web 构建里插件本来就不能注入页面）。
- 只在侧边栏浏览器**有网页在屏幕上**时认领这个组合：没有可见的 `webview`、或者当前文档不是 http(s) 时返回 `pass`，组合仍然归应用与系统。
- 已经在一个会话里再按一次，等同于按钮的第二次点击——结束会话。
- 命令出现在应用的快捷键设置里，名称走插件自己的 i18n（「标注页面元素」）；改键后按钮 tooltip 与 `aria-keyshortcuts` 立即跟着变。
- 版本 `0.10.0` → `0.11.0`。

不改的东西：标注会话本身、块文本、注入路径、按钮的既有行为都不变。

## Capabilities

### New Capabilities

- `page-annotation/session-launch`: 一次标注会话怎么被发起——工具栏按钮之外的键盘入口、它的默认键位、生效范围（只在有页面时）、以及改键与提示的可见性。

### Modified Capabilities

（无。）

## Impact

- `lib/client.js`：`install()` 里向 `ctx.shortcuts` 注册命令、可见页面解析、tooltip 与 `aria-keyshortcuts` 跟随绑定。
- i18n：新增 `shortcut.annotate`（两套字典）。
- 测试：`test/toolbar.test.mjs` 的 mock `ctx` 增加 `shortcuts` 服务，断言注册形状、默认键位、`pass`/`handled` 分叉、tooltip 跟随。
- 无宿主 API、bundle 契约变更；`package.json` 的 `files` 不变。
