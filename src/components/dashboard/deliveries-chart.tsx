import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
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
import { HOURLY } from "@/data/fleet"
import { cn } from "@/lib/utils"

const config = {
  entregas: { label: "Entregas", color: "var(--chart-2)" },
  optimizadas: { label: "Optimizadas", color: "var(--foreground)" },
} satisfies ChartConfig

export function DeliveriesChart({ className }: { className?: string }) {
  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardHeader className="border-b py-3">
        <CardTitle>Entregas del día</CardTitle>
        <CardDescription>
          Acumulado por hora · real frente a optimizado
        </CardDescription>
      </CardHeader>
      <div className="p-4">
        <ChartContainer config={config} className="h-[240px] w-full">
          <LineChart data={HOURLY} margin={{ left: -8, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="2 4" />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="readout"
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
              type="monotone"
              isAnimationActive={false}
              stroke="var(--color-entregas)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              isAnimationActive={false}
              dataKey="optimizadas"
              type="monotone"
              stroke="var(--color-optimizadas)"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ r: 3, strokeWidth: 2, fill: "var(--background)" }}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </Card>
  )
}
