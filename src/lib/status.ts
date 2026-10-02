import type { Level, Notice, Order, Vehicle } from "@/data/types"

export type Thresholds = {
  delayWarn: number
  delayCrit: number
  xteWarn: number
  xteCrit: number
  fuelLow: number
  stopCrit: number
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  delayWarn: 10,
  delayCrit: 20,
  xteWarn: 100,
  xteCrit: 300,
  fuelLow: 30,
  stopCrit: 10,
}

export const LEVEL_LABEL: Record<Level, string> = {
  ok: "En plan",
  risk: "En riesgo",
  crit: "Crítico",
  idle: "Sin ruta",
}

export const LEVEL_RANK: Record<Level, number> = {
  crit: 0,
  risk: 1,
  ok: 2,
  idle: 3,
}

export function vehicleLevel(v: Vehicle, t: Thresholds): Level {
  if (v.status === "mantenimiento") return "idle"
  if (v.status === "detenido")
    return v.stoppedMin >= t.stopCrit ? "crit" : "risk"
  if (v.status === "disponible") return v.fuel <= t.fuelLow ? "risk" : "idle"
  if (v.xte >= t.xteCrit || v.delay >= t.delayCrit) return "crit"
  if (v.xte >= t.xteWarn || v.delay >= t.delayWarn || v.fuel <= t.fuelLow)
    return "risk"
  return "ok"
}

export const STATUS_LABEL: Record<Vehicle["status"], string> = {
  en_ruta: "En ruta",
  detenido: "Detenido",
  disponible: "Disponible",
  mantenimiento: "Mantenimiento",
}

/** Why a vehicle is at its level, in one short clause. */
export function vehicleReason(v: Vehicle, t: Thresholds): string | null {
  const parts: string[] = []
  if (v.status === "detenido") parts.push(`detenido ${v.stoppedMin} min`)
  if (v.status === "en_ruta") {
    if (v.xte >= t.xteWarn) parts.push(`fuera de corredor ${v.xte} m`)
    if (v.delay >= t.delayWarn) parts.push(`+${v.delay} min de retraso`)
  }
  if (v.status !== "mantenimiento" && v.fuel <= t.fuelLow)
    parts.push(`combustible ${v.fuel}%`)
  return parts.length ? parts.join(" · ") : null
}

export function deriveNotices(
  vehicles: Vehicle[],
  orders: Order[],
  t: Thresholds,
  includeTraffic = true
): Notice[] {
  const out: Notice[] = []
  for (const v of vehicles) {
    if (v.status === "en_ruta" && v.xte >= t.xteWarn) {
      out.push({
        id: `xte-${v.id}`,
        level: v.xte >= t.xteCrit ? "crit" : "risk",
        title: `${v.id} fuera del corredor planificado`,
        detail: `${v.xte} m de desvío · ${v.driver ?? "sin conductor"} · Zona ${v.zone}`,
        vehicleId: v.id,
        action: "Re-planificar",
        ageMin: 3,
      })
    }
    if (v.status === "en_ruta" && v.delay >= t.delayWarn) {
      out.push({
        id: `delay-${v.id}`,
        level: v.delay >= t.delayCrit ? "crit" : "risk",
        title: `${v.id} acumula +${v.delay} min de retraso`,
        detail: `Próxima parada en ${v.etaMin ?? "–"} min · ${v.driver ?? "sin conductor"}`,
        vehicleId: v.id,
        action: "Reasignar paradas",
        ageMin: 7,
      })
    }
    if (v.status === "detenido") {
      out.push({
        id: `stop-${v.id}`,
        level: v.stoppedMin >= t.stopCrit ? "crit" : "risk",
        title: `${v.id} detenido sin parada planificada`,
        detail: `Hace ${v.stoppedMin} min en Zona ${v.zone} · ${v.driver ?? "sin conductor"}`,
        vehicleId: v.id,
        action: "Contactar conductor",
        ageMin: v.stoppedMin,
      })
    }
    if (v.status !== "mantenimiento" && v.fuel <= t.fuelLow) {
      out.push({
        id: `fuel-${v.id}`,
        level: "risk",
        title: `${v.id} con combustible bajo`,
        detail: `${v.fuel}% de tanque · Base ${v.zone === "Base" ? "Central" : v.zone}`,
        vehicleId: v.id,
        action: "Programar recarga",
        ageMin: 22,
      })
    }
  }
  for (const o of orders) {
    if (o.status === "retrasado") {
      out.push({
        id: `sla-${o.id}`,
        level: "crit",
        title: `${o.id} ${o.customer}: ventana de entrega vencida`,
        detail: `Ventana ${o.timeWindow} · prioridad ${o.priority} · ${o.vehicle ?? "sin vehículo"}`,
        orderId: o.id,
        vehicleId: o.vehicle ?? undefined,
        at: o.at,
        action: "Avisar al cliente",
        ageMin: 11,
      })
    }
  }
  if (includeTraffic) {
    out.push({
      id: "traffic-centro",
      level: "risk",
      title: "Congestión en Zona Centro",
      detail: "Ruta A-15 · +15 min estimados sobre el plan",
      at: { x: 650, y: 322 },
      action: "Ver en carta",
      ageMin: 14,
    })
  }
  const rank = { crit: 0, risk: 1 } as const
  return out.sort(
    (a, b) => rank[a.level] - rank[b.level] || a.ageMin - b.ageMin
  )
}
