import { Bell, Search } from "lucide-react"
import * as React from "react"
import { Link, useNavigate } from "react-router"
import { StatusMark } from "@/components/status-mark"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useFleet, useNow } from "@/state/fleet-live"
import { useSettings } from "@/state/settings"

function ageLabel(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000))
  return s < 60 ? `${s}\u2009s` : `${Math.floor(s / 60)}\u2009min`
}

export function TopBar() {
  const navigate = useNavigate()
  const { notices, counts, updatedAt } = useFleet()
  const { saved } = useSettings()
  const now = useNow()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [q, setQ] = React.useState("")

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (
        e.key === "/" &&
        !(el && el.closest("input, textarea, select, [contenteditable='true']"))
      ) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const stale = now - updatedAt > saved.refreshSec * 3000
  const time = new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: saved.timezone,
  }).format(now)
  const top = notices.slice(0, 4)
  const crit = notices.filter((n) => n.level === "crit").length

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-3 backdrop-blur-sm md:px-4">
      <SidebarTrigger aria-label="Mostrar u ocultar menú" />
      <Separator orientation="vertical" className="h-5" />

      <form
        role="search"
        className="relative w-full max-w-sm"
        onSubmit={(e) => {
          e.preventDefault()
          navigate(
            `/orders${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`
          )
        }}
      >
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Buscar órdenes y clientes"
          placeholder="Buscar órdenes, clientes…"
          className="h-8 pr-8 pl-8"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border px-1 text-[0.625rem] text-muted-foreground sm:block">
          /
        </kbd>
      </form>

      {/* Fleet by state: always-visible situational awareness */}
      <ul
        className="ml-auto flex items-center gap-3 text-xs"
        aria-label="Flota por estado"
      >
        <li className="flex items-center gap-1.5">
          <StatusMark level="ok" />
          <span className="readout font-semibold">{counts.ok}</span>
          <span className="hidden text-muted-foreground xl:inline">
            en plan
          </span>
        </li>
        <li className="flex items-center gap-1.5">
          <StatusMark level="risk" />
          <span className="readout font-semibold">{counts.risk}</span>
          <span className="hidden text-muted-foreground xl:inline">
            en riesgo
          </span>
        </li>
        <li className="flex items-center gap-1.5">
          <StatusMark level="crit" pulse />
          <span className="readout font-semibold">{counts.crit}</span>
          <span className="hidden text-muted-foreground xl:inline">
            {counts.crit === 1 ? "crítico" : "críticos"}
          </span>
        </li>
      </ul>

      <Separator orientation="vertical" className="hidden h-5 md:block" />

      <div
        className="hidden flex-col items-end leading-tight md:flex"
        title="Telemetría simulada: los datos son de ejemplo"
      >
        <span className="readout text-xs font-semibold">{time}</span>
        <span
          className={`text-[0.6875rem] ${stale ? "text-risk" : "text-muted-foreground"}`}
        >
          {stale ? "Sin datos hace " : "Telemetría hace "}
          <span className="readout">{ageLabel(now - updatedAt)}</span>
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={`Avisos: ${notices.length}`}
          >
            <Bell />
            {notices.length > 0 && (
              <Badge
                className={`readout absolute -top-0.5 -right-0.5 h-4 min-w-4 justify-center px-1 text-[0.625rem] ${
                  crit > 0
                    ? "bg-crit text-background"
                    : "bg-risk text-background"
                }`}
              >
                {notices.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96">
          <DropdownMenuLabel className="flex items-center justify-between">
            Avisos a la operación
            <span className="readout text-muted-foreground">
              {notices.length}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {top.map((n) => (
            <DropdownMenuItem key={n.id} asChild>
              <Link
                to={n.vehicleId ? `/live-map?v=${n.vehicleId}` : "/live-map"}
                className="items-start gap-2.5 p-2.5"
              >
                <StatusMark level={n.level} className="mt-0.5" />
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium">{n.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {n.detail}
                  </span>
                </span>
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/" className="justify-center text-xs font-semibold">
              Ver todos en el centro de control
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
