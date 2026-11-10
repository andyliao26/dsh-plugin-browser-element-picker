# Spec Delta

## MODIFIED Requirements

### Requirement: The request is a delimited section

When a comment exists, the block SHALL end with exactly one blank line followed by one `**修改要求:** {comment}` line, with no rule between them. When no comment exists, neither the blank line nor the label SHALL appear.

#### Scenario: Comment present
- **WHEN** the user types `两个按钮的高度统一为40px。`
- **THEN** the block ends with a blank line and `**修改要求:** 两个按钮的高度统一为40px。`
- **AND** no `---` line appears above the request

#### Scenario: Design only
- **WHEN** there is no comment but a target has design deltas
- **THEN** the block ends with the last design delta line
- **AND** it contains no `---` and no `**修改要求:**`

#### Scenario: No comment and no design
- **WHEN** the block has targets but neither a comment nor any delta
- **THEN** the block ends with the last target subline
- **AND** it contains no separator and no request label
