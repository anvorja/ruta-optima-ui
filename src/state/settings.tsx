import * as React from "react"
import { DEFAULT_THRESHOLDS, type Thresholds } from "@/lib/status"

export type Settings = {
  thresholds: Thresholds
  notify: { crit: boolean; risk: boolean; info: boolean }
  channels: { app: boolean; email: boolean; sms: boolean }
  sound: boolean
  units: "km" | "mi"
  timezone: string
  density: "comfortable" | "compact"
  refreshSec: 3 | 5 | 10 | 30
  org: { name: string; operator: string; role: string }
}

export const DEFAULT_SETTINGS: Settings = {
  thresholds: DEFAULT_THRESHOLDS,
  notify: { crit: true, risk: true, info: false },
  channels: { app: true, email: true, sms: false },
  sound: false,
  units: "km",
  timezone: "America/Bogota",
  density: "comfortable",
  refreshSec: 5,
  org: {
    name: "RutaOptima Logística",
    operator: "Operador de turno",
    role: "Despachador",
  },
}

const KEY = "rutaoptima.settings.v1"

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      thresholds: { ...DEFAULT_SETTINGS.thresholds, ...parsed.thresholds },
      notify: { ...DEFAULT_SETTINGS.notify, ...parsed.notify },
      channels: { ...DEFAULT_SETTINGS.channels, ...parsed.channels },
      org: { ...DEFAULT_SETTINGS.org, ...parsed.org },
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

type Ctx = {
  settings: Settings
  saved: Settings
  setDraft: (next: Settings) => void
  save: () => void
  reset: () => void
  dirty: boolean
}

const SettingsContext = React.createContext<Ctx | undefined>(undefined)

/** `settings` is the saved value that drives the app; the page edits a draft. */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = React.useState<Settings>(load)
  const [draft, setDraft] = React.useState<Settings>(saved)

  const save = React.useCallback(() => {
    setSaved(draft)
    try {
      localStorage.setItem(KEY, JSON.stringify(draft))
    } catch {
      /* storage unavailable: keep in memory */
    }
  }, [draft])

  const reset = React.useCallback(() => {
    setDraft(DEFAULT_SETTINGS)
    setSaved(DEFAULT_SETTINGS)
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const dirty = React.useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved]
  )

  const value = React.useMemo(
    () => ({ settings: draft, saved, setDraft, save, reset, dirty }),
    [draft, saved, save, reset, dirty]
  )
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = React.useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider")
  return ctx
}
