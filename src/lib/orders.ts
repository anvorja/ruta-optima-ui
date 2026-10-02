import type { Level, OrderStatus, Priority } from "@/data/types"

export const ORDER_STATUS: Record<
  OrderStatus,
  { label: string; level: Level }
> = {
  entregado: { label: "Entregado", level: "ok" },
  en_camino: { label: "En camino", level: "ok" },
  asignado: { label: "Asignado", level: "idle" },
  pendiente: { label: "Pendiente", level: "risk" },
  retrasado: { label: "Retrasado", level: "crit" },
}

export const PRIORITY: Record<Priority, { label: string; className: string }> =
  {
    urgente: { label: "Urgente", className: "border-crit/50 text-crit" },
    alta: { label: "Alta", className: "border-risk/50 text-risk" },
    normal: { label: "Normal", className: "text-muted-foreground" },
  }
