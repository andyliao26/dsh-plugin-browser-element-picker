# page-annotation/overlay-isolation Specification

## Purpose
Keeps the injected annotation overlay usable on pages that render their own modal layers: the overlay is treated as part of whichever container holds the element being annotated, it keeps keyboard focus, and it leaves no trace on the page when the session ends.

## Requirements

### Requirement: Containment follows the active target

While a session has at least one target, a containment check naming the annotation overlay root SHALL return the same answer as the same check naming the active target. The overlay SHALL NOT be reported inside a container that does not hold the active target.

#### Scenario: A sheet that holds the target considers the overlay inside itself
- **WHEN** an open page sheet tests whether it contains the overlay root while the active target sits inside that sheet
- **THEN** the sheet's containment test answers that it does

#### Scenario: An unrelated container still excludes the overlay
- **WHEN** a page container that does not hold the active target tests whether it contains the overlay root
- **THEN** the test answers that it does not

#### Scenario: Ancestor lookup from the overlay matches the target's ancestors
- **WHEN** page code resolves an ancestor by selector starting from the overlay root
- **THEN** it receives the ancestor the active target would resolve to

#### Scenario: A page listener registered before the session still sees the overlay as inside
- **WHEN** the page installs an outside-click handler on the window capture phase before the annotation session starts, and the user clicks inside the annotation card
- **THEN** that handler's containment check answers that the overlay is inside the sheet
- **AND** the sheet stays open

#### Scenario: Containment reverts when no target is selected
- **WHEN** the last target is removed and the session returns to picking
- **THEN** containment checks involving the overlay root answer as they would for an ordinary page node

### Requirement: Keyboard focus lands in the comment field after a pick

After a target is picked, keyboard focus SHALL be in the comment field once the pick has settled — checked immediately and again after a short settle period — and a page focus guard that reacts to focus landing outside its own container SHALL NOT move it away.

#### Scenario: A guard that reacts on the focus event does not steal focus
- **WHEN** the user picks an element inside an open sheet that refocuses its own first control as soon as focus lands outside it
- **THEN** the comment field holds keyboard focus

#### Scenario: None of the typed characters reach the page
- **WHEN** the user types immediately after picking, without clicking anything
- **THEN** the characters appear in the comment field and no page input receives them

#### Scenario: A guard that re-checks on a later tick does not steal focus
- **WHEN** the sheet takes focus back on a delayed timer after the pick
- **THEN** the comment field still holds keyboard focus once the settle period ends

#### Scenario: Picking another target keeps the field focused
- **WHEN** the user adds a second target with Shift-click
- **THEN** the comment field holds keyboard focus again

### Requirement: A page that keeps holding focus is reported

If the comment field still does not hold focus once the settle period and its confirmation have passed, the session SHALL show a visible notice that the page holds focus, and SHALL keep the session and its selection intact.

#### Scenario: Persistent focus theft produces a notice
- **WHEN** the page takes focus back to its own control on a repeating timer
- **THEN** the overlay shows a notice about the page holding focus
- **AND** the card and the selected target remain

#### Scenario: A single delayed theft is not reported
- **WHEN** the page takes focus away once on a delayed timer and then stops
- **THEN** the comment field holds focus again once the settle period ends
- **AND** no notice is shown

#### Scenario: The notice does not block later typing
- **WHEN** the user clicks the comment field after the notice was shown
- **THEN** the notice is gone and the typed characters land in the field

### Requirement: A removed target never produces a stale annotation

Completing the session while a target is no longer in the document SHALL NOT write anything to the composer. The session SHALL drop that target from the selection and SHALL show that it was removed, staying open for the user to pick again or cancel.

#### Scenario: The sheet closes before the user submits
- **WHEN** the page removes the annotated element and the user presses Enter
- **THEN** nothing is inserted into the composer
- **AND** the target's chip disappears and a notice names the removal
- **AND** the session is still active

#### Scenario: Every target was removed
- **WHEN** all annotated elements are gone when the user presses Enter
- **THEN** nothing is inserted and the session drops to picking mode
- **AND** pressing Enter again still writes nothing
- **AND** the user can pick another element or cancel

#### Scenario: Submitting again after the drop completes normally
- **WHEN** the user presses Enter again once the removed targets are gone
- **THEN** the annotation contains only the targets that are still in the document

### Requirement: Ending a session restores the page completely

When a session ends by finishing, cancelling in the page, or cancelling from the host, the overlay SHALL restore every page-level change it made: containment behaviour, cursor, user selection, and its own nodes. A session replaced by a new one SHALL restore the same way.

#### Scenario: Finish restores native containment
- **WHEN** the user completes a session started on a page with a containment-checking sheet
- **THEN** the sheet's containment checks answer natively again
- **AND** no overlay node remains in the document

#### Scenario: Cancel restores the same state
- **WHEN** the user cancels with Esc
- **THEN** containment, cursor, and user selection are restored exactly as after a finish

#### Scenario: Host-side cancel restores the same state
- **WHEN** the host cancels a running session
- **THEN** containment, cursor, and user selection are restored exactly as after an in-page cancel

#### Scenario: The page is hidden or navigated away
- **WHEN** the page is hidden while a session is running
- **THEN** the session ends as a cancel
- **AND** containment, cursor, user selection, and overlay nodes are restored immediately

#### Scenario: Starting a new session restores the previous one
- **WHEN** a new session starts while another is running
- **THEN** the previous session's page changes are undone before the new one installs its own
