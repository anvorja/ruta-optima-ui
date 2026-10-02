import L from "leaflet"
import "leaflet/dist/leaflet.css"
import * as React from "react"
import {
  Circle,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet"
import { BOGOTA_CENTER } from "@/data/places"
import { CONTOURS, HUBS } from "@/data/scenery"
import type { Level, Order, Point, Vehicle } from "@/data/types"
import { useResolvedTheme } from "@/hooks/use-resolved-theme"
import { pointAt, slice, toTuples } from "@/lib/geo"
import { vehicleLevel, type Thresholds } from "@/lib/status"
import { DARKEN_TILES, TILE_ATTRIBUTION, TILE_URL } from "@/lib/tiles"
import { cn } from "@/lib/utils"

export type Layers = {
  tracks: boolean
  stops: boolean
  traffic: boolean
  labels: boolean
}

export const DEFAULT_LAYERS: Layers = {
  tracks: true,
  stops: true,
  traffic: true,
  labels: true,
}

const LEVEL_VAR: Record<Level, string> = {
  ok: "var(--ok)",
  risk: "var(--risk)",
  crit: "var(--crit)",
  idle: "var(--idle)",
}

/** Chart-light symbol as SVG markup, centred on (0,0). */
function lightSvg(level: Level, s = 6): string {
  const c = LEVEL_VAR[level]
  if (level === "ok") return `<circle r="${s * 0.75}" fill="${c}"/>`
  if (level === "risk")
    return `<path d="M0 ${-s} L${s} ${s * 0.8} L${-s} ${s * 0.8}Z" fill="${c}"/>`
  if (level === "crit") {
    const k = s * 0.42
    const pts = [
      [-k, -s],
      [k, -s],
      [s, -k],
      [s, k],
      [k, s],
      [-k, s],
      [-s, k],
      [-s, -k],
    ]
    return (
      `<path d="M${pts.map((p) => p.join(" ")).join(" L")}Z" fill="${c}"/>` +
      `<rect x="${-s * 0.13}" y="${-s * 0.6}" width="${s * 0.26}" height="${s * 0.7}" fill="var(--background)"/>` +
      `<rect x="${-s * 0.13}" y="${s * 0.3}" width="${s * 0.26}" height="${s * 0.28}" fill="var(--background)"/>`
    )
  }
  return `<circle r="${s * 0.65}" fill="none" stroke="${c}" stroke-width="1.8"/>`
}

type Moving = Vehicle & { heading: number }

function vehicleIcon(
  v: Moving,
  level: Level,
  opts: { selected: boolean; showTag: boolean }
) {
  const stopped = v.status === "detenido"
  const ring =
    opts.selected || level === "crit"
      ? `<circle r="${opts.selected ? 21 : 18}" fill="none" stroke="${LEVEL_VAR[level]}" stroke-width="1.6" ${
          opts.selected ? "" : 'stroke-dasharray="4 3"'
        }/>`
      : ""
  const body = stopped
    ? '<rect x="-7" y="-7" width="14" height="14" fill="var(--background)" stroke="var(--foreground)" stroke-width="2.4"/>'
    : '<path d="M0 -11 L8 9 L0 5 L-8 9Z" fill="var(--background)" stroke="var(--foreground)" stroke-width="2.4" stroke-linejoin="round"/>'
  return L.divIcon({
    className: "chart-vehicle",
    iconSize: [64, 64],
    iconAnchor: [32, 32],
    html: `<svg viewBox="-32 -32 64 64" width="64" height="64" style="overflow:visible" aria-hidden="true">${ring}<g transform="rotate(${
      stopped ? 0 : Math.round(v.heading)
    })">${body}</g><g transform="translate(13 -13)"><circle r="7.5" fill="var(--background)"/>${lightSvg(
      level,
      5.2
    )}</g></svg>${opts.showTag ? `<span class="chart-tag" style="border-color:${LEVEL_VAR[level]}">${v.id}</span>` : ""}`,
  })
}

function stopIcon(status: Order["status"]) {
  const inner =
    status === "retrasado"
      ? lightSvg("crit", 8)
      : status === "entregado"
        ? '<circle r="4" fill="var(--muted-foreground)"/>'
        : status === "en_camino"
          ? '<circle r="7" fill="var(--background)" stroke="var(--foreground)" stroke-width="2"/><circle r="2.5" fill="var(--foreground)"/>'
          : '<circle r="5" fill="var(--background)" stroke="var(--foreground)" stroke-width="1.6"/>'
  return L.divIcon({
    className: "chart-stop",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    html: `<svg viewBox="-10 -10 20 20" width="20" height="20" aria-hidden="true">${inner}</svg>`,
  })
}

function hubIcon(name: string, showName: boolean) {
  return L.divIcon({
    className: "chart-hub",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: `<svg viewBox="-11 -11 22 22" width="22" height="22" aria-hidden="true"><rect x="-9" y="-9" width="18" height="18" fill="var(--background)" stroke="var(--foreground)" stroke-width="2"/><path d="M-4 0H4M0 -4V4" stroke="var(--foreground)" stroke-width="2"/></svg>${
      showName ? `<span class="chart-hub-tag">${name}</span>` : ""
    }`,
  })
}

function numberIcon(n: number) {
  return L.divIcon({
    className: "chart-number",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    html: `<span>${n}</span>`,
  })
}

function labelIcon(text: string) {
  return L.divIcon({
    className: "chart-contour-label",
    iconSize: [40, 14],
    iconAnchor: [20, 7],
    html: `<span>${text}</span>`,
  })
}

/** Move a point `metres` to the right of a heading (cross-track deviation). */
function offsetRight(p: Point, heading: number, metres: number): Point {
  const h = ((heading + 90) * Math.PI) / 180
  return {
    lat: p.lat + (Math.cos(h) * metres) / 111320,
    lng:
      p.lng +
      (Math.sin(h) * metres) / (111320 * Math.cos((p.lat * Math.PI) / 180)),
  }
}

function Controller({
  boundsKey,
  bounds,
  focus,
  compact,
  onHover,
}: {
  boundsKey: string
  bounds: L.LatLngBounds | null
  focus?: Point | null
  compact: boolean
  onHover?: (p: Point | null) => void
}) {
  const map = useMap()
  const boundsRef = React.useRef(bounds)
  React.useEffect(() => {
    boundsRef.current = bounds
  })
  // Fit once the container has its real size; static previews keep refitting on resize.
  React.useEffect(() => {
    const fit = () => {
      map.invalidateSize({ animate: false })
      if (boundsRef.current)
        map.fitBounds(boundsRef.current, { padding: [28, 28], animate: false })
    }
    fit()
    const el = map.getContainer()
    let first = true
    const ro = new ResizeObserver(() => {
      if (first || compact) fit()
      first = false
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [boundsKey, map, compact])
  React.useEffect(() => {
    if (focus)
      map.flyTo([focus.lat, focus.lng], Math.max(map.getZoom(), 14), {
        duration: 0.8,
      })
  }, [focus, map])
  useMapEvents({
    mousemove: (e) => onHover?.({ lat: e.latlng.lat, lng: e.latlng.lng }),
    mouseout: () => onHover?.(null),
  })
  return null
}

type Props = {
  vehicles: Vehicle[]
  thresholds: Thresholds
  orders?: Order[]
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  layers?: Layers
  /** Compact = dashboard preview: no pan/zoom, fewer labels. */
  compact?: boolean
  /** Extra plan drawn on top (route planner preview). */
  overlayTrack?: Point[]
  overlayStops?: { at: Point; n: number }[]
  /** Fly to this point when it changes. */
  focus?: Point | null
  onHover?: (p: Point | null) => void
  className?: string
  title?: string
}

export function ChartMap({
  vehicles,
  thresholds,
  orders = [],
  selectedId = null,
  onSelect,
  layers = DEFAULT_LAYERS,
  compact = false,
  overlayTrack,
  overlayStops,
  focus,
  onHover,
  className,
  title = "Carta de operaciones",
}: Props) {
  const theme = useResolvedTheme()
  const [map, setMap] = React.useState<L.Map | null>(null)

  const levelOf = React.useMemo(() => {
    const m = new Map<string, Level>()
    for (const v of vehicles) m.set(v.id, vehicleLevel(v, thresholds))
    return m
  }, [vehicles, thresholds])

  const moving = vehicles.filter((v) => v.route.length > 1)

  // Fit to the plan (routes, hubs, overlay), never to the tiles' whole world.
  const { bounds, boundsKey } = React.useMemo(() => {
    const pts: [number, number][] = HUBS.map((h) => [h.at.lat, h.at.lng])
    for (const v of vehicles) {
      if (v.route.length > 1) {
        pts.push([v.route[0].lat, v.route[0].lng])
        for (const o of orders)
          if (o.vehicle === v.id) pts.push([o.at.lat, o.at.lng])
      }
    }
    for (const p of overlayTrack ?? []) pts.push([p.lat, p.lng])
    const b = L.latLngBounds(pts)
    return { bounds: b, boundsKey: b.toBBoxString() }
  }, [vehicles, orders, overlayTrack])

  const showTag = (v: Vehicle, lvl: Level) =>
    !compact || selectedId === v.id || lvl === "crit" || lvl === "risk"

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-water select-none",
        theme === "dark" && DARKEN_TILES && "map-dark",
        className
      )}
      data-chart
    >
      <MapContainer
        ref={setMap}
        center={BOGOTA_CENTER}
        zoom={12}
        zoomControl={false}
        zoomSnap={0.25}
        zoomDelta={0.5}
        dragging={!compact}
        scrollWheelZoom={!compact}
        doubleClickZoom={!compact}
        touchZoom={!compact}
        keyboard={!compact}
        boxZoom={false}
        className="h-full w-full"
        aria-label={`${title}. ${moving.length} vehículos con ruta planificada.`}
      >
        <TileLayer
          key={theme}
          url={TILE_URL[theme]}
          attribution={TILE_ATTRIBUTION}
          maxZoom={19}
        />
        <Controller
          boundsKey={boundsKey}
          bounds={bounds}
          focus={focus}
          compact={compact}
          onHover={onHover}
        />

        {/* Traffic-delay isochrones */}
        {layers.traffic &&
          CONTOURS.map((c, i) => (
            <React.Fragment key={i}>
              <Circle
                center={[c.at.lat, c.at.lng]}
                radius={c.radius}
                interactive={false}
                pathOptions={{
                  className:
                    c.minutes >= 15 ? "chart-contour hot" : "chart-contour",
                }}
              />
              {!compact && (
                <Marker
                  interactive={false}
                  keyboard={false}
                  position={[c.at.lat + c.radius / 111320, c.at.lng]}
                  icon={labelIcon(`+${c.minutes}`)}
                />
              )}
            </React.Fragment>
          ))}

        {/* Planned tracks inside a corridor */}
        {layers.tracks &&
          moving.map((v) => {
            const sel = selectedId === v.id
            const lvl = levelOf.get(v.id) ?? "ok"
            const dim = Boolean(selectedId) && !sel
            const hot = lvl === "crit" || lvl === "risk"
            const route = toTuples(v.route)
            return (
              <React.Fragment key={v.id}>
                <Polyline
                  positions={route}
                  interactive={false}
                  pathOptions={{
                    className: cn("chart-corridor", sel && "sel", dim && "dim"),
                  }}
                />
                <Polyline
                  positions={route}
                  pathOptions={{
                    className: cn(
                      "chart-track",
                      sel && "sel",
                      hot && "hot",
                      dim && "dim"
                    ),
                  }}
                  eventHandlers={
                    onSelect ? { click: () => onSelect(v.id) } : undefined
                  }
                />
                <Polyline
                  positions={toTuples(
                    slice(v.route, 0, Math.max(0.001, v.progress))
                  )}
                  interactive={false}
                  pathOptions={{
                    className: cn("chart-travelled", dim && "dim"),
                  }}
                />
              </React.Fragment>
            )
          })}

        {/* Stops */}
        {layers.stops &&
          orders.map((o) => {
            if (selectedId && o.vehicle !== selectedId) return null
            if (compact && o.status === "entregado") return null
            return (
              <Marker
                key={o.id}
                position={[o.at.lat, o.at.lng]}
                icon={stopIcon(o.status)}
                keyboard={false}
                title={`${o.id} · ${o.customer}`}
              >
                {!compact && (
                  <Tooltip
                    direction="right"
                    offset={[10, 0]}
                    className="chart-tooltip"
                  >
                    <strong className="readout">{o.id}</strong> {o.customer}
                    <br />
                    <span className="readout">{o.timeWindow}</span>
                  </Tooltip>
                )}
              </Marker>
            )
          })}

        {/* Hubs */}
        {HUBS.map((h) => (
          <Marker
            key={h.id}
            position={[h.at.lat, h.at.lng]}
            icon={hubIcon(h.name, layers.labels)}
            keyboard={false}
            title={h.name}
          />
        ))}

        {/* Route-planner overlay */}
        {overlayTrack && overlayTrack.length > 1 && (
          <>
            <Polyline
              positions={toTuples(overlayTrack)}
              interactive={false}
              pathOptions={{ className: "chart-corridor sel" }}
            />
            <Polyline
              positions={toTuples(overlayTrack)}
              interactive={false}
              pathOptions={{ className: "chart-track sel" }}
            />
          </>
        )}
        {overlayStops?.map((s) => (
          <Marker
            key={s.n}
            position={[s.at.lat, s.at.lng]}
            icon={numberIcon(s.n)}
            keyboard={false}
            zIndexOffset={600}
          />
        ))}

        {/* Vehicles, displaced from the track by their cross-track error */}
        {moving.map((v) => {
          const lvl = levelOf.get(v.id) ?? "ok"
          const { p, heading } = pointAt(v.route, v.progress)
          const shown = offsetRight(p, heading, Math.min(v.xte, 800))
          const sel = selectedId === v.id
          const dim = Boolean(selectedId) && !sel
          return (
            <React.Fragment key={v.id}>
              {v.status === "en_ruta" && v.xte >= thresholds.xteWarn && (
                <Polyline
                  positions={[
                    [p.lat, p.lng],
                    [shown.lat, shown.lng],
                  ]}
                  interactive={false}
                  pathOptions={{ className: "chart-xte" }}
                />
              )}
              <Marker
                position={[shown.lat, shown.lng]}
                icon={vehicleIcon({ ...v, heading }, lvl, {
                  selected: sel,
                  showTag: showTag(v, lvl),
                })}
                opacity={dim ? 0.4 : 1}
                zIndexOffset={
                  sel ? 1000 : lvl === "crit" ? 800 : lvl === "risk" ? 400 : 0
                }
                title={`${v.id} · ${v.driver ?? "sin conductor"}`}
                keyboard={Boolean(onSelect)}
                eventHandlers={
                  onSelect ? { click: () => onSelect(v.id) } : undefined
                }
              />
            </React.Fragment>
          )
        })}
      </MapContainer>

      {!compact && (
        <div className="absolute top-3 right-3 z-[500] flex flex-col overflow-hidden rounded-md border bg-card/95 shadow-sm">
          <button
            type="button"
            aria-label="Acercar"
            className="grid size-8 place-items-center text-lg leading-none hover:bg-muted"
            onClick={() => map?.zoomIn()}
          >
            +
          </button>
          <button
            type="button"
            aria-label="Alejar"
            className="grid size-8 place-items-center border-y text-lg leading-none hover:bg-muted"
            onClick={() => map?.zoomOut()}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Ver toda la operación"
            className="grid size-8 place-items-center text-[0.6875rem] font-semibold hover:bg-muted"
            onClick={() => map?.fitBounds(bounds, { padding: [28, 28] })}
          >
            Todo
          </button>
        </div>
      )}
    </div>
  )
}
