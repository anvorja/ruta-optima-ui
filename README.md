# RutaOptima · Torre de control

Plataforma B2B para planificar rutas, monitorear la flota en tiempo real y gestionar excepciones. Migración de `../mydashboard` a Vite 8 + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui.

## Comandos

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # tsc -b && vite build
pnpm lint
pnpm typecheck
```

## Rutas

| Ruta | Pantalla |
| --- | --- |
| `/` | Centro de control: indicadores, carta de operaciones, avisos, tablero de flota |
| `/live-map` | Mapa en vivo: carta a pantalla completa, capas, inspector de vehículo (`?v=V-002` enfoca un vehículo) |
| `/routes` | Planificador de rutas con optimización de orden de paradas |
| `/orders` | Órdenes con búsqueda (`?q=`) y filtros |
| `/fleet` | Gestión de flota |
| `/analytics` | Analíticas y exportación CSV |
| `/settings` | Umbrales de alerta, notificaciones, operación, apariencia, integraciones |

## Datos

No hay backend. Los datos son **de ejemplo** (`src/data`) y la telemetría se simula en `src/state/fleet-live.tsx`. Para conectar un TMS o telemática, sustituye ese proveedor manteniendo los tipos de `src/data/types.ts`.

## Diseño

Dirección visual: carta náutica nocturna. Ver `PRODUCT.md` (producto) y `DESIGN.md` (sistema visual). Los tokens están en `src/index.css`; el estado se codifica siempre con color + forma + texto (`src/components/status-mark.tsx`). Atajo: `D` alterna carta de noche y de día; `/` enfoca la búsqueda.

## Flujo de trabajo (GitFlow)

- `main`: producción. Solo recibe PR desde `release/*` y `hotfix/*`.
- `develop`: integración. Recibe PR desde `feature/*`, `fix/*` y `chore/*`.
- `feature/*`, `release/x.y.z`, `hotfix/x.y.z`: ramas de vida corta; se crean desde `develop` (o `main` en el caso de `hotfix`).
- Todo cambio entra por Pull Request con **squash and merge**; el título del PR es el mensaje del commit (Conventional Commits: `feat:`, `fix:`, `chore:`…).
- Los rulesets están en `.github/rulesets` (importar en Settings → Rules): PR obligatorio, sin borrar ni reescribir historial, checks requeridos `Calidad y build` e `Imagen Docker`.
- CI (`.github/workflows/ci.yml`): prettier, tsc, eslint, build, auditoría de dependencias y prueba de humo de la imagen Docker.
- La app es un SPA estático sin variables de entorno ni secretos. `.env*` está ignorado; no subas credenciales.

## Docker

```bash
docker build -t ruta-optima-dashboard .
docker run --rm -p 8080:8080 ruta-optima-dashboard   # http://localhost:8080 (/healthz para salud)
```

## Pendientes

- Etiquetas de «CENTRO» y «Base Central» se solapan con vehículos en la carta.
- Marco de carta (neatline y marcas) en los paneles; tipografía con más carácter cartográfico.
- Botones que dependen de un TMS real (importar Excel, nueva orden, editar, desactivar) solo muestran un aviso.
- Sin pruebas automáticas todavía (unitarias ni e2e).
- Despliegue: sin publicación de imagen ni destino definidos (Docker Hub, Render u otro). Ver `../referencia-github-api-drinks` como base.
- Revisar la rama con `npx impeccable update` (v4.5.0).
