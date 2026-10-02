---
name: RutaOptima
description: A night navigation chart for fleet operations; plotted tracks, light-characteristic status, tabular mono readouts.
colors:
  abyss: "oklch(0.168 0.027 256)"
  abyss-rail: "oklch(0.145 0.026 258)"
  panel: "oklch(0.205 0.03 256)"
  panel-raised: "oklch(0.235 0.032 256)"
  panel-muted: "oklch(0.238 0.03 256)"
  panel-secondary: "oklch(0.27 0.033 256)"
  hairline: "oklch(0.33 0.035 252)"
  hairline-input: "oklch(0.38 0.035 252)"
  chart-white: "oklch(0.945 0.012 232)"
  ink-muted: "oklch(0.73 0.03 244)"
  route-magenta: "oklch(0.74 0.17 328)"
  route-magenta-ink: "oklch(0.17 0.04 330)"
  selection-wash: "oklch(0.3 0.06 320)"
  state-nominal: "oklch(0.78 0.16 155)"
  state-risk: "oklch(0.83 0.15 85)"
  state-critical: "oklch(0.7 0.2 25)"
  state-idle: "oklch(0.66 0.03 248)"
  water: "oklch(0.185 0.042 256)"
  water-deep: "oklch(0.165 0.045 258)"
  land: "oklch(0.272 0.024 252)"
  land-edge: "oklch(0.43 0.045 250)"
  road: "oklch(0.33 0.028 252)"
  contour: "oklch(0.45 0.07 238)"
  graticule: "oklch(0.5 0.04 250)"
  day-water: "oklch(0.972 0.009 232)"
  day-panel: "oklch(0.992 0.004 232)"
  day-ink: "oklch(0.23 0.045 258)"
  day-magenta: "oklch(0.5 0.2 328)"
  day-land: "oklch(0.925 0.045 95)"
typography:
  headline:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
  body:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  caption:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
  readout:
    fontFamily: "JetBrains Mono Variable, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.43
    letterSpacing: "-0.01em"
    fontFeature: "'tnum', 'zero'"
  chart-label:
    fontFamily: "Figtree Variable, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: "1rem"
    letterSpacing: "0.06em"
rounded:
  sm: "3.6px"
  md: "4.8px"
  lg: "6px"
  xl: "7.2px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
components:
  button-primary:
    backgroundColor: "{colors.route-magenta}"
    textColor: "{colors.route-magenta-ink}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 12px"
  button-outline:
    backgroundColor: "{colors.abyss}"
    textColor: "{colors.chart-white}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 12px"
  button-ghost:
    textColor: "{colors.chart-white}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 12px"
  button-xs:
    rounded: "{rounded.md}"
    height: "24px"
    padding: "0 10px"
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.chart-white}"
    rounded: "{rounded.lg}"
    padding: "16px"
  input:
    backgroundColor: "{colors.hairline-input}"
    textColor: "{colors.chart-white}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "4px 10px"
  status-pill:
    textColor: "{colors.state-nominal}"
    rounded: "{rounded.sm}"
    height: "20px"
    padding: "0 6px"
  sidebar:
    backgroundColor: "{colors.abyss-rail}"
    textColor: "{colors.ink-muted}"
    width: "16rem"
  top-bar:
    backgroundColor: "{colors.abyss}"
    textColor: "{colors.chart-white}"
    height: "56px"
---

# Design System: RutaOptima

## Overview

**Creative North Star: "The Night Chart"**

The operations screen is an ECDIS night display, not a SaaS card grid. Routes are plotted tracks, deviation is cross-track error, alerts are Notices (Avisos), hubs are harbours, and state is a light characteristic: a fixed shape plus a label plus a colour. The ground is an abyss blue-black, chart water sits one step off it, land is dimmed khaki-grey, and borders are 1px hairline graticule. Day mode is the same chart in daylight (pale water, sand land) on the same token names; night is the default for control rooms.

Density is instrument-level: small type (12-14px), 32px controls, hairline separation instead of boxes within boxes. Numbers are readouts, set mono and tabular, and paired with a plotted tick scale rather than a progress bar or a hero tile. The system is built on shadcn/Tailwind 4 tokens, so every surface is addressed by the semantic names in `src/index.css`.

**Key Characteristics:**
- Blue-black ground, one accent (route magenta), four fixed state colours that never stand alone.
- Hairline borders and tonal steps; no shadows at rest.
- Mono tabular readouts with fixed decimals; Figtree for everything else.
- Tick scales and diamond markers for plan-versus-actual.
- Tracks bend at 45 and 90 degrees only; hubs are squares.

## Colors

