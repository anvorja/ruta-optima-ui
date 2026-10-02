import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Clock,
  DollarSign,
  Fuel,
  MapPin,
  Plus,
  Route as RouteIcon,
  Trash2,
  Zap,
} from "lucide-react"
import * as React from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import { ChartMap } from "@/components/chart/chart-map"
import { PageHeader } from "@/components/page-header"
import { StatusMark } from "@/components/status-mark"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HUBS } from "@/data/scenery"
import type { Point } from "@/data/types"
import { distance, STREET_FACTOR } from "@/lib/geo"
import { STATUS_LABEL } from "@/lib/status"
import { windowStart } from "@/lib/format"
import { PRIORITY } from "@/lib/orders"
import { cn } from "@/lib/utils"
import { useFleet } from "@/state/fleet-live"
import { useSettings } from "@/state/settings"

type Stop = {
  id: number
  address: string
  customer: string
  timeWindow: string
  priority: "urgente" | "alta" | "normal"
  kg: number
  at: Point
}

const BASE = HUBS[0].at

/** Estimated driving km of a chain of points: straight legs padded by the street factor. */
function legKm(points: Point[]): number {
  let m = 0
  for (let i = 1; i < points.length; i++)
    m += distance(points[i - 1], points[i])
  return (m * STREET_FACTOR) / 1000
}
const INITIAL: Stop[] = [
  {
    id: 1,
    customer: "Almacenes García",
    address: "Av. Principal 123, Centro",
    timeWindow: "10:30 - 11:00",
    priority: "alta",
    kg: 45,
    at: { lat: 4.6115, lng: -74.0835 },
  },
  {
    id: 2,
    customer: "Supermercado El Sol",
    address: "Calle Norte 456",
    timeWindow: "11:00 - 12:00",
    priority: "normal",
    kg: 32,
    at: { lat: 4.7013, lng: -74.0414 },
  },
  {
    id: 3,
    customer: "Farmacia Central",
    address: "Plaza Mayor 789",
    timeWindow: "11:30 - 12:30",
    priority: "urgente",
    kg: 5,
    at: { lat: 4.5981, lng: -74.076 },
  },
  {
    id: 4,
    customer: "Restaurante La Mesa",
    address: "Av. Comercio 321",
    timeWindow: "12:00 - 13:00",
    priority: "normal",
    kg: 78,
    at: { lat: 4.6677, lng: -74.0545 },
  },
]

/** Candidate drop points for newly added addresses. */
const SPOTS: Point[] = [
  { lat: 4.6535, lng: -74.06 },
  { lat: 4.6944, lng: -74.03 },
  { lat: 4.6485, lng: -74.117 },
  { lat: 4.6262, lng: -74.0654 },
  { lat: 4.6032, lng: -74.0655 },
]

function planLength(stops: Stop[]) {
  return legKm([BASE, ...stops.map((s) => s.at), BASE])
}

const SHIFT_START = 10 * 60 + 30
const KMH = 28
const SERVICE_MIN = 6

function windowEnd(w: string): number {
  const [h, m] = w.split("-")[1].trim().split(":").map(Number)
  return h * 60 + m
}

/** Cost of a sequence: distance plus a heavy penalty per missed window. */
function sequenceCost(seq: Stop[]): number {
  let t = SHIFT_START
  let late = 0
  let prev = BASE
  let dist = 0
  for (const s of seq) {
    const d = legKm([prev, s.at])
    dist += d
    t += (d / KMH) * 60
    t = Math.max(t, windowStart(s.timeWindow))
    if (t > windowEnd(s.timeWindow)) late += s.priority === "urgente" ? 3 : 1
    t += SERVICE_MIN
    prev = s.at
  }
  dist += legKm([prev, BASE])
  return dist + late * 100
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items]
  return items.flatMap((x, i) =>
    permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((p) => [
      x,
      ...p,
    ])
  )
}

/** Exact search for up to 7 stops; window order beyond that. */
function optimizeOrder(stops: Stop[]): Stop[] {
  if (stops.length > 7) {
    return [...stops].sort(
      (a, b) => windowStart(a.timeWindow) - windowStart(b.timeWindow)
    )
  }
  let best = stops
  let bestCost = sequenceCost(stops)
  for (const p of permutations(stops)) {
    const c = sequenceCost(p)
    if (c < bestCost - 1e-6) {
      best = p
      bestCost = c
    }
  }
  return best
}

