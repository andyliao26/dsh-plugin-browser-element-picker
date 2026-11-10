# Design

## Context

动机见 `proposal.md`，契约见 delta spec。既有事实：浮层根挂在 `<html>` 下、与 `<body>` 平级；`isOurs(event)` 用 `composedPath().indexOf(host)` 判断事件是否来自浮层，来自浮层的事件**不吞**（否则光标定位与拖选会被 `preventDefault` 废掉）；页面的 `pointerdown` / `mousedown` / `click` 在 `window` 捕获阶段被吞，仅限打向页面元素的那一路。

## Goals / Non-Goals

**Goals:**

- 页面用任何“事件是不是从我外面来的”判据，都得不到“外面”这个答案。
- 浮层内部的原生行为一个都不损失。

**Non-Goals:**

- 不把事件伪装成来自页面元素（那会让页面真的去处理它，反而更糟）。
- 不拦捕获阶段：那会连带废掉浮层自己的输入框（`stopPropagation` 在 `window` 捕获阶段执行，事件就到不了 textarea）。
- 不改浮层与页面的 DOM 归属。

## Decisions

### 1. 在 shadow root 的冒泡阶段截断

给 shadow root 挂一组冒泡监听（`pointerdown` / `pointerup` / `mousedown` / `mouseup` / `click` / `dblclick` / `auxclick` / `contextmenu` / `keydown` / `keyup` / `focusin` / `focusout`），只做 `stopPropagation()`。

为什么是冒泡阶段：`window` 捕获阶段的监听先于 shadow root 执行，在那里截断会让事件根本到不了 textarea，光标、选区、按钮全部失效；而在 shadow root 冒泡阶段截断时，浮层内部该跑的监听（textarea 的 `input`/`keydown`、按钮的 `click`、设计面板输入框的 `blur`）都已经跑完了。`stopPropagation` 不阻止同一节点上的其他监听，所以 `onOverlayKey`（也挂在 shadow root 上）照常工作。

为什么需要它：沿 `parentNode` 上溯这类判据（MUI 的 `ClickAwayListener` 就是走祖先链）根本不用 `contains`，只能靠“事件压根到不了页面”来解决。

### 2. `composedPath()` 委托给当前目标的祖先链

气泡被截断只能挡住冒泡阶段的监听。捕获阶段注册在 `document` 上的监听（Radix / Headless UI 一族）仍然先看到事件，于是把 `Event.prototype.composedPath` 也包一层：当路径里含浮层根时，把当前目标的祖先链（到 `document` 为止）插在浮层根之后返回。

这仍是同一条谎：“浮层在目标所在的位置”。它让 `path.includes(panelEl)` 与 `path.indexOf(sheetEl) >= 0` 都成立，而 `path[0]`（真实目标）不被改动，所以页面若用 `path[0]` 读“点到了哪个元素”，看到的是我们真实的 textarea——这比谎报成页面元素安全。

**考虑过并放弃：**

- *把事件重新派发成来自页面元素*：合成事件没有原生默认行为，还要冒页面真的去处理它的风险。
- *把浮层塞进抽屉子树*：抽屉普遍用 `transform` 做滑入动画，`position: fixed` 的坐标系会整体偏移，还会被 `overflow` 裁掉。
- *把卡片搬进 iframe*：事件天然不跨文档，是最彻底的隔离，但要重做样式、输入、i18n 注入与全套测试，代价远超本次修复。

## Risks / Trade-offs

- **页面再也收不到浮层里的点击/按键** → 这是本次要的行为；浮层自己的控件不受影响。
- **`composedPath` 被改写可能影响页面的事件委托逻辑** → 只对含浮层根的路径生效，会话结束立刻复原；`path[0]` 保持真实目标。
- **捕获阶段 + 恒等比较（`event.target === panel`）仍无法覆盖** → 这类写法与“外部点击”语义不符，当前不处理。
- **`compareDocumentPosition` 一类判据不覆盖** → 同样属于少见写法；若真实遇到，再加入同一套委托。

## Migration Plan

纯客户端 bundle 行为变更：`0.9.0` → `0.10.0`，安装目录是 `link:` 依赖，重载即可生效；回退即回退版本。

## Open Questions

无。
