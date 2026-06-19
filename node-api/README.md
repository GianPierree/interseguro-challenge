# Node.js API — Statistics Service

Microservicio en **Node.js + Express** que recibe las matrices Q y R de la API Go y calcula estadísticas descriptivas.

## Stack

| Elemento | Tecnología |
|----------|-----------|
| Lenguaje | Node.js 20 |
| Framework | Express 4 |
| Tests | Jest + Supertest |
| Containerización | Docker (multi-stage) |

## Arquitectura SDD (Spec-Driven Development)

```
Handler → Agent → Service
```

- **Specs** (`src/specs/`): Contratos de datos + validación de entrada.
- **Agents** (`src/agents/`): Orquestadores de workflows.
- **Services** (`src/services/`): Funciones puras de estadística.
- **Handlers** (`src/handlers/`): Routers Express delgados.

## Endpoints

### `POST /api/matrix/stats`
Recibe matrices Q y R, retorna estadísticas.

```json
// Request
{
  "qrResult": {
    "Q": [[-0.169, 0.897], [-0.507, 0.276], [-0.845, -0.345]],
    "R": [[-5.916, -7.437], [0, 0.828]],
    "originalRows": 3,
    "originalCols": 2
  }
}

// Response
{
  "max": 0.897,
  "min": -7.437,
  "average": -1.083,
  "sum": -13.0,
  "isDiagonal": {
    "Q": false,
    "R": false
  }
}
```

### `GET /health`
Health check del servicio.

## Estadísticas calculadas

| Estadística | Descripción |
|-------------|-------------|
| `max` | Valor máximo entre todas las matrices |
| `min` | Valor mínimo entre todas las matrices |
| `average` | Promedio de todos los valores |
| `sum` | Suma total de todos los valores |
| `isDiagonal.Q` | Si Q es matriz diagonal |
| `isDiagonal.R` | Si R es matriz diagonal |

## Tests

```bash
npm test          # Ejecuta todos los tests con cobertura
npm run test:watch  # Modo watch
```

## Ejecución local

```bash
cp .env.example .env
npm install
npm run dev
```
