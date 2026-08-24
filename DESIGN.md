# Design

<!-- impeccable:design-schema 1 -->

## Process note

This redesign skipped Impeccable's interactive concept-seed/decision-page ceremony: no image generation tool is available in this environment, and this session runs as a background job without a confirmed interactive browser to render the decision page. The direction below was decided directly against `PRODUCT.md`'s physical scene and Operate-mode guidance (`reference/operate.md`), which explicitly favors a grounded, workhorse direction over invented "visual worlds" for task-first surfaces. The finish-review and documentation subagents shipped with Impeccable (`impeccable-finish-reviewer`, `impeccable-documenter`) are not registered in this harness's agent roster; those passes were substituted with an in-thread review against `reference/craft-floor.md` and browser screenshots at tablet and desktop widths.

## Mode

**Operate.** The visitor is completing a task (counting stock, filing a purchase order, administering data), not being persuaded or entertained. Expression never outranks scanability, state legibility, or native affordances.

## Physical scene

Primary use: standing in a store's stockroom, tablet in one hand, walking the aisle while counting physical inventory, under stockroom lighting that is inconsistent and often harsh (fluorescent overhead, occasional glare near doors/windows). Secondary use: an administrator at a desktop, reviewing and consolidating orders from multiple stores in an office.

This scene forces two decisions the previous implementation got backwards:
- **Light, not dark.** Dark UIs lose effective contrast under glare — reflections wash near-black toward gray, and a subtle blue-on-black accent disappears exactly when the light is worst. A light, high-contrast ground holds its contrast ratio under glare and reads faster at a glance while walking.
- **No glass/blur.** `backdrop-filter: blur()` softens edges and reduces the contrast of whatever sits behind it — the opposite of what a screen needs to survive variable ambient light. Flat surfaces with a real border read unambiguously in any light.

## Own-world

The product replaces a shared Excel workbook (`Centralizador.xlsm`) that stores used to record stock counts and orders. Its visual material comes from the floor it operates on, not from generic SaaS-dashboard conventions: pallet tags, stock labels, tally sheets, warehouse signage — flat cards with a clear printed-label border, bold tabular numerals for every count and quantity (a legitimate use of monospace/tabular figures for data, not a "technical" costume), and a single safety-amber accent standing in for the hi-vis marking a warehouse already uses to flag "this needs attention / this is active." Blue was dropped entirely — it is the default every dashboard already reaches for and it carries no meaning on a stockroom floor.

## Color strategy

**Restrained** (Operate's default): a neutral paper/graphite scale carries almost everything; one committed accent (amber) is reserved for primary actions, current selection, and "needs attention" states — never decoration.

```
--background:        0 0% 100%      (pure paper white ground)
--foreground:         20 14% 12%    (warm near-black graphite text)
--card:                0 0% 100%
--card-foreground:   20 14% 12%
--surface:            30 20% 97%    (warm off-white panel, one step off ground)
--surface-hover:      30 20% 94%
--muted:              30 12% 94%
--muted-foreground:  20 8% 42%
--border:             30 10% 85%
--input:              30 10% 85%
--ring:               28 92% 48%    (= primary)

--primary:            28 92% 48%    (safety amber — the one committed accent)
--primary-foreground: 0 0% 100%

--secondary:          20 14% 12%    (graphite — secondary actions read as "ink", not a second brand color)
--secondary-foreground: 0 0% 100%

--success:            142 65% 32%
--success-foreground: 0 0% 100%
--warning:             45 93% 40%   (gold — distinct hue from primary amber)
--warning-foreground:  0 0% 100%
--destructive:          4 74% 42%
--destructive-foreground: 0 0% 100%

--popover:  0 0% 100%
--popover-foreground: 20 14% 12%
--overlay: 20 14% 12%  (used at low opacity, never blurred)
```

All state colors are bold and named (solid fills, not 10%-opacity tints standing in for meaning) so they read correctly under glare and never depend on a subtle hue shift alone.

## Typography

- One workhorse family (system sans / Inter, already in the project) carries headings, labels, body, and data. Operate mode does not need a display face.
- Fixed rem scale (not fluid/clamp) — the tablet viewport is predictable, unlike a marketing page.
- Scale: `text-xs` 0.75rem / `text-sm` 0.875rem / `text-base` 1rem / `text-lg` 1.125rem / `text-xl` 1.25rem / `text-2xl` 1.5rem / `text-3xl` 1.875rem. Ratio ≈1.13–1.2, tight by design — many UI elements share the page, not a handful of display moments.
- All counts, quantities, prices, and IDs use `font-variant-numeric: tabular-nums` so columns of numbers align — this is measurement, not a monospace costume.
- Body text minimum 0.875rem in dense tables, 1rem everywhere a field worker reads standing up.

## Shape & elevation

- Radius: label-like, not bubble-like. `--radius: 0.5rem` (8px) as the base; small controls at 0.375rem. No `rounded-2xl`/`rounded-3xl` sweep across every surface — that reads as generic template chrome.
- Elevation: real offset+blur shadows only on genuinely floating elements (modal, popover, sticky submit bar). Resting cards use a 1px border, not a shadow. No `backdrop-filter` anywhere in the shipped system — `.glass`/`.glass-card` utility classes are removed.

## Touch & density

- Default interactive control height: 48px (`h-12`). This applies to buttons, inputs, selects, and stepper controls used in the field flow (`OrderForm`, `StoreSelector`, `ProductFilter`).
- Primary submit actions (order submit, confirm) stay large — 56–64px — since they are the one action a field worker commits to per screen.
- Admin/desktop-only surfaces (tables, dense CRUD forms) may use the 40px `sm` control size where the mouse affords precision Impeccable doesn't ask tablets to have.
- Icon-only buttons are never smaller than 44×44px, per WCAG 2.5.5 / the platform's own touch-target floor.

## Motion

150–250ms on state transitions (hover, expand, confirm). One authored moment on success (order submitted), not scattered entrance animation on every card. No orchestrated page-load choreography — the app loads into a task.

## Components

Every interactive component ships default, hover, focus-visible, active, disabled, loading, and error states, themed from the palette above (focus ring = amber, never the browser default blue). Overlays (dropdowns, comboboxes) use `position: fixed` or the popover API so they never clip inside a scrolling card.

## What this replaces

- Dark "premium" theme (`hsl(240 10% 3.9%)` background, `hsl(210 100% 50%)` blue primary) → light paper ground, amber primary.
- `.glass` / `.glass-card` (backdrop-blur, translucent white borders) → flat bordered surfaces.
- `rounded-xl`/`rounded-2xl` sweep and glow shadows (`shadow-primary`, `shadow-success/30`) → restrained 8px radius, offset shadows only on floating elements.
- 40px (`h-10`) default control height → 48px default, 44px icon-button floor.
- shadcn-default component chrome (`ring-offset-background`, generic `bg-primary`/`bg-accent` tokens with no product meaning) → the same token names, revalued to the amber/paper system above and applied consistently.
