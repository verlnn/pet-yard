# PetYard Front End Design Guide

This document captures the current PetYard front-end visual language so new Codex sessions keep the design consistent.

## 1. Core Direction
- Tone: warm, calm, friendly, lightly polished
- Mode: light-first
- Visual mood: soft gradients, rounded surfaces, subtle glassy cards, gentle depth
- Avoid: harsh dark UI, neon accents, ultra-flat layouts, random style shifts between screens

## 2. Color System
Use the existing Tailwind extended colors as the primary palette.

- `ink`: primary text, primary button background, strong emphasis
- `sand`: app background base
- `pine`: secondary accent, supportive emphasis
- `moss`: soft natural accent
- `clay`: warm accent/background tint
- `ember`: destructive or alert emphasis
- `sky`: cool background accent

Guidelines:
- Prefer `ink + sand` as the default contrast pair.
- Use `pine`, `moss`, `clay`, and `sky` as supporting accents, not dominant replacements.
- Use `ember` mainly for destructive states, errors, or warning emphasis.
- Do not introduce a new dominant brand color unless the task explicitly requires it.

## 3. Typography
- Display font: `Space Grotesk`
- Body font: `SUIT`

Guidelines:
- Titles and section headers should lean on the display font or equivalent display styling.
- Body copy, labels, form text, and helper text should stay on the body font.
- Prefer clear hierarchy over decorative typography.

## 4. Backgrounds and Surfaces
- Base page background should feel layered and atmospheric rather than flat.
- Existing backgrounds use soft radial gradients and warm neutral fills.
- Cards often use:
  - semi-opaque white
  - subtle border
  - backdrop blur when appropriate
  - soft shadow

Guidelines:
- Reuse the existing “soft card on warm gradient background” approach.
- Prefer soft translucency over heavy solid blocks for important containers.
- Avoid overly dark panels unless the feature already uses them, like media viewers.

## 5. Radius and Shape
- The interface uses large rounded corners consistently.
- Common patterns:
  - inputs and buttons: `rounded-2xl`
  - pills/tags: `rounded-full`
  - larger panels/dialogs: around `28px` to `32px`

Guidelines:
- Default to generous rounding.
- Do not mix sharp rectangular UI with the rest of the current interface.

## 6. Shadows and Depth
- Shadows are soft and slightly lifted, never harsh.
- Existing patterns use low-contrast dark shadows with wide blur.

Guidelines:
- Prefer subtle elevation.
- Hover motion should be gentle, usually slight lift or background change.
- Avoid aggressive scale transforms and strong drop shadows.

## 7. Inputs and Form Controls
Current shared style direction:
- rounded large inputs
- soft border
- white or near-white background
- subtle shadow
- `ink`-tinted focus ring

Guidelines:
- New forms should visually match the current auth/onboarding inputs.
- If a new form component is introduced, style it from the same family before creating a new variant.
- Disabled states should be clearly visible but still soft and readable.

## 8. Buttons
Current hierarchy:
- Primary: dark `ink` background with `sand` text
- Secondary/Ghost: white or translucent white with border
- Destructive: red/ember family only when needed

Guidelines:
- Keep one clear primary action per view or section.
- Use full-width primary buttons in step-based mobile-like flows such as onboarding.
- Secondary buttons should feel lighter, not equally dominant.

## 9. Motion
- Motion is present but restrained.
- Existing style favors fade/slide transitions and slight hover lift.

Guidelines:
- Use motion to clarify flow, not to decorate.
- Prefer:
  - fade up
  - subtle translate
  - soft opacity transitions
- Avoid flashy animations, bouncy interactions, or inconsistent transition curves.

## 10. Component Naming and Styling
- JSX should prefer semantic class names over long raw utility strings when the element has a clear role.
- Styles should be centralized in `web/app/globals.css` under `@layer components` when reusable or structurally meaningful.

Examples:
- `onboarding-profile-step-panel`
- `onboarding-pet-verify-button`
- `feed-detail-menu-trigger`

## 11. Consistency Rule for New Work
When creating or editing UI:
1. Check if an existing component, style family, or pattern already solves the problem.
2. Extend that pattern before inventing a new one.
3. If a new visual pattern is necessary, make it feel like a natural member of the same system.

## 12. What to Avoid
- Random per-page redesigns
- Different button philosophies on each screen
- New color families that overpower the current palette
- Small, cramped radii in a large-radius system
- Overloaded JSX with unreadable utility-only styling when a semantic component class makes more sense
