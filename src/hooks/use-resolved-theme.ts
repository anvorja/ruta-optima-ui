import * as React from "react"
import { useTheme } from "@/components/theme-provider"

const QUERY = "(prefers-color-scheme: dark)"

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

/** "dark" | "light", with "system" resolved against the OS preference. */
export function useResolvedTheme(): "dark" | "light" {
  const { theme } = useTheme()
  const systemDark = React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => true
  )
  if (theme === "system") return systemDark ? "dark" : "light"
  return theme
}
