import { Link } from "react-router"
import { ChevronRight, Clock, MapPin } from "lucide-react"
import { StatusMark } from "@/components/status-mark"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ORDER_STATUS, PRIORITY } from "@/lib/orders"
import { windowStart } from "@/lib/format"
import { useFleet } from "@/state/fleet-live"
import { cn } from "@/lib/utils"

export function UpcomingDeliveries({ className }: { className?: string }) {
  const { orders } = useFleet()
  const next = orders
    .filter((o) => o.status !== "entregado")
    .sort(
      (a, b) =>
        Number(b.status === "retrasado") - Number(a.status === "retrasado") ||
        windowStart(a.timeWindow) - windowStart(b.timeWindow)
    )
    .slice(0, 6)

  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardHeader className="border-b py-3">
        <CardTitle>Próximas entregas</CardTitle>
        <CardDescription>
          Ventanas de tiempo activas, vencidas primero
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/orders">
              Ver todas <ChevronRight />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <ul className="divide-y">
        {next.map((o) => {
          const s = ORDER_STATUS[o.status]
          return (
            <li key={o.id} className="flex items-start gap-3 px-4 py-2.5">
              <StatusMark
                level={s.level}
                className="mt-1"
                pulse={o.status === "retrasado"}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="readout text-[0.8125rem] font-semibold">
                    {o.id}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {s.label}
                  </span>
                  {o.priority !== "normal" && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-4 rounded-sm px-1 text-[0.625rem]",
                        PRIORITY[o.priority].className
                      )}
                    >
                      {PRIORITY[o.priority].label}
                    </Badge>
                  )}
                </div>
                <p className="truncate text-sm">{o.customer}</p>
                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="size-3 shrink-0" />
                  {o.address}
                </p>
              </div>
              <span className="readout flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {o.timeWindow.replace(" - ", "–")}
              </span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
