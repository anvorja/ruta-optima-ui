import { Calendar, Download } from "lucide-react"
import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { COSTS, FLEET_MIX, WEEKLY, ZONE_PERFORMANCE } from "@/data/fleet"
import { money, nf } from "@/lib/format"
import { cn } from "@/lib/utils"

const PERIODS = {
  week: { label: "Esta semana", k: 0.25, vs: "vs semana anterior" },
  month: { label: "Este mes", k: 1, vs: "vs mes anterior" },
  quarter: { label: "Trimestre", k: 3, vs: "vs trimestre anterior" },
  year: { label: "Este año", k: 12, vs: "vs año anterior" },
} as const
type Period = keyof typeof PERIODS

const weeklyConfig = {
  entregas: { label: "Entregas", color: "var(--chart-2)" },
  optimizadas: { label: "Optimizadas", color: "var(--foreground)" },
} satisfies ChartConfig

const costConfig = {
  actual: { label: "Costo actual", color: "var(--chart-5)" },
  optimizado: { label: "Costo optimizado", color: "var(--chart-2)" },
} satisfies ChartConfig

const MIX_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
]

export default function Analytics() {
  const [period, setPeriod] = React.useState<Period>("month")
  const p = PERIODS[period]

  const kpis = [
    { title: "Ahorro", value: money(Math.round(12450 * p.k)), change: "+22%" },
    {
      title: "Combustible ahorrado",
      value: `${nf.format(Math.round(1234 * p.k))} L`,
      change: "+18%",
    },
    { title: "Tiempo promedio", value: "23 min", change: "−15%" },
    {
      title: "Km optimizados",
      value: nf.format(Math.round(8456 * p.k)),
      change: "+25%",
    },
  ]

  const exportCsv = () => {
    const rows = [
      ["dia", "entregas", "optimizadas", "ahorro_pct"],
      ...WEEKLY.map((w) => [w.day, w.entregas, w.optimizadas, w.ahorro]),
    ]
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], {
      type: "text/csv;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rutaoptima-entregas-${period}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Exportación lista", {
      description: "Datos de ejemplo de entregas semanales.",
    })
  }

  return (
    <>
      <PageHeader
        title="Analíticas"
        description="Rendimiento y métricas de optimización · datos de ejemplo"
        actions={
          <>
            <Select
              value={period}
              onValueChange={(v) => setPeriod(v as Period)}
            >
              <SelectTrigger className="w-[170px]" aria-label="Periodo">
                <Calendar className="size-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PERIODS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportCsv}>
              <Download /> Exportar CSV
            </Button>
          </>
        }
      />

      <section
        aria-label="Indicadores del periodo"
        className="mb-4 rounded-lg border bg-card"
      >
        <dl className="grid grid-cols-2 divide-x lg:grid-cols-4 [&>div:nth-child(n+3)]:max-lg:border-t">
          {kpis.map((k) => (
            <div key={k.title} className="flex flex-col gap-1 px-4 py-3">
              <dt className="chart-label">{k.title}</dt>
              <dd className="readout text-2xl font-semibold tracking-tight">
                {k.value}
              </dd>
              <dd className="text-xs text-ok">
                <span className="readout font-semibold">{k.change}</span>{" "}
                <span className="text-muted-foreground">{p.vs}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-3">
            <CardTitle>Entregas semanales</CardTitle>
            <CardDescription>
              Comparación real frente a optimizado
            </CardDescription>
          </CardHeader>
          <div className="p-4">
            <ChartContainer config={weeklyConfig} className="h-[280px] w-full">
              <LineChart data={WEEKLY} margin={{ left: -8, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="2 4" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  className="readout"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="entregas"
                  stroke="var(--color-entregas)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
                <Line
                  dataKey="optimizadas"
                  stroke="var(--color-optimizadas)"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={{ r: 3, fill: "var(--background)", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-3">
            <CardTitle>Costos operativos</CardTitle>
            <CardDescription>Actual frente a optimizado (MXN)</CardDescription>
          </CardHeader>
          <div className="p-4">
            <ChartContainer config={costConfig} className="h-[280px] w-full">
              <BarChart data={COSTS} margin={{ left: -4, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="2 4" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  className="readout"
                  tickFormatter={(v: number) => `${v / 1000}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => money(Number(value))}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="actual"
                  fill="var(--color-actual)"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="optimizado"
                  fill="var(--color-optimizado)"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-3">
            <CardTitle>Uso de flota</CardTitle>
            <CardDescription>Distribución por tipo de vehículo</CardDescription>
          </CardHeader>
          <div className="flex flex-col gap-4 p-4">
            <div
              className="flex h-4 overflow-hidden rounded-sm"
              role="img"
              aria-label={FLEET_MIX.map((m) => `${m.name} ${m.value}%`).join(
                ", "
              )}
            >
              {FLEET_MIX.map((m, i) => (
                <div
                  key={m.name}
                  style={{ width: `${m.value}%`, background: MIX_COLORS[i] }}
                  className="border-r border-card last:border-r-0"
                />
              ))}
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {FLEET_MIX.map((m, i) => (
                <li
                  key={m.name}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-sm"
                      style={{ background: MIX_COLORS[i] }}
                      aria-hidden="true"
                    />
                    {m.name}
                  </span>
                  <span className="readout font-semibold">{m.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-3">
            <CardTitle>Rendimiento por zona</CardTitle>
            <CardDescription>
              Entregas, tiempo promedio y eficiencia
            </CardDescription>
          </CardHeader>
          <ul className="flex flex-col gap-3 p-4">
            {ZONE_PERFORMANCE.map((z) => (
              <li
                key={z.zone}
                className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3"
              >
                <span className="text-sm font-medium">{z.zone}</span>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>
                      <span className="readout">{z.entregas}</span> entregas
                    </span>
                    <span>
                      <span className="readout">{z.tiempo}</span> min prom.
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`Eficiencia de ${z.zone}`}
                    aria-valuenow={z.eficiencia}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-1.5 bg-muted"
                  >
                    <div
                      className={cn(
                        "h-full",
                        z.eficiencia >= 90 ? "bg-ok" : "bg-risk"
                      )}
                      style={{ width: `${z.eficiencia}%` }}
                    />
                  </div>
                </div>
                <span
                  className={cn(
                    "readout text-right text-sm font-semibold",
                    z.eficiencia >= 90 ? "text-ok" : "text-risk"
                  )}
                >
                  {z.eficiencia}%
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