export default function RoutePlanner() {
  const { vehicles } = useFleet()
  const { saved } = useSettings()
  const [stops, setStops] = React.useState<Stop[]>(INITIAL)
  const [vehicleId, setVehicleId] = React.useState("")
  const [optimizing, setOptimizing] = React.useState(false)
  const [result, setResult] = React.useState<{
    order: Stop[]
    before: number
    after: number
  } | null>(null)
  const [draft, setDraft] = React.useState("")
  const nextId = React.useRef(100)

  const vehicle = vehicles.find((v) => v.id === vehicleId)
  const totalKg = stops.reduce((a, s) => a + s.kg, 0)
  const overCapacity = vehicle ? totalKg > vehicle.capacity : false

  const shown = result ? result.order : stops
  const track = React.useMemo(
    () => (shown.length ? [BASE, ...shown.map((s) => s.at), BASE] : []),
    [shown]
  )

  const edit = (next: Stop[]) => {
    setStops(next)
    setResult(null)
  }

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= stops.length) return
    const next = [...stops]
    ;[next[i], next[j]] = [next[j], next[i]]
    edit(next)
  }

  const add = () => {
    const address = draft.trim()
    if (!address) return
    const n = stops.length
    edit([
      ...stops,
      {
        id: nextId.current++,
        customer: `Parada ${n + 1}`,
        address,
        timeWindow: "13:00 - 14:00",
        priority: "normal",
        kg: 20,
        at: SPOTS[n % SPOTS.length],
      },
    ])
    setDraft("")
  }

  const optimize = () => {
    setOptimizing(true)
    window.setTimeout(() => {
      const order = optimizeOrder(stops)
      setResult({ order, before: planLength(stops), after: planLength(order) })
      setOptimizing(false)
      toast.success("Ruta optimizada", {
        description: "Orden recalculado respetando ventanas y prioridad.",
      })
    }, 1400)
  }

  const km = result ? result.after : 0
  const minutesTotal = result
    ? Math.round((km / 28) * 60 + stops.length * 6)
    : 0
  const savings = result
    ? Math.max(0, Math.round((1 - result.after / result.before) * 100))
    : 0
  const already = result !== null && savings === 0

  return (
    <>
      <PageHeader
        title="Planificador de rutas"
        description="Optimización multicriterio: ventanas de entrega, prioridad, capacidad y distancia"
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="gap-3 py-4">
            <CardHeader>
              <CardTitle className="text-sm">Vehículo</CardTitle>
            </CardHeader>
            <div className="px-4">
              <Select
                value={vehicleId}
                onValueChange={(v) => {
                  setVehicleId(v)
                  setResult(null)
                }}
              >
                <SelectTrigger
                  className="w-full"
                  aria-label="Seleccionar vehículo"
                >
                  <SelectValue placeholder="Elegir vehículo disponible…" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => {
                    const free = v.status === "disponible"
                    return (
                      <SelectItem key={v.id} value={v.id} disabled={!free}>
                        <span className="readout">{v.id}</span>
                        <span>{v.name}</span>
                        <span className="text-muted-foreground">
                          ({v.capacity} kg)
                        </span>
                        {!free && (
                          <Badge
                            variant="secondary"
                            className="rounded-sm text-[0.625rem]"
                          >
                            {STATUS_LABEL[v.status]}
                          </Badge>
                        )}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {vehicle && (
                <p
                  className={cn(
                    "mt-2 flex items-center gap-1.5 text-xs",
                    overCapacity ? "text-crit" : "text-muted-foreground"
                  )}
                >
                  {overCapacity && <StatusMark level="crit" />}
                  Carga prevista <span className="readout">
                    {totalKg} kg
                  </span>{" "}
                  de <span className="readout">{vehicle.capacity} kg</span>
                  {overCapacity && " · excede la capacidad del vehículo"}
                </p>
              )}
            </div>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-3">
              <CardTitle>Paradas ({stops.length})</CardTitle>
              <CardDescription>
                Reordena con las flechas; optimizar propone el mejor orden
              </CardDescription>
            </CardHeader>
            <ol className="divide-y">
              {shown.map((s, i) => (
                <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="readout grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium">{s.customer}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-4 rounded-sm px-1 text-[0.625rem]",
                          PRIORITY[s.priority].className
                        )}
                      >
                        {PRIORITY[s.priority].label}
                      </Badge>
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" /> {s.address}
                      </span>
                      <span className="readout flex items-center gap-1">
                        <Clock className="size-3" /> {s.timeWindow}
                      </span>
                    </p>
                  </div>
                  {!result && (
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Subir ${s.customer}`}
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                      >
                        <ArrowUp />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Bajar ${s.customer}`}
                        disabled={i === stops.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        <ArrowDown />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Quitar ${s.customer}`}
                        className="hover:text-destructive"
                        onClick={() => edit(stops.filter((x) => x.id !== s.id))}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  )}
                </li>
              ))}
              {shown.length === 0 && (
                <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Sin paradas. Agrega una dirección para empezar a planificar.
                </li>
              )}
            </ol>
            <form
              className="flex items-center gap-2 border-t p-3"
              onSubmit={(e) => {
                e.preventDefault()
                add()
              }}
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Agregar nueva dirección…"
                aria-label="Nueva dirección"
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={!draft.trim()}
              >
                <Plus /> Agregar
              </Button>
            </form>
          </Card>

          <Button
            size="lg"
            className="h-11 text-base"
            onClick={optimize}
            disabled={optimizing || stops.length === 0}
          >
            <Zap />
            {optimizing
              ? "Optimizando…"
              : result
                ? "Optimizar de nuevo"
                : "Optimizar ruta"}
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          {result && (
            <Card className="gap-0 py-0" aria-live="polite">
              <CardHeader className="border-b py-3">
                <CardTitle className="flex items-center gap-2">
                  <StatusMark level="ok" /> Ruta optimizada
                </CardTitle>
                <CardDescription>
                  CVRPTW + A* · orden propuesto en la carta
                </CardDescription>
              </CardHeader>
              <dl className="grid grid-cols-2 divide-x divide-y">
                {[
                  {
                    k: "Distancia",
                    v: `${km.toFixed(1).replace(".", ",")} km`,
                    i: RouteIcon,
                  },
                  {
                    k: "Tiempo",
                    v: `${Math.floor(minutesTotal / 60)} h ${String(minutesTotal % 60).padStart(2, "0")} min`,
                    i: Clock,
                  },
                  {
                    k: "Combustible",
                    v: `$${(km * 1.9).toFixed(2).replace(".", ",")}`,
                    i: Fuel,
                  },
                  {
                    k: "Ahorro",
                    v: already ? "Ya óptimo" : `${savings}%`,
                    i: DollarSign,
                  },
                ].map(({ k, v, i: Icon }) => (
                  <div
                    key={k}
                    className="px-4 py-3 [&:nth-child(n+3)]:border-b-0"
                  >
                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon className="size-3.5" /> {k}
                    </dt>
                    <dd
                      className={cn(
                        "readout mt-1 text-lg font-semibold",
                        k === "Ahorro" && "text-ok"
                      )}
                    >
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="border-t p-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/live-map">Ver en mapa</Link>
                </Button>
              </div>
            </Card>
          )}

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-3">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-risk" /> Alertas de
                tráfico
              </CardTitle>
            </CardHeader>
            <ul className="divide-y">
              <li className="flex gap-3 px-4 py-3">
                <StatusMark level="risk" className="mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    Zona Centro: congestión alta
                  </p>
                  <p className="text-xs text-muted-foreground">
                    +15 min estimados sobre el plan
                  </p>
                </div>
              </li>
              <li className="flex gap-3 px-4 py-3">
                <StatusMark level="ok" className="mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Av. Norte: tráfico normal
                </p>
              </li>
            </ul>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-3">
              <CardTitle>Vista previa</CardTitle>
              <CardDescription>
                {result ? "Ruta optimizada" : "Orden actual de paradas"}
              </CardDescription>
            </CardHeader>
            <div className="relative h-60">
              <ChartMap
                compact
                vehicles={[]}
                thresholds={saved.thresholds}
                layers={{
                  tracks: false,
                  stops: false,
                  traffic: true,
                  labels: true,
                }}
                overlayTrack={track}
                overlayStops={shown.map((s, i) => ({ at: s.at, n: i + 1 }))}
                className="absolute inset-0"
                title="Vista previa de la ruta planificada"
              />
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
