import { Clock, DollarSign, Fuel, Zap } from "lucide-react"
import { toast } from "sonner"
import { TickScale } from "@/components/tick-scale"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ago } from "@/lib/format"
import { useFleet, useNow } from "@/state/fleet-live"
import { cn } from "@/lib/utils"

const METRICS = [
  {
    label: "Tiempo ahorrado",
    value: "2,5 h",
    change: "−18%",
    progress: 75,
    icon: Clock,
  },
  {
    label: "Combustible",
    value: "45 L",
    change: "−22%",
    progress: 82,
    icon: Fuel,
  },
  {
    label: "Costo operativo",
    value: "$1.250",
    change: "−15%",
    progress: 68,
    icon: DollarSign,
  },
]

export function runOptimization(optimize: () => Promise<void>) {
  toast.promise(optimize(), {
    loading: "Optimizando rutas (CVRPTW + A*)…",
    success: "Rutas optimizadas. Se actualizaron ETA y desvíos.",
    error: "No se pudo optimizar. Intenta de nuevo.",
  })
}

export function OptimizationPanel({ className }: { className?: string }) {
  const { optimize, optimizing, lastOptimizedAt } = useFleet()
  const now = useNow(5000)
  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardHeader className="border-b py-3">
        <CardTitle>Motor de optimización</CardTitle>
        <CardDescription>
          VRP multicriterio: costo, tiempo, combustible y ventanas SLA
        </CardDescription>
        <CardAction>
          <Button
            onClick={() => runOptimization(optimize)}
            disabled={optimizing}
          >
            <Zap />
            {optimizing ? "Optimizando…" : "Optimizar"}
          </Button>
        </CardAction>
      </CardHeader>
      <ul className="flex flex-1 flex-col divide-y">
        {METRICS.map((m) => (
          <li key={m.label} className="px-4 py-3">
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3">
              <span className="flex items-center gap-2 text-sm">
                <m.icon
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                {m.label}
              </span>
              <span className="readout text-lg font-semibold">{m.value}</span>
              <span className="readout w-12 text-right text-xs font-semibold text-muted-foreground">
                {m.change}
              </span>
            </div>
            <TickScale
              className="mt-1"
              label={`${m.label}: ${m.progress}% de la meta diaria`}
              min={0}
              max={100}
              value={m.progress}
              target={100}
              targetLabel="meta"
            />
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        <span>
          Última:{" "}
          <span className="readout text-foreground">
            hace {ago(now - lastOptimizedAt)}
          </span>
        </span>
        <span>
          <span className="readout text-foreground">CVRPTW + A*</span>
        </span>
      </div>
    </Card>
  )
}
