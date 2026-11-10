# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
