import { Layers as LayersIcon, Phone, Search, Zap } from "lucide-react"
import * as React from "react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"
import {
  ChartMap,
  DEFAULT_LAYERS,
  type Layers,
} from "@/components/chart/chart-map"
import { ChartLegendKey } from "@/components/chart/legend"
import { runOptimization } from "@/components/dashboard/optimization-panel"
import { StatusMark, StatusPill } from "@/components/status-mark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Level, Point, Vehicle } from "@/data/types"
import { ORDER_STATUS } from "@/lib/orders"
import {
  LEVEL_RANK,
  STATUS_LABEL,
  vehicleLevel,
  vehicleReason,
} from "@/lib/status"
import { pointAt } from "@/lib/geo"
import { minutes } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useFleet } from "@/state/fleet-live"
import { useSettings } from "@/state/settings"

const LAYER_LABEL: Record<keyof Layers, string> = {
  tracks: "Rutas planificadas",
  stops: "Paradas",
  traffic: "Retrasos por tráfico",
  labels: "Etiquetas de zona",
}

function Row({
  k,
  v,
  warn,
}: {
  k: string
  v: React.ReactNode
  warn?: boolean
}) {
  return (
    <>
      <dt className="text-muted-foreground">{k}</dt>
      <dd
        className={cn("readout text-right", warn && "font-semibold text-risk")}
      >
        {v}
      </dd>
    </>
  )
}

