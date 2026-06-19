# Go API — QR Factorization Service

Microservicio en **Go + Fiber** que recibe una matriz rectangular, realiza la **descomposición QR** mediante el proceso de Gram-Schmidt, y reenvía las matrices resultantes (Q, R) al servicio Node.js para el cálculo de estadísticas.

## Stack

| Elemento | Tecnología |
|----------|-----------|
| Lenguaje | Go 1.21 |
| Framework | Fiber v2 |
| Auth | JWT (HS256) |
| Containerización | Docker (multi-stage) |

## Arquitectura SDD (Spec-Driven Development)

```
Handler → Agent → Service
           ↓
       Node.js API
```

- **Specs** (`internal/specs/`): Contratos de datos tipados que definen inputs/outputs de cada operación.
- **Agents** (`internal/agents/`): Orquestadores que coordinan servicios y comunicación entre APIs.
- **Services** (`internal/services/`): Lógica de negocio pura (matemáticas, sin dependencias HTTP).
- **Handlers** (`internal/handlers/`): Capa HTTP delgada que parsea request y delega al agent.

## Endpoints

### `POST /api/auth/token` (público)
Genera un JWT válido por 24 horas.

```json
// Request
{ "username": "admin", "password": "interseguro" }

// Response
{ "token": "eyJ..." }
```

### `POST /api/matrix/qr` 🔒 (requiere Bearer JWT)
Factoriza la matriz y devuelve Q, R + estadísticas del Node API.

```json
// Request
{
  "matrix": [
    [1, 2],
    [3, 4],
    [5, 6]
  ]
}

// Response
{
  "qrResult": {
    "Q": [[...], ...],
    "R": [[...], ...],
    "originalRows": 3,
    "originalCols": 2
  },
  "statistics": {
    "max": 6,
    "min": 1,
    "average": 3.5,
    "sum": 21,
    "isDiagonal": { "Q": false, "R": false }
  }
}
```

### `GET /health`
Health check del servicio.

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `3000` | Puerto del servidor |
| `JWT_SECRET` | `super-secret-key` | Secreto para firmar JWT |
| `NODE_API_URL` | `http://node-api:4000` | URL del servicio Node.js |

## Ejecución local

```bash
cp .env.example .env
go mod download
go run ./cmd/server
```

## Docker

```bash
docker build -t interseguro-go-api .
docker run -p 3000:3000 interseguro-go-api
```
