# Contribuir

## Ramas (GitFlow)

| Rama | Sale de | Entra a | Uso |
| --- | --- | --- | --- |
| `feature/*`, `fix/*`, `chore/*` | `develop` | `develop` | Trabajo diario |
| `release/x.y.z` | `develop` | `main` | Preparar una versión |
| `hotfix/x.y.z` | `main` | `main` y `develop` | Corrección urgente en producción |

Todo entra por Pull Request con **squash and merge**. El título del PR es el mensaje del commit y sigue Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`…). Después de integrar un `release/*` o `hotfix/*` en `main`, hay que traer esos cambios de vuelta a `develop`.

## Antes de abrir el PR

```bash
pnpm format:check && pnpm typecheck && pnpm lint && pnpm build
```

El CI ejecuta lo mismo, audita las dependencias de producción y construye la imagen Docker.

## Reglas

- Nada de secretos, tokens ni variables de entorno en el código o en commits. `.env*` está ignorado.
- Cada estado nuevo en la interfaz lleva color, forma y texto; nunca solo color (ver `DESIGN.md`).
- Los datos de la interfaz son de ejemplo y deben indicarlo.
