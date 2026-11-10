# page-annotation/session-launch Specification

## Purpose
Defines how a user starts an annotation session from the keyboard, where that shortcut is allowed to act, and how a rebound shortcut stays visible next to the toolbar button.

## Requirements

### Requirement: A keyboard shortcut opens and closes a session

The plugin SHALL register one user-remappable command whose default binding is `Cmd+Shift+C` on macOS desktop and `Ctrl+Shift+C` on Windows desktop. The command SHALL start a session when none is running and SHALL cancel the running one otherwise.

#### Scenario: Default binding starts a session
- **WHEN** no session is running, a browser page is on screen, and the user presses the default combination
- **THEN** the annotation session starts on that page

#### Scenario: The same combination ends a running session
- **WHEN** a session is already running and the user presses the combination again
- **THEN** the session is cancelled and the page returns to its normal state

#### Scenario: The web build carries no default
- **WHEN** the same plugin is mounted in a browser build
- **THEN** the command is registered without a binding there

#### Scenario: Linux desktop carries no default
- **WHEN** the plugin is mounted on Linux desktop
- **THEN** the command is registered without a binding, because the platform reserves the primary-plus-C family

### Requirement: The shortcut is claimed only while a browser page is open

When the sidebar shows no page, the combination SHALL NOT be claimed: it stays available to the application and the operating system.

#### Scenario: No page on screen
- **WHEN** the sidebar browser is closed, hidden, or empty and the user presses the default combination
- **THEN** the combination is not claimed and the application handles it as usual

#### Scenario: A document that is not a web page
- **WHEN** the sidebar shows a non-`http(s)` document and the user presses the combination
- **THEN** the combination is not claimed

#### Scenario: A page comes back
- **WHEN** a web page becomes visible again
- **THEN** the combination is claimed again and starts a session

### Requirement: The effective binding stays visible

The command SHALL appear in the application's keyboard settings under a localized name, and the toolbar button SHALL expose the binding currently in effect to both users and assistive technology.

#### Scenario: The settings entry is localized
- **WHEN** the application lists its commands
- **THEN** this command appears under the name the plugin's locale provides

#### Scenario: Rebinding updates the button
- **WHEN** the user assigns a different combination
- **THEN** the button tooltip and its shortcut attribute show the new binding

#### Scenario: An unbound command hides the hint
- **WHEN** the user clears the binding
- **THEN** the tooltip falls back to the action label and no shortcut attribute is exposed

### Requirement: A rejected shortcut never disables the button

When the keyboard service refuses the registration — a reserved default, a conflict, or no service at all — the toolbar button and the session itself SHALL keep working, and the refusal SHALL be reported to the console instead of aborting plugin startup.

#### Scenario: A reserved default leaves the button in place
- **WHEN** the keyboard service throws while registering the command
- **THEN** the button still mounts on the browser tab
- **AND** starting a session from it still works
- **AND** the refusal appears in the console

#### Scenario: No keyboard service at all
- **WHEN** the plugin is mounted in an environment without the shortcut service
- **THEN** it starts normally with the button and no shortcut
