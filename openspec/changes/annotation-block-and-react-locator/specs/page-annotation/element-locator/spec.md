# Spec Delta

## Purpose

Turns a picked DOM element into a locator an agent can act on: a CSS selector built from the most stable evidence available, plus, when the page exposes React development metadata, the owning component and the source location that produced the element.

## ADDED Requirements

### Requirement: Selector anchors on the most stable evidence

For each picked element the system SHALL build a selector by consulting, in order: a unique `#id`; the first stable authoring attribute among `data-testid`, `data-test`, `data-test-id`, `data-cy`, `data-qa`, `data-automation-id`, `name`, `aria-label`, `alt`, `placeholder`, `title`; at most two kept class names; and finally the bare tag name.

#### Scenario: Unique id wins
- **WHEN** the picked element is `<button id="submit">`
- **THEN** its selector is `#submit`

#### Scenario: Authoring attribute beats clean class names
- **WHEN** the picked element is `<button class="btn primary" data-testid="submit">`
- **THEN** its selector is `button[data-testid="submit"]`
- **AND** no class name appears in the selector

#### Scenario: Attributed tag carries its tag name
- **WHEN** the picked element is `<span aria-label="已完成">`
- **THEN** its selector contains `span[aria-label="已完成"]`

### Requirement: Generated class names are never used as anchors

The system SHALL discard class names that carry a build-generated hash: CSS-in-JS prefixes (`css-`, `sc-`, `emotion-`, `styled-`, `jsx-`, `svelte-`), CSS Modules underscore hashes, and any name containing a four-digit run.

#### Scenario: CSS Modules hash is dropped
- **WHEN** the picked element has `class="_label_4f8c"` and no other anchor
- **THEN** its selector contains no `_label_4f8c`
- **AND** the selector falls back to the positional path

#### Scenario: Emotion hash is dropped
- **WHEN** the picked element has `class="css-1x2y3z badge"`
- **THEN** its selector contains `.badge`
- **AND** it contains no `.css-1x2y3z`

### Requirement: Utility class names are never used as anchors

The system SHALL discard class names that belong to a utility framework — layout, spacing, typography, color, border, and shadow utilities, including their numeric and variant suffixes — because such a name matches many elements and makes a selector look precise while remaining unlocatable.

#### Scenario: Utility-only element falls back
- **WHEN** the picked element is `<div class="flex items-center gap-2">` with no attribute anchor
- **THEN** its selector contains no `.flex`, `.items-center`, or `.gap-2`
- **AND** the selector is built from attributes, an ancestor, or the positional path

#### Scenario: A semantic class survives next to utilities
- **WHEN** the picked element is `<div class="order-card flex p-4">`
- **THEN** its selector contains `.order-card`
- **AND** it contains neither `.flex` nor `.p-4`

### Requirement: Ancestors supply the anchor when the element has none

When an element has no usable anchor of its own, the system SHALL extend the selector upward and use the nearest ancestor that has one, descending from that ancestor by tag name and adding `:nth-of-type` where the tag repeats among its siblings.

#### Scenario: Attribute anchor above the element
- **WHEN** a `<button>` with no anchor of its own sits directly inside `<div data-testid="toolbar">`
- **THEN** its selector is `div[data-testid="toolbar"] > button`

#### Scenario: Repeated sibling tags stay distinguishable
- **WHEN** two `<button>` elements share the ancestor `div[data-testid="toolbar"]`
- **THEN** the second one's selector ends with `button:nth-of-type(2)`

### Requirement: Every selector reports how many elements it matches

The system SHALL count on the live page how many elements the produced selector matches, and SHALL report that count with the target, so a non-unique locator is never presented as unique.

#### Scenario: Ambiguous selector reports three
- **WHEN** the produced selector matches three elements on the page
- **THEN** the target reports a match count of three

#### Scenario: Unique selector reports one
- **WHEN** the produced selector matches exactly one element
- **THEN** the target reports a match count of one

### Requirement: React identity reports the nearest component name

The system SHALL report the nearest function component name found by walking the fiber return chain, skipping host nodes, framework wrappers, and one or two character minified identifiers. When no acceptable name exists, the system SHALL report no React identity rather than a placeholder.

#### Scenario: Production page has no metadata
- **WHEN** no React metadata is present on the element or anywhere on its ancestor chain
- **THEN** the target reports no React identity

#### Scenario: Minified component names are rejected
- **WHEN** the only component name found on the chain is a one or two character minified identifier
- **THEN** no component name is reported

### Requirement: Source location comes from debug metadata or the owner stack

The system SHALL report a source location as a `src/`-relative path with bundler prefixes, origins, and query strings removed: `path:line` when React exposes `_debugSource`, otherwise the file alone from the nearest owner stack frame naming a `.jsx`/`.tsx`/`.vue`/`.svelte` file outside vendor code, because stack coordinates are post-transform.

#### Scenario: Component and source from the fiber chain
- **WHEN** the picked button's fiber chain reaches a component named `Toolbar` and carries `_debugSource` `webpack-internal:///./src/components/Toolbar.tsx:42:7`
- **THEN** the target reports component `Toolbar`
- **AND** the target reports source `src/components/Toolbar.tsx:42`

#### Scenario: Owner stack supplies the file
- **WHEN** React 19 exposes no `_debugSource` but the owner stack names `http://127.0.0.1:5199/src/components/Toolbar.jsx:9:30`
- **THEN** the target reports source `src/components/Toolbar.jsx` with no line number

#### Scenario: Absolute dev-server path keeps the source tail
- **WHEN** `_debugSource.fileName` is `/private/tmp/app/src/panels/ReportPanel.tsx` with line 12
- **THEN** the target reports source `src/panels/ReportPanel.tsx:12`

### Requirement: React identity requires a component name

A source location alone SHALL NOT be reported, because it does not say which component the element belongs to. The system SHALL omit the identity until a component name is found.

#### Scenario: Source without a component
- **WHEN** a source location is found but the chain exposes no acceptable component name
- **THEN** the target reports no React identity

#### Scenario: Component without a source
- **WHEN** a component name is found but no source location is exposed
- **THEN** the target reports the component name and no source
