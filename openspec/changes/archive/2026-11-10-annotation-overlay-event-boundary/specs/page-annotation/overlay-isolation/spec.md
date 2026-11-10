# Spec Delta

## ADDED Requirements

### Requirement: The page never observes events raised inside the overlay

A pointer, mouse, key, or focus event that starts inside the annotation overlay SHALL NOT be delivered to listeners outside it. An event path that page code can still observe SHALL continue from the overlay into the ancestors of the active target, not into the overlay's own parent.

#### Scenario: A sheet that reads the path on the bubble phase stays open
- **WHEN** a page dismisses its sheet on any outside `mousedown` by checking `composedPath()` in a bubble-phase listener, and the user presses inside the annotation card
- **THEN** the sheet stays open

#### Scenario: A sheet that reads the path on the capture phase stays open
- **WHEN** the same dismissal check is registered on the capture phase
- **THEN** the sheet stays open

#### Scenario: A sheet that walks ancestors stays open
- **WHEN** the page decides outside-ness by walking `parentNode` from the event target
- **THEN** the sheet stays open

#### Scenario: The overlay keeps its own defaults
- **WHEN** the user presses inside the comment field and types
- **THEN** the caret lands where pressed and the characters reach the field
- **AND** the card's buttons still respond to clicks

#### Scenario: The page still sees its own events after the session
- **WHEN** the session ends and the user presses a page element outside the open sheet
- **THEN** the page's own dismissal runs and the sheet closes
