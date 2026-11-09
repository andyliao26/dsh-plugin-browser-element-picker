# Proposal

## Why

当前注入的标注提示词是「散文式标签」而不是稳定结构：单目标塞入计算样式、外部 HTML 和视口几何（实测 635 字符中样式一行占 361，57%），多目标却把这些全部丢掉，只剩选择器和文本；设计调整又以「第 N 个元素」独立成块，需要回查目标。三种真实场景——单标注、多标注、设计调整——因此长得像三套不同的东西。

用户已经确认接受更紧凑的形态：只保留定位与意图（选择器、标签/文本、设计 `from → to`、用户要求），删除计算样式、HTML、几何与冗余匹配数，并把设计调整嵌到所属目标下。

## What Changes

- **统一结构**：`【页面标注】[N 个元素]` → `页面：标题 | URL` → 编号目标 → 目标内嵌设计 → 唯一 `要求` → 短尾句。单目标也编号，A/B/C 三种场景只差条目数与设计行。
- **删除证据**：提示词不再包含计算样式、外部 HTML、位置/视口/滚动、每条匹配数；选择器仅在页面内匹配数不等于 1 时追加 `（匹配 N）`。
- **设计内嵌**：每个目标下用 `设计：` 加缩进 `- 属性: 旧值 → 新值`，不再出现「设计调整（第 N 个元素）」。
- **单一要求与自适应结尾**：用户评论统一为 `要求：…`；无评论但有设计时用 `要求：按上述设计调整修改。`；两者都没有时省略要求与尾句。尾句统一为「保持选择器语义，说明修改文件。」
- **纯文本兜底**：不再追加空的 `修改要求：` 后缀，与引用块模式保持同一段文本（`formatAnnotation` 的 `quote` 分支随之取消）。
- **内部契约变化**：提示词排版与字典键位改变，`design-mode-as-prompt-intent` 中「多目标设计独立成块」的格式被替换；guest 结果结构保持不变，`styles` / `html` / `rect` 仍照常采集，只是不再进入提示词。

## Capabilities

### New Capabilities

- `page-annotation/prompt`: 标注提示词的块级结构：页头、编号目标、选择器歧义标记、设计调整的内嵌位置、共享的用户要求与收尾句，覆盖单目标、多目标与仅设计调整三种场景。

### Modified Capabilities

- `page-annotation/design-intent`: 移除「Prompt renders design intent one property per line」；delta 的文本形态与放置位置统一由新的 `page-annotation/prompt` 负责，避免两个能力重复定义同一段提示词。

## Impact

- `lib/client.js`：`formatAnnotation()`、`zh`/`en` 字典中的 `prompt.*` 键、调用 `formatAnnotation` 的两处（引用块与纯文本兜底）。
- 测试：`test/injection.test.mjs`（三种场景、歧义选择器、空要求、纯文本兜底）、`test/toolbar.test.mjs`、`test/payload.test.mjs`、`test/bundle-contract.test.mjs`；`test/guest-annotate.test.mjs` 不涉及提示词排版。
- 文档与版本：`README.md` 的提示词示例与设计模式说明、`AGENTS.md` 契约 #3/#4、`package.json` `0.3.0 → 0.4.0`。
- 无新增依赖、无 Host 侧改动、安装方式不变。
