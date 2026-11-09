# Design

## Context

设计模式位于 `lib/client.js` 的 `guestAnnotate()` 内，随整个会话通过 `annotateScript()` 注入页面；结果对象由 host 侧 `formatAnnotation()` 渲染。现状与约束：

- 面板 16 个字段直接读写元素行内样式（`applyStyle()`），并用 `originals` 快照实现取消还原。
- `design` 以「目标数组下标」为键，`removeTarget()` 只做 `splice`，不重排键。
- `guestAnnotate` 是 `toString()` 序列化的源码，必须自包含、保持 ES5 与函数名/形状不变；测试用花括号匹配提取它。
- host 侧只做文本组装，不感知页面 DOM；composer 集成（引用块/发送）不变。
- 所有新文案必须同时进入 `zh`/`en` 字典、`annotateScript()` 的 `texts` 和 `test/cdp.mjs` 的 `GUEST_TEXTS`。

目标与范围见 `proposal.md`，行为契约见 `specs/page-annotation/design-intent/spec.md`。

## Goals / Non-Goals

**Goals:**

- 设计模式只记录意图：打开时采一次 computed 基线，编辑只改 draft，Apply 产生 delta。
- 回显与 `from` 值在可比范围内忠实于当前渲染值，并给出稳定的归一化规则。
- 设计数据与元素身份绑定，删除/重选/页面替换都不会错挂。
- 提示词、卡片、滚动与键盘行为与新语义一致。

**Non-Goals:**

- 不引入 CSS 解析器、通用样式求值或源码映射；不做「恢复源码声明」的推断。
- 不扩展 16 字段集合，不为非对称圆角/边框或双值 gap 增加多控件。
- 不改 composer 的引用块/发送链路，不改 Host 侧空 `apply()`。
- 不追求「页面样式绝对零触碰」：覆盖层自身的 DOM 与临时 cursor 属于交互层，只要求会话结束后还原页面原值。

## Decisions

### 1. 三段状态 + 字符串快照，按元素绑定

每个目标维护：

```
baseline: Map<property, normalized string>   // 打开面板时采一次
committed: Array<{ property, from, to }>     // Apply 后
draft: Map<property, to> | null              // 面板打开期间
```

实现上用与 `targets` 平行的数组或 `Map<Element, entry>`，不再以数组下标为键；删除元素时同步删除其 entry。`getComputedStyle()` 返回 live 对象，因此 baseline 必须落成字符串（每个属性 `getPropertyValue()` 后归一化），不能缓存对象或对象引用。`openDesign()` 不再「先建控件再重放 seed」，而是让控件直接读取「已提交的 to，回退 baseline」。

备选：每次打开都重新采集 baseline（否决——页面可能已变化，且重开会破坏 `from` 的稳定性）；把 baseline 直接存成 computed 对象（否决——live 对象会被后续读取污染）。

### 2. 零写入：删除行内样式与回滚逻辑

`applyStyle()` 改为 `record(property, value)`：只写 draft，不触碰元素。删除 `originals`、`closeDesign()` 的还原分支、`openDesign()` 的重放逻辑。Apply 只把 draft 转成 committed；Cancel/Esc 只清空 draft。

覆盖层的 `setMode()` 仍会临时设置根元素 `cursor` / `user-select`，改为先保存原值、会话结束还原（现状是直接 `removeProperty`，会删掉页面自定义值）。

备选：保留「预览」开关（否决——与本次需求相反）；仅在设计模式不使用 cursor（否决——拾取态仍需准星光标）。

### 3. 归一化层按字段类型实现，不做通用 CSS 求值

- 数值：`parseFloat` 后最多 1 位小数并去尾零；尺寸补 `px`，字重保持无单位。
- 颜色：alpha = 0 → `transparent`；alpha = 1 → `#rrggbb`；0 < alpha < 1 → 保留 `rgba(...)`。
- padding/margin：按四边分别读取基线，只把用户实际触碰的边以 longhand（`padding-top` 等）写入 delta，避免连带修改与取整丢失。
- 下拉：若当前值不在选项内（`normal`、`space-evenly`、`safe center`、任意字重），动态插入一个当前值选项，保证回显不撒谎。
- 空输入：删除该字段的 draft delta 并回显 baseline；opacity clamp 到 0–1；尺寸拒绝负数。
- 无操作判断：仅比较用户触碰过的字段，按属性比较归一化后的值（颜色规范化后、数值按 1 位小数、简写按折叠形式），不做跨属性等价推断。

