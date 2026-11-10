# Design

## Context

动机见 `proposal.md`，行为契约见 `specs/page-annotation/overlay-isolation/spec.md`。这里只记实现必须尊重的既有约束。

`guestAnnotate()` 的源码被 `annotateScript()` 取 `.toString()` 后交给 `webview.executeJavaScript`，因此它必须自包含、ES5 风格（`var` / `function`，无箭头、无 `const`、无可选链），不能引用模块作用域的任何东西。会话在页面里只挂一个 shadow host（`div[data-dsh-annotation]`，挂在 `document.documentElement` 下，与 `<body>` 平级），所有浮层节点都在这一个 shadow root 里；`window.__dshAnnotationState` 是宿主取消会话的唯一把手。

页面事件侧现状：`pointerdown` / `pointerup` / `mousedown` / `mouseup` / `click` / `dblclick` / `auxclick` / `contextmenu` 都在 `window` 捕获阶段被 `swallow()`（`preventDefault` + `stopPropagation` + `stopImmediatePropagation`），但 `isOurs(event)` 为真时直接放行。这些监听是**注入时**才注册的，所以它们只能盖住注册在它们之后、以及位于事件路径更深处（`document`、`body`、元素）的监听；页面若在加载时就在 `window` 捕获阶段装了自己的监听，那条会排在我们前面先跑。焦点事件则根本不在这张拦截表里。

结论：吞事件是尽力而为，**唯一与注册顺序、监听阶段都无关的判据是包含性**。这正是整个设计的方向——不加“冻结页面”，而是让页面把浮层当成自己人。

## Goals / Non-Goals

**Goals:**

- 页面用包含性判断决定“这是不是外面”的任何模态层（抽屉、Sheet、Dialog、焦点守卫），在标注期间都把浮层视为当前层的一部分。
- 选中后的焦点归属可观测、可自检、可降级。
- 会话结束时页面状态与开启前逐项一致。
- 被页面卸载的目标不会产出无效标注。

**Non-Goals:**

- 不把评论框搬到 DSH 层渲染（那会把事件泄漏换成 webview 失焦泄漏，且要动视图合成）。
- 不冻结页面命中测试，不改动选取阶段既有的事件吞断策略。
- 不支持 iframe / Shadow DOM 内元素的深层选取（既有范围限制不变）。
- 不为“页面无限抢占焦点”提供强攻方案，只提供有限重试与降级提示。

## Decisions

### 1. 用 `contains` / `closest` 的委托表达“浮层的身份”

会话期间把 `Node.prototype.contains` 与 `Element.prototype.closest` 各包一层：只有当入参 / `this` 是浮层根 `host` 时，改问当前 active 目标（`nativeContains.call(this, activeTarget)` / `nativeClosest.call(activeTarget, selector)`），其余调用原样透传。安装点在会话初始化，复原点在 `cleanup()`。`pagehide` 直接按取消结束会话（而不是只把原型换回去），这样浮层、计时器、监听与补丁一次性复原，不会在页面藏起来时留下半截状态；分页缓存恢复后会话已经结束，这是可以接受的取舍。

这条判据与监听阶段无关，所以它能覆盖捕获、冒泡、定时器复查，也能覆盖注册在我们之前的 `window` 捕获监听——`swallow()` 做不到的那类。

**考虑过并放弃：**

- *在 shadow root 上 `stopPropagation` 冒泡事件*：只有冒泡阶段的页面监听受益，捕获阶段（Radix 一类）静默失效——失败不可见，比补丁本身更危险。
- *把 `host` 挪进抽屉子树*：抽屉普遍用 `transform` 做滑入动画，会让 `position: fixed` 的坐标系整体偏移，且被 `overflow` 裁剪。
- *把 `host` 从 `<html>` 改挂到 `<body>`*：只能让 `body.contains` 成立，对真正的 `sheet.contains(host)` 无效；委托已覆盖，不值得为这点收益引入 `body` 带 `transform` 的回归面。

### 2. 焦点有明确的“落定窗口”与复核

`select()` 末尾不再裸调 `textarea.focus()`，改为 `focusComment()`，分三步判定，全部读 **shadow root 的 `activeElement`**（焦点在 shadow 内时 `document.activeElement` 会是 `host`，只读它无法区分“落在输入框”和“落在别处”）：

1. 立即 `focus()` 并检查；失败则 `requestAnimationFrame` 重试一次。
2. 约 100ms 后做落定检查：仍未落上就再聚焦一次并**推迟 120ms 复核**——延迟只抢一次焦点的守卫会在这一步恢复，持续抢占的才会被判定失败。
3. 复核仍未落上，才弹“页面正占用焦点”的提示；窗口内成功则什么都不说。

“先补聚焦再立刻判断”是不够的：刚聚焦完必然通过检查，持续抢占的页面反而永远判不出来。复核这 120ms 就是用来区分“偶尔慢了一拍”和“一直在抢”。

提示在评论框重新获得焦点时立刻消失，且不参与焦点计时器的清理——否则换选元素时会掐掉它的过期计时，提示就永久留在屏幕上。

窗口内的 `requestAnimationFrame` 句柄与定时器都要登记，`cleanup()` 里取消；回调入口再查一次 `settled` 与 `mode === "edit"`，避免取消或切进设计面板后迟到的 `focus()` 把焦点从面板输入框抢走。

所有裸 `textarea.focus()` 都要收拢：`select()`、`closeDesign()`、`commitDesign()` 三处替换，`onOverlayKey()` 里设计面板 Enter 之后那次是重复调用（`commitDesign()` 已聚焦），直接删掉。

