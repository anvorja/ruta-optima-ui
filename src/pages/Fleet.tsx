import { Clock, Fuel, MapPin, MoreVertical, Plus, Truck } from "lucide-react"
import * as React from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { StatusPill } from "@/components/status-mark"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Vehicle, VehicleStatus } from "@/data/types"
import {
  LEVEL_RANK,
  STATUS_LABEL,
  vehicleLevel,
  vehicleReason,
} from "@/lib/status"
import { cn } from "@/lib/utils"
import { useFleet } from "@/state/fleet-live"
import { useSettings } from "@/state/settings"

type Filter = "all" | VehicleStatus

function Meter({
  label,
  value,
  text,
  warn,
}: {
  label: string
  value: number
  text: string
  warn?: boolean
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={cn(
            "readout",
            warn ? "font-semibold text-risk" : "text-foreground"
          )}
        >
          {text}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 bg-muted"
      >
        <div
          className={cn("h-full", warn ? "bg-risk" : "bg-foreground/70")}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  )
}

function VehicleCard({ v }: { v: Vehicle }) {
  const { saved } = useSettings()
  const t = saved.thresholds
  const lvl = vehicleLevel(v, t)
  const reason = vehicleReason(v, t)
  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-2 border-b p-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-md border bg-muted">
            <Truck className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="readout font-semibold">{v.id}</span>
              <StatusPill
                level={lvl}
                label={
                  lvl === "idle" || lvl === "ok"
                    ? STATUS_LABEL[v.status]
                    : undefined
                }
                pulse
              />
            </div>
            <p className="truncate text-sm text-muted-foreground">{v.name}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Acciones de ${v.id}`}
            >
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/live-map?v=${v.id}`}>Ver en carta</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                toast.info(`Edición de ${v.id} disponible al conectar el TMS`)
              }
            >
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                toast.info(
                  "Asignación de conductor disponible al conectar el TMS"
                )
              }
            >
              Asignar conductor
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onSelect={() =>
                toast.warning(`Desactivar ${v.id} requiere confirmación`)
              }
            >
              Desactivar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-col gap-3 p-3">
        {reason && (
          <p className="text-xs font-medium text-risk" role="status">
            {reason}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Conductor</p>
            <p className="truncate font-medium">{v.driver ?? "Sin asignar"}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" /> Zona
            </p>
            <p className="font-medium">{v.zone}</p>
          </div>
        </div>
        <Meter
          label="Carga"
          value={(v.load / v.capacity) * 100}
          text={`${v.load}/${v.capacity} kg`}
        />
        <Meter
          label="Combustible"
          value={v.fuel}
          text={`${v.fuel}%`}
          warn={v.fuel <= t.fuelLow}
        />
        <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3" /> Mant.{" "}
            <span className="readout">{v.lastMaintenance}</span>
          </span>
          <span className="readout">{v.consumption}</span>
        </div>
      </div>
    </Card>
  )
}

export default function Fleet() {
  const { vehicles, counts } = useFleet()
  const { saved } = useSettings()
  const [filter, setFilter] = React.useState<Filter>("all")
  const avgFuel = Math.round(
    vehicles.reduce((a, v) => a + v.fuel, 0) / vehicles.length
  )
  const list = vehicles
    .filter((v) => filter === "all" || v.status === filter)
    .sort(
      (a, b) =>
        LEVEL_RANK[vehicleLevel(a, saved.thresholds)] -
        LEVEL_RANK[vehicleLevel(b, saved.thresholds)]
    )

  const stat = (
    label: string,
    value: string | number,
    icon: React.ReactNode
  ) => (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="grid size-9 place-items-center rounded-md border bg-muted text-muted-foreground">
        {icon}
      </span>
      <div>
        <p className="readout text-xl leading-none font-semibold">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )

  return (
    <>
      <PageHeader
        title="Gestión de flota"
        description={
          <>
            <span className="readout">{vehicles.length}</span> vehículos
            registrados
          </>
        }
        actions={
          <Button
            onClick={() =>
              toast.info("Alta de vehículos disponible al conectar el TMS")
            }
          >
            <Plus /> Agregar vehículo
          </Button>
        }
      />

      <Card className="mb-4 py-0">
        <div className="grid grid-cols-2 divide-x divide-y lg:grid-cols-4 lg:divide-y-0">
          {stat("En ruta", counts.onRoute, <Truck className="size-4" />)}
          {stat(
            "Disponibles",
            vehicles.filter((v) => v.status === "disponible").length,
            <Truck className="size-4" />
          )}
          {stat(
            "En mantenimiento",
            counts.maintenance,
            <Clock className="size-4" />
          )}
          {stat(
            "Combustible promedio",
            `${avgFuel}%`,
            <Fuel className="size-4" />
          )}
        </div>
      </Card>

      <ToggleGroup
        type="single"
        value={filter}
        onValueChange={(v) => setFilter((v || "all") as Filter)}
        variant="outline"
        className="mb-4 flex-wrap justify-start"
        aria-label="Filtrar por estado"
      >
        <ToggleGroupItem value="all">Todos</ToggleGroupItem>
        <ToggleGroupItem value="en_ruta">En ruta</ToggleGroupItem>
        <ToggleGroupItem value="detenido">Detenido</ToggleGroupItem>
        <ToggleGroupItem value="disponible">Disponible</ToggleGroupItem>
        <ToggleGroupItem value="mantenimiento">Mantenimiento</ToggleGroupItem>
      </ToggleGroup>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((v) => (
          <VehicleCard key={v.id} v={v} />
        ))}
      </div>
      {list.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No hay vehículos en este estado.
        </p>
      )}
    </>
  )
}