Cold, tinted darks (hue 252-258) with chart-white ink, one warm-magenta voice, and a state quartet. Night values are listed; day-mode counterparts are the same token names redefined under `:root` (see `day-*` entries and `src/index.css`).

### Primary
- **Route Magenta** (oklch(0.74 0.17 328) night, oklch(0.5 0.2 328) day): planned tracks, the single primary action per view ("Optimizar rutas", notice actions on critical items), selection, focus ring, caret, text selection tint. Nothing else.
- **Selection Wash** (oklch(0.3 0.06 320)): the accent and sidebar-accent fill for selected rows and the active nav item.

### Neutral
- **Abyss** (oklch(0.168 0.027 256)): page background and top bar. **Abyss Rail** (oklch(0.145 0.026 258)) is the sidebar, one step deeper.
- **Panel / Panel Raised** (oklch(0.205 0.03 256) / oklch(0.235 0.032 256)): cards, then popovers and menus. Muted and secondary fills step up from there (0.238, 0.27).
- **Hairline** (oklch(0.33 0.035 252)): every border and divider. **Hairline Input** (oklch(0.38 0.035 252)) at 50% fills inputs.
- **Chart White** (oklch(0.945 0.012 232)): primary ink. **Ink Muted** (oklch(0.73 0.03 244)): secondary text, units, descriptions.

### State (light characteristics)
- **Nominal** (oklch(0.78 0.16 155)): green filled circle, "En plan".
- **At Risk** (oklch(0.83 0.15 85)): amber triangle.
- **Critical** (oklch(0.7 0.2 25)): red octagon with a bar-and-dot cut-out; the only state allowed to pulse (ping ring, 2.6s), and the only one with a row tint (crit at 7%).
- **Idle** (oklch(0.66 0.03 248)): grey hollow ring, "sin ruta" / offline.

### Chart Scenery
Water (0.185), Water Deep (0.165), Land (0.272), Land Edge (0.43), Road (0.33), Contour (oklch(0.45 0.07 238), traffic-delay isochrones), Graticule (oklch(0.5 0.04 250)). Scenery stays low-chroma so tracks and state marks are the brightest things on the chart.

### Named Rules
**The One Voice Rule.** Magenta means planned track, selection, or the primary action. It is never a status, never decoration, never a second button colour on the same view.
**The Never Alone Rule.** A state colour always travels with its shape and a text label (or an sr-only label where space forbids). Colour-only state is a defect.
**The Same Tokens Rule.** Day and night differ by token value only; components never branch on mode for colour.

## Typography

**Display / Body Font:** Figtree Variable (with system-ui, sans-serif), stylistic sets ss01 and cv11 on.
**Readout Font:** JetBrains Mono Variable (with ui-monospace, monospace).

**Character:** A friendly humanist sans for labels and prose against a strict mono for anything measured. The contrast is the instrument-panel feel; no display face is used.

### Hierarchy
- **Headline** (600, 1.5rem, tight -0.025em): page title in the page header only.
- **Title** (500, 1rem): card titles.
- **Body** (400-500, 0.875rem / 0.8125rem): rows, descriptions, controls; table and `.tnum` numerics are tabular.
- **Caption** (400, 0.75rem; 0.6875rem and 0.625rem for chart annotations): deltas, timestamps, helper text.
- **Readout** (mono, tabular + slashed zero, -0.01em): measured values, IDs, coordinates, times, counts, tick-scale annotations.
- **Chart Label** (600, 0.6875rem, +0.06em, uppercase, Ink Muted): units, axis titles, legend keys only.

### Named Rules
**The Readout Rule.** Any value an operator reads as a measurement (count, %, km, time, ID, coordinate) uses `.readout` with fixed decimals and the locale's decimal comma.
**The Chart Label Rule.** Uppercase tracked caps are for chart furniture (units, axes, legend keys). They do not label sections or introduce headings.

## Layout

Workstation shell: collapsible left rail (16rem, icon-collapsed available, sheet on mobile), sticky 56px top bar (search, fleet-by-state counts, clock with data freshness, notices), then the page. Page header: 1.5rem title, optional description, page-scoped actions right-aligned (wraps under the title on narrow screens), 20px below. Dashboard first viewport is the instrument strip of six readouts, then the chart at roughly two thirds width with the Avisos queue as the right third.

Spacing is a 4px base with 8, 12, 16 (card padding, default), 12 (small cards) and 20 steps in use. Separation comes from hairlines and `divide-y` lists. Responsive: desktop multi-monitor first; columns stack below the sidebar breakpoint and the rail becomes a sheet down to phone width.

## Elevation & Depth