### 3. 完成前先剔除已卸载目标，会话不关闭

`finish()` 是 Enter、⌘Enter、勾选按钮三条路径的唯一汇合点。进入时先把 `!targets[i].isConnected` 的目标从三个平行数组（`targets` / `designs` / `baselines`）里一并剔除、重排 `active`，然后弹提示并**直接 return**——不构造 payload、不 resolve。若因此清空，`setMode("pick")` 回到选取态，用户可以重新选或 Esc。

这样已有的“静默丢弃”分支被彻底删掉，payload 结构不变（宿主侧零改动），也不会出现“给不存在的元素写了修改要求”。用户再按一次 Enter 时剩下的目标都已 connected，正常完成。

剔除以目标对象本身为准（不是下标），与既有“设计增量按元素存放”的约定一致。

一个目标都没有时按 Enter 不写任何东西、也不结束会话：空选择永远产不出标注。

**这会改变一个既有测试的期望**：`test/guest-annotate.test.mjs` 的“detached targets are dropped”用例现在断言第一次 Enter 就返回成功结果，必须改成“第一次 Enter 不返回、chip 减少、提示出现，第二次 Enter 返回只剩存活目标”。

### 4. 提示用一个独立节点，不复用顶部 hint

顶部 `hint` 只在 pick 模式显示，而剔除目标后恰好可能切回 pick 模式——复用会互相覆盖。新增一个 `notice` 节点（shadow 内、`position: fixed`、底部居中、`pointer-events: none`），`notify(text)` 显示 2.4 秒后清空；`cleanup()` 里清定时器。同类提示只有一个，新的覆盖旧的。

文案两条：`guest.removedTarget`（目标已从页面移除）、`guest.focusBlocked`（页面正占用焦点，请点击评论框）。按既有约束，两条都要进 `zh` / `en` 字典、`annotateScript()` 的 `texts`、`test/cdp.mjs` 的 `GUEST_TEXTS` 四处。`bundle-contract` 只比较 `zh` / `en` 的键位，证明不了另外两处，所以必须有一条真正把提示渲染出来的用例。

### 5. 测试要产生可信的输入与事件

现有 `clickPage()` 只合成 `pointermove` + `click`，没有 `pointerdown` / `mousedown`，走不到浏览器的原生聚焦路径；现有 `typeComment()` 直接给 `value` 赋值，测不出“字符到底进了哪个输入框”。两者都要补：

- `test/cdp.mjs` 增加基于 `Input.dispatchMouseEvent` 的真实按压助手，用于“点进评论框”。
- `test/cdp.mjs` 增加基于 `Input.dispatchKeyEvent` 的真实逐字符输入助手，用于“选中后不点击、直接打字”的归属断言；同时断言页面上的输入框值为空。
- 宿主层（`test/injection.test.mjs`）补“会话未完成时不插入、不发送”的断言——guest 测试只看得到 promise 是否 resolve，看不到 composer。

`test/fixture.html` 的假抽屉要备齐四类守卫，否则覆盖不到设计里的分支：按包含性判定后立即抢焦点（`focusin`）、按包含性判定后延迟复查（`setTimeout`）、`mousedown` 即关闭外加点外判定（含一个在加载时注册到 `window` 捕获阶段的版本）、以及一个**绕过包含性**的定时抢焦点版本（用来触发降级提示，包一层之后前面三类守卫本来就不该再抢了）。抽屉内部放一个带输入框的 `fieldset`，与真实页面的被标注对象同形；另放一个无关容器，用来断言“不包含目标就仍然判外”。

## Risks / Trade-offs

- **改原型方法的全局影响** → 只在 `other === host` / `this === host` 这一个分支上改变结果，其余调用严格透传；篡改范围与会话同生共死，`cleanup()` 单点复原并注销 `pagehide`。
- **页面自己已经改过 `contains`** → 捕获时保存的是“当前值”，复原时换回它，不会把页面的补丁一起抹掉。
- **页面把判据写成恒等比较（`event.target === sheetEl`）** → 委托不覆盖；这类写法当前不在处理范围，等真实遇到再评估。
- **页面在注入前就把监听挂在 `window` 捕获阶段** → 吞不掉，但包含性委托仍让它的判定答“内部”；残留风险是它若还检查了别的东西（类型、按钮、坐标），仍然可能关门。
- **窗口内的重试可能被慢守卫错开** → 100ms 的落定检查与 120ms 的复核就是为此存在；再慢视为持续抢占，走降级提示。
- **剔除目标后用户以为已完成** → 提示文案用“目标已从页面移除”，卡片保持打开，第二次 Enter 才真正完成。
- **取消时漏掉焦点计时器无法从行为上观察**（节点已摘除，迟到的 `focus()` 是空操作）→ 只由 `cleanup()` 里的显式取消保证；不为它写计时器插桩测试，测试比实现更容易变脆。

## Migration Plan

纯客户端 bundle 行为变更，无数据迁移、无宿主契约变更。发布方式照旧：改 `lib/client.js` 与 `package.json` 版本（`0.8.0` → `0.9.0`），安装到 profile 后切换侧边栏标签页或重载即可生效。回退即回退版本。

## Open Questions

- 无。剩余的未知（页面用恒等比较判外、页面用我们没覆盖的 `elementFromPoint` 判外）都不改变 spec、方案或任务拆分，已在 Risks 里记为残余风险。
