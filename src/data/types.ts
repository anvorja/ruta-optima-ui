/** Geographic position (WGS84). */
export type Point = { lat: number; lng: number }

/** Light characteristics: every state has a fixed colour, shape and label. */
export type Level = "ok" | "risk" | "crit" | "idle"

export type VehicleStatus =
  "en_ruta" | "detenido" | "disponible" | "mantenimiento"

export type VehicleType = "Camión" | "Camioneta" | "Van" | "Moto"

export type Zone = "Centro" | "Norte" | "Sur" | "Este" | "Oeste" | "Base"

export type Vehicle = {
  id: string
  name: string
  type: VehicleType
  driver: string | null
  status: VehicleStatus
  zone: Zone
  /** kg */
  capacity: number
  load: number
  /** % */
  fuel: number
  consumption: string
  lastMaintenance: string
  /** Planned track following real streets. Empty when not routed. */
  route: Point[]
  /** 0..1 along the planned track. */
  progress: number
  /** km/h */
  speed: number
  /** Cross-track deviation from the planned corridor, metres. */
  xte: number
  /** Minutes behind (+) or ahead (-) of the planned ETA at the next stop. */
  delay: number
  /** Minutes until the next stop at the planned pace. */
  etaMin: number | null
  /** Minutes the vehicle has been stationary without a planned stop. */
  stoppedMin: number
  orders: string[]
}

export type OrderStatus =
  "entregado" | "en_camino" | "asignado" | "pendiente" | "retrasado"

export type Priority = "urgente" | "alta" | "normal"

export type Order = {
  id: string
  customer: string
  address: string
  timeWindow: string
  status: OrderStatus
  priority: Priority
  vehicle: string | null
  items: number
  weight: string
  /** Position of the drop. */
  at: Point
}

export type Notice = {
  id: string
  level: Exclude<Level, "idle" | "ok">
  title: string
  detail: string
  /** Where on the chart (for focusing). */
  vehicleId?: string
  orderId?: string
  at?: Point
  action: string
  /** Minutes since raised. */
  ageMin: number
}