Flat and tonal. Depth is conveyed by lightness steps (abyss, panel, panel raised) and 1px hairlines, never by shadows on resting surfaces. Overlays (popovers, dropdowns, select menus, sheets, toasts) use the stock shadcn shadow plus the raised panel tone; that is the only shadow in use. The top bar carries a 95% background with light blur to keep content legible when scrolled under it.

### Named Rules
**The Flat Chart Rule.** Cards, rows, and readouts have no shadow. If something needs to sit above the chart, give it the raised panel tone and a hairline.

## Shapes

Small, instrument-like corners: base radius 6px; controls and inputs use 4.8px, pills and chips 3.6px, cards 6px. Full-round appears only on dots and the switch thumb. Borders are 1px hairline. Chart geometry is angular: tracks run at 45 and 90 degrees only with round joins, hubs and interchanges are squares, ownship vehicles are symbols with a heading vector, and the corridor is a dashed band around the planned track. The brand mark is that grammar in one glyph: a magenta track bending at 45 degrees into a hub square.

## Components

### Buttons
- **Shape:** 4.8px radius, 32px tall (xs 24px, sm 28px, lg 36px), 12px horizontal padding, 14px medium text.
- **Primary:** Route Magenta fill with dark magenta-ink text; hover drops to 80% opacity; used once per view for the main action.
- **Outline / Ghost:** hairline border on abyss, or no border; hover fills muted. Outline is the default for non-critical notice actions.
- **Focus / Press:** 2px magenta outline offset 2px (global focus-visible) plus a 3px ring at 30%; active nudges down 1px. Destructive is a 10% crit tint with crit text, not a solid fill.

### Cards / Containers
- **Corner Style:** 6px, 1px hairline border, Panel background, no shadow.
- **Internal Padding:** 16px (12px small); headers separated from content by a hairline; lists inside are `divide-y`.

### Inputs / Fields
- **Style:** 32px tall, 4.8px radius, Hairline Input at 50% fill, no resting border, magenta caret.
- **Focus:** border shifts to magenta ring with a 3px 30% halo. Invalid uses destructive border and halo.

### Navigation
- Sidebar on Abyss Rail with Ink Muted items; active item takes Selection Wash with near-white magenta-tinted text. Top bar holds global items only (search with kbd hint, fleet-by-state counts, clock and freshness, notices); page actions never go there.

### Status Mark and Pill (signature)
16-unit SVG: filled circle (nominal), triangle (risk), octagon with a background-coloured bar and dot (critical), hollow ring (idle). Size 14px in lists, 12px inside the pill. The pill is a 20px, 3.6px-radius tint (12-14% of the state colour) with the mark and a Spanish label. Critical may pulse; motion is disabled under reduced motion.

### Tick Scale (signature)
Replaces progress bars for plan-versus-actual. A 1px baseline with 21 ticks (major every 25%), a 2.5px foreground fill to the reading, a diamond marker on the reading, and a dashed vertical target tick with a mono annotation ("plan 180", "SLA 95"). Exposed as `role="meter"` with a value text that includes the target.

### Instrument Strip and Avisos
Six readouts in a row (label, mono value with unit, delta, tick scale), separated by hairlines, not cards. Avisos is an ordered list ranked by impact: state mark, sr-only level word, title, detail, then its action button; critical rows carry the faint crit tint and a magenta action, risk rows an outline action.

### Chart
Water ground with graticule, dimmed land, road lines, contour isochrones for delay, planned tracks in magenta inside a dashed corridor, wakes as dotted trails, ownship symbols with heading vectors, hubs as squares. Beacon animation uses stepped blinking (`steps(1)`), a light-characteristic rhythm rather than a smooth pulse.

## Do's and Don'ts

### Do:
- **Do** pair every state colour with its fixed shape and a Spanish label (circle En plan, triangle Riesgo, octagon Crítico, ring Sin ruta).
- **Do** use magenta only for planned tracks, selection, focus, and the single primary action.
- **Do** set measured values in `.readout` and show freshness and source beside live data; label sample data as sample.
- **Do** compare plan to actual with a Tick Scale and a target annotation.
- **Do** draw new tracks and connectors at 45 or 90 degrees with round joins and square hubs.
- **Do** build new surfaces from the semantic tokens so day and night both work, and respect reduced motion.

### Don't:
- **Don't** use rows of same-size icon cards or big-number hero tiles for KPIs; use the instrument strip.
- **Don't** use neon or glow on black; state colours are tuned in lightness, not luminous.
- **Don't** use colour alone for state, or green/amber/red as decoration.
- **Don't** add shadows to resting cards or readouts; step the tone and use a hairline.
- **Don't** introduce a second accent hue or use magenta for status.
- **Don't** bend a drawn track at arbitrary angles or use curved routes on the chart.
- **Don't** use progress bars for plan-versus-actual where a Tick Scale fits.
