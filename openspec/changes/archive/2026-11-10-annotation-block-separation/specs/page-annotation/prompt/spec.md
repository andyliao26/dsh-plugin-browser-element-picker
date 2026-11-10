# Spec Delta

## MODIFIED Requirements

### Requirement: Block starts with the page line

The block SHALL start with exactly one `页面：{title} | {url}` line, emitted once regardless of how many targets follow. When the block is inserted after existing draft content, the inserted section SHALL begin with one blank line, a `---` rule, and one blank line before that page line.

#### Scenario: Single target
- **WHEN** one element is annotated on the order list page `http://localhost:5173/orders`
- **THEN** the first line is `页面：订单列表 | http://localhost:5173/orders`

#### Scenario: Multiple targets
- **WHEN** three elements are annotated
- **THEN** the page line appears once, before all targets
- **AND** no header or count line precedes it

#### Scenario: A second annotation becomes its own section
- **WHEN** a block is inserted while the composer already holds content before the insertion point
- **THEN** the inserted text starts with a blank line, then `---`, then a blank line
- **AND** the page line follows immediately after that separator

#### Scenario: An empty draft stays clean
- **WHEN** the insertion point is at the start of an empty draft
- **THEN** the inserted text starts with the page line, with no separator in front of it

#### Scenario: The chip keeps its short label
- **WHEN** a block carrying a separator is inserted as a reference chip
- **THEN** the chip label still shows only the tag and the user's comment
