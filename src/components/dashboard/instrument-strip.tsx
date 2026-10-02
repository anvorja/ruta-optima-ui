import { TickScale } from "@/components/tick-scale"
import { useFleet } from "@/state/fleet-live"

type Reading = {
  label: string
  value: string
  unit?: string
  delta: string
  scale: {
    min: number
    max: number
    value: number
    target: number
    targetLabel: string
  }
}

/** Conning-bar readouts: each value sits on a plotted scale against its plan or SLA. */
export function InstrumentStrip() {
  const { counts, total } = useFleet()
  const readings: Reading[] = [
    {
      label: "Entregas hoy",
      value: "156",
      delta: "+12% vs ayer",
      scale: {
        min: 0,
        max: 200,
        value: 156,
        target: 180,
        targetLabel: "plan 180",
      },
    },
    {
      label: "A tiempo (OTD)",
      value: "94,2",
      unit: "%",
      delta: "+1,3 pts vs ayer",
      scale: {
        min: 85,
        max: 100,
        value: 94.2,
        target: 95,
        targetLabel: "SLA 95",
      },
    },
    {
      label: "Flota activa",
      value: `${counts.active}`,
      unit: `/${total}`,
      delta: `${counts.maintenance} en mantenimiento`,
      scale: {
        min: 0,
        max: total,
        value: counts.active,
        target: total - counts.maintenance,
        targetLabel: "",
      },
    },
    {
      label: "Km optimizados",
      value: "1.234",
      unit: "km",
      delta: "−18% distancia",
      scale: {
        min: 0,
        max: 1600,
        value: 1234,
        target: 1500,
        targetLabel: "meta 1.500",
      },
    },
    {
      label: "Ahorro del día",
      value: "$2.450",
      delta: "+22% eficiencia",
      scale: {
        min: 0,
        max: 3000,
        value: 2450,
        target: 2800,
        targetLabel: "meta 2.800",
      },
    },
    {
      label: "Error de ETA",
      value: "±4",
      unit: "min",
      delta: "1 min menos que ayer",
      scale: { min: 0, max: 10, value: 4, target: 5, targetLabel: "SLA ±5" },
    },
  ]
  return (
    <section
      aria-label="Indicadores del turno"
      className="rounded-lg border bg-card"
    >
      <dl className="grid grid-cols-2 divide-x sm:grid-cols-3 xl:grid-cols-6 [&>div]:border-b xl:[&>div]:border-b-0">
        {readings.map((r) => (
          <div key={r.label} className="flex flex-col gap-0.5 px-4 pt-3 pb-1">
            <dt className="chart-label">{r.label}</dt>
            <dd className="readout flex items-baseline gap-1 text-2xl font-semibold tracking-tight">
              {r.value}
              {r.unit && (
                <span className="text-sm font-medium text-muted-foreground">
                  {r.unit}
                </span>
              )}
            </dd>
            <dd className="mt-1">
              <TickScale
                label={`${r.label} frente a su objetivo`}
                {...r.scale}
              />
            </dd>
            <dd className="pb-1 text-xs text-muted-foreground">{r.delta}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
