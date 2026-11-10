# Design

## Context

`@deepseek-ai/dsh-client-shortcuts` 在注册时对每个声明的 `runtime:platform` 校验默认键位。`bindingIssue()` 对 `desktop:macos` / `desktop:windows` 直接放行，对 `desktop:linux` 则继续检查，而「主修饰键 + `KeyC`」命中保留组合（复制），返回 `reserved`；注册因此抛错。插件把这个调用放在 `install()` 的 `ctx.effect()` 里，异常逃出来就中断了 `install()`，后面的 `scan()` 没跑，按钮自然没有。

## Goals / Non-Goals

**Goals:**

- 快捷键的得失与按钮的挂载彻底解耦。
- 默认键位只声明平台确实接受的那些。

**Non-Goals:**

- 不绕过平台校验、不硬编码键位、不为 Linux 猜一个"差不多"的组合。
- 不改分发、判定、tooltip 这些既有行为。

## Decisions

### 1. Linux 桌面端不声明默认

平台的保留规则把 `Ctrl+C`、`Ctrl+Shift+C` 一类都算作复制族，Linux 上无法使用这个组合。与其挑一个用户没要的键，不如让它保持未绑定，由用户在设置里指定——速查会把未绑定的命令显示为"暂无快捷键"，不会误导。

### 2. 注册失败只降级，不连坐

`register()` 被包在 `try/catch` 里，失败时 `console.warn` 一条并把 disposer 当作不存在。快捷键是增强能力：保留组合、与其他插件冲突、服务未挂载，任何一种都不应该让标注按钮消失。这条也顺便覆盖了"用户的机器上恰好有别的插件占了同一个组合"这种运行时情况。

**考虑过并放弃：** 在 `catch` 里换一个候选键位重试——那等于插件替用户做审美决定，还会让不同机器的默认键位不一致。

## Risks / Trade-offs

- **Linux 用户没有开箱即用的快捷键** → 设置里可自行指定；README 写清楚。
- **`catch` 可能掩盖真实错误** → 用 `console.warn` 带原始错误输出，开发时在 DevTools 里一眼可见。

## Migration Plan

`0.11.0` → `0.11.1`，`link:` 依赖，重载生效。回退即回退版本。

## Open Questions

无。
