import type { Point } from "@/data/types"

const R = 6371008.8 // mean Earth radius, metres
const rad = (d: number) => (d * Math.PI) / 180

/** Great-circle distance in metres. */
export function distance(a: Point, b: Point): number {
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Initial bearing in degrees (0 = north, clockwise). */
export function bearing(a: Point, b: Point): number {
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat))
  const x =
    Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) -
    Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng))
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

export function segLengths(route: Point[]): number[] {
  const out: number[] = []
  for (let i = 1; i < route.length; i++)
    out.push(distance(route[i - 1], route[i]))
  return out
}

/** Route length in kilometres. */
export function routeLengthKm(route: Point[]): number {
  return segLengths(route).reduce((a, b) => a + b, 0) / 1000
}

/** Position and heading at fraction t (0..1) of a route, by distance travelled. */
export function pointAt(
  route: Point[],
  t: number
): { p: Point; heading: number } {
  if (route.length === 0) return { p: { lat: 0, lng: 0 }, heading: 0 }
  if (route.length === 1) return { p: route[0], heading: 0 }
  const lens = segLengths(route)
  const total = lens.reduce((a, b) => a + b, 0)
  let d = Math.min(Math.max(t, 0), 1) * total
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const f = lens[i] === 0 ? 0 : Math.min(d / lens[i], 1)
      const a = route[i]
      const b = route[i + 1]
      return {
        p: {
          lat: a.lat + (b.lat - a.lat) * f,
          lng: a.lng + (b.lng - a.lng) * f,
        },
        heading: bearing(a, b),
      }
    }
    d -= lens[i]
  }
  return { p: route[route.length - 1], heading: 0 }
}

/** Sub-route between fractions a and b (the wake behind a vehicle). */
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

export const toTuples = (route: Point[]): [number, number][] =>
  route.map((p) => [p.lat, p.lng])

export const toPoint = ([lat, lng]: [number, number]): Point => ({ lat, lng })

/** Straight-line distance padded for street layout: a planning estimate, not a route. */
export const STREET_FACTOR = 1.35
