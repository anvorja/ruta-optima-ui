import { Compass } from "lucide-react"
import { useEffect } from "react"
import { Link, useLocation } from "react-router"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const { pathname } = useLocation()
  useEffect(() => {
    console.error("404: ruta inexistente:", pathname)
  }, [pathname])

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <Compass className="size-10 text-muted-foreground" aria-hidden="true" />
      <p className="readout text-5xl font-semibold">404</p>
      <h1 className="text-xl font-semibold">Fuera de carta</h1>
      <p className="text-sm text-muted-foreground">
        No existe la ruta{" "}
        <span className="readout text-foreground">{pathname}</span>. Vuelve al
        centro de control o abre el mapa en vivo.
      </p>
      <div className="flex gap-2">
        <Button asChild>
          <Link to="/">Centro de control</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/live-map">Mapa en vivo</Link>
        </Button>
      </div>
    </div>
  )
}
