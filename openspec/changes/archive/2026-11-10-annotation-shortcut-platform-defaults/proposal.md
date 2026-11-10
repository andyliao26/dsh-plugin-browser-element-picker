# Proposal

## Why

`0.11.0` 给 Linux 桌面端也声明了 `Ctrl+Shift+C`。平台把「主修饰键 + C」这一族判为保留组合（复制），注册时直接抛 `Reserved shortcut default`；这个异常从插件注册里冒出来，把 `install()` 之后的按钮挂载整段跳过了——结果是快捷键不生效，连地址栏右侧的标注按钮也一起消失。

## What Changes

- 去掉 `desktop:linux` 的默认键位：Linux 桌面端一开始就没有绑定，用户可在 设置 → 快捷键 里自行指定一个平台允许的组合。
- 包住注册调用：注册被拒（保留组合、与其他插件冲突、服务不可用等）只是没有快捷键，记一条 `console.warn`，按钮与会话一切照常。
- 版本 `0.11.0` → `0.11.1`。

## Capabilities

### New Capabilities

（无。）

### Modified Capabilities

- `page-annotation/session-launch`: 默认键位的平台范围收窄为 macOS / Windows 桌面端；新增「注册被拒不得影响按钮」的要求。

## Impact

- `lib/client.js`：`defaults` 去掉 linux、注册包 `try/catch`。
- `README.md`：快捷键行的平台说明。
- 测试：`test/toolbar.test.mjs` 断言 `defaults` 只有两个键；新增「注册抛错时按钮仍然挂载并记录告警」的用例。
