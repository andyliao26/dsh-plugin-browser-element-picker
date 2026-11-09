# Tasks

## 1. 基线数据与归一化

- [x] 1.1 把设计数据从「targets 下标为键」改为按元素绑定（平行数组或 `Map<Element, entry>`），删除/重选/清空元素时同步清理；在 `test/guest-annotate.test.mjs` 增加「三目标删除首项后剩余 delta 不串位」断言并通过
- [x] 1.2 增加面板打开时的一次性 computed 快照（每属性 `getPropertyValue()` 后存字符串），区分 baseline / committed / draft；用 guest 测试断言重开面板不会重采 baseline（改后取消仍回到原 baseline）并通过
- [x] 1.3 实现按属性归一化：数值 1 位小数去尾零、颜色 `transparent`/hex/`rgba()`、padding/margin 按实际触碰的 longhand 记录、字重无单位；用 `test/payload.test.mjs` 或新增 guest 断言覆盖透明背景、小数宽高、简写边距并通过

## 2. 回显与零写入

- [x] 2.1 控件改为直接读取「已提交的 to，回退 baseline」；对当前值不在选项内的下拉（`normal`、`space-evenly`、`safe center`、任意字重）动态补当前值选项；验证：guest 测试断言非 flex 元素的 `justify-content` 回显为 `normal` 而非第一项
- [x] 2.2 清空数字输入时删除该字段 draft 并回显 baseline；opacity clamp 0–1、尺寸拒绝负数；验证：guest 测试覆盖清空、越界与非法输入后不产生 delta
- [x] 2.3 把 `applyStyle()` 改为只写 draft，删除 `originals` 快照、`closeDesign()` 还原与 `openDesign()` 重放逻辑；验证：guest 测试在输入、Apply、Cancel 全程断言目标元素的 `style.*`、computed 值与 bounding box 均未变化
- [x] 2.4 处理 `setMode()` 的 `cursor` / `user-select`：保存页面原值并在会话结束还原；验证：guest 测试在页面预先设置 `cursor:pointer` 后断言会话结束恢复原值

## 3. 结果结构与提示词

- [x] 3.1 将 `designList()` 的 `changes` 改为 `{property, from, to}[]`，按元素顺序输出，过滤无 delta 条目；验证：guest 测试断言 Apply 后结构、属性顺序与 `from`/`to` 正确
- [x] 3.2 在 `formatAnnotation()` 中逐行渲染设计调整（header + 缩进 `property: from → to`，多目标带“第 N 个元素”），新增 `prompt.designHeader*` / `prompt.designChange` 字典键并贯通 `annotateScript()`；验证：`test/injection.test.mjs` 断言单目标多属性、多目标两种排版
- [x] 3.3 更新 `test/bundle-contract.test.mjs` 覆盖新增 design 模板的占位符与 zh/en 键一致；验证：该测试通过
- [x] 3.4 扩展 `test/payload.test.mjs` 做真实 guest → host 端到端：断言设计 delta 进入提示词且没有对象泄漏或 `[object Object]`；验证：该测试通过

## 4. 卡片与键盘

- [x] 4.1 评论卡片增加当前 active 元素的 delta 行（`property: from → to`），delta 区设 `max-height` 并内部滚动，铅笔按钮显式绑定所属元素打开面板；验证：guest 测试断言 Apply 后卡片出现 delta、Cancel 后不出现、铅笔打开的是该元素的 panel
- [x] 4.2 键盘交互：`onOverlayKey()` 在焦点为 button 时不再拦截 Enter，页面级 `onKey()` 在设计模式下不结束会话，两处补 `isComposing || keyCode === 229`；验证：guest 测试覆盖「铅笔聚焦 + Enter 打开面板」「IME Enter 忽略」「设计模式页面级 Enter 保留 draft」
- [x] 4.3 提交时过滤 `!isConnected` 的目标及其中设计数据；验证：guest 测试在选中后移除该节点，断言结果中不再包含该目标

## 5. 滚动可用性

- [x] 5.1 面板正文加常显细滚动条样式（`scrollbar-width`、`::-webkit-scrollbar`、`scrollbar-gutter: stable`、`overscroll-behavior: contain`）与底部渐隐；验证：guest 测试在 `window.resizeTo(1000, 520)` 后断言 `scrollHeight > clientHeight`
- [x] 5.2 短视口滚到底后最后一个字段与 Apply/Cancel 可达；验证：guest 测试把滚动位置推到末尾并断言 footer 按钮的 bounding box 在视口内

## 6. 文档与发布

- [x] 6.1 更新 `README.md`：设计模式小节、单/多元素提示词示例、使用边界（去掉「实时生效/刷新即消失」），并核对「自检」列表与命令可执行
- [x] 6.2 更新 `AGENTS.md` 的契约 #4（外部结果结构与注入优先级）与 #6（去掉行内样式表述，写入零写入与身份绑定约束）
- [x] 6.3 将 `package.json` 版本升到 `0.3.0`，并在 README 中标注提示词排版的内部破坏性变化；验证：`node -e "console.log(require('./package.json').version)"` 输出 `0.3.0`
- [x] 6.4 跑全量测试 `for f in test/*.test.mjs; do node "$f" || break; done`，全部输出 OK；再在桌面端侧边浏览器人工验收：开面板回显、改多项、Apply、重开、多选删除首项、取消、短视口滚动、中文 IME

## Workflow follow-up

- 归档前按项目评审要求确认实现与 spec 一致。
- 归档后验证 `openspec/specs/page-annotation/design-intent/spec.md` 已生成。
