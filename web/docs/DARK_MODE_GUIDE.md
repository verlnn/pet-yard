# PetYard Dark Mode Guide

This document defines the initial dark mode direction for the PetYard web app.
It is a draft guide for future implementation and should be used together with the existing white-mode design language.

## 1. Direction

- Dark mode should feel calm, dense, and readable.
- Do not use pure black as the default surface.
- Use the current sidebar "more" menu background as the main dark surface reference.
- Keep the overall visual tone consistent with PetYard rather than switching to a completely different product feel.

## 2. Base Color Reference

Primary dark surface reference:

- `slate-800`
- Approximate hex: `#1e293b`

Recommended usage:

- Main dark cards, sidebar panels, dropdowns, overlays: `#1e293b`

Recommended supporting dark values:

- App background: `#0f172a` or `#111827`
- Secondary surface: `#334155`
- Border: `rgba(255, 255, 255, 0.12)`
- Primary text: `#f8fafc`
- Secondary text: `#cbd5e1`
- Muted text: `#94a3b8`

## 3. White / Dark Mode Strategy

The app is expected to support both white mode and dark mode.
For that reason, colors should not be hard-coded page by page.
Instead, both modes should map into a shared semantic token structure.

Use this rule:

- White mode decides the semantic role
- Dark mode provides an alternate value for the same semantic role

Examples:

- `background` means app canvas in both modes
- `surface` means cards/panels in both modes
- `text-primary` means primary readable text in both modes

## 4. Draft CSS Variable Structure

Recommended root structure:

```css
:root {
  --color-bg: #ffffff;
  --color-bg-muted: #f8fafc;
  --color-surface: #ffffff;
  --color-surface-muted: #f8fafc;
  --color-surface-elevated: #ffffff;
  --color-border: rgba(15, 23, 42, 0.12);

  --color-text: #111827;
  --color-text-muted: #475569;
  --color-text-subtle: #94a3b8;

  --color-primary: #111827;
  --color-primary-contrast: #f8fafc;
  --color-accent: #c4553d;
  --color-danger: #ef4444;

  --shadow-soft: 0 20px 50px -35px rgba(15, 23, 42, 0.2);
  --shadow-card: 0 24px 56px -42px rgba(15, 23, 42, 0.12);
}

[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-bg-muted: #111827;
  --color-surface: #1e293b;
  --color-surface-muted: #334155;
  --color-surface-elevated: #273449;
  --color-border: rgba(255, 255, 255, 0.12);

  --color-text: #f8fafc;
  --color-text-muted: #cbd5e1;
  --color-text-subtle: #94a3b8;

  --color-primary: #f8fafc;
  --color-primary-contrast: #111827;
  --color-accent: #f2b38f;
  --color-danger: #f87171;

  --shadow-soft: 0 20px 50px -35px rgba(2, 6, 23, 0.55);
  --shadow-card: 0 24px 56px -42px rgba(2, 6, 23, 0.5);
}
```

## 5. Token Usage Rules

Prefer semantic variables instead of direct colors:

- page background: `var(--color-bg)`
- card background: `var(--color-surface)`
- subtle panel background: `var(--color-surface-muted)`
- text: `var(--color-text)`
- helper text: `var(--color-text-muted)`
- borders: `var(--color-border)`

Avoid:

- writing `bg-slate-800`, `text-white`, `border-white/10` directly in many places when the role is reusable
- defining separate per-page dark colors without first checking the shared tokens

## 6. Component Mapping Draft

Recommended first mapping:

- App background: `--color-bg`
- Sidebar background: `--color-surface`
- Dropdown / more menu: `--color-surface`
- Card surfaces: `--color-surface`
- Hover surfaces: `--color-surface-muted`
- Modal surface: `--color-surface-elevated`
- Primary text: `--color-text`
- Secondary text: `--color-text-muted`

## 7. Motion and Effects in Dark Mode

- Reduce glow usage
- Prefer contrast and layering over colored blur backgrounds
- Shadows should become slightly denser, not larger
- Glassmorphism should be used carefully; solid dark surfaces are preferred over translucent blur-heavy dark panels

## 8. Implementation Order Suggestion

Recommended rollout order:

1. Introduce global CSS variables for both themes
2. Convert layout-level backgrounds and major card surfaces
3. Convert sidebar, dropdown, modal, and feed shells
4. Convert auth/onboarding forms
5. Convert edge cases and interactive states

## 9. Important Constraint

Dark mode should not become a new visual identity.
It should feel like PetYard in a darker environment, not like a different product.
