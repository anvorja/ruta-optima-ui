/**
 * Basemap tiles. The default is the standard OpenStreetMap layer, which needs no key but
 * is only meant for light use (see https://operations.osmfoundation.org/policies/tiles/):
 * for production set the VITE_TILE_* variables to a provider you have an agreement with.
 * Values are public (they ship to the browser): if the provider needs a key, restrict it
 * by domain. With the default, dark mode darkens the tiles with a CSS filter.
 */
const env = import.meta.env

const OSM = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"

export const TILE_URL = {
  dark: env.VITE_TILE_URL_DARK ?? OSM,
  light: env.VITE_TILE_URL_LIGHT ?? OSM,
} as const

/** True when the dark theme reuses the light tiles and must be darkened with a filter. */
export const DARKEN_TILES = !env.VITE_TILE_URL_DARK

export const TILE_ATTRIBUTION =
  env.VITE_TILE_ATTRIBUTION ??
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
