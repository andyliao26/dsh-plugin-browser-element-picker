# Proposal

## Why

上一版把浮层的“身份”委托给了当前目标：页面用 `contains` / `closest` 判断“这是不是外面”时，答案与目标元素一致，焦点不再被抽屉抢走。但页面判定外部点击并不只有这两个 API。EnvoyOps 的 `环境维护` 抽屉在点评论框时仍会收起，而点选元素时不会——差别在于点选那一刻的点击被会话在 `window` 捕获阶段吞掉了，页面根本没看见；点评论框的点击则原样冒泡出去，页面拿到的 `target` 是被重定向到浮层根的外部节点。

也就是说：只要事件真的离开了浮层，页面总有机会用别的判据（`composedPath()`、沿 `parentNode` 上溯、`compareDocumentPosition`）得出“这一下点在外面”。补 `contains` / `closest` 只能挡住用这两个 API 的写法。

## What Changes

- 浮层内部产生的指针、鼠标、键盘、焦点事件不再跨出 shadow 边界：在 shadow root 的冒泡阶段截断，页面的 document / body 级监听收不到。
- 页面若用 `composedPath()` 判断，看到的事件路径从浮层根继续延伸进**当前目标的祖先链**，而不是浮层自己的父节点（`<html>`）。
- 捕获阶段注册的页面监听仍会先看到事件，但它们拿到的 `composedPath()` 同样已经被改写；只有“沿 `parentNode` 上溯”这类判据需要靠截断本身挡住（它们在冒泡阶段才跑）。
- 版本 `0.9.0` → `0.10.0`。

不改的东西：浮层自己的默认行为（光标落点、拖选、双击选词、按钮点击、Enter/Esc）全部保留；会话结束仍是完整复原；`contains` / `closest` 的委托不变。

## Capabilities

### New Capabilities

（无。）

### Modified Capabilities

- `page-annotation/overlay-isolation`: 新增一条“页面不得观察到浮层内部产生的事件”，并给“结束会话完全复原”补一个“事件路径不再被改写”的场景。

## Impact

- `lib/client.js` 的 `guestAnnotate()`：shadow root 上的边界截断、`Event.prototype.composedPath` 的委托与复原。
- 测试：`test/fixture.html` 增加三种“非 contains”的外部点击判据（`composedPath` 冒泡版、`composedPath` 捕获版、`parentNode` 上溯版）；`test/guest-annotate.test.mjs` 的“真实按压不关抽屉”用例自动覆盖三者，并补一条会话结束后的路径复原断言。
- 无宿主 API、依赖、bundle 契约变更。
