import type { Point, Zone } from "@/data/types"

/** Two landmasses split by a river, in chart space (1000 × 640). */
export const LAND: Point[][] = [
  [
    { x: 24, y: 24 },
    { x: 538, y: 24 },
    { x: 538, y: 176 },
    { x: 448, y: 266 },
    { x: 448, y: 404 },
    { x: 358, y: 494 },
    { x: 358, y: 616 },
    { x: 24, y: 616 },
  ],
  [
    { x: 582, y: 24 },
    { x: 976, y: 24 },
    { x: 976, y: 616 },
    { x: 402, y: 616 },
    { x: 402, y: 510 },
    { x: 492, y: 420 },
    { x: 492, y: 282 },
    { x: 582, y: 192 },
  ],
]

/** Bridges across the river: [from, to] */
export const BRIDGES: [Point, Point][] = [
  [
    { x: 530, y: 100 },
    { x: 590, y: 100 },
  ],
  [
    { x: 440, y: 334 },
    { x: 500, y: 334 },
  ],
  [
    { x: 350, y: 560 },
    { x: 410, y: 560 },
  ],
]

export const ZONES: { name: Zone; at: Point }[] = [
  { name: "Norte", at: { x: 740, y: 96 } },
  { name: "Oeste", at: { x: 170, y: 330 } },
  { name: "Centro", at: { x: 598, y: 298 } },
  { name: "Este", at: { x: 890, y: 300 } },
  { name: "Sur", at: { x: 830, y: 604 } },
]

export const HUBS: {
  id: string
  name: string
  at: Point
  kind: "depot" | "shop"
}[] = [
  { id: "base", name: "Base Central", at: { x: 610, y: 372 }, kind: "depot" },
  {
    id: "taller",
    name: "Taller Central",
    at: { x: 190, y: 560 },
    kind: "shop",
  },
]

/** Deterministic closed blob (traffic-delay isochrone). */
function blob(cx: number, cy: number, r: number, seed: number): string {
  const n = 12
  const pts: Point[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const j =
      1 + 0.16 * Math.sin(a * 3 + seed) + 0.1 * Math.cos(a * 2 + seed * 1.7)
    pts.push({
      x: cx + Math.cos(a) * r * j * 1.15,
      y: cy + Math.sin(a) * r * j * 0.85,
    })
  }
  const mid = (a: Point, b: Point) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  })
  let d = `M${mid(pts[n - 1], pts[0]).x.toFixed(1)} ${mid(pts[n - 1], pts[0]).y.toFixed(1)}`
  for (let i = 0; i < n; i++) {
    const m = mid(pts[i], pts[(i + 1) % n])
    d += ` Q${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${m.x.toFixed(1)} ${m.y.toFixed(1)}`
  }
  return d + "Z"
}

/** Traffic isochrones; label = extra minutes. Innermost is the worst. */
export const CONTOURS: {
  d: string
  label: string
  at: Point
  minutes: number
}[] = [
  {
    d: blob(650, 322, 150, 1),
    label: "+5",
    at: { x: 650 - 150 * 1.15 + 6, y: 322 },
    minutes: 5,
  },
  {
    d: blob(650, 322, 100, 2),
    label: "+10",
    at: { x: 650 - 100 * 1.15 + 6, y: 322 },
    minutes: 10,
  },
  {
    d: blob(650, 322, 52, 3),
    label: "+15",
    at: { x: 650, y: 322 - 40 },
    minutes: 15,
  },
  {
    d: blob(820, 196, 70, 4),
    label: "+5",
    at: { x: 820 - 70 * 1.15 + 6, y: 196 },
    minutes: 5,
  },
  {
    d: blob(820, 196, 36, 5),
    label: "+9",
    at: { x: 820, y: 196 - 28 },
    minutes: 9,
  },
]
