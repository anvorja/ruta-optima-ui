import { Monitor, Moon, Plug, Sun } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { StatusMark } from "@/components/status-mark"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { INITIAL_VEHICLES } from "@/data/fleet"
import { deriveNotices, type Thresholds, vehicleLevel } from "@/lib/status"
import { useFleet } from "@/state/fleet-live"
import { type Settings as S, useSettings } from "@/state/settings"

function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string
  hint?: string
  children: React.ReactNode
  htmlFor?: string
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-6">
      <div>
        <Label htmlFor={htmlFor} className="text-sm font-medium">
          {label}
        </Label>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div>{children}</div>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="border-b py-3">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <div className="flex flex-col gap-5 p-4">{children}</div>
    </Card>
  )
}

function ThresholdSlider({
  id,
  label,
  hint,
  unit,
  min,
  max,
  step,
  value,
  onChange,
}: {
  id: string
  label: string
  hint: string
  unit: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
}) {
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <div className="flex items-center gap-4">
        <Slider
          id={id}
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          aria-label={label}
        />
        <span className="readout w-20 shrink-0 text-right text-sm font-semibold">
          {value} {unit}
        </span>
      </div>
    </Field>
  )
}

const INTEGRATIONS = [
  { name: "TMS", desc: "Órdenes, ventanas de entrega y asignaciones" },
  { name: "WMS", desc: "Preparación de pedidos y muelles de carga" },
  { name: "ERP", desc: "Clientes, facturación y costos" },
  {
    name: "Telemática / GPS",
    desc: "Posición, velocidad y eventos de conducción",
  },
  { name: "IoT cadena de frío", desc: "Temperatura y humedad de la carga" },
]

const ZONES: [string, string][] = [
  ["America/Bogota", "Bogotá (UTC−5)"],
  ["America/Mexico_City", "Ciudad de México (UTC−6)"],
  ["America/Lima", "Lima (UTC−5)"],
  ["America/Santiago", "Santiago (UTC−4/−3)"],
  ["Europe/Madrid", "Madrid (UTC+1/+2)"],
]

