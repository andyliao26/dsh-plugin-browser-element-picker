# Design

## Context

`formatAnnotation()` 位于 `lib/client.js`，把 guest 的会话结果拼成交给 composer 的引用块，也用于纯文本兜底。当前实现有两条分支：单目标输出选择器、元素、位置、计算样式、外部 HTML、设计块、评论和长尾句；多目标只输出「序号. `<tag>` 文本 — 选择器」、按「第 N 个元素」命名的设计块、评论和长尾句。`prompt.*` 字典承载全部行模板。

实测（同一订单页样例，引用块模式）：A 单目标 635 字符，其中计算样式 361 字符（57%），HTML 63、几何 50、固定尾句 42；B 双目标 172 字符，固定尾句占 24%；C 双目标带设计 314 字符，设计块 134、固定尾句 42。目标与范围见 `proposal.md`，行为契约见两份 delta spec。

## Goals / Non-Goals

**Goals:**

- 三种场景共用一套结构：页头、页面行、编号目标、目标内嵌设计、唯一要求、短尾句。
- 单目标体积降到约 100–150 字符；多目标不因增加条目而失去结构一致性。
- 目标与设计的归属不再依赖「第 N 个元素」回查。
- 评论为空、纯设计、两者都没有时都有明确的结尾行为。

**Non-Goals:**

- 不修改 guest 的结果结构；`styles` / `html` / `rect` 仍照常采集，只是不进入提示词（后续可单独清理采集开销）。
- 不改选择器生成算法、不改设计面板、不改 composer 注入链路。
- 不引入可配置的提示词模板或用户自定义格式。

## Decisions

### 1. 删除样式、HTML、几何与冗余匹配数

提示词只保留「定位 + 意图」：选择器、标签/文本、设计 delta、用户要求。计算样式是单目标体积的主要来源，且 computed 值（继承、浏览器默认）对改源码的帮助远小于选择器本身；设计 delta 已携带真正相关的样式变化。HTML 快照最长 600 字符，容易让提示词失焦。几何与视口对响应式问题有价值，但属于少数场景，可让用户在 `要求` 里补充。

备选：保留一行压缩样式（A 约 220 字符，省 65%）——在 B/C 反而比现状更长；保留方案二的视口矩形——B/C 增加 27%/9%。均否决。

### 2. 单目标也编号，A/B/C 共用同一结构

```
【页面标注】[N 个元素]
页面：{title} | {url}
{index}. {selector}[（匹配 N）] | <{tag}> {text}
[   设计：]
[   - {property}: {from} → {to}]
要求：{comment}
保持选择器语义，说明修改文件。
```

单目标与多目标的唯一差异是头部是否带计数；不再为单目标单独设计一套「富证据」分支。这样 formatter 只有一条渲染路径，测试与文档也更简单。

### 3. 选择器歧义只在需要时标注

`describe()` 已经采集 `matches`。当且仅当 `matches !== 1` 时，在选择器后追加 `（匹配 {matches}）`；唯一选择器完全省略该标记。这样既省字符，又保留「选择器可能改错目标」的关键信号。

### 4. 设计调整内嵌到目标

每个目标渲染完自身行后，若存在 delta，先输出 `设计：`，再按提交顺序输出 `  - property: from → to`。不再输出独立的「设计调整（第 N 个元素）」块，也不依赖 `design[].selector` 二次关联；`design[].index` 只用于找到对应目标。多目标多设计时，归属一目了然。

### 5. 要求与收尾按内容自适应

- 评论非空：`要求：{comment}` + 尾句。
- 评论为空、存在 delta：`要求：按上述设计调整修改。` + 尾句。
- 评论与 delta 都为空：省略 `要求` 与尾句，只保留定位信息；用户在引用块之后自行写要求。
- 尾句统一为 `保持选择器语义，说明修改文件。`，不再出现「请按上面的意见」这类在空评论时悬空的措辞。

### 6. 引用块与纯文本兜底输出同一段文本

删除 `prompt.fillSuffix` 与 `formatAnnotation` 的 `quote` 分支：两条注入路径都得到同一段块文本，纯文本兜底不再追加空的 `修改要求：`。用户在块后继续输入即可。调用点从 `formatAnnotation(t, result, true/false)` 收敛为 `formatAnnotation(t, result)`。

### 7. 字典键收敛

新增/保留：`prompt.headerSingle`、`prompt.headerMany`、`prompt.page`、`prompt.target`、`prompt.ambiguous`、`prompt.designHeader`、`prompt.designChange`、`prompt.comment`、`prompt.designFallback`、`prompt.footer`、`prompt.emptyText`。删除：`prompt.selector`、`prompt.element`、`prompt.geometry`、`prompt.styles`、`prompt.html`、`prompt.designHeaderMany`、`prompt.footerSingle`、`prompt.footerMany`、`prompt.fillSuffix`。zh/en 键集必须一致，并由 `bundle-contract` 断言占位符。

## Risks / Trade-offs

- [删除样式/HTML 后，模型缺少布局诊断信息] → 选择器与源码仍是权威来源；需要视觉细节时用户在 `要求` 里补充；设计调整自带相关属性。
- [选择器不唯一时模型可能改错元素] → 保留 `（匹配 N）` 标记；唯一时省略。
- [空评论 + 引用块模式下用户会在块后继续输入] → 纯设计时给默认要求句，两者都为空时干脆不写要求，避免与用户后续输入冲突。
- [提示词排版是内部破坏性变化] → 版本升到 0.4.0，README/AGENTS 与测试同批更新；回滚即 revert。
- [现有测试大量断言旧排版] → 在同一个 change 内重写 `injection` / `toolbar` / `payload` / `bundle-contract`，`guest-annotate` 不受影响。
- [`design-intent` 的主 spec 含旧的「按位置命名」要求] → 本 change 用 REMOVED 移除该 requirement，由 `page-annotation/prompt` 接管设计行的文本形态与放置位置，避免重复与冲突。

## Migration Plan

单次提交：formatter 与字典、测试、文档、版本 0.3.0 → 0.4.0。无数据与配置迁移。回滚即 revert 该提交。发布后建议在桌面端做一次人工检查：单标注、多标注、纯设计、空评论四种情况下引用块的实际文本。

## Open Questions

无。
