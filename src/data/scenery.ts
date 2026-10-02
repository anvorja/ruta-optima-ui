import type { Point } from "@/data/types"
import { BASE, WORKSHOP } from "@/data/places"

const pt = ([lat, lng]: [number, number]): Point => ({ lat, lng })

export const HUBS: {
  id: string
  name: string
  at: Point
  kind: "depot" | "shop"
}[] = [
  { id: "base", name: "Base Central", at: pt(BASE), kind: "depot" },
  { id: "taller", name: "Taller Central", at: pt(WORKSHOP), kind: "shop" },
]

/** Traffic-delay isochrones as circles (metres); label = extra minutes. */
export const CONTOURS: { at: Point; radius: number; minutes: number }[] = [
  { at: { lat: 4.615, lng: -74.075 }, radius: 1700, minutes: 5 },
  { at: { lat: 4.615, lng: -74.075 }, radius: 1100, minutes: 10 },
  { at: { lat: 4.615, lng: -74.075 }, radius: 550, minutes: 15 },
  { at: { lat: 4.706, lng: -74.056 }, radius: 1000, minutes: 5 },
  { at: { lat: 4.706, lng: -74.056 }, radius: 480, minutes: 9 },
]

/** Where the "Zona Centro" congestion notice points. */
export const CENTRO_AT: Point = { lat: 4.615, lng: -74.075 }
