# SPEC.md — Go API (QR Factorization Service)

Leído por agentes de IA antes de modificar cualquier archivo en `go-api/`.
Ver también `AGENTS.md` en la raíz para las reglas globales.

---

## Arquitectura: Clean Architecture + SOLID

```
cmd/server/main.go          ← entry point (carga .env, llama a infrastructure)
internal/
├── domain/                 ← Entities: structs + interfaces puras (sin dependencias)
│   ├── matrix.go           ← Matrix entity, QRResult, Statistics, Credentials
│   └── gateway.go          ← interfaces: StatisticsGateway, QRDecomposer, TokenSigner
├── usecases/               ← Application Business Rules
│   ├── qr_usecase.go       ← orquesta: Matrix entity → QRDecomposer → StatisticsGateway
│   └── auth_usecase.go     ← valida credenciales → TokenSigner
├── adapters/               ← Interface Adapters (implementan interfaces del domain)
│   ├── gateway/
│   │   ├── qr_decomposer.go       ← GramSchmidtDecomposer implements QRDecomposer
│   │   ├── statistics_gateway.go  ← HTTPStatisticsGateway implements StatisticsGateway
│   │   └── jwt_signer.go          ← JWTSigner implements TokenSigner
│   ├── http/
│   │   └── handlers.go            ← MatrixHandler, AuthHandler (Fiber)
│   └── middleware/
│       └── jwt.go                 ← JWT Bearer validation
└── infrastructure/
    └── server.go           ← wiring: construye adapters → inyecta en use cases → monta rutas
```

### Principios SOLID aplicados

| Principio | Dónde |
|-----------|-------|
| **SRP** | Cada struct tiene una sola razón de cambio |
| **OCP** | Nuevo algoritmo QR = nueva struct en `adapters/gateway/`, use case sin cambios |
| **LSP** | Cualquier `QRDecomposer` puede sustituir a `GramSchmidtDecomposer` |
| **ISP** | `StatisticsGateway`, `QRDecomposer` y `TokenSigner` son interfaces mínimas |
| **DIP** | `QRUseCase` depende de interfaces del domain, nunca de implementaciones concretas |

---

## Flujo de dependencias (regla de dependencia)

```
infrastructure → adapters → usecases → domain
                                  ↑
                            (interfaces aquí)
                                  ↑
                         adapters implementan
```

Las flechas apuntan SIEMPRE hacia adentro. El domain no importa nada externo.

---

## Endpoints

### `POST /api/auth/token` — público
```json
// Request
{ "username": "admin", "password": "interseguro" }

// Response 200
{ "token": "eyJ..." }

// Response 401
{ "error": "invalid credentials" }
```

### `POST /api/matrix/qr` — 🔒 Bearer JWT
```json
// Request
{ "matrix": [[1,2],[3,4],[5,6]] }

// Response 200
{
  "qrResult": { "Q": [[...]], "R": [[...]], "originalRows": 3, "originalCols": 2 },
  "statistics": { "max": 0.897, "min": -7.437, "average": -1.08, "sum": -13.0,
                  "isDiagonal": { "Q": false, "R": false } }
}

// Response 400 — validación de dominio
{ "error": "invalid matrix: QR decomposition requires rows >= cols, got 2x3" }

// Response 500 — gateway falla
{ "error": "statistics gateway failed: http call to node-api failed: ..." }
```

### `GET /health` — público
```json
{ "status": "ok", "service": "go-api" }
```

---

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `3000` | Puerto Fiber |
| `JWT_SECRET` | `super-secret-key` | Secreto HS256 |
| `NODE_API_URL` | `http://node-api:4000` | URL node-api (Docker). Usar `http://localhost:4000` en local |

---

## Qué NO agregar

- Lógica de estadísticas → va en `node-api`
- Lógica de negocio en `handlers.go` o `server.go`
- Imports de `adapters` o `infrastructure` desde `domain` o `usecases`
- Nuevos endpoints sin actualizar este SPEC.md
