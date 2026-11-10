# Tasks

## 1. 浮层边界

- [x] 1.1 在 shadow root 的冒泡阶段截断指针、鼠标、键盘与焦点事件，验证：`node test/guest-annotate.test.mjs` 的“真实按压不关抽屉”用例通过，且卡片按钮、Enter/Esc、设计面板输入仍工作。
- [x] 1.2 把 `Event.prototype.composedPath` 委托给当前目标的祖先链（仅对含浮层根的路径生效），并在 `cleanup()` 复原，验证：`node --check lib/client.js` 与全量测试通过。
- [x] 1.3 在 `test/fixture.html` 增加三种“非 contains”的外部点击判据（`composedPath` 冒泡版、`composedPath` 捕获版、`parentNode` 上溯版），验证：去掉 1.1 或 1.2 任一半，同一用例都会失败（变异检查）。
- [x] 1.4 补“会话结束后页面仍能收到自己的事件”断言（会话结束后在抽屉外按一下，页面自己的关闭逻辑必须照常触发），验证：`node test/guest-annotate.test.mjs` 通过。

## 2. 文档与版本

- [x] 2.1 `package.json` 版本 `0.9.0` → `0.10.0`，验证：`for f in test/*.test.mjs; do node "$f" || break; done` 全量通过。
