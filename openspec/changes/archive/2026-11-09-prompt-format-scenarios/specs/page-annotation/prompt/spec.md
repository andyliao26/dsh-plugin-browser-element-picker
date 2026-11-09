# Spec Delta

## Purpose

Defines the compact, scenario-adaptive annotation block inserted into the composer for single and multiple targets, including where the selector, tag/text, design deltas, and the user's request appear.

## ADDED Requirements

### Requirement: Block starts with a header and one page line

The block SHALL start with `【页面标注】` for a single target or `【页面标注】{count} 个元素` for multiple targets, followed by exactly one `页面：{title} | {url}` line.

#### Scenario: Single target header
- **WHEN** one element is annotated on the order list page
- **THEN** the first line is `【页面标注】`
- **AND** the next line is `页面：订单列表 | http://localhost:5173/orders`

#### Scenario: Multiple target header
- **WHEN** three elements are annotated
- **THEN** the first line is `【页面标注】3 个元素`
- **AND** the page line appears once, before the targets

### Requirement: Each target is a numbered line with selector and tag/text

Each target SHALL render as `{index}. {selector} | <{tag}> {text}`. The selector SHALL carry a `（匹配 {matches}）` marker only when the page-match count is not 1. The block SHALL NOT include computed styles, outer HTML, box geometry, viewport, scroll position, or a match count for a unique selector.

#### Scenario: Single target line
- **WHEN** the annotated element is `#submit` with tag `button` and text `提交订单`
- **THEN** the target line is `1. #submit | <button> 提交订单`

#### Scenario: Multiple target lines
- **WHEN** `#submit` and `#cancel` are annotated
- **THEN** the block lists `1. #submit | <button> 提交订单` and `2. #cancel | <button> 取消`
- **AND** both use the same line shape as the single-target case

#### Scenario: Ambiguous selector keeps a match marker
- **WHEN** a target's selector matches three elements on the page
- **THEN** its line carries `（匹配 3）` after the selector
- **AND** a selector that matches exactly one element carries no marker

#### Scenario: Diagnostic evidence is omitted
- **WHEN** the block is rendered
- **THEN** it contains no `计算样式`, `外部 HTML`, `位置`, `视口`, or `滚动` lines
- **AND** it contains no per-target computed-style list or HTML snapshot

### Requirement: Design deltas are nested under their target

When a target has design deltas, the block SHALL render a `设计：` line directly under that target, followed by one indented `- {property}: {from} → {to}` line per delta in the order the properties were changed. No separate position-based design block SHALL appear elsewhere in the block.

#### Scenario: Deltas follow their own target
- **WHEN** the second of two targets has `border-radius: 8px → 12px`
- **THEN** a `设计：` line and the delta line appear directly under target 2
- **AND** no `设计调整（第 2 个元素）` block appears after the target list

#### Scenario: Several deltas keep their order
- **WHEN** one target changes `background-color` then `border-radius`
- **THEN** its two delta lines appear in that order under the target

### Requirement: The user's request appears once after the targets

When the comment is non-empty, the block SHALL include one `要求：{comment}` line after all targets. When the comment is empty but at least one target has deltas, it SHALL use `要求：按上述设计调整修改。`. When both are empty, it SHALL omit the request line and the closing instruction. When a request or design intent is present, the block SHALL end with `保持选择器语义，说明修改文件。`

#### Scenario: Comment present
- **WHEN** the user types `两个按钮的高度统一为40px。`
- **THEN** the block contains one `要求：两个按钮的高度统一为40px。` line after all targets
- **AND** it ends with `保持选择器语义，说明修改文件。`

#### Scenario: Design only
- **WHEN** there is no comment but a target has design deltas
- **THEN** the block contains `要求：按上述设计调整修改。`
- **AND** the closing instruction is present

#### Scenario: No comment and no design
- **WHEN** the block has targets but neither a comment nor any delta
- **THEN** it contains no `要求：` line
- **AND** it contains no closing instruction

### Requirement: Quote and plain-text modes render the same block

The quote-node path and the plain-text fallback SHALL produce identical block text. The plain-text fallback SHALL NOT append a separate `修改要求：` suffix.

#### Scenario: Both delivery paths match
- **WHEN** the same session result is rendered for a quote node and for the plain-text fallback
- **THEN** both strings are identical
- **AND** neither ends with `修改要求：`
