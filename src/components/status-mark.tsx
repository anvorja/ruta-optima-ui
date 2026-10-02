import type { Level } from "@/data/types"
import { LEVEL_LABEL } from "@/lib/status"
import { cn } from "@/lib/utils"

export const LEVEL_TEXT: Record<Level, string> = {
  ok: "text-ok",
  risk: "text-risk",
  crit: "text-crit",
  idle: "text-idle",
}

export const LEVEL_BG: Record<Level, string> = {
  ok: "bg-ok/12",
  risk: "bg-risk/14",
  crit: "bg-crit/14",
  idle: "bg-idle/12",
}

/** Chart-light symbols: circle = en plan, triangle = riesgo, octagon = crítico, ring = sin ruta. */
export function StatusMark({
  level,
  className,
  pulse = false,
}: {
  level: Level
  className?: string
  pulse?: boolean
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn(
        "size-3.5 shrink-0 overflow-visible",
        LEVEL_TEXT[level],
        className
      )}
    >
      {pulse && level === "crit" && (
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          className="origin-center motion-safe:animate-ping-slow"
          style={{ transformBox: "fill-box" }}
        />
      )}
      {level === "ok" && <circle cx="8" cy="8" r="5.5" fill="currentColor" />}
      {level === "risk" && (
        <path d="M8 1.5 15.2 14.5H.8Z" fill="currentColor" />
      )}
      {level === "crit" && (
        <>
          <path
            d="M4.6 .8h6.8l4.8 4.8v4.8l-4.8 4.8H4.6L-.2 10.4V5.6Z"
            fill="currentColor"
          />
          <rect x="7" y="3.6" width="2" height="5.4" fill="var(--background)" />
          <rect x="7" y="10.4" width="2" height="2" fill="var(--background)" />
        </>
      )}
      {level === "idle" && (
        <circle
          cx="8"
          cy="8"
          r="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      )}
    </svg>
  )
}

export function StatusPill({
  level,
  label,
  className,
  pulse,
}: {
  level: Level
  label?: string
  className?: string
  pulse?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-sm px-1.5 text-[0.6875rem] font-semibold whitespace-nowrap",
        LEVEL_BG[level],
        LEVEL_TEXT[level],
        className
      )}
    >
      <StatusMark level={level} className="size-3" pulse={pulse} />
      {label ?? LEVEL_LABEL[level]}
    </span>
  )
}
