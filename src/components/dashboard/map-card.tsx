import { Maximize2 } from "lucide-react"
import { Link } from "react-router"
import { ChartMap } from "@/components/chart/chart-map"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartLegendKey } from "@/components/chart/legend"
import { useIsMobile } from "@/hooks/use-mobile"
import { useFleet } from "@/state/fleet-live"
import { useSettings } from "@/state/settings"
import { cn } from "@/lib/utils"

export function MapCard({ className }: { className?: string }) {
  const isMobile = useIsMobile()
  const { vehicles, orders } = useFleet()
  const { saved } = useSettings()
  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardHeader className="border-b py-3">
        <CardTitle className="flex flex-wrap items-center gap-x-2">
          Carta de operaciones
          <span className="flex items-center gap-1.5 text-[0.6875rem] font-semibold whitespace-nowrap text-ok">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-ok opacity-60 motion-safe:animate-ping-slow" />
              <span className="relative inline-flex size-2 rounded-full bg-ok" />
            </span>
            EN VIVO · simulado
          </span>
        </CardTitle>
        <CardDescription>
          Rutas planificadas, posición real y retrasos de tráfico
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link to="/live-map">
              <Maximize2 />{" "}
              <span className="max-sm:sr-only">Abrir carta completa</span>
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <div className="relative min-h-[360px] flex-1">
        <ChartMap
          compact
          fit={isMobile ? "slice" : "meet"}
          vehicles={vehicles}
          orders={orders}
          thresholds={saved.thresholds}
          className="absolute inset-0"
        />
      </div>
      <ChartLegendKey className="border-t px-4 py-2" />
    </Card>
  )
}
