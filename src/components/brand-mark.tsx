import { cn } from "@/lib/utils"

/** A plotted track bending at 45° into a hub square: the product in one glyph. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="4"
        fill="var(--background)"
        stroke="var(--border)"
        strokeWidth="1.5"
      />
      <path
        d="M6 24 H12 L19 17 H22"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <rect
        x="21"
        y="12"
        width="6"
        height="6"
        fill="var(--background)"
        stroke="var(--foreground)"
        strokeWidth="2"
      />
      <circle cx="6" cy="24" r="2" fill="var(--foreground)" />
    </svg>
  )
}
