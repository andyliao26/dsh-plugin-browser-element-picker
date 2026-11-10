# page-annotation/prompt Specification

## Purpose
Defines the compact, scenario-adaptive annotation block inserted into the composer for single and multiple targets, including where the selector, tag/text, design deltas, and the user's request appear.

## Requirements

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

### Requirement: Quote and plain-text modes render the same block

The quote-node path and the plain-text fallback SHALL produce identical block text. The request section SHALL be part of that text in both paths, and SHALL NOT be appended a second time outside the block.

#### Scenario: Both delivery paths match
- **WHEN** the same session result is rendered for a quote node and for the plain-text fallback
- **THEN** both strings are identical
- **AND** both end with the same request section when a comment exists

#### Scenario: No duplicated request
- **WHEN** the plain-text fallback renders a result with a comment
- **THEN** the block contains exactly one `**修改要求:**` line
- **AND** nothing is appended after it

### Requirement: Block starts with the page line

The block SHALL start with exactly one `页面：{title} | {url}` line, emitted once regardless of how many targets follow.

#### Scenario: Single target
- **WHEN** one element is annotated on the order list page `http://localhost:5173/orders`
- **THEN** the first line is `页面：订单列表 | http://localhost:5173/orders`

#### Scenario: Multiple targets
- **WHEN** three elements are annotated
- **THEN** the page line appears once, before all targets
- **AND** no header or count line precedes it

### Requirement: Each target may carry a component identity subline

When a target reports React identity, its line SHALL be followed by a subline `组件：{component} {file}:{line}`; when only the component name is known, by `组件：{component}`. When no component name is known, no subline SHALL appear.

#### Scenario: Component and source
- **WHEN** a target reports component `Toolbar` and source `src/components/Toolbar.tsx:42`
- **THEN** a line `组件：Toolbar src/components/Toolbar.tsx:42` follows its target line

#### Scenario: Component only
- **WHEN** a target reports component `Toolbar` and no source
- **THEN** the subline is `组件：Toolbar`

#### Scenario: No React identity
- **WHEN** a target reports no React identity
- **THEN** no `组件：` line appears for it

### Requirement: The request is a delimited section

When a comment exists, the block SHALL end with a blank line, a `---` line, and one `**修改要求:** {comment}` line. When no comment exists, neither the separator nor the label SHALL appear.

#### Scenario: Comment present
- **WHEN** the user types `两个按钮的高度统一为40px。`
- **THEN** the block ends with a blank line, `---`, and `**修改要求:** 两个按钮的高度统一为40px。`

#### Scenario: Design only
- **WHEN** there is no comment but a target has design deltas
- **THEN** the block ends with the last design delta line
- **AND** it contains no `---` and no `**修改要求:**`

#### Scenario: No comment and no design
- **WHEN** the block has targets but neither a comment nor any delta
- **THEN** the block ends with the last target subline
- **AND** it contains no separator and no request label

### Requirement: The block carries no execution instruction

Apart from the `**修改要求:**` section, which carries the user's own words, the block SHALL NOT contain any instruction addressed to the reader — no request to keep selector semantics, no request to list changed files, no default request text, and no trailing prompt.

#### Scenario: Instructions are absent
- **WHEN** any block is rendered, with or without a comment
- **THEN** it contains none of `保持选择器语义` and none of `说明修改文件`
- **AND** it contains no request text the user did not type