export default function Settings() {
  const { settings, setDraft, save, reset, dirty } = useSettings()
  const { orders } = useFleet()
  const { theme, setTheme } = useTheme()

  const patch = (p: Partial<S>) => setDraft({ ...settings, ...p })
  const th = (k: keyof Thresholds) => (v: number) =>
    patch({ thresholds: { ...settings.thresholds, [k]: v } })

  // Live impact of the draft thresholds on today's fleet.
  const impact = React.useMemo(() => {
    const levels = INITIAL_VEHICLES.map((v) =>
      vehicleLevel(v, settings.thresholds)
    )
    return {
      crit: levels.filter((l) => l === "crit").length,
      risk: levels.filter((l) => l === "risk").length,
      notices: deriveNotices(INITIAL_VEHICLES, orders, settings.thresholds)
        .length,
    }
  }, [settings.thresholds, orders])

  return (
    <>
      <PageHeader
        title="Configuración"
        description="Umbrales de alerta, avisos, operación y apariencia de tu torre de control"
      />

      <Tabs defaultValue="umbrales" className="gap-4 pb-20">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="umbrales">Umbrales</TabsTrigger>
          <TabsTrigger value="avisos">Notificaciones</TabsTrigger>
          <TabsTrigger value="operacion">Operación</TabsTrigger>
          <TabsTrigger value="apariencia">Apariencia</TabsTrigger>
          <TabsTrigger value="integraciones">Integraciones</TabsTrigger>
          <TabsTrigger value="organizacion">Organización</TabsTrigger>
        </TabsList>

        <TabsContent value="umbrales" className="flex flex-col gap-4">
          <Section
            title="Cuándo un vehículo pasa a riesgo o crítico"
            description="Estos umbrales gobiernan los estados de la flota y los avisos del centro de control."
          >
            <div
              className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-md border bg-muted/40 px-3 py-2 text-sm"
              role="status"
              aria-live="polite"
            >
              <span className="text-muted-foreground">
                Con estos valores, la flota de hoy tendría:
              </span>
              <span className="flex items-center gap-1.5">
                <StatusMark level="crit" />{" "}
                <span className="readout font-semibold">{impact.crit}</span>{" "}
                críticos
              </span>
              <span className="flex items-center gap-1.5">
                <StatusMark level="risk" />{" "}
                <span className="readout font-semibold">{impact.risk}</span> en
                riesgo
              </span>
              <span className="text-muted-foreground">
                <span className="readout font-semibold text-foreground">
                  {impact.notices}
                </span>{" "}
                avisos
              </span>
            </div>
            <ThresholdSlider
              id="delayWarn"
              label="Retraso: riesgo"
              hint="Minutos sobre el plan en la próxima parada."
              unit="min"
              min={3}
              max={30}
              step={1}
              value={settings.thresholds.delayWarn}
              onChange={th("delayWarn")}
            />
            <ThresholdSlider
              id="delayCrit"
              label="Retraso: crítico"
              hint="Pone en peligro la ventana SLA del cliente."
              unit="min"
              min={10}
              max={60}
              step={1}
              value={settings.thresholds.delayCrit}
              onChange={th("delayCrit")}
            />
            <ThresholdSlider
              id="xteWarn"
              label="Desvío de ruta: riesgo"
              hint="Distancia al corredor planificado (XTE)."
              unit="m"
              min={50}
              max={500}
              step={10}
              value={settings.thresholds.xteWarn}
              onChange={th("xteWarn")}
            />
            <ThresholdSlider
              id="xteCrit"
              label="Desvío de ruta: crítico"
              hint="Fuera del corredor: probable ruta incorrecta."
              unit="m"
              min={150}
              max={1000}
              step={10}
              value={settings.thresholds.xteCrit}
              onChange={th("xteCrit")}
            />
            <ThresholdSlider
              id="stopCrit"
              label="Detención no planificada: crítica"
              hint="Minutos detenido fuera de una parada."
              unit="min"
              min={3}
              max={30}
              step={1}
              value={settings.thresholds.stopCrit}
              onChange={th("stopCrit")}
            />
            <ThresholdSlider
              id="fuelLow"
              label="Combustible bajo"
              hint="Porcentaje de tanque que genera aviso."
              unit="%"
              min={10}
              max={50}
              step={1}
              value={settings.thresholds.fuelLow}
              onChange={th("fuelLow")}
            />
          </Section>
        </TabsContent>

        <TabsContent value="avisos" className="flex flex-col gap-4">
          <Section
            title="Qué avisos recibes"
            description="Cuida la atención del operador: menos ruido, más impacto."
          >
            {(
              [
                [
                  "crit",
                  "Críticos",
                  "Incumplimiento inminente de SLA, desvíos graves, detenciones largas.",
                ],
                [
                  "risk",
                  "En riesgo",
                  "Retrasos moderados, combustible bajo, congestión.",
                ],
                [
                  "info",
                  "Informativos",
                  "Optimizaciones completadas y cambios de estado.",
                ],
              ] as const
            ).map(([k, label, hint]) => (
              <Field key={k} label={label} hint={hint} htmlFor={`n-${k}`}>
                <Switch
                  id={`n-${k}`}
                  checked={settings.notify[k]}
                  onCheckedChange={(c) =>
                    patch({ notify: { ...settings.notify, [k]: c } })
                  }
                />
              </Field>
            ))}
            <Field
              label="Sonido en avisos críticos"
              hint="Un tono breve; se silencia con reducción de movimiento activa."
              htmlFor="sound"
            >
              <Switch
                id="sound"
                checked={settings.sound}
                onCheckedChange={(c) => patch({ sound: c })}
              />
            </Field>
          </Section>
          <Section title="Canales" description="Dónde se entregan los avisos.">
            {(
              [
                ["app", "En la aplicación"],
                ["email", "Correo electrónico"],
                ["sms", "SMS al supervisor de turno"],
              ] as const
            ).map(([k, label]) => (
              <Field key={k} label={label} htmlFor={`c-${k}`}>
                <Switch
                  id={`c-${k}`}
                  checked={settings.channels[k]}
                  onCheckedChange={(c) =>
                    patch({ channels: { ...settings.channels, [k]: c } })
                  }
                />
              </Field>
            ))}
          </Section>
        </TabsContent>

        <TabsContent value="operacion" className="flex flex-col gap-4">
          <Section title="Operación">
            <Field
              label="Frecuencia de telemetría"
              hint="Cada cuánto se actualiza la posición de la flota."
              htmlFor="refresh"
            >
              <Select
                value={String(settings.refreshSec)}
                onValueChange={(v) =>
                  patch({ refreshSec: Number(v) as S["refreshSec"] })
                }
              >
                <SelectTrigger id="refresh" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 10, 30].map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      Cada {s} segundos
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Zona horaria" htmlFor="tz">
              <Select
                value={settings.timezone}
                onValueChange={(v) => patch({ timezone: v })}
              >
                <SelectTrigger id="tz" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ZONES.map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Unidades de distancia" htmlFor="units">
              <ToggleGroup
                id="units"
                type="single"
                variant="outline"
                value={settings.units}
                onValueChange={(v) => v && patch({ units: v as S["units"] })}
                aria-label="Unidades de distancia"
              >
                <ToggleGroupItem value="km">Kilómetros</ToggleGroupItem>
                <ToggleGroupItem value="mi">Millas</ToggleGroupItem>
              </ToggleGroup>
            </Field>
          </Section>
        </TabsContent>

        <TabsContent value="apariencia" className="flex flex-col gap-4">
          <Section
            title="Apariencia"
            description="La carta de noche reduce el deslumbramiento en centros de control; la de día es para pantallas con luz."
          >
            <Field label="Tema">
              <ToggleGroup
                type="single"
                variant="outline"
                value={theme}
                onValueChange={(v) =>
                  v && setTheme(v as "dark" | "light" | "system")
                }
                aria-label="Tema"
              >
                <ToggleGroupItem value="dark">
                  <Moon /> Noche
                </ToggleGroupItem>
                <ToggleGroupItem value="light">
                  <Sun /> Día
                </ToggleGroupItem>
                <ToggleGroupItem value="system">
                  <Monitor /> Sistema
                </ToggleGroupItem>
              </ToggleGroup>
            </Field>
            <Field
              label="Densidad"
              hint="Más filas por pantalla para monitores grandes."
              htmlFor="density"
            >
              <ToggleGroup
                id="density"
                type="single"
                variant="outline"
                value={settings.density}
                onValueChange={(v) =>
                  v && patch({ density: v as S["density"] })
                }
                aria-label="Densidad"
              >
                <ToggleGroupItem value="comfortable">Cómoda</ToggleGroupItem>
                <ToggleGroupItem value="compact">Compacta</ToggleGroupItem>
              </ToggleGroup>
            </Field>
            <p className="text-xs text-muted-foreground">
              Atajo: pulsa <kbd className="rounded border px-1">D</kbd> en
              cualquier pantalla para alternar noche y día.
            </p>
          </Section>
        </TabsContent>

        <TabsContent value="integraciones" className="flex flex-col gap-4">
          <Section
            title="Integraciones"
            description="Conecta las fuentes de datos de tu operación. Hoy la plataforma muestra datos de ejemplo."
          >
            <ul className="divide-y rounded-md border">
              {INTEGRATIONS.map((i) => (
                <li key={i.name} className="flex items-center gap-3 px-3 py-3">
                  <Plug
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{i.name}</p>
                    <p className="text-xs text-muted-foreground">{i.desc}</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <StatusMark level="idle" /> No conectado
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toast.info(`Conector ${i.name}: próximamente`)
                    }
                  >
                    Conectar
                  </Button>
                </li>
              ))}
            </ul>
          </Section>
        </TabsContent>

        <TabsContent value="organizacion" className="flex flex-col gap-4">
          <Section title="Organización y operador">
            <Field label="Empresa" htmlFor="org">
              <Input
                id="org"
                value={settings.org.name}
                onChange={(e) =>
                  patch({ org: { ...settings.org, name: e.target.value } })
                }
              />
            </Field>
            <Field label="Operador" htmlFor="op">
              <Input
                id="op"
                value={settings.org.operator}
                onChange={(e) =>
                  patch({ org: { ...settings.org, operator: e.target.value } })
                }
              />
            </Field>
            <Field label="Rol" htmlFor="role">
              <Select
                value={settings.org.role}
                onValueChange={(v) =>
                  patch({ org: { ...settings.org, role: v } })
                }
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Despachador",
                    "Operador de monitoreo",
                    "Supervisor",
                    "Gerente de operaciones",
                  ].map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </Section>
        </TabsContent>
      </Tabs>

      <div
        className={`fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t bg-popover px-4 py-3 transition-transform md:left-[var(--sidebar-width)] ${
          dirty ? "translate-y-0" : "translate-y-full"
        }`}
        role="region"
        aria-label="Cambios sin guardar"
        aria-hidden={!dirty}
      >
        <p className="text-sm">Tienes cambios sin guardar.</p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            tabIndex={dirty ? 0 : -1}
            onClick={() => {
              reset()
              toast("Configuración restablecida a los valores por defecto")
            }}
          >
            Restablecer
          </Button>
          <Button
            tabIndex={dirty ? 0 : -1}
            onClick={() => {
              save()
              toast.success("Configuración guardada")
            }}
          >
            Guardar cambios
          </Button>
        </div>
      </div>
    </>
  )
}
