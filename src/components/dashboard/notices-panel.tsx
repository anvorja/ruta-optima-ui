import { ArrowRight, MapPin } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"
import { StatusMark } from "@/components/status-mark"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Notice } from "@/data/types"
import { useFleet } from "@/state/fleet-live"
import { cn } from "@/lib/utils"

const LEVEL_TINT = { crit: "bg-crit/7", risk: "" } as const

export function NoticesPanel({
  className,
  limit,
}: {
  className?: string
  limit?: number
}) {
  const { notices, vehicles, optimize, optimizing } = useFleet()
  const navigate = useNavigate()
  const shown = limit ? notices.slice(0, limit) : notices

  const act = (n: Notice) => {
    const v = vehicles.find((x) => x.id === n.vehicleId)
    switch (n.action) {
      case "Re-planificar":
      case "Reasignar paradas":
        toast.promise(optimize(), {
          loading: `Recalculando ruta de ${n.vehicleId}…`,
          success: "Ruta recalculada. El desvío quedó dentro del corredor.",
        })
        break
      case "Contactar conductor":
        toast.info(`Llamando a ${v?.driver ?? "conductor"}…`, {
          description: `${n.vehicleId} · simulación: no se realiza ninguna llamada real.`,
        })
        break
      case "Avisar al cliente":
        toast.success("Aviso de retraso enviado al cliente", {
          description: `${n.orderId} · simulación de notificación.`,
        })
        break
      case "Programar recarga":
        toast.success(`Recarga programada para ${n.vehicleId}`, {
          description: "Base Central · 14:30",
        })
        break
      default:
        navigate(n.vehicleId ? `/live-map?v=${n.vehicleId}` : "/live-map")
    }
  }

  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardHeader className="border-b py-3">
        <CardTitle>Avisos a la operación</CardTitle>
        <CardDescription>
          Ordenados por impacto · {notices.length} activos
        </CardDescription>
        <CardAction>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <StatusMark level="crit" />
            <span className="readout">
              {notices.filter((n) => n.level === "crit").length}
            </span>
            <StatusMark level="risk" className="ml-1" />
            <span className="readout">
              {notices.filter((n) => n.level === "risk").length}
            </span>
          </span>
        </CardAction>
      </CardHeader>
      <ScrollArea className="min-h-0 flex-1">
        <ol className="divide-y">
          {shown.map((n) => (
            <li
              key={n.id}
              className={cn("flex gap-3 px-4 py-3", LEVEL_TINT[n.level])}
            >
              <StatusMark level={n.level} className="mt-0.5" pulse />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug font-medium">
                  <span className="sr-only">
                    {n.level === "crit" ? "Crítico: " : "Riesgo: "}
                  </span>
                  {n.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {n.detail}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    size="xs"
                    variant={n.level === "crit" ? "default" : "outline"}
                    onClick={() => act(n)}
                    disabled={optimizing && n.action.startsWith("Re")}
                  >
                    {n.action}
                  </Button>
                  {(n.vehicleId || n.at) && (
                    <Button size="xs" variant="ghost" asChild>
                      <Link
                        to={
                          n.vehicleId
                            ? `/live-map?v=${n.vehicleId}`
                            : "/live-map"
                        }
                      >
                        <MapPin /> Ver en carta
                      </Link>
                    </Button>
                  )}
                  <span className="readout ml-auto shrink-0 text-[0.6875rem] whitespace-nowrap text-muted-foreground">
                    hace {n.ageMin} min
                  </span>
                </div>
              </div>
            </li>
          ))}
          {shown.length === 0 && (
            <li className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <StatusMark level="ok" className="size-6" />
              <p className="text-sm font-medium">Operación en plan</p>
              <p className="text-xs text-muted-foreground">
                Ningún vehículo supera los umbrales de retraso, desvío o
                detención. Ajusta los umbrales en Configuración.
              </p>
            </li>
          )}
        </ol>
      </ScrollArea>
      {!limit && notices.length > 4 && (
        <p className="border-t bg-muted/40 px-4 py-1.5 text-center text-[0.6875rem] text-muted-foreground">
          {notices.length} avisos activos · desplaza para ver todos
        </p>
      )}
      {limit && notices.length > limit && (
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link to="/">
              Ver {notices.length - limit} más <ArrowRight />
            </Link>
          </Button>
        </div>
      )}
    </Card>
  )
}
