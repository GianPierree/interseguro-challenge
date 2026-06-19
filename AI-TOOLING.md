# AI Tooling & Methodology — Interseguro Coding Challenge

Este documento describe los frameworks de IA utilizados, la metodología
de desarrollo y cómo se aplicó **Spec-Driven Design (SDD)** con agentes
a lo largo del proyecto.

---

## Herramienta de IA utilizada

| Herramienta | Rol en el proyecto |
|-------------|-------------------|
| **Claude (Anthropic)** | Generación de código, arquitectura, revisión SOLID, documentación |

El desarrollo completo fue asistido por **Claude Sonnet** via Claude.ai,
actuando como agente de desarrollo guiado por specs.

---

## Spec-Driven Design (SDD) — qué es y cómo se aplicó

### Concepto

Spec-Driven Design es una metodología donde las **especificaciones escritas**
(contratos de datos, reglas de negocio, contratos de API) se definen
**antes** de que el agente de IA escriba código. El agente lee la spec
y genera implementaciones que la satisfacen, en lugar de generar código
libre que luego hay que corregir.

```
Humano escribe SPEC → Agente IA lee SPEC → Agente genera código → Humano valida
         ↑_____________________________________________________|
                         ciclo iterativo
```

### Archivos de spec en este repositorio

| Archivo | Propósito |
|---------|-----------|
| `AGENTS.md` | Instrucciones globales: arquitectura, convenciones, reglas que aplican a todos los servicios |
| `go-api/SPEC.md` | Contrato completo del servicio Go: endpoints, tipos, flujo interno, restricciones |
| `node-api/SPEC.md` | Contrato completo del servicio Node.js |
| `frontend/SPEC.md` | Contrato del frontend: estados, componentes, tipos, restricciones |

### Cómo se usaron durante el desarrollo

**Fase 1 — Diseño de specs**
Antes de escribir una sola línea de código, se definieron los contratos:
- Qué endpoints expone cada servicio
- Qué tipos de datos entran y salen
- Qué capa puede importar qué (regla de dependencia de Clean Architecture)
- Qué está explícitamente prohibido en cada servicio

**Fase 2 — Generación guiada por spec**
El agente (Claude) recibía como contexto el `AGENTS.md` y el `SPEC.md`
del servicio en cuestión antes de generar cada archivo. Esto garantizó:
- Consistencia arquitectónica entre servicios
- Respeto de las capas de Clean Architecture
- Nombres de paquetes y funciones coherentes

**Fase 3 — Revisión y auditoría SOLID**
Tras la generación inicial, se realizó una auditoría SOLID explícita
donde el agente identificó las violaciones y propuso la refactorización
(carpeta `agents/` → capas `usecases/` + `adapters/`).

**Fase 4 — Iteración sobre errores reales**
Los errores de Docker (`public/` no encontrada, puerto incorrecto)
y de configuración local (`NODE_API_URL`) se resolvieron en ciclos
cortos donde el log de error era el input del agente.

---

## Arquitectura de agentes aplicada

El proyecto implementa el patrón de **agentes orquestadores** a nivel de código:

```
HTTP Request
    ↓
Handler (adapter)     ← traduce HTTP → dominio
    ↓
Use Case              ← orquesta el workflow como un "agente"
    ↓          ↓
Decomposer  Gateway   ← herramientas especializadas del agente
(QR math)  (HTTP→Node)
```

El `QRUseCase` actúa como agente: recibe una tarea (factorizar y obtener estadísticas),
delega en herramientas especializadas (`QRDecomposer`, `StatisticsGateway`),
y retorna el resultado compuesto. Las herramientas son intercambiables
porque el agente depende de interfaces, no de implementaciones (DIP).

---

## Open Specs — contratos públicos de API

### Go API — POST /api/matrix/qr

```
Input spec:
  matrix: number[][]   (rows >= cols, no vacía, sin columnas dependientes)

Output spec:
  qrResult.Q: number[][]        (matriz ortogonal rows×cols)
  qrResult.R: number[][]        (matriz triangular superior cols×cols)
  qrResult.originalRows: int
  qrResult.originalCols: int
  statistics.max: float64
  statistics.min: float64
  statistics.average: float64
  statistics.sum: float64
  statistics.isDiagonal.Q: bool
  statistics.isDiagonal.R: bool

Auth: Bearer JWT (HS256, 24h TTL)
Errors: { "error": "mensaje descriptivo" }
```

### Node API — POST /api/matrix/stats

```
Input spec:
  qrResult.Q: number[][]   (filas de numbers, no vacía)
  qrResult.R: number[][]   (filas de numbers, no vacía)

Output spec:
  max: float64
  min: float64
  average: float64   (6 decimales)
  sum: float64       (6 decimales)
  isDiagonal.Q: bool
  isDiagonal.R: bool

Auth: ninguna (servicio interno, solo accesible por go-api en red Docker)
```

---

## Principios de diseño aplicados

### Clean Architecture

```
domain → usecases → adapters → infrastructure
  ↑           ↑          ↑
sin deps   solo domain  impl. de interfaces
externas
```

La regla de dependencia se respeta en ambos servicios:
`domain/` no importa nada externo. `usecases/` solo importa `domain/`.

### SOLID

| Principio | Implementación concreta |
|-----------|------------------------|
| **SRP** | `GramSchmidtDecomposer` solo factoriza; `HTTPStatisticsGateway` solo llama HTTP; `matrixValidator.js` solo valida |
| **OCP** | Cambiar algoritmo QR = nueva struct en `adapters/gateway/`; `QRUseCase` no se modifica |
| **LSP** | `GramSchmidtDecomposer` implementa `QRDecomposer`; cualquier otra impl. es sustituible |
| **ISP** | `StatisticsGateway`, `QRDecomposer`, `TokenSigner` son interfaces de un solo método |
| **DIP** | `QRUseCase` recibe interfaces por constructor, nunca instancia sus dependencias |

---

## Estructura de documentación del repositorio

```
interseguro-challenge/
├── README.md          ← inicio rápido, arquitectura general, decisiones técnicas
├── AGENTS.md          ← instrucciones para agentes de IA (este proyecto)
├── AI-TOOLING.md      ← este archivo
├── go-api/
│   ├── README.md      ← instrucciones del servicio Go
│   └── SPEC.md        ← spec completa para agentes de IA
├── node-api/
│   ├── README.md      ← instrucciones del servicio Node.js
│   └── SPEC.md        ← spec completa para agentes de IA
└── frontend/
    ├── README.md      ← instrucciones del frontend
    └── SPEC.md        ← spec completa para agentes de IA
```
