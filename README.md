# Interseguro Coding Challenge — División TI

Solución al desafío técnico de Interseguro (Junio 2024). Sistema de **factorización QR de matrices** distribuido en tres servicios independientes.

---

## Arquitectura general

```
┌─────────────┐      JWT      ┌──────────────────────────────────────┐
│   Frontend  │ ────────────► │           Go API  :3000              │
│  Next.js 14 │  POST /qr     │  Fiber · QR Decomposition (Gram-     │
│    :3001    │ ◄──────────── │  Schmidt) · JWT Auth                 │
└─────────────┘   Q, R +      └──────────────┬───────────────────────┘
                  stats                       │ HTTP POST /stats
                                              ▼
                                 ┌────────────────────────┐
                                 │     Node.js API :4000  │
                                 │  Express · Statistics  │
                                 │  max, min, avg, sum,   │
                                 │  isDiagonal(Q), (R)    │
                                 └────────────────────────┘
```

---

## Diseño: Clean Architecture + SOLID

Ambas APIs siguen **Clean Architecture**. Las dependencias apuntan siempre hacia adentro:

```
infrastructure → adapters → usecases → domain
```

| Capa | Responsabilidad |
|------|----------------|
| **domain** | Entities y ports (interfaces). Sin dependencias externas. |
| **usecases** | Reglas de negocio de la aplicación. Solo importa `domain`. |
| **adapters** | Implementan las interfaces del domain (HTTP gateway, JWT, Gram-Schmidt). |
| **infrastructure** | Wiring de dependencias, configuración del framework, arranque del servidor. |

### SOLID en práctica

| Principio | Ejemplo concreto |
|-----------|-----------------|
| **SRP** | `GramSchmidtDecomposer` solo factoriza; `HTTPStatisticsGateway` solo llama al Node API |
| **OCP** | Cambiar algoritmo QR = nueva struct en `adapters/gateway/`, `QRUseCase` sin tocar |
| **LSP** | `GramSchmidtDecomposer` y cualquier futura impl. son intercambiables vía `QRDecomposer` |
| **ISP** | `StatisticsGateway`, `QRDecomposer` y `TokenSigner` son interfaces mínimas y enfocadas |
| **DIP** | `QRUseCase` depende de interfaces del domain, nunca del `http.Client` directamente |

---

## Stack tecnológico

| Servicio | Lenguaje | Framework | Puerto |
|----------|----------|-----------|--------|
| Go API | Go 1.21 | Fiber v2 | 3000 |
| Node API | Node.js 20 | Express 4 | 4000 |
| Frontend | TypeScript | Next.js 14 | 3001 |

---

## Estructura del repositorio

```
interseguro-challenge/
├── docker-compose.yml
├── AGENTS.md                        ← instrucciones para agentes de IA
├── go-api/
│   ├── SPEC.md                      ← spec del servicio para agentes de IA
│   ├── cmd/server/main.go
│   └── internal/
│       ├── domain/                  ← entities + interfaces (ports)
│       ├── usecases/                ← application business rules
│       ├── adapters/
│       │   ├── gateway/             ← QR decomposer, stats gateway, JWT signer
│       │   ├── http/                ← Fiber handlers
│       │   └── middleware/          ← JWT middleware
│       └── infrastructure/          ← server wiring
├── node-api/
│   ├── SPEC.md
│   └── src/
│       ├── domain/                  ← pure statistics functions
│       ├── usecases/                ← orchestration
│       ├── adapters/
│       │   ├── http/                ← Express routers
│       │   └── validators/          ← request validation
│       └── infrastructure/          ← server setup
└── frontend/
    ├── SPEC.md
    └── src/
        ├── components/
        ├── pages/
        └── services/
```

---

## Funcionalidades implementadas

### Requeridas ✅
- [x] API Go (Fiber) con factorización QR
- [x] API Node.js (Express) con estadísticas (max, min, promedio, suma, diagonal)
- [x] Comunicación HTTP entre servicios (Go → Node.js)
- [x] Docker para cada servicio
- [x] docker-compose en la raíz

### Opcionales ✅
- [x] Frontend (Next.js 14) que consume ambas APIs
- [x] JWT para proteger las consultas a las APIs
- [x] Tests unitarios y de integración (Node.js API con Jest + Supertest)

---

## Inicio rápido

### Con Docker Compose (recomendado)

```bash
git clone <repo-url>
cd interseguro-challenge
cp .env.example .env
docker compose up --build
```

Servicios disponibles:
- Frontend: http://localhost:3001
- Go API:   http://localhost:3000
- Node API: http://localhost:4000

### Ejecución local por servicio

Cada servicio se levanta en una terminal separada, en este orden:

**Terminal 1 — Node API** (debe estar arriba antes que el Go API)
```bash
cd node-api
cp .env.example .env
npm install
npm run dev
# → corriendo en http://localhost:4000
```

**Terminal 2 — Go API**
```bash
cd go-api
cp .env.example .env
```

> ⚠️ **Importante:** Edita `go-api/.env` y cambia `NODE_API_URL` a `localhost`.
> El valor por defecto (`node-api`) es el hostname de red de Docker y no funciona en local.

```
# go-api/.env
PORT=3000
JWT_SECRET=change-me-in-production
NODE_API_URL=http://localhost:4000
```

```bash
go mod download
go run ./cmd/server
# → corriendo en http://localhost:3000
```

**Terminal 3 — Frontend**
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
# → corriendo en http://localhost:3001
```

---

## Uso de la API

### 1. Obtener JWT

```bash
curl -X POST http://localhost:3000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"interseguro"}'
```

### 2. Factorizar una matriz

```bash
curl -X POST http://localhost:3000/api/matrix/qr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"matrix":[[1,2],[3,4],[5,6]]}'
```

**Respuesta:**
```json
{
  "qrResult": {
    "Q": [[-0.16903, 0.89709], [-0.50709, 0.27603], [-0.84515, -0.34503]],
    "R": [[-5.91608, -7.43736], [0, 0.82808]],
    "originalRows": 3,
    "originalCols": 2
  },
  "statistics": {
    "max": 0.89709,
    "min": -7.43736,
    "average": -1.08326,
    "sum": -13.0,
    "isDiagonal": { "Q": false, "R": false }
  }
}
```

---

## Tests

```bash
cd node-api
npm install
npm test
```

---

## Decisiones técnicas

**¿Por qué Clean Architecture y no MVC?**
MVC mezcla responsabilidades cuando la aplicación crece. Con Clean Architecture el domain nunca sabe que existe Express o Fiber — si mañana migras de Fiber a Echo solo tocas `infrastructure/`.

**¿Por qué interfaces en el domain para el QR y el gateway HTTP?**
Aplicación directa del DIP. El `QRUseCase` no sabe si el algoritmo es Gram-Schmidt o Householder, ni si el gateway llama HTTP o gRPC. Esto hace el sistema testeable con mocks sin levantar servidores reales.

**¿Por qué Gram-Schmidt para QR?**
Implementación directa sin dependencias externas de álgebra lineal, clara y auditable. Al estar detrás de la interfaz `QRDecomposer`, cambiar a Householder es solo agregar una nueva struct.

**¿Por qué la estadística combina Q y R?**
El enunciado pide estadísticas sobre "los datos de las matrices devueltas" (plural), por lo que se calculan sobre el conjunto {Q, R}. El check diagonal se aplica individualmente a cada una.
