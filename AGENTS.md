# AGENTS.md — Instrucciones globales para agentes de IA

Este archivo es leído por agentes de IA (Claude Code, Cursor, Copilot, etc.)
antes de tocar cualquier archivo del repositorio.

---

## Contexto del proyecto

Sistema distribuido de **factorización QR de matrices** con tres servicios:

| Servicio | Tecnología | Puerto | Responsabilidad |
|----------|-----------|--------|----------------|
| `go-api` | Go 1.21 + Fiber v2 | 3000 | Recibe matriz, hace QR, reenvía a node-api |
| `node-api` | Node.js 20 + Express 4 | 4000 | Recibe Q y R, calcula estadísticas |
| `frontend` | Next.js 14 + TypeScript | 3001 | UI que consume go-api |

---

## Arquitectura: Clean Architecture

Todos los servicios siguen Clean Architecture. Las dependencias apuntan SIEMPRE hacia adentro:

```
infrastructure → adapters → usecases → domain
```

| Capa | Contiene | Puede importar |
|------|----------|---------------|
| `domain` | Entities, interfaces (ports) | Nada externo |
| `usecases` | Application business rules | Solo `domain` |
| `adapters` | Implementaciones de interfaces, routers HTTP | `usecases` + `domain` |
| `infrastructure` | Framework config, wiring, server start | Todo lo anterior |

**Regla de oro:** si necesitas agregar un import de una capa externa a una capa interna, la arquitectura está mal.

---

## SOLID — reglas que el agente debe respetar

- **SRP**: cada archivo tiene una sola razón de cambio. Lógica de negocio, HTTP y config van en archivos separados.
- **OCP**: extensiones via nuevas structs/funciones, sin modificar código existente.
- **DIP**: use cases dependen de interfaces (definidas en `domain`), nunca de implementaciones concretas.
- Los handlers/routers son delgados: parsean input, llaman al use case, serializan output. Sin lógica de negocio.

---

## Convenciones Go

- Packages en minúsculas: `domain`, `usecases`, `adapters`, `infrastructure`
- Errores wrapeados: `fmt.Errorf("contexto: %w", err)`
- Responses HTTP siempre como `fiber.Map{"error": "..."}` o struct tipado
- Sin `interface{}` crudo — usar structs del package `domain`
- Interfaces definidas en `domain/gateway.go`, implementadas en `adapters/gateway/`

## Convenciones Node.js

- CommonJS (`require`/`module.exports`), no ESM
- JSDoc en todas las funciones públicas
- Funciones de `domain/` deben ser **puras** (sin estado, sin side effects)
- Errores propagados con `next(err)` en Express
- Validación en `adapters/validators/`, nunca en `domain/` ni en `usecases/`

## Convenciones Frontend (TypeScript)

- `strict: true` — sin `any`
- Interfaces de datos en `src/services/matrixService.ts`
- Componentes funcionales con hooks
- Tailwind para estilos

---

## Estructura de archivos esperada

```
go-api/internal/
    domain/         ← entities + interfaces
    usecases/       ← application rules
    adapters/
        gateway/    ← implementaciones de interfaces domain
        http/       ← handlers Fiber
        middleware/ ← middleware Fiber
    infrastructure/ ← server setup + wiring

node-api/src/
    domain/         ← pure business functions
    usecases/       ← orchestration
    adapters/
        http/       ← Express routers
        validators/ ← request validation
    infrastructure/ ← server setup

frontend/src/
    components/     ← React components
    pages/          ← Next.js pages
    services/       ← API communication
    hooks/          ← custom hooks
```

---

## Docker

- Cada servicio tiene su propio `Dockerfile` multi-stage en su carpeta
- `docker-compose.yml` en la raíz del repositorio
- Variables sensibles en `.env` (ignorado por git), plantilla en `.env.example`
- `NODE_API_URL=http://node-api:4000` para Docker, `http://localhost:4000` para local

---

## Lo que el agente NO debe hacer

- Poner lógica de estadísticas en `go-api`
- Poner lógica de QR en `node-api`
- Importar capas externas desde capas internas (domain no importa adapters)
- Crear endpoints sin documentar en el `SPEC.md` del servicio correspondiente
- Agregar dependencias nuevas sin justificación
