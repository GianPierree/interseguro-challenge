# SPEC.md — Node.js API (Statistics Service)

Leído por agentes de IA antes de modificar cualquier archivo en `node-api/`.
Ver también `AGENTS.md` en la raíz para las reglas globales.

---

## Arquitectura: Clean Architecture + SOLID

```
src/
├── domain/
│   └── statistics.js          ← reglas de negocio puras (sin deps externas)
├── usecases/
│   └── computeStats.js        ← orquesta: llama a domain, retorna resultado
├── adapters/
│   ├── http/
│   │   └── matrixRouter.js    ← Express router: HTTP → use case → HTTP
│   └── validators/
│       └── matrixValidator.js ← valida el request antes de entrar al use case
└── infrastructure/
    └── server.js              ← Express app, middleware, rutas, start
index.js                       ← entry point, delega a infrastructure
```

### Principios SOLID aplicados

| Principio | Dónde |
|-----------|-------|
| **SRP** | `statistics.js` solo calcula; `matrixValidator.js` solo valida; `matrixRouter.js` solo traduce HTTP |
| **OCP** | Nueva estadística = nueva función en `statistics.js`, sin modificar el use case |
| **LSP** | N/A (no hay jerarquía de clases en este servicio) |
| **ISP** | Cada módulo expone solo las funciones que necesita quien lo importa |
| **DIP** | `computeStats.js` depende de `domain/statistics.js`, no de Express ni de HTTP |

---

## Flujo de dependencias

```
infrastructure → adapters → usecases → domain
```

`domain/statistics.js` no importa nada. Es la capa más interna.

---

## Endpoint

### `POST /api/matrix/stats`
```json
// Request
{
  "qrResult": {
    "Q": [[-0.169, 0.897], [-0.507, 0.276], [-0.845, -0.345]],
    "R": [[-5.916, -7.437], [0, 0.828]]
  }
}

// Response 200
{
  "max": 0.897,
  "min": -7.437,
  "average": -1.083,
  "sum": -13.0,
  "isDiagonal": { "Q": false, "R": false }
}

// Response 400
{ "error": "Missing required field: qrResult" }
```

### `GET /health`
```json
{ "status": "ok", "service": "node-api" }
```

---

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `4000` | Puerto Express |

---

## Tests

```bash
npm test          # corre Jest con cobertura
npm run test:watch
```

- `tests/statisticsService.test.js` → tests unitarios de `domain/statistics.js`
- `tests/matrixHandler.test.js`     → tests de integración vía Supertest

---

## Qué NO agregar

- Lógica de QR → va en `go-api`
- Auth JWT → este servicio es interno
- Lógica de negocio en `matrixRouter.js` o `server.js`
- Funciones con estado en `domain/statistics.js` (deben ser puras)
- Nuevos endpoints sin actualizar este SPEC.md
