import { Link } from "react-router"
import { ChevronRight } from "lucide-react"
import { StatusPill } from "@/components/status-mark"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LEVEL_RANK, STATUS_LABEL, vehicleLevel } from "@/lib/status"
import { useFleet } from "@/state/fleet-live"
import { useSettings } from "@/state/settings"
import { cn } from "@/lib/utils"
import { minutes } from "@/lib/format"

/** Departure-board style table of the fleet, worst first. */
export function FleetBoard({
  rows = 8,
  className,
}: {
  rows?: number
  className?: string
}) {
  const { vehicles } = useFleet()
  const { saved } = useSettings()
  const t = saved.thresholds
  const sorted = [...vehicles]
    .filter((v) => v.status !== "mantenimiento")
    .sort(
      (a, b) => LEVEL_RANK[vehicleLevel(a, t)] - LEVEL_RANK[vehicleLevel(b, t)]
    )
    .slice(0, rows)

  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardHeader className="border-b py-3">
        <CardTitle>Tablero de flota</CardTitle>
        <CardDescription>
          Peor estado primero · seguimiento en tiempo real
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/fleet">
              Toda la flota <ChevronRight />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[132px]">Estado</TableHead>
            <TableHead>Vehículo</TableHead>
            <TableHead className="hidden md:table-cell">Zona</TableHead>
            <TableHead className="hidden w-32 md:table-cell">Avance</TableHead>
            <TableHead className="text-right">ETA</TableHead>
            <TableHead className="hidden text-right lg:table-cell">
              Δ plan
            </TableHead>
            <TableHead className="hidden text-right xl:table-cell">
              Comb.
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((v) => {
            const lvl = vehicleLevel(v, t)
            return (
              <TableRow key={v.id}>
                <TableCell>
                  <StatusPill
                    level={lvl}
                    label={lvl === "idle" ? STATUS_LABEL[v.status] : undefined}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    to={`/live-map?v=${v.id}`}
                    className="flex flex-col leading-tight hover:underline"
                  >
                    <span className="readout text-[0.8125rem] font-semibold">
                      {v.id}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {v.driver ?? "Sin conductor"}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {v.zone}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <div
                      role="progressbar"
                      aria-valuenow={Math.round(v.progress * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Avance de ${v.id}`}
                      className="h-1.5 w-16 bg-muted"
                    >
                      <div
                        className="h-full bg-foreground/70"
                        style={{ width: `${v.progress * 100}%` }}
                      />
                    </div>
                    <span className="readout w-8 text-right text-xs text-muted-foreground">
                      {Math.round(v.progress * 100)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="readout text-right text-[0.8125rem]">
                  {v.etaMin === null ? "—" : `${v.etaMin} min`}
                </TableCell>
                <TableCell
                  className={cn(
                    "readout hidden text-right text-[0.8125rem] lg:table-cell",
                    v.delay >= saved.thresholds.delayWarn
                      ? "font-semibold text-risk"
                      : "text-muted-foreground"
                  )}
                >
                  {v.status === "en_ruta" || v.status === "detenido"
                    ? minutes(v.delay)
                    : "—"}
                </TableCell>
                <TableCell
                  className={cn(
                    "readout hidden text-right text-[0.8125rem] xl:table-cell",
                    v.fuel <= saved.thresholds.fuelLow
                      ? "font-semibold text-risk"
                      : "text-muted-foreground"
                  )}
                >
                  {v.fuel}%
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
