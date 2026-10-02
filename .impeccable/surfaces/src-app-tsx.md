---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# Surface brief: RutaOptima control tower (whole app shell + all routes)

Mode: Operate. Visitor: dispatcher/monitoring operator on long shifts, dim control room, desktop multi-monitor first, usable down to phone for supervisors/drivers.
Task: see fleet + shipments state in seconds, catch delay/deviation/stop early, triage alerts by impact, act (re-plan, contact, reassign).
Constraints: preserve routes `/ /routes /orders /fleet /analytics`, add `/live-map` and `/settings`; Spanish copy; status never colour-only; WCAG AA; reduced motion; synthetic data labeled as sample.

## Direction contract

THESIS: The operations screen is a night navigation chart, not a SaaS card grid. Routes are plotted tracks, deviation is cross-track error, alerts are Notices, hubs are harbours, state is a light characteristic (shape + pattern + colour). Refuses: rows of same-size icon cards, big-number hero tiles, neon-on-black glow.

OWN-WORLD: ECDIS night display. Abyss blue-black ground (oklch ~0.17 0.025 255), chart water one step lighter, land dimmed khaki-grey, hairline 1px graticule borders, ink in chart-white with tinted greys. One accent: route magenta (hue ~328) for planned tracks, primary action and selection only. Status vocabulary fixed: steady green circle = nominal, amber triangle = at risk, red octagon = critical, grey hollow ring = idle/offline. Tracks follow real streets on a real Leaflet basemap (the 45/90 rule was dropped once the map became real; it stays for schematic diagrams); numerics tabular and mono with fixed decimals (Ikeda raise). Day mode = daylight chart (pale water, sand land) on the same tokens.

STORY: Operator opens the tower and within seconds reads: how many vessels (vehicles) are on plan, which are drifting off corridor, which windows will be missed, and what to do about each. Trusts it because every readout shows freshness and source.

FIRST VIEWPORT: Left rail (nav, collapsible) + top status bar (clock, data freshness, alert count). Below, one instrument strip of 6 tabular readouts (not cards). Then the chart fills ~2/3 width and ~70vh: vehicles as ownship symbols with heading vector, wake and planned magenta track inside a dashed corridor; depth-contour isochrones show traffic delay. Right third: "Avisos" queue ranked by impact, each with its action button. Primary action "Optimizar rutas" sits in the Dashboard page header (page-scoped; the top bar stays global: search, fleet-by-state counts, clock, notices), magenta.

FORM: Chart-plotter workstation; position 7 of 7 on the candidate list (assigned by the roll); seed key a0cb1e4f. Raises: transit-diagram (angle discipline, interchange = hub), Ikeda (tabular mono numerics).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
