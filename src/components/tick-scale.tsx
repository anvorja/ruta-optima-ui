import { cn } from "@/lib/utils"

/**
 * Plotted tick scale: reading (diamond) against a target tick, as on a chart's
 * bearing scale. Replaces progress bars for plan-vs-actual comparisons.
 */
export function TickScale({
  min,
  max,
  value,
  target,
  targetLabel,
  label,
  className,
}: {
  min: number
  max: number
  value: number
  target?: number
  targetLabel?: string
  label: string
  className?: string
}) {
  const pct = (v: number) =>
    ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * 100
  const ticks = Array.from({ length: 21 }, (_, i) => i * 5)
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={
        target !== undefined ? `${value}, objetivo ${target}` : String(value)
      }
      className={cn("relative h-7 w-full", className)}
    >
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          x1="0"
          x2="100%"
          y1="18"
          y2="18"
          stroke="var(--border)"
          strokeWidth="1"
        />
        {ticks.map((t) => (
          <line
            key={t}
            x1={`${t}%`}
            x2={`${t}%`}
            y1={t % 25 === 0 ? 14 : 16}
            y2={22}
            stroke="var(--muted-foreground)"
            strokeOpacity={t % 25 === 0 ? 0.9 : 0.45}
            strokeWidth="1"
          />
        ))}
        <line
          x1="0"
          x2={`${pct(value)}%`}
          y1="18"
          y2="18"
          stroke="var(--foreground)"
          strokeWidth="2.5"
        />
        {target !== undefined && (
          <line
            x1={`${pct(target)}%`}
            x2={`${pct(target)}%`}
            y1="6"
            y2="26"
            stroke="var(--foreground)"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
        )}
      </svg>
      <span
        aria-hidden="true"
        className="absolute top-[9px] size-2 -translate-x-1/2 rotate-45 bg-foreground"
        style={{ left: `${pct(value)}%` }}
      />
      {target !== undefined && targetLabel && (
        <span
          aria-hidden="true"
          className="readout absolute top-[-2px] -translate-x-1/2 text-[0.625rem] whitespace-nowrap text-muted-foreground"
          style={{ left: `${Math.min(88, Math.max(12, pct(target)))}%` }}
        >
          {targetLabel}
        </span>
      )}
    </div>
  )
}
