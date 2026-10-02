import * as React from "react"
import { INITIAL_VEHICLES, ORDERS, TOTAL_FLEET } from "@/data/fleet"
import type { Notice, Order, Vehicle } from "@/data/types"
import { deriveNotices, vehicleLevel } from "@/lib/status"
import { useSettings } from "@/state/settings"

type FleetCtx = {
  vehicles: Vehicle[]
  orders: Order[]
  notices: Notice[]
  total: number
  /** ms epoch of the last telemetry frame. */
  updatedAt: number
  lastOptimizedAt: number
  optimizing: boolean
  optimize: () => Promise<void>
  counts: {
    active: number
    onRoute: number
    maintenance: number
    crit: number
    risk: number
    ok: number
  }
}

const Ctx = React.createContext<FleetCtx | undefined>(undefined)

/**
 * Simulated telemetry: advances moving vehicles along their planned track so the
 * chart is alive. Replace with a TMS/telematics subscription.
 */
export function FleetProvider({ children }: { children: React.ReactNode }) {
  const { saved } = useSettings()
  const t = saved.thresholds
  const [vehicles, setVehicles] = React.useState<Vehicle[]>(INITIAL_VEHICLES)
  const [updatedAt, setUpdatedAt] = React.useState(() => Date.now())
  const [lastOptimizedAt, setLastOptimizedAt] = React.useState(
    () => Date.now() - 15 * 60_000
  )
  const [optimizing, setOptimizing] = React.useState(false)

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setVehicles((vs) =>
        vs.map((v) =>
          v.status === "en_ruta"
            ? {
                ...v,
                progress: Math.min(0.97, v.progress + (v.speed / 38) * 0.0035),
                etaMin:
                  v.etaMin === null
                    ? null
                    : Math.max(1, v.etaMin - (Math.random() < 0.18 ? 1 : 0)),
              }
            : v
        )
      )
      setUpdatedAt(Date.now())
    }, saved.refreshSec * 1000)
    return () => window.clearInterval(id)
  }, [saved.refreshSec])

  const optimize = React.useCallback(async () => {
    setOptimizing(true)
    await new Promise((r) => setTimeout(r, 2000))
    setVehicles((vs) =>
      vs.map((v) =>
        v.status === "en_ruta"
          ? {
              ...v,
              xte: v.xte >= 100 ? 0 : v.xte,
              delay: v.delay > 0 ? Math.max(0, v.delay - 8) : v.delay,
            }
          : v
      )
    )
    setLastOptimizedAt(Date.now())
    setUpdatedAt(Date.now())
    setOptimizing(false)
  }, [])

  const notices = React.useMemo(
    () => deriveNotices(vehicles, ORDERS, t),
    [vehicles, t]
  )

  const counts = React.useMemo(() => {
    const levels = vehicles.map((v) => vehicleLevel(v, t))
    return {
      active: vehicles.filter((v) => v.status !== "mantenimiento").length,
      onRoute: vehicles.filter(
        (v) => v.status === "en_ruta" || v.status === "detenido"
      ).length,
      maintenance: vehicles.filter((v) => v.status === "mantenimiento").length,
      crit: levels.filter((l) => l === "crit").length,
      risk: levels.filter((l) => l === "risk").length,
      ok: levels.filter((l) => l === "ok").length,
    }
  }, [vehicles, t])

  const value = React.useMemo(
    () => ({
      vehicles,
      orders: ORDERS,
      notices,
      total: TOTAL_FLEET,
      updatedAt,
      lastOptimizedAt,
      optimizing,
      optimize,
      counts,
    }),
    [
      vehicles,
      notices,
      updatedAt,
      lastOptimizedAt,
      optimizing,
      optimize,
      counts,
    ]
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useFleet() {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("useFleet must be used within FleetProvider")
  return ctx
}

/** Re-renders once per second so "hace N s" labels stay honest. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}
