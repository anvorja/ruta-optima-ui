export const nf = new Intl.NumberFormat("es-CO")
export const money = (n: number) => `$${nf.format(n)}`

export function minutes(n: number): string {
  const sign = n < 0 ? "−" : n > 0 ? "+" : ""
  return `${sign}${Math.abs(n)} min`
}

export function ago(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 60) return `${s}\u2009s`
  const m = Math.floor(s / 60)
  return m < 60
    ? `${m}\u2009min`
    : `${Math.floor(m / 60)}\u2009h ${m % 60}\u2009min`
}

/** "10:30 - 11:00" → start minutes since midnight (for sorting). */
export function windowStart(w: string): number {
  const [h, m] = w.split("-")[0].trim().split(":").map(Number)
  return h * 60 + m
}