备选：引入 CSS 解析/求值库（否决——桌面 webview 无构建链，且不值得为 16 个字段引入依赖）。

### 4. 结构化 delta 由 host 格式化

guest 结果保持外层 `{ index, selector, changes }`，`changes` 改为 `{ property, from, to }[]`。`formatAnnotation()` 逐条渲染：

```
- 设计调整：
  - justify-content: normal → flex-end
  - width: 91.3px → 466px
```

多目标用 `- 设计调整（第 N 个元素）：`。箭头为固定字符，不参与 i18n；header 与每行模板进字典，便于中英文对齐。

备选：guest 侧拼字符串（否决——i18n 与格式化职责混在页面上下文里，且卡片也要复用同一份 delta）；`changes` 保持 `string[]`（否决——卡片与测试需要结构性断言）。

### 5. 卡片展示与入口

卡片保留元素 chips；在 chips 下方按行展示当前 active 元素的 committed delta，区域设 `max-height` 并可滚动。铅笔按钮直接捕获它所属元素的引用调用 `openDesign(element)`，不依赖 `active` 下标。Cancel 丢弃的 draft 不进入卡片。

### 6. 滚动与键盘

- 面板：`panelBody` 保留 `overflow:auto`，加 `scrollbar-width: thin`、`::-webkit-scrollbar` 8px、`scrollbar-gutter: stable`、`overscroll-behavior: contain`、底部渐隐；`placePanel()` 的视口钳制保留。自动化测试用 `window.resizeTo(1000, 520)` 验证可滚到底；「常驻可见」在真实 macOS DSH 中目视验收。
- 键盘：`onOverlayKey()` 在 `event.target` 为按钮时不再拦截 Enter，让原生 click 生效；设计模式下页面级 `onKey()` 遇到 Enter 直接返回；页面级 `onKey()` 与 `onOverlayKey()` 统一补 `isComposing || keyCode === 229` 判断。

### 7. 提交时的目标清理

`finish()` 组装结果前过滤 `!target.isConnected` 的目标，并同步过滤其设计数据；selector 仍在提交时按当前 DOM 重新计算（保持既有行为），但不再对失联元素生成条目。

## Risks / Trade-offs

- [单值控件无法忠实表达非对称圆角/边框/双值 gap] → `from` 保留完整的 computed 简写、输入框回显首个数值，`to` 表示统一值；在 README 与设计文档中写明该限制，不扩 UI。
- [1 位小数会丢失亚像素精度] → 提示词只表达意图，且 0.1px 级差异无实现意义；不将其用于布局验收。
- [归一化与 no-op 判断可能误判等价] → 规则按字段类型收敛，宁可比实际更保守（宁可多一条 delta，也不静默丢掉用户改动）。
- [移除实时预览会改变既有用户习惯与测试] → 版本升到 0.3.0，README/AGENTS.md/测试同批更新；提示词排版变化标注为内部 BREAKING。
- [macOS 覆盖式滚动条是否常驻可见无法由单测证明] → 测试只断言可滚动与可达性，另做真机目视验收；样式上使用 gutter + 常显 thumb。
- [卡片增加 delta 区后高度变化] → 设上限并内部滚动，`placeCard()` 继续用 `offsetHeight` 测量，位置钳制不受影响。
- [按钮 Enter 行为改变可能影响既有快捷键] → 仅当焦点在 button 上时交还原生 click；textarea/input 的 Enter、⌘Enter 语义不变，测试覆盖两条路径。

## Migration Plan

单次提交完成：`lib/client.js` 行为迁移、测试重写、文档与版本更新；无数据迁移、无配置迁移。回滚即 revert 该次提交（0.2.x 行为与文档一并恢复）。发布后需在桌面端侧边浏览器做一次人工验收：打开面板、改多项、Apply、重开、多选删除首项、取消、短视口滚动、IME 输入。

## Open Questions

无。滚动条「常驻可见」属于发布前的人工验收项，不影响实现或任务拆分。
