import * as React from "react"
import { BRIDGES, CONTOURS, HUBS, LAND, ZONES } from "@/data/scenery"
import type { Level, Order, Point, Vehicle } from "@/data/types"
import { CHART_H, CHART_W, gridRef, pointAt, slice, toPath } from "@/lib/geo"
import { vehicleLevel, type Thresholds } from "@/lib/status"
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

type View = { x: number; y: number; w: number; h: number }
const FULL: View = { x: 0, y: 0, w: CHART_W, h: CHART_H }

/** Small chart-light symbol drawn in SVG user space. */
function Light({
  level,
  x,
  y,
  s = 7,
}: {
  level: Level
  x: number
  y: number
  s?: number
}) {
  const c = LEVEL_VAR[level]
  if (level === "ok") return <circle cx={x} cy={y} r={s * 0.7} fill={c} />
  if (level === "risk")
    return (
      <path
        d={`M${x} ${y - s} L${x + s} ${y + s * 0.8} L${x - s} ${y + s * 0.8}Z`}
        fill={c}
      />
    )
  if (level === "crit") {
    const k = s * 0.42
    const pts = [
      [x - k, y - s],
      [x + k, y - s],
      [x + s, y - k],
      [x + s, y + k],
      [x + k, y + s],
      [x - k, y + s],
      [x - s, y + k],
      [x - s, y - k],
    ]
    return (
      <g>
        <path d={`M${pts.map((p) => p.join(" ")).join(" L")}Z`} fill={c} />
        <rect
          x={x - s * 0.13}
          y={y - s * 0.6}
          width={s * 0.26}
          height={s * 0.7}
          fill="var(--background)"
        />
        <rect
          x={x - s * 0.13}
          y={y + s * 0.3}
          width={s * 0.26}
          height={s * 0.28}
          fill="var(--background)"
        />
      </g>
    )
  }
  return (
    <circle
      cx={x}
      cy={y}
      r={s * 0.65}
      fill="none"
      stroke={c}
      strokeWidth={1.8}
    />
  )
}

type Props = {
  vehicles: Vehicle[]
  thresholds: Thresholds
  orders?: Order[]
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  layers?: Layers
  /** Compact = dashboard preview: fewer labels, no pan/zoom. */
  compact?: boolean
  /** Extra track drawn on top (route planner preview). */
  overlayTrack?: Point[]
  overlayStops?: { at: Point; n: number }[]
  /** How the chart fits its box: whole chart (meet) or fill and crop (slice). */
  fit?: "meet" | "slice"
  /** Fit the view to these points on mount/change. */
  focus?: Point | null
  onHover?: (info: { ref: string; zone: string } | null) => void
  className?: string
  title?: string
}

