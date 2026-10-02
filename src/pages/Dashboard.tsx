import { Zap } from "lucide-react"
import { DeliveriesChart } from "@/components/dashboard/deliveries-chart"
import { FleetBoard } from "@/components/dashboard/fleet-board"
import { InstrumentStrip } from "@/components/dashboard/instrument-strip"
import { MapCard } from "@/components/dashboard/map-card"
import { NoticesPanel } from "@/components/dashboard/notices-panel"
import {
  OptimizationPanel,
  runOptimization,
} from "@/components/dashboard/optimization-panel"
import { UpcomingDeliveries } from "@/components/dashboard/upcoming-deliveries"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { useFleet, useNow } from "@/state/fleet-live"
import { ago } from "@/lib/format"

export default function Dashboard() {
  const { optimize, optimizing, updatedAt } = useFleet()
  const now = useNow()
  const raw = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now)
  const date = raw.charAt(0).toUpperCase() + raw.slice(1)
  return (
    <>
      <PageHeader
        title="Centro de control"
        description={
          <>
            {date} · telemetría simulada, actualizada hace{" "}
            <span className="readout">{ago(now - updatedAt)}</span>
          </>
        }
        actions={
          <Button
            onClick={() => runOptimization(optimize)}
            disabled={optimizing}
          >
            <Zap />
            {optimizing ? "Optimizando…" : "Optimizar rutas"}
          </Button>
        }
      />
      <div className="flex flex-col gap-4">
        <InstrumentStrip />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px] xl:[&>*]:h-[560px]">
          <MapCard />
          <NoticesPanel className="max-xl:max-h-[480px]" />
        </div>
        <div className="grid gap-4 xl:grid-cols-5">
          <FleetBoard className="xl:col-span-3" />
          <UpcomingDeliveries className="xl:col-span-2" />
        </div>
        <div className="grid gap-4 xl:grid-cols-5">
          <OptimizationPanel className="xl:col-span-2" />
          <DeliveriesChart className="xl:col-span-3" />
        </div>
      </div>
    </>
  )
}
