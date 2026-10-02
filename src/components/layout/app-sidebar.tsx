import {
  BarChart3,
  LayoutDashboard,
  type LucideIcon,
  MapPin,
  Moon,
  Package,
  Route,
  Settings,
  Sun,
  Truck,
} from "lucide-react"
import { Link, useLocation } from "react-router"
import { BrandMark } from "@/components/brand-mark"
import { StatusMark } from "@/components/status-mark"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useFleet } from "@/state/fleet-live"
import { useSettings } from "@/state/settings"

type Item = { title: string; url: string; icon: LucideIcon; hint?: string }

const OPERATE: Item[] = [
  { title: "Centro de control", url: "/", icon: LayoutDashboard },
  { title: "Mapa en vivo", url: "/live-map", icon: MapPin },
  { title: "Planificar rutas", url: "/routes", icon: Route },
  { title: "Órdenes", url: "/orders", icon: Package },
  { title: "Flota", url: "/fleet", icon: Truck },
]
const ANALYZE: Item[] = [
  { title: "Analíticas", url: "/analytics", icon: BarChart3 },
  { title: "Configuración", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { pathname } = useLocation()
  const { orders, notices, counts } = useFleet()
  const { saved } = useSettings()
  const { theme, setTheme } = useTheme()
  const open = orders.filter((o) => o.status !== "entregado").length
  const crit = notices.filter((n) => n.level === "crit").length
  const resolved =
    theme === "system"
      ? typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme

  const badge = (url: string) => {
    if (url === "/orders") return String(open)
    if (url === "/fleet")
      return `${counts.onRoute}/${counts.active + counts.maintenance}`
    return null
  }

  const render = (items: Item[]) =>
    items.map((item) => {
      const active =
        item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)
      const b = badge(item.url)
      return (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
            <Link to={item.url} aria-current={active ? "page" : undefined}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
          {b && (
            <SidebarMenuBadge className="readout text-[0.6875rem]">
              {b}
            </SidebarMenuBadge>
          )}
          {item.url === "/live-map" && (
            <SidebarMenuBadge>
              <span className="flex items-center gap-1 text-[0.6875rem] font-semibold text-ok">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full rounded-full bg-ok opacity-60 motion-safe:animate-ping-slow" />
                  <span className="relative inline-flex size-2 rounded-full bg-ok" />
                </span>
                EN VIVO
              </span>
            </SidebarMenuBadge>
          )}
        </SidebarMenuItem>
      )
    })

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border px-3">
        <Link
          to="/"
          className="flex items-center gap-2.5 overflow-hidden rounded-md"
        >
          <BrandMark />
          <span className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-bold tracking-tight">
              RutaOptima
            </span>
            <span className="truncate text-[0.6875rem] text-sidebar-foreground/70">
              Torre de control
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{render(OPERATE)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Análisis y ajustes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{render(ANALYZE)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-2 border-t border-sidebar-border">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-2.5 py-2 text-xs group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent"
        >
          <StatusMark level={crit > 0 ? "crit" : "ok"} pulse />
          <span className="flex flex-col leading-tight">
            <span className="font-semibold">
              {notices.length} avisos activos
            </span>
            <span className="text-sidebar-foreground/70">
              {crit > 0
                ? `${crit} ${crit === 1 ? "crítico" : "críticos"} por atender`
                : "Sin críticos"}
            </span>
          </span>
        </Link>
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:flex-col">
          <div className="flex min-w-0 items-center gap-2 group-data-[collapsible=icon]:hidden">
            <span className="grid size-8 shrink-0 place-items-center rounded-md border bg-card text-xs font-bold">
              {saved.org.operator
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-xs font-semibold">
                {saved.org.operator}
              </span>
              <span className="truncate text-[0.6875rem] text-sidebar-foreground/70">
                {saved.org.role}
              </span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              resolved === "dark"
                ? "Cambiar a carta de día"
                : "Cambiar a carta de noche"
            }
            title="Tecla D"
            onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
          >
            {resolved === "dark" ? <Sun /> : <Moon />}
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
