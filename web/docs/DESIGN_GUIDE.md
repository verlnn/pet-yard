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

## 13. Dark Floating Panel System
PetYard now has a defined dark floating panel pattern used by the sidebar “More” menu, the theme switch panel, and alert-style action cards such as logout confirmation.

This pattern should be treated as a reusable UI family, not as one-off styling.

Use this pattern for:
- “More” style contextual menus
- lightweight settings subpanels
- confirmation cards for actions such as logout
- alert-like overlays that should feel like part of the same product language

Do not use this pattern for:
- full-page dialogs
- heavy form flows
- large content modals
- onboarding steps or primary task surfaces

### 13.1 Visual Identity
These panels should feel:
- dark
- compact
- elevated
- rounded
- quiet rather than flashy

The visual reference is the current sidebar “More” panel:
- dark charcoal surface
- large rounded corners
- soft but deep shadow
- thin separators
- white text with slightly muted secondary copy

This family is intentionally different from the light-first default app cards. It exists as a special-purpose overlay system.

### 13.2 Surface Rules
Preferred panel traits:
- background from the shared menu surface token, not arbitrary black
- rounded corners around `24px`
- clipped overflow
- strong but soft shadow
- restrained internal spacing

Guidelines:
- Use one continuous card surface instead of stacking many mini cards inside.
- The panel should read as a single floating object.
- Dividers should be subtle and thin.
- Do not add bright borders, glowing outlines, or decorative gradients.

### 13.3 Content Hierarchy
Within this panel family, hierarchy should be obvious:
- title or primary label is the most visible text
- secondary description is muted but still readable
- actions are compact and visually subordinate to the message

For alert cards specifically:
- the message must carry more visual weight than the buttons
- action buttons should not compete with the title
- compact action rows are preferred over oversized CTA buttons

### 13.4 Action Rows
The current product direction is that actions inside these dark floating cards should resemble menu rows, not generic large dialog buttons.

Rules:
- keep actions compact
- prefer `text-sm` or slightly smaller button text
- avoid oversized padded buttons
- use separators when stacking actions
- use horizontal actions only when there are exactly two short actions and they can fit cleanly

When using horizontal actions:
- center the labels
- keep both actions visually balanced
- use a vertical divider between them

When using vertical actions:
- keep labels left-aligned
- preserve the “menu list” feeling
- use horizontal dividers between actions

### 13.5 Theme Switch Panel Pattern
The theme switch subpanel should follow the same card family as the “More” menu:
- same dark surface
- same radius
- same shadow language
- same divider treatment

Structure:
1. header row
2. subtle divider
3. compact settings row

Header row rules:
- left back control
- centered or visually dominant title
- right status icon reflecting current mode

Icon behavior:
- show a moon icon when dark mode is active
- show a sun icon when light mode is active
- the icon should communicate current state, not just the destination action

### 13.6 Alert Card Pattern
Alert cards should now be implemented through a shared component, not ad hoc markup.

Current shared direction:
- use the common alert component
- render it in a viewport-level overlay
- keep the card itself in the same design family as the “More” menu

Alert card structure:
1. strong title
2. short explanatory description
3. divider
4. action group

Behavior rules:
- clicking the backdrop closes the alert when appropriate
- `Escape` should close it
- the card should appear centered in the viewport
- the card should not inherit transformed ancestor layout behavior

### 13.7 Recommended Shared API
For reusable alert UI, the shared component should allow:
- title
- description
- confirm label
- cancel label
- action layout class or variant
- close handler
- confirm handler

The action layout must be configurable because some alerts read better with:
- horizontal compact actions
- vertical stacked actions

Use semantic class families rather than inline utility strings when this pattern evolves.

### 13.8 Implementation Guidance
When implementing this pattern:
1. start from the existing “More” menu styling
2. reuse the same surface token and divider language
3. keep spacing compact
4. make copy more prominent than actions
5. use a shared component for alert-style overlays
6. only introduce a new variant if the current family cannot express the needed structure cleanly
