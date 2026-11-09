# page-annotation/design-intent Specification

## Purpose
Design mode captures a user's intended style adjustments as directional, property-by-property deltas that are added to the annotation prompt, without modifying the annotated page.

## Requirements

### Requirement: Design mode echoes current computed styles without touching the page

When the design panel opens for a selected element, the system SHALL populate every control from that element's current computed styles, and SHALL leave the element's inline styles, computed styles, and geometry unchanged.

#### Scenario: Panel opens with the element's rendered values
- **WHEN** the user opens design mode for an element whose width is `91.3281px`, padding is `10px 18px`, and background is `rgb(64, 86, 255)`
- **THEN** the Width control echoes the rendered width, the Padding controls echo the four computed sides, and the Background control echoes the color
- **AND** the element's inline style attribute, computed styles, and bounding box are unchanged

#### Scenario: Transient values are echoed faithfully
- **WHEN** the computed background is `rgba(0, 0, 0, 0)` or a layout property is `normal` while the control's option list does not contain `normal`
- **THEN** the panel represents the value as `transparent` / `rgba(...)` or as an option carrying the current value
- **AND** it does not substitute `#000000`, `0`, or the first option in the list

### Requirement: Editing records intent only and never mutates the page

While the design panel is open, changing a control SHALL update only the pending draft. It SHALL NOT alter the element's inline style, computed style, or geometry. Applying SHALL commit the draft, and cancelling SHALL discard it.

#### Scenario: A change is not applied live
- **WHEN** the user changes Width from the echoed value to `500` and picks a new Text color
- **THEN** the element's `style.width` and `style.color` remain empty
- **AND** its computed width and color and its bounding box are unchanged

#### Scenario: Applying commits without changing the page
- **WHEN** the user applies the draft
- **THEN** the deltas are recorded for the prompt
- **AND** the element's inline style, computed styles, and geometry are still unchanged

#### Scenario: Cancelling discards only the draft
- **WHEN** the user changes one or more controls and then cancels with the Cancel button or Esc
- **THEN** the draft is discarded and no delta is recorded
- **AND** the previously committed design intent for that element, if any, remains unchanged

### Requirement: Each committed change is a normalized from-to delta

Applying SHALL record one delta per changed property containing the property name, the baseline value as `from`, and the chosen value as `to`. Fields whose chosen value equals the baseline SHALL be omitted, and clearing a field SHALL remove that field's delta.

#### Scenario: A single property becomes one delta
- **WHEN** the user sets `justify-content` to `flex-end` on an element whose baseline is `center`
- **THEN** the result contains the delta `{ property: "justify-content", from: "center", to: "flex-end" }`

#### Scenario: Several properties become ordered deltas
- **WHEN** the user changes width and border radius in one panel session
- **THEN** the result contains one delta per property, in the order the fields were changed

#### Scenario: Unchanged and cleared fields are omitted
- **WHEN** the user focuses a field without changing its value, or clears a numeric field that had a draft value
- **THEN** no delta is recorded for that field, and any previous draft delta for it is removed

#### Scenario: Values are normalized before comparison
- **WHEN** the user selects the same color that is currently rendered, or enters a value equivalent to the baseline after normalization
- **THEN** no delta is recorded
- **AND** colors, pixel values, and shorthand padding/margin are compared in their normalized forms rather than as raw computed strings

### Requirement: Design intent survives reopening without chained history

Reopening the design panel for an element SHALL prefill controls with the last committed `to` values, while every delta continues to use the page baseline captured when the panel first opened as `from`.

#### Scenario: Reopening keeps the original baseline
- **WHEN** the baseline is `center`, the user applies `flex-end`, reopens the panel, and changes the value to `flex-start`
- **THEN** the control opens on `flex-end`
- **AND** the resulting delta is `center → flex-start`
- **AND** cancelling at this point leaves the committed `center → flex-end` delta intact

### Requirement: Design intent is bound to element identity

Design deltas SHALL stay associated with the element they describe regardless of selection order. Removing an element SHALL remove its deltas and SHALL NOT reattach them to another element. Targets no longer present in the document SHALL be omitted when the session finishes.

#### Scenario: Removing the first of three targets does not shift deltas
- **WHEN** three elements have design deltas and the first one is removed with its chip's remove button
- **THEN** the remaining two elements keep their own deltas
- **AND** their ordering, selectors, and card entries stay consistent with the visible elements

#### Scenario: Detached targets are dropped at submit
- **WHEN** a selected element is removed from the page before the annotation session finishes
- **THEN** the session result omits that target and its design deltas

### Requirement: Prompt renders design intent one property per line

For every target with deltas, the annotation block SHALL include a design header followed by one indented line per property in the form `property: from → to`. For multiple targets, the header SHALL name the target's position in the selection.

#### Scenario: Single target with several properties
- **WHEN** one element has `justify-content: center → flex-end` and `width: 91.3px → 466px`
- **THEN** the block contains a design header line
- **AND** it contains two indented lines, one per property, in that form

#### Scenario: Multiple targets get separate headers
- **WHEN** the third selected element has one design delta
- **THEN** its header names the third element
- **AND** its property lines are indented under that header

### Requirement: Comment card shows committed intent and reopens the panel

The comment card SHALL list the committed design deltas of the active element and SHALL provide a control that reopens the design panel for that same element. Discarded drafts SHALL NOT be shown.

#### Scenario: Card reflects applied deltas
- **WHEN** an element has committed deltas
- **THEN** the card lists them as `property: from → to` lines
- **AND** activating the edit control reopens the design panel bound to that element

#### Scenario: Cancelled drafts stay hidden
- **WHEN** the user opens design mode, changes values, and cancels
- **THEN** the card shows no lines for the discarded draft

### Requirement: Design panel and card stay usable when content exceeds the viewport

The design panel body SHALL scroll vertically with a persistent, visible scrollbar, and the card's delta area SHALL be bounded and scrollable so that the panel footer and card actions remain reachable.

#### Scenario: Short viewport scrolls to the last field
- **WHEN** the viewport height is small enough that all sixteen fields exceed the panel height
- **THEN** the panel body is scrollable
- **AND** scrolling reaches the last field and the Apply and Cancel actions remain visible

#### Scenario: Many deltas do not push the card actions away
- **WHEN** the active element has enough deltas to exceed the card's delta area
- **THEN** the delta area scrolls
- **AND** the card's action buttons stay reachable

### Requirement: Keyboard interaction respects focus, IME, and design mode

Enter SHALL activate a focused button instead of submitting the annotation session. Enter during IME composition SHALL be ignored. While design mode is open, a page-level Enter SHALL NOT end the session or discard the draft.

#### Scenario: Enter on the card edit control opens the panel
- **WHEN** the card's edit control has focus and the user presses Enter
- **THEN** the design panel opens for the element the card describes
- **AND** the annotation session does not submit

#### Scenario: IME composition Enter is ignored
- **WHEN** an Enter key event reports IME composition (`isComposing` or `keyCode === 229`)
- **THEN** the session neither submits nor changes mode

#### Scenario: Page-level Enter during design mode does not finish
- **WHEN** focus is on the page body while the design panel is open and the user presses Enter
- **THEN** the session does not finish and the pending draft is preserved

### Requirement: Temporary overlay styles are restored

The system SHALL restore the page's original `cursor` and `user-select` values when the annotation session ends, whether it was applied, cancelled, or dismissed.

#### Scenario: Page-defined cursor survives the session
- **WHEN** the page sets `cursor: pointer` on its root and an annotation session changes it
- **THEN** after the session ends the page's original `cursor` and `user-select` values are restored
