import {
  Clock,
  Filter,
  MapPin,
  MoreVertical,
  Package,
  Plus,
  Search,
  Upload,
} from "lucide-react"
import * as React from "react"
import { Link, useSearchParams } from "react-router"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { StatusPill } from "@/components/status-mark"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Order, OrderStatus } from "@/data/types"
import { ORDER_STATUS, PRIORITY } from "@/lib/orders"
import { cn } from "@/lib/utils"
import { useFleet } from "@/state/fleet-live"

const STATUSES: OrderStatus[] = [
  "pendiente",
  "asignado",
  "en_camino",
  "entregado",
  "retrasado",
]

export default function Orders() {
  const { orders } = useFleet()
  const [params, setParams] = useSearchParams()
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [detail, setDetail] = React.useState<Order | null>(null)
  const q = params.get("q") ?? ""

  const filtered = orders.filter((o) => {
    const needle = q.toLowerCase()
    const matchesSearch =
      !needle ||
      o.id.toLowerCase().includes(needle) ||
      o.customer.toLowerCase().includes(needle)
    return (
      matchesSearch && (statusFilter === "all" || o.status === statusFilter)
    )
  })

  const counts = Object.fromEntries(
    STATUSES.map((s) => [s, orders.filter((o) => o.status === s).length])
  ) as Record<OrderStatus, number>

  const setQ = (value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set("q", value)
    else next.delete("q")
    setParams(next, { replace: true })
  }

  return (
    <>
      <PageHeader
        title="Órdenes"
        description={
          <>
            <span className="readout">{orders.length}</span> órdenes totales ·{" "}
            <span className="readout">{counts.pendiente}</span> pendientes ·{" "}
            <span className="readout">{counts.retrasado}</span> retrasadas
          </>
        }
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                toast.info("Importación de Excel disponible al conectar el TMS")
              }
            >
              <Upload /> Importar Excel
            </Button>
            <Button
              onClick={() =>
                toast.info("Alta de órdenes disponible al conectar el TMS")
              }
            >
              <Plus /> Nueva orden
            </Button>
          </>
        }
      />

      <ul className="mb-4 flex flex-wrap gap-2" aria-label="Órdenes por estado">
        {STATUSES.map((s) => {
          const meta = ORDER_STATUS[s]
          const active = statusFilter === s
          return (
            <li key={s}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => setStatusFilter(active ? "all" : s)}
                className={cn(
                  "flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-muted",
                  active && "border-primary bg-accent"
                )}
              >
                <StatusPill
                  level={meta.level}
                  label={meta.label}
                  className="bg-transparent px-0"
                />
                <span className="readout font-semibold">{counts[s]}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <Card className="mb-4 py-3">
        <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por ID o cliente…"
              aria-label="Buscar por ID o cliente"
              className="pl-8"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="w-full sm:w-[200px]"
              aria-label="Filtrar por estado"
            >
              <Filter className="size-4" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {ORDER_STATUS[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="gap-0 py-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Orden</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Dirección</TableHead>
              <TableHead className="hidden lg:table-cell">Ventana</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden sm:table-cell">Prioridad</TableHead>
              <TableHead className="hidden xl:table-cell">Vehículo</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o) => {
              const s = ORDER_STATUS[o.status]
              const p = PRIORITY[o.priority]
              return (
                <TableRow key={o.id}>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setDetail(o)}
                      className="readout flex items-center gap-2 text-[0.8125rem] font-semibold hover:underline"
                    >
                      <Package
                        className="size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      {o.id}
                    </button>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{o.customer}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.items} ítems · {o.weight}
                    </p>
                  </TableCell>
                  <TableCell className="hidden max-w-[220px] md:table-cell">
                    <span className="flex items-center gap-1 truncate text-muted-foreground">
                      <MapPin className="size-3 shrink-0" />
                      {o.address}
                    </span>
                  </TableCell>
                  <TableCell className="readout hidden text-[0.8125rem] lg:table-cell">
                    {o.timeWindow}
                  </TableCell>
                  <TableCell>
                    <StatusPill
                      level={s.level}
                      label={s.label}
                      pulse={o.status === "retrasado"}
                    />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant="outline"
                      className={cn("rounded-sm", p.className)}
                    >
                      {p.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="readout hidden text-[0.8125rem] xl:table-cell">
                    {o.vehicle ? (
                      <Link
                        to={`/live-map?v=${o.vehicle}`}
                        className="hover:underline"
                      >
                        {o.vehicle}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Acciones de ${o.id}`}
                        >
                          <MoreVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setDetail(o)}>
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            toast.info(
                              `Edición de ${o.id} disponible al conectar el TMS`
                            )
                          }
                        >
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            toast.info(
                              "Asignación manual disponible en Planificar rutas"
                            )
                          }
                        >
                          Asignar vehículo
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() =>
                            toast.warning(
                              `Cancelar ${o.id} requiere confirmación del despachador`
                            )
                          }
                        >
                          Cancelar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="py-12 text-center">
                  <p className="font-medium">Ninguna orden coincide</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Prueba con otro ID o cliente, o quita el filtro de estado.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setQ("")
                      setStatusFilter("all")
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle className="readout">{detail.id}</SheetTitle>
                <SheetDescription>{detail.customer}</SheetDescription>
              </SheetHeader>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 px-4 text-sm">
                <dt className="text-muted-foreground">Estado</dt>
                <dd>
                  <StatusPill
                    level={ORDER_STATUS[detail.status].level}
                    label={ORDER_STATUS[detail.status].label}
                  />
                </dd>
                <dt className="text-muted-foreground">Dirección</dt>
                <dd>{detail.address}</dd>
                <dt className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-3.5" /> Ventana
                </dt>
                <dd className="readout">{detail.timeWindow}</dd>
                <dt className="text-muted-foreground">Prioridad</dt>
                <dd>{PRIORITY[detail.priority].label}</dd>
                <dt className="text-muted-foreground">Carga</dt>
                <dd>
                  {detail.items} ítems · {detail.weight}
                </dd>
                <dt className="text-muted-foreground">Vehículo</dt>
                <dd className="readout">{detail.vehicle ?? "Sin asignar"}</dd>
              </dl>
              <div className="mt-2 flex gap-2 px-4">
                <Button asChild>
                  <Link
                    to={
                      detail.vehicle
                        ? `/live-map?v=${detail.vehicle}`
                        : "/live-map"
                    }
                  >
                    <MapPin /> Ver en carta
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => setDetail(null)}>
                  Cerrar
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
