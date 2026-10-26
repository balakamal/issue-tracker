# UI & Styling Rules: Border & Container Policy

## Strict Prohibitions
1. **Never use colored left-border stripes, side accent bars, or vertical indicator lines** pinned to cards, modals, containers, callout boxes, or dialogs (e.g., `border-left: 3px/4px solid <color>`, inner accent bars like `<div style={{ width: 4, background: color }} />`, or asymmetric side borders).
2. **Never create asymmetric borders on rounded containers**: Asymmetric border widths on elements with `border-radius` cause distorted, slanted corner seams.
3. **Never use heavy colored edge borders for categorization**: Do not use red/coral, green/mint, blue/sky, or yellow/amber left borders to denote item types (like loopholes, bugs, enhancements, stages, or priorities).

## Approved Styling Patterns
1. **Uniform Subtle Borders**: All cards, containers, dialogs, and modals must use uniform 1px borders all around (`border: 1px solid var(--line)` or `var(--border-subtle)`).
2. **Classification Indicators**: Differentiate categories and statuses exclusively through:
   - Modern inline badges/pills (`<TypeBadge>`, `<PriorityBadge>`, `<StatusBadge>`),
   - Subtle background tints or icon chips,
   - Clean typographic cues.