function Inspector({ v }: { v: Vehicle }) {
  const { orders, optimize, optimizing } = useFleet()
  const { saved } = useSettings()
  const t = saved.thresholds
  const lvl = vehicleLevel(v, t)
  const reason = vehicleReason(v, t)
  const mine = orders.filter((o) => o.vehicle === v.id)
  const moving = v.route.length > 1
  const heading = moving
    ? Math.round(pointAt(v.route, v.progress).heading)
    : null
  return (
    <section
      aria-label={`Detalle de ${v.id}`}
      className="flex flex-col gap-3 border-t p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="readout text-lg leading-none font-semibold">{v.id}</p>
          <p className="mt-1 text-sm text-muted-foreground">{v.name}</p>
        </div>
        <StatusPill
          level={lvl}
          label={
            lvl === "ok" || lvl === "idle" ? STATUS_LABEL[v.status] : undefined
          }
          pulse
        />
      </div>
      {reason && (
        <p
          className="rounded-md border border-risk/40 bg-risk/10 px-2.5 py-1.5 text-xs font-medium"
          role="status"
        >
          {reason}
        </p>
      )}
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <Row k="Conductor" v={v.driver ?? "Sin asignar"} />
        <Row k="Zona" v={v.zone} />
        <Row k="Velocidad" v={`${v.speed} km/h`} />
        <Row
          k="Rumbo"
          v={heading === null ? "—" : `${String(heading).padStart(3, "0")}°`}
        />
        <Row k="Avance" v={`${Math.round(v.progress * 100)}%`} />
        <Row
          k="ETA próxima parada"
          v={v.etaMin === null ? "—" : `${v.etaMin} min`}
        />
        <Row
          k="Δ plan"
          v={
            v.status === "en_ruta" || v.status === "detenido"
              ? minutes(v.delay)
              : "—"
          }
          warn={v.delay >= t.delayWarn}
        />
        <Row k="Desvío (XTE)" v={`${v.xte} m`} warn={v.xte >= t.xteWarn} />
        <Row k="Carga" v={`${v.load}/${v.capacity} kg`} />
        <Row k="Combustible" v={`${v.fuel}%`} warn={v.fuel <= t.fuelLow} />
      </dl>
      {mine.length > 0 && (
        <div>
          <p className="chart-label mb-1.5">Paradas</p>
          <ul className="flex flex-col gap-1">
            {mine.map((o) => (
              <li key={o.id} className="flex items-center gap-2 text-xs">
                <StatusMark level={ORDER_STATUS[o.status].level} />
                <span className="readout font-semibold">
                  {o.id.replace("ORD-", "")}
                </span>
                <span className="truncate">{o.customer}</span>
                <span className="readout ml-auto shrink-0 text-muted-foreground">
                  {o.timeWindow.split(" - ")[0]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={!v.driver}
          onClick={() =>
            toast.info(`Llamando a ${v.driver}…`, {
              description: "Simulación: no se realiza ninguna llamada real.",
            })
          }
        >
          <Phone /> Contactar
        </Button>
        <Button
          size="sm"
          disabled={!moving || optimizing}
          onClick={() => runOptimization(optimize)}
        >
          <Zap /> Re-planificar
        </Button>
      </div>
    </section>
  )
}

export default function LiveMap() {
  const { vehicles, orders } = useFleet()
  const { saved } = useSettings()
  const t = saved.thresholds
  const [params, setParams] = useSearchParams()
  const [layers, setLayers] = React.useState<Layers>(DEFAULT_LAYERS)
  const [filter, setFilter] = React.useState<Level | "all">("all")
  const [query, setQuery] = React.useState("")
  const [hover, setHover] = React.useState<Point | null>(null)

  const selectedId = params.get("v")
  const selected = vehicles.find((v) => v.id === selectedId) ?? null
  const [focus, setFocus] = React.useState<Point | null>(null)

  const select = React.useCallback(
    (id: string | null, fly = false) => {
      const next = new URLSearchParams(params)
      if (id) next.set("v", id)
      else next.delete("v")
      setParams(next, { replace: true })
      const v = vehicles.find((x) => x.id === id)
      if (fly && v && v.route.length > 1)
        setFocus({ ...pointAt(v.route, v.progress).p })
    },
    [params, setParams, vehicles]
  )

  // Deep link (?v=V-002 from an alert): fly to the vehicle once.
  const flown = React.useRef<string | null>(null)
  React.useEffect(() => {
    if (
      selected &&
      flown.current !== selected.id &&
      selected.route.length > 1
    ) {
      flown.current = selected.id
      setFocus({ ...pointAt(selected.route, selected.progress).p })
    }
  }, [selected])

  const list = vehicles
    .map((v) => ({ v, lvl: vehicleLevel(v, t) }))
    .filter(
      ({ v, lvl }) =>
        (filter === "all" || lvl === filter) &&
        (!query ||
          `${v.id} ${v.driver ?? ""} ${v.zone}`
            .toLowerCase()
            .includes(query.toLowerCase()))
    )
    .sort((a, b) => LEVEL_RANK[a.lvl] - LEVEL_RANK[b.lvl])

  return (
    <div className="-m-3 flex min-h-[calc(100svh-3.5rem)] flex-col md:-m-5 lg:h-[calc(100svh-3.5rem)] lg:flex-row">
      <div className="relative min-h-[420px] flex-1">
        <ChartMap
          vehicles={vehicles}
          orders={orders}
          thresholds={t}
          layers={layers}
          selectedId={selectedId}
          onSelect={(id) => select(id)}
          focus={focus}
          onHover={setHover}
          className="absolute inset-0"
        />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="border bg-card/95 shadow-sm"
              >
                <LayersIcon /> Capas
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64">
              <p className="chart-label mb-3">Capas de la carta</p>
              <ul className="flex flex-col gap-3">
                {(Object.keys(LAYER_LABEL) as (keyof Layers)[]).map((k) => (
                  <li key={k} className="flex items-center justify-between">
                    <Label
                      htmlFor={`layer-${k}`}
                      className="text-sm font-normal"
                    >
                      {LAYER_LABEL[k]}
                    </Label>
                    <Switch
                      id={`layer-${k}`}
                      checked={layers[k]}
                      onCheckedChange={(c) =>
                        setLayers((l) => ({ ...l, [k]: c }))
                      }
                    />
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
          <span className="flex items-center gap-1.5 rounded-md border bg-card/95 px-2 py-1 text-[0.6875rem] font-semibold text-ok shadow-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-ok opacity-60 motion-safe:animate-ping-slow" />
              <span className="relative inline-flex size-2 rounded-full bg-ok" />
            </span>
            EN VIVO · simulado
          </span>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 flex flex-col items-start gap-2">
          <div className="readout rounded-md border bg-card/95 px-2.5 py-1.5 text-xs shadow-sm">
            {hover ? (
              <span className="font-semibold">
                {hover.lat.toFixed(4)}, {hover.lng.toFixed(4)}
              </span>
            ) : (
              <span className="text-muted-foreground">
                Coordenadas · mueve el cursor
              </span>
            )}
          </div>
          <ChartLegendKey className="rounded-md border bg-card/95 px-2.5 py-1.5 shadow-sm" />
        </div>
      </div>

      <aside
        aria-label="Vehículos"
        className="flex w-full shrink-0 flex-col border-t bg-card max-lg:h-[62svh] lg:w-[360px] lg:border-t-0 lg:border-l"
      >
        <div className="flex flex-col gap-3 border-b p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar vehículo, conductor, zona…"
              aria-label="Buscar vehículo"
              className="pl-8"
            />
          </div>
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(v) => setFilter((v || "all") as Level | "all")}
            variant="outline"
            size="sm"
            className="flex-wrap justify-start"
            aria-label="Filtrar por estado"
          >
            <ToggleGroupItem value="all">Todos</ToggleGroupItem>
            <ToggleGroupItem value="crit" aria-label="Críticos">
              <StatusMark level="crit" /> Crít.
            </ToggleGroupItem>
            <ToggleGroupItem value="risk" aria-label="En riesgo">
              <StatusMark level="risk" /> Riesgo
            </ToggleGroupItem>
            <ToggleGroupItem value="ok" aria-label="En plan">
              <StatusMark level="ok" /> Plan
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <ul className="divide-y">
            {list.map(({ v, lvl }) => (
              <li key={v.id}>
                <button
                  type="button"
                  aria-pressed={selectedId === v.id}
                  onClick={() =>
                    select(selectedId === v.id ? null : v.id, true)
                  }
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted",
                    selectedId === v.id && "bg-accent"
                  )}
                >
                  <StatusMark level={lvl} pulse />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="readout text-[0.8125rem] font-semibold">
                        {v.id}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {v.driver ?? "Sin conductor"}
                      </span>
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {vehicleReason(v, t) ??
                        `${STATUS_LABEL[v.status]} · ${v.zone}`}
                    </span>
                  </span>
                  <span className="readout shrink-0 text-xs text-muted-foreground">
                    {v.etaMin === null ? "—" : `${v.etaMin} min`}
                  </span>
                </button>
              </li>
            ))}
            {list.length === 0 && (
              <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                Ningún vehículo coincide.
              </li>
            )}
          </ul>
        </ScrollArea>

        {selected && <Inspector v={selected} />}
      </aside>
    </div>
  )
}
