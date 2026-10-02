import type { Point } from "@/data/types"

export const CHART_W = 1000
export const CHART_H = 640

export function segLengths(route: Point[]): number[] {
  const out: number[] = []
  for (let i = 1; i < route.length; i++) {
    out.push(
      Math.hypot(route[i].x - route[i - 1].x, route[i].y - route[i - 1].y)
    )
  }
  return out
}

export function routeLength(route: Point[]): number {
  return segLengths(route).reduce((a, b) => a + b, 0)
}

/** Position and heading (degrees, 0 = up, clockwise) at fraction t of a route. */
export function pointAt(
  route: Point[],
  t: number
): { p: Point; heading: number } {
  if (route.length === 0) return { p: { x: 0, y: 0 }, heading: 0 }
  if (route.length === 1) return { p: route[0], heading: 0 }
  const lens = segLengths(route)
  const total = lens.reduce((a, b) => a + b, 0)
  let d = Math.min(Math.max(t, 0), 1) * total
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const f = lens[i] === 0 ? 0 : Math.min(d / lens[i], 1)
      const a = route[i]
      const b = route[i + 1]
      const heading = (Math.atan2(b.x - a.x, -(b.y - a.y)) * 180) / Math.PI
      return {
        p: { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f },
        heading: (heading + 360) % 360,
      }
    }
    d -= lens[i]
  }
  return { p: route[route.length - 1], heading: 0 }
}

/** Sub-route between fractions a and b (used for the wake behind a vehicle). */
export function slice(route: Point[], a: number, b: number): Point[] {
  const lens = segLengths(route)
  const total = lens.reduce((x, y) => x + y, 0)
  if (total === 0) return route
  const start = a * total
  const end = b * total
  const pts: Point[] = [pointAt(route, a).p]
  let acc = 0
  for (let i = 0; i < lens.length; i++) {
    acc += lens[i]
    if (acc > start && acc < end) pts.push(route[i + 1])
  }
  pts.push(pointAt(route, b).p)
  return pts
}

export function toPath(points: Point[]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ")
}

/**
 * Orthogonal-with-45° routing between two points: one diagonal leg, one straight
 * leg. Used for plotted tracks so every bend is 45° or 90°.
 */
export function chartRoute(points: Point[]): Point[] {
  if (points.length < 2) return points
  const out: Point[] = [points[0]]
  for (let i = 1; i < points.length; i++) {
    const a = out[out.length - 1]
    const b = points[i]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const diag = Math.min(Math.abs(dx), Math.abs(dy))
    if (diag > 0 && Math.abs(dx) !== Math.abs(dy)) {
      // straight first along the long axis, then diagonal
      if (Math.abs(dx) > Math.abs(dy)) {
        out.push({ x: b.x - Math.sign(dx) * diag, y: a.y })
      } else {
        out.push({ x: a.x, y: b.y - Math.sign(dy) * diag })
      }
    }
    out.push(b)
  }
  return out
}

/** Grid reference like "D4" for a chart point (10 columns × 6 rows). */
export function gridRef(p: Point): string {
  const col = Math.min(9, Math.max(0, Math.floor(p.x / (CHART_W / 10))))
  const row = Math.min(5, Math.max(0, Math.floor(p.y / (CHART_H / 6))))
  return `${String.fromCharCode(65 + col)}${row + 1}`
}

/** Chart units → kilometres (one grid cell is ~1.5 km). */
export const KM_PER_UNIT = 1.5 / 100
