# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing scaffold in this repo: Vite 8, React 19, TypeScript 6, Tailwind CSS 4 (`@tailwindcss/vite`), shadcn/ui (style `radix-rhea`, radix-ui, lucide), pnpm. The legacy app (`../mydashboard`: Vite 7 + React 18 + Tailwind 3) is the source of functionality to migrate.

## Users

Primary: dispatcher / monitoring operator in a logistics control tower, working long shifts on desktop and multi-monitor screens, often in dim rooms. Job: see fleet and shipment state in seconds, catch delays, deviations and unplanned stops early, prioritise exceptions by impact, and act.

Secondary (confirmed as roles the product must serve, not first-screen priorities): operations supervisor / manager (SLA, OTIF, cost, trends), end customer (reliable ETAs), driver in the field (mobile).

## Product Purpose

RutaOptima ("Planificador de Rutas Multicriterio", Logistics AI) is a B2B platform for transport and last-mile companies: plan and optimise routes, monitor fleet and orders live, manage exceptions, and analyse cost and service performance. Success: fewer incidents, delays and costs; operators understand operation state in a few seconds and are led to the correct action.

## Positioning

Multi-criteria route optimisation (cost, time, fuel, SLA windows) combined with a live control-tower view, so the same screen that shows the problem offers the re-plan.

## Operating Context

Control rooms and dispatch desks; continuous monitoring (dark mode matters); legible at distance. Integrates conceptually with TMS, WMS, ERP, telematics, GPS/IoT. Logistics KPIs in play: OTIF, on-time delivery, ETA accuracy, fleet utilisation, cost per km and per delivery, dwell time, empty km, fuel consumption. Compliance concerns: driving hours, documentation, cold chain, dangerous goods, proof of delivery.

## Capabilities and Constraints

Existing routes to preserve: `/` dashboard, `/routes` route planner, `/orders`, `/fleet`, `/analytics`. New pages required: `/live-map` and `/settings` (both already linked in the sidebar). Existing UI language is Spanish; keep Spanish copy.

Data: the legacy app uses hardcoded sample data. Decision: introduce typed, realistic mock data (vehicle, shipment/order, alert, route, KPI) behind a data layer ready to swap for an API/TMS. No real backend exists. Do not present mock numbers as real customer evidence.

Functionality must not break in the migration; states must be semantic (normal / at risk / critical) and never colour-only.

## Evidence on Hand

Legacy implementation at `../mydashboard/src` (pages, dashboard widgets, layout). No real customer data, testimonials, logos or benchmarks exist; none may be fabricated.

## Product Principles

1. Reduce operator cognitive load: clarity over decoration, action over display.
2. State of the operation readable in seconds; problems surface before they hit the customer or the cost line.
3. Every alert leads directly to the right action, ranked by impact to fight alert fatigue.
4. Build trust in data: show freshness, source and precision of what is on screen.
5. Scale to more vehicles, clients, regions and roles without redesign; density adapts to the role.

## Accessibility & Inclusion

Target WCAG AA. Status never relies on colour alone (icon, label, shape). Dark mode supported for continuous monitoring, light mode available. Respect reduced motion.
