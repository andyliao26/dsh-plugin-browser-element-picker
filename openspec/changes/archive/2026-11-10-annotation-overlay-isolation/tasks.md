# Tasks

## 1. 测试夹具与真实输入助手

- [x] 1.1 在 `test/fixture.html` 增加假抽屉：容器内含一个带输入框的 `fieldset`，并挂四种“判定外面”的守卫（`focusin` 立即抢焦点、`focusout` 后 `setTimeout` 复查、`mousedown` 即关闭且包含一个在加载时注册到 `window` 捕获阶段的版本、以及一个绕过包含性判定的定时抢焦点版本），另加一个无关容器；验证：`node test/guest-annotate.test.mjs` 既有用例全部通过，新节点不影响既有用例依赖的坐标与计数。
- [x] 1.2 在 `test/cdp.mjs` 增加基于 `Input.dispatchMouseEvent` 的真实按压助手；验证：用它在 fixture 页面上点一次普通按钮，`window.__pageClicks` 增加。
- [x] 1.3 在 `test/cdp.mjs` 增加基于 `Input.dispatchKeyEvent` 的真实逐字符输入助手；验证：先聚焦 fixture 里的页面输入框再输入，字符确实落在该输入框（证明助手走的是真实焦点归属，而不是直接赋值）。

## 2. 浮层身份：包含性委托

- [x] 2.1 在 `guestAnnotate()` 里包装 `Node.prototype.contains` 与 `Element.prototype.closest`：仅当入参 / `this` 是浮层根时改问当前 active 目标，其余严格透传；在 `cleanup()` 复原，并补一个 `pagehide` 监听兜底复原（同样在 `cleanup()` 里注销）。
- [x] 2.2 写断言（复用 1.1 的守卫）：在该抽屉里选中 `fieldset` 后，抽屉的包含性判定认为浮层在里面、无关容器仍判外、按选择器查祖先得到与目标一致的祖先；`mousedown` 关闭守卫（含 `window` 捕获版）在点过评论框后抽屉仍在；验证：`node test/guest-annotate.test.mjs` 新用例通过。
- [x] 2.3 写复原断言：正常完成、Esc 取消、宿主取消，以及“会话进行中再注入一次新会话”四种退出后，抽屉的包含性判定都回到原生语义、文档里不再有 `[data-dsh-annotation]` 节点；最后一个目标被移除退回选取态时同样判外；验证：同文件用例通过。

## 3. 焦点落定窗口与降级提示

- [x] 3.1 新增 `focusComment()`：立即检查 `shadow.activeElement`、失败则下一帧重试一次、约 100ms 做落定检查，仍未落上则再聚焦一次并在 120ms 后复核；`requestAnimationFrame` 句柄与定时器都要登记并在 `cleanup()` 取消，回调入口再查 `settled` 与 `mode`。用它替换 `select()`、`closeDesign()`、`commitDesign()` 的裸 `focus()`，并删掉 `onOverlayKey()` 里设计面板 Enter 之后那次重复调用。
- [x] 3.2 新增文案 `guest.removedTarget`、`guest.focusBlocked`，同步 `zh` / `en` 字典、`annotateScript()` 的 `texts`、`test/cdp.mjs` 的 `GUEST_TEXTS`；验证：`node test/bundle-contract.test.mjs` 的键位对齐通过，且新用例能真的把提示文案渲染出来（键位测试证明不了 `texts` 与 `GUEST_TEXTS` 两处）。
- [x] 3.3 写断言：选中后不点击、直接用 1.3 的助手输入，字符落在评论输入框且页面输入框值为空；`setTimeout` 守卫在落定窗口内抢过一次焦点后，最终 `shadow.activeElement` 仍是评论框；Shift 追加第二个目标后焦点重新落回评论框；取消会话或切进设计面板后，迟到的焦点回调不会把焦点抢回来；验证：`node test/guest-annotate.test.mjs` 新用例通过。
- [x] 3.4 写断言：面对绕过包含性的持续抢焦点守卫，`guest.focusBlocked` 提示出现、卡片与被选目标仍在；停掉它之后点评论框能继续输入（提示不阻塞）；验证：同文件用例通过。

## 4. 完成前的目标剔除

- [x] 4.1 新增 `dropDisconnected()`：按目标对象本身过滤三个平行数组（`targets` / `designs` / `baselines`）、重排 `active`、单次重渲染；`finish()` 入口先调用它，有剔除就提示并直接返回，不构造 payload、不 resolve；删掉原来的静默过滤分支。
- [x] 4.2 写断言：关闭抽屉后按 Enter，guest promise 仍未完成、chip 消失、提示出现、会话仍然活跃；目标全部被移除时退回选取态；验证：`node test/guest-annotate.test.mjs` 新用例通过（含改写既有“detached targets are dropped”用例：第一次 Enter 不再返回成功结果）。
- [x] 4.3 写断言：剔除后再次 Enter 以存活目标正常完成，payload 只含存活目标；宿主层（`test/injection.test.mjs`）补一条：会话未完成时不插入引用、不调用发送；验证：`node test/guest-annotate.test.mjs` 与 `node test/injection.test.mjs` 均通过。

## 5. 文档与版本

- [x] 5.1 在 `README.md` 交互区补一条“带抽屉的页面上标注时，卡片与抽屉互不打扰；评论框在选中后自动获得焦点；目标被移除时会提示并可重选”，验证：交互表与实现一致、覆盖新增可见行为。
- [x] 5.2 `package.json` 版本 `0.8.0` → `0.9.0`；验证：`for f in test/*.test.mjs; do node "$f" || break; done` 全量通过。

## Workflow follow-up

- 按项目约定用 `openspec verify` 复核实现与 artifacts 的一致性。
- 复核通过后归档本 change。
- 归档 `annotation-block-and-react-locator`（已 complete 但未归档），把 `page-annotation/prompt` 主 spec 与代码对齐；本 change 不碰这份漂移。
