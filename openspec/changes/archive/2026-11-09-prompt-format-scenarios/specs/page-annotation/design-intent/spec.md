# Spec Delta

## REMOVED Requirements

### Requirement: Prompt renders design intent one property per line

**Reason**: The exact shape and placement of design lines in the annotation block are now owned by the `page-annotation/prompt` capability, which renders one indented `property: from → to` line per delta under its target. Keeping the old requirement here would duplicate that contract and contradict the new nested layout.

**Migration**: Use the `page-annotation/prompt` requirement "Design deltas are nested under their target". This capability still owns baseline capture, delta structure, reopen behavior, element binding, the card, scrolling, and keyboard handling.
