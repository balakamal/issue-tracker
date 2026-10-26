---
name: clean-ui-styling
description: Enforces clean, modern UI styling standards without colored left-border stripes, asymmetric side borders, or heavy edge indicator bars.
---

# Clean UI Styling Standards

## Border and Container Guidelines

### Prohibited Patterns
- **No colored left-border stripes**: Never apply `border-left: 3px/4px solid <color>` or colored vertical edge bars (such as `<div style={{ width: 4, background: color }} />`) to cards, callouts, or modals.
- **No asymmetric container borders**: On containers with `border-radius`, all four sides must share identical border-width to avoid ugly angled corner seams.
- **No border-based categorization**: Do not use red/coral, green, or blue side borders to communicate status, type, or priority.

### Required Patterns
- **Uniform 1px Borders**: Always use clean, subtle 1px borders (`border: 1px solid var(--line)` or `var(--border-subtle)`).
- **Classification Badges**: Always communicate item types (Loophole, Enhancement, Bug), stages, and priorities through inline pill badges (`<TypeBadge>`, `<PriorityBadge>`), icons, or soft background tags.
