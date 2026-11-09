# Spec Delta

## REMOVED Requirements

### Requirement: Block starts with a header and one page line

**Reason**: The header carried no collected information — it only restated how many targets followed — and it forced every consumer to treat `【页面标注】` as a magic marker. The page line on its own already says what the block is about.

**Migration**: The block now starts directly with `页面：{title} | {url}`. `【页面标注】` and `【页面标注】{count} 个元素` are no longer emitted; count any integration that matched them.

### Requirement: The user's request appears once after the targets

**Reason**: This requirement fixed both the trailing instruction `保持选择器语义，说明修改文件。` and the design-only default `要求：按上述设计调整修改。`. Both are execution instructions inside what should be a record of the page, and the first one forced a file-list output format the user never asked for.

**Migration**: A non-empty comment now renders as a delimited request section (`---` followed by `**修改要求:** {comment}`). An empty comment renders no request section at all — no `要求：` line, no default text, no closing instruction.

## MODIFIED Requirements

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

## ADDED Requirements

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
