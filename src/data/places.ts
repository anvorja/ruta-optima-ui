/**
 * Illustrative coordinates in Bogotá for the sample data. They are placeholders for
 * real customer addresses; routing snaps them to the nearest road.
 * Plain module (no path aliases) so scripts/generate-routes.ts can import it.
 */
export type LatLngTuple = [lat: number, lng: number]

export const BASE: LatLngTuple = [4.6469, -74.1033]
export const WORKSHOP: LatLngTuple = [4.621, -74.138]
export const BOGOTA_CENTER: LatLngTuple = [4.64, -74.09]

export const ORDER_COORDS: Record<string, LatLngTuple> = {
  "ORD-2458": [4.6115, -74.0835],
  "ORD-2459": [4.7013, -74.0414],
  "ORD-2460": [4.5981, -74.076],
  "ORD-2461": [4.6677, -74.0545],
  "ORD-2462": [4.6086, -74.0688],
  "ORD-2463": [4.635, -74.12],
  "ORD-2464": [4.628, -74.064],
  "ORD-2465": [4.5855, -74.099],
  "ORD-2466": [4.58, -74.11],
  "ORD-2467": [4.578, -74.14],
  "ORD-2468": [4.69, -74.125],
  "ORD-2469": [4.67, -74.143],
  "ORD-2470": [4.6535, -74.06],
  "ORD-2471": [4.6944, -74.03],
  "ORD-2472": [4.601, -74.065],
  "ORD-2473": [4.61, -74.064],
  "ORD-2474": [4.63, -74.155],
  "ORD-2475": [4.641, -74.15],
  "ORD-2476": [4.618, -74.152],
  "ORD-2477": [4.565, -74.128],
  "ORD-2478": [4.556, -74.148],
  "ORD-2479": [4.57, -74.105],
  "ORD-2480": [4.612, -74.0705],
  "ORD-2481": [4.6012, -74.071],
  "ORD-2482": [4.662, -74.051],
  "ORD-2483": [4.68, -74.045],
  "ORD-2484": [4.702, -74.035],
}

/** Planned stop order per vehicle (order ids). */
export const VEHICLE_STOPS: Record<string, string[]> = {
  "V-001": ["ORD-2458", "ORD-2460", "ORD-2470"],
  "V-002": ["ORD-2464", "ORD-2459", "ORD-2471"],
  "V-003": ["ORD-2465", "ORD-2466", "ORD-2467"],
  "V-004": ["ORD-2472", "ORD-2473", "ORD-2462"],
  "V-007": ["ORD-2468", "ORD-2469"],
  "V-008": ["ORD-2474", "ORD-2475", "ORD-2476"],
  "V-009": ["ORD-2477", "ORD-2478", "ORD-2479"],
  "V-010": ["ORD-2480", "ORD-2481"],
  "V-011": ["ORD-2482", "ORD-2483", "ORD-2484"],
}