function nearestZone(p: Point) {
  let best = ZONES[0]
  let d = Infinity
  for (const z of ZONES) {
    const dd = Math.hypot(z.at.x - p.x, z.at.y - p.y)
    if (dd < d) {
      d = dd
      best = z
    }
  }
  return best.name
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
  fit = "meet",
  onHover,
  className,
  title = "Carta de operaciones",
}: Props) {
  const uid = React.useId().replace(/:/g, "")
  const svgRef = React.useRef<SVGSVGElement>(null)
  const [view, setView] = React.useState<View>(FULL)
  const drag = React.useRef<{ x: number; y: number; view: View } | null>(null)

  const zoom = view.w / CHART_W

  const toChart = React.useCallback(
    (clientX: number, clientY: number): Point | null => {
      const el = svgRef.current
      if (!el) return null
      const r = el.getBoundingClientRect()
      const scale = Math.min(r.width / view.w, r.height / view.h)
      const ox = (r.width - view.w * scale) / 2
      const oy = (r.height - view.h * scale) / 2
      return {
        x: view.x + (clientX - r.left - ox) / scale,
        y: view.y + (clientY - r.top - oy) / scale,
      }
    },
    [view]
  )

  const clampView = (v: View): View => {
    const w = Math.min(CHART_W, Math.max(CHART_W / 5, v.w))
    const h = (w / CHART_W) * CHART_H
    return {
      w,
      h,
      x: Math.min(CHART_W - w, Math.max(0, v.x)),
      y: Math.min(CHART_H - h, Math.max(0, v.y)),
    }
  }

  const zoomBy = (factor: number, around?: Point) => {
    setView((v) => {
      const c = around ?? { x: v.x + v.w / 2, y: v.y + v.h / 2 }
      const w = v.w * factor
      const h = v.h * factor
      return clampView({
        w,
        h,
        x: c.x - ((c.x - v.x) / v.w) * w,
        y: c.y - ((c.y - v.y) / v.h) * h,
      })
    })
  }

  // Fly to a requested point when the `focus` prop changes (adjust state during render).
  const [prevFocus, setPrevFocus] = React.useState(focus)
  if (focus !== prevFocus) {
    setPrevFocus(focus)
    if (focus && !compact) {
      const w = Math.min(view.w, CHART_W / 2.2)
      const h = (w / CHART_W) * CHART_H
      setView(clampView({ w, h, x: focus.x - w / 2, y: focus.y - h / 2 }))
    }
  }

  const levelOf = React.useMemo(() => {
    const m = new Map<string, Level>()
    for (const v of vehicles) m.set(v.id, vehicleLevel(v, thresholds))
    return m
  }, [vehicles, thresholds])

  const moving = vehicles.filter((v) => v.route.length > 1)
  const showLabels = layers.labels && !compact
  const showNames = layers.labels
  const u = Math.max(0.55, Math.min(1.6, zoom * 1.35)) // symbol scale vs. zoom

  return (
    <div
      className={cn("relative overflow-hidden bg-water select-none", className)}
      data-chart
    >
      <svg
        ref={svgRef}
        role="img"
        aria-label={`${title}. ${moving.length} vehículos con ruta planificada.`}
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        preserveAspectRatio={`xMidYMid ${fit}`}
        className={cn(
          "block h-full w-full",
          !compact && "cursor-grab touch-none active:cursor-grabbing"
        )}
        onPointerDown={(e) => {
          if (compact) return
          ;(e.target as Element).setPointerCapture?.(e.pointerId)
          drag.current = { x: e.clientX, y: e.clientY, view }
        }}
        onPointerMove={(e) => {
          if (drag.current && !compact) {
            const r = svgRef.current!.getBoundingClientRect()
            const scale = Math.min(
              r.width / drag.current.view.w,
              r.height / drag.current.view.h
            )
            const dx = (e.clientX - drag.current.x) / scale
            const dy = (e.clientY - drag.current.y) / scale
            setView(
              clampView({
                ...drag.current.view,
                x: drag.current.view.x - dx,
                y: drag.current.view.y - dy,
              })
            )
          }
          if (onHover) {
            const p = toChart(e.clientX, e.clientY)
            onHover(p ? { ref: gridRef(p), zone: nearestZone(p) } : null)
          }
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerLeave={() => {
          drag.current = null
          onHover?.(null)
        }}
        onWheel={(e) => {
          if (compact) return
          const p = toChart(e.clientX, e.clientY)
          zoomBy(e.deltaY > 0 ? 1.12 : 0.89, p ?? undefined)
        }}
        onClick={(e) => {
          if (
            (e.target as Element).tagName === "svg" ||
            (e.target as Element).getAttribute("data-bg")
          ) {
            onSelect?.(null)
          }
        }}
      >
        <defs>
          <clipPath id={`land-${uid}`}>
            {LAND.map((poly, i) => (
              <path key={i} d={toPath(poly) + "Z"} />
            ))}
          </clipPath>
          <pattern
            id={`hatch-${uid}`}
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke="var(--contour)"
              strokeWidth="0.6"
              opacity="0.5"
            />
          </pattern>
        </defs>

        {/* Water + graticule */}
        <rect
          data-bg="1"
          x="-3000"
          y="-3000"
          width={CHART_W + 6000}
          height={CHART_H + 6000}
          fill="var(--water)"
        />
        <g stroke="var(--graticule)" strokeWidth={0.5 * zoom} opacity="0.35">
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={`gx${i}`}
              x1={(i + 1) * 100}
              y1="0"
              x2={(i + 1) * 100}
              y2={CHART_H}
              strokeDasharray="2 6"
            />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <line
              key={`gy${i}`}
              x1="0"
              y1={((i + 1) * CHART_H) / 6}
              x2={CHART_W}
              y2={((i + 1) * CHART_H) / 6}
              strokeDasharray="2 6"
            />
          ))}
        </g>

        {/* Land */}
        <g data-bg="1">
          {LAND.map((poly, i) => (
            <path
              key={i}
              d={toPath(poly) + "Z"}
              fill="var(--land)"
              stroke="var(--land-edge)"
              strokeWidth={1.4}
              strokeLinejoin="round"
              data-bg="1"
            />
          ))}
        </g>
        <g
          clipPath={`url(#land-${uid})`}
          stroke="var(--road)"
          fill="none"
          strokeLinecap="square"
          data-bg="1"
        >
          {Array.from({ length: 11 }, (_, i) => (
            <line
              key={`rv${i}`}
              x1={i * 100}
              y1="0"
              x2={i * 100}
              y2={CHART_H}
              strokeWidth={i % 3 === 0 ? 4 : 2}
              data-bg="1"
            />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line
              key={`rh${i}`}
              x1="0"
              y1={i * (CHART_H / 6)}
              x2={CHART_W}
              y2={i * (CHART_H / 6)}
              strokeWidth={i % 3 === 0 ? 4 : 2}
              data-bg="1"
            />
          ))}
          <path d="M582 192 L976 586" strokeWidth="3" data-bg="1" />
          <path d="M24 470 L358 136" strokeWidth="3" data-bg="1" />
        </g>
        {BRIDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="var(--land-edge)"
            strokeWidth="9"
            strokeLinecap="butt"
          />
        ))}
        {BRIDGES.map(([a, b], i) => (
          <line
            key={`br${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="var(--road)"
            strokeWidth="5"
            strokeLinecap="butt"
          />
        ))}

        {/* Traffic isochrones */}
        {layers.traffic && (
          <g fill="none">
            {CONTOURS.map((c, i) => (
              <g key={i}>
                <path
                  d={c.d}
                  fill={c.minutes >= 15 ? `url(#hatch-${uid})` : "none"}
                  stroke="var(--contour)"
                  strokeWidth={c.minutes >= 10 ? 1.4 : 1}
                  strokeDasharray={c.minutes >= 10 ? undefined : "5 3"}
                />
                {!compact && (
                  <text
                    x={c.at.x}
                    y={c.at.y}
                    fontSize={10 * u}
                    textAnchor="middle"
                    fill="var(--contour)"
                    className="readout"
                    stroke="var(--land)"
                    strokeWidth={3 * u}
                    paintOrder="stroke"
                  >
                    {c.label}
                  </text>
                )}
              </g>
            ))}
          </g>
        )}

        {/* Hubs: depots are squares */}
        {HUBS.map((h) => (
          <g key={h.id} transform={`translate(${h.at.x} ${h.at.y})`}>
            <rect
              x={-9 * u}
              y={-9 * u}
              width={18 * u}
              height={18 * u}
              fill="var(--background)"
              stroke="var(--foreground)"
              strokeWidth={2 * u}
            />
            <path
              d={`M${-4 * u} 0H${4 * u}M0 ${-4 * u}V${4 * u}`}
              stroke="var(--foreground)"
              strokeWidth={2 * u}
            />
          </g>
        ))}

        {/* Planned tracks inside a dashed corridor */}
        {layers.tracks &&
          moving.map((v) => {
            const sel = selectedId === v.id
            const lvl = levelOf.get(v.id) ?? "ok"
            const dim = selectedId && !sel
            const hot = lvl === "crit" || lvl === "risk"
            const showAsTrack = !compact || sel || hot
            return (
              <g key={v.id} opacity={dim ? 0.28 : showAsTrack ? 1 : 0.5}>
                <path
                  d={toPath(v.route)}
                  fill="none"
                  stroke="var(--primary)"
                  strokeOpacity={sel ? 0.28 : 0.12}
                  strokeWidth={22 * u}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <path
                  d={toPath(v.route)}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth={(sel ? 3.4 : hot ? 2.6 : 1.8) * u}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect?.(v.id)
                  }}
                  className={onSelect ? "cursor-pointer" : undefined}
                />
                {/* travelled part: solid ink, remaining stays magenta */}
                <path
                  d={toPath(slice(v.route, 0, Math.max(0.001, v.progress)))}
                  fill="none"
                  stroke="var(--foreground)"
                  strokeOpacity="0.55"
                  strokeWidth={1.6 * u}
                  strokeDasharray={`${2 * u} ${4 * u}`}
                  strokeLinecap="round"
                />
              </g>
            )
          })}

        {/* Stops (buoys): hollow = pending, ring = en camino, filled = entregado, level shape if late */}
        {layers.stops &&
          orders.map((o) => {
            const veh = vehicles.find((v) => v.id === o.vehicle)
            if (selectedId && o.vehicle !== selectedId) return null
            if (compact && o.status === "entregado") return null
            const late = o.status === "retrasado"
            return (
              <g
                key={o.id}
                transform={`translate(${o.at.x} ${o.at.y})`}
                opacity={veh && veh.status === "mantenimiento" ? 0.4 : 1}
              >
                {late ? (
                  <Light level="crit" x={0} y={0} s={8 * u} />
                ) : o.status === "entregado" ? (
                  <circle r={4 * u} fill="var(--muted-foreground)" />
                ) : o.status === "en_camino" ? (
                  <g>
                    <circle
                      r={7 * u}
                      fill="var(--background)"
                      stroke="var(--foreground)"
                      strokeWidth={2 * u}
                    />
                    <circle r={2.5 * u} fill="var(--foreground)" />
                  </g>
                ) : (
                  <circle
                    r={5 * u}
                    fill="var(--background)"
                    stroke="var(--foreground)"
                    strokeWidth={1.6 * u}
                  />
                )}
                {showLabels && zoom < 0.7 && (
                  <text
                    x={11 * u}
                    y={4 * u}
                    fontSize={9 * u}
                    className="readout"
                    fill="var(--foreground)"
                    stroke="var(--land)"
                    strokeWidth={3 * u}
                    paintOrder="stroke"
                  >
                    {o.id.replace("ORD-", "")}
                  </text>
                )}
              </g>
            )
          })}

        {/* Overlay plan (route planner) */}
        {overlayTrack && overlayTrack.length > 1 && (
          <g>
            <path
              d={toPath(overlayTrack)}
              fill="none"
              stroke="var(--primary)"
              strokeOpacity="0.2"
              strokeWidth={24 * u}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d={toPath(overlayTrack)}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={3.6 * u}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>
        )}
        {overlayStops?.map((s) => (
          <g key={s.n} transform={`translate(${s.at.x} ${s.at.y})`}>
            <circle
              r={11 * u}
              fill="var(--primary)"
              stroke="var(--background)"
              strokeWidth={2 * u}
            />
            <text
              y={4 * u}
              fontSize={12 * u}
              textAnchor="middle"
              fill="var(--primary-foreground)"
              fontWeight="700"
              className="readout"
            >
              {s.n}
            </text>
          </g>
        ))}

        {/* Vehicles (ownship): chevron + heading vector + cross-track line + light */}
        {moving.map((v) => {
          const lvl = levelOf.get(v.id) ?? "ok"
          const { p, heading } = pointAt(v.route, v.progress)
          const rad = (heading * Math.PI) / 180
          // perpendicular offset: positive xte pushes to the right of travel
          const off = Math.min(v.xte, 600) * 0.06 * u * 4
          const nx = Math.cos(rad)
          const ny = Math.sin(rad)
          const vx = p.x + nx * off
          const vy = p.y + ny * off
          const sel = selectedId === v.id
          const dim = selectedId && !sel
          const stopped = v.status === "detenido"
          const ahead = Math.max(18, v.speed * 1.1) * u
          const hx = vx + Math.sin(rad) * ahead
          const hy = vy - Math.cos(rad) * ahead
          return (
            <g
              key={v.id}
              opacity={dim ? 0.35 : 1}
              onClick={(e) => {
                e.stopPropagation()
                onSelect?.(v.id)
              }}
              className={onSelect ? "cursor-pointer" : undefined}
              role={onSelect ? "button" : undefined}
              aria-label={onSelect ? `Seleccionar ${v.id}` : undefined}
            >
              {off > 4 && (
                <line
                  x1={p.x}
                  y1={p.y}
                  x2={vx}
                  y2={vy}
                  stroke="var(--crit)"
                  strokeWidth={1.6 * u}
                  strokeDasharray={`${3 * u} ${3 * u}`}
                />
              )}
              {!stopped && (
                <line
                  x1={vx}
                  y1={vy}
                  x2={hx}
                  y2={hy}
                  stroke="var(--foreground)"
                  strokeWidth={1.4 * u}
                  strokeDasharray={`${1 * u} ${3 * u}`}
                  strokeLinecap="round"
                />
              )}
              {(lvl === "crit" || sel) && (
                <circle
                  cx={vx}
                  cy={vy}
                  r={(sel ? 20 : 17) * u}
                  fill="none"
                  stroke={LEVEL_VAR[lvl]}
                  strokeWidth={1.4 * u}
                  strokeDasharray={sel ? undefined : `${4 * u} ${3 * u}`}
                />
              )}
              <g
                transform={`translate(${vx} ${vy}) rotate(${stopped ? 0 : heading}) scale(${u})`}
              >
                {stopped ? (
                  <rect
                    x="-7"
                    y="-7"
                    width="14"
                    height="14"
                    fill="var(--background)"
                    stroke="var(--foreground)"
                    strokeWidth="2.4"
                  />
                ) : (
                  <path
                    d="M0 -11 L8 9 L0 5 L-8 9Z"
                    fill="var(--background)"
                    stroke="var(--foreground)"
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                  />
                )}
              </g>
              <g transform={`translate(${vx + 13 * u} ${vy - 13 * u})`}>
                <circle r={7.5 * u} fill="var(--background)" />
                <Light level={lvl} x={0} y={0} s={5.2 * u} />
              </g>
              {(!compact || sel || lvl === "crit" || lvl === "risk") && (
                <g transform={`translate(${vx + 4 * u} ${vy + 24 * u})`}>
                  <rect
                    x={-17 * u}
                    y={-9 * u}
                    width={34 * u}
                    height={14 * u}
                    rx={2 * u}
                    fill="var(--background)"
                    stroke={LEVEL_VAR[lvl]}
                    strokeWidth={1.2 * u}
                  />
                  <text
                    y={2 * u}
                    fontSize={9.5 * u}
                    textAnchor="middle"
                    fill="var(--foreground)"
                    className="readout"
                    fontWeight="600"
                  >
                    {v.id}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* Names on the top layer with a halo, so tracks and vehicles never print over them */}
        {showNames && (
          <g pointerEvents="none">
            {ZONES.map((z) => (
              <text
                key={z.name}
                x={z.at.x}
                y={z.at.y}
                fontSize={15 * u}
                fontStyle="italic"
                letterSpacing="0.14em"
                textAnchor="middle"
                fill="var(--muted-foreground)"
                stroke="var(--land)"
                strokeWidth={4 * u}
                strokeLinejoin="round"
                paintOrder="stroke"
                style={{ textTransform: "uppercase" }}
              >
                {z.name}
              </text>
            ))}
            {HUBS.map((h) => (
              <text
                key={h.id}
                x={h.at.x - 12 * u}
                y={h.at.y + 24 * u}
                textAnchor="end"
                fontSize={11 * u}
                fill="var(--foreground)"
                fontWeight="600"
                stroke="var(--land)"
                strokeWidth={4 * u}
                strokeLinejoin="round"
                paintOrder="stroke"
              >
                {h.name}
              </text>
            ))}
          </g>
        )}

        {/* Frame, grid refs and scale bar */}
        {!compact && (
          <g
            fontSize={9 * Math.max(0.7, zoom)}
            fill="var(--muted-foreground)"
            className="readout"
            pointerEvents="none"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <text
                key={`c${i}`}
                x={i * 100 + 50}
                y={view.y + 12 * Math.max(0.7, zoom)}
                textAnchor="middle"
              >
                {String.fromCharCode(65 + i)}
              </text>
            ))}
            {Array.from({ length: 6 }, (_, i) => (
              <text
                key={`r${i}`}
                x={view.x + 6 * Math.max(0.7, zoom)}
                y={i * (CHART_H / 6) + CHART_H / 12 + 3}
              >
                {i + 1}
              </text>
            ))}
            <g
              transform={`translate(${view.x + view.w - 130 * zoom} ${view.y + view.h - 20 * zoom})`}
            >
              <line
                x1="0"
                y1="0"
                x2={100 * zoom}
                y2="0"
                stroke="var(--foreground)"
                strokeWidth={2 * zoom}
              />
              <text x="0" y={-5 * zoom} fontSize={9 * Math.max(0.7, zoom)}>
                0 — 1,5 km
              </text>
            </g>
          </g>
        )}
        {!compact && (
          <rect
            x="0.5"
            y="0.5"
            width={CHART_W - 1}
            height={CHART_H - 1}
            fill="none"
            stroke="var(--graticule)"
            strokeWidth={1}
            pointerEvents="none"
          />
        )}
      </svg>

      {!compact && (
        <div className="absolute top-3 right-3 flex flex-col overflow-hidden rounded-md border bg-card/95 shadow-sm">
          <button
            type="button"
            aria-label="Acercar"
            className="grid size-8 place-items-center text-lg leading-none hover:bg-muted"
            onClick={() => zoomBy(0.8)}
          >
            +
          </button>
          <button
            type="button"
            aria-label="Alejar"
            className="grid size-8 place-items-center border-y text-lg leading-none hover:bg-muted"
            onClick={() => zoomBy(1.25)}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Ver toda la carta"
            className="grid size-8 place-items-center text-[0.6875rem] font-semibold hover:bg-muted"
            onClick={() => setView(FULL)}
          >
            1:1
          </button>
        </div>
      )}
    </div>
  )
}
