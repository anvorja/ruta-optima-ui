import { StatusMark } from "@/components/status-mark"
import { cn } from "@/lib/utils"

/** Legend for chart symbols. Every state: shape + colour + word. */
export function ChartLegendKey({ className }: { className?: string }) {
  return (
    <ul
      aria-label="Leyenda de la carta"
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground",
        className
      )}
    >
      <li className="flex items-center gap-1.5">
        <StatusMark level="ok" /> En plan
      </li>
      <li className="flex items-center gap-1.5">
        <StatusMark level="risk" /> En riesgo
      </li>
      <li className="flex items-center gap-1.5">
        <StatusMark level="crit" /> Crítico
      </li>
      <li className="flex items-center gap-1.5">
        <svg viewBox="0 0 24 6" className="w-6" aria-hidden="true">
          <line
            x1="0"
            y1="3"
            x2="24"
            y2="3"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        Ruta planificada
      </li>
      <li className="flex items-center gap-1.5">
        <svg viewBox="0 0 24 6" className="w-6" aria-hidden="true">
          <line
            x1="0"
            y1="3"
            x2="24"
            y2="3"
            stroke="var(--contour)"
            strokeWidth="1.6"
            strokeDasharray="5 3"
          />
        </svg>
        Retraso por tráfico
      </li>
      <li className="flex items-center gap-1.5">
        <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true">
          <circle
            cx="6"
            cy="6"
            r="4"
            fill="var(--background)"
            stroke="var(--foreground)"
            strokeWidth="1.6"
          />
        </svg>
        Parada
      </li>
    </ul>
  )
}
