# SPEC.md — Frontend (QR Matrix Tool)

Leído por agentes de IA antes de modificar cualquier archivo en `frontend/`.
Ver también `AGENTS.md` en la raíz para las reglas globales.

---

## Responsabilidad de este servicio

- Permitir al usuario autenticarse con la `go-api` para obtener un JWT
- Recibir una matriz ingresada manualmente en formato JSON
- Enviarla a `go-api` y mostrar los resultados: matrices Q y R + estadísticas
- El frontend **solo habla con `go-api`** — nunca llama directamente a `node-api`

---

## Stack

| Elemento | Valor |
|----------|-------|
| Framework | Next.js 14 (Pages Router) |
| Lenguaje | TypeScript (strict) |
| Estilos | Tailwind CSS v3 |
| HTTP | Axios |
| Fuentes | Inter (UI), JetBrains Mono (matrices/números) |

---

## Estructura de archivos

```
frontend/src/
├── pages/
│   ├── _app.tsx          ← configura globals.css
│   └── index.tsx         ← página principal (única página)
├── components/
│   ├── LoginForm.tsx      ← formulario de login, llama a matrixService.login()
│   ├── MatrixInput.tsx    ← textarea JSON + validación + botón submit
│   ├── MatrixDisplay.tsx  ← renderiza una matriz 2D como tabla HTML
│   └── StatsDisplay.tsx   ← renderiza las estadísticas en tarjetas
├── services/
│   └── matrixService.ts   ← toda la comunicación HTTP con go-api
└── styles/
    └── globals.css        ← Tailwind base + fuentes Google
```

---

## Estados de la aplicación (`index.tsx`)

La página maneja un estado `AppState` con 5 valores:

```
"login"   → muestra LoginForm
"ready"   → muestra MatrixInput (usuario autenticado)
"loading" → MatrixInput deshabilitado mientras se procesa
"result"  → muestra MatrixInput + MatrixDisplay(Q) + MatrixDisplay(R) + StatsDisplay
"error"   → muestra MatrixInput + mensaje de error
```

Transiciones:
```
login ──(onLogin)──► ready
ready ──(submit)───► loading ──(success)──► result
                              └─(error)───► error
result/error ──(submit again)──► loading
any ──(logout)──► login
```

---

## Contratos de tipos (`src/services/matrixService.ts`)

```ts
interface QRResult {
  Q: number[][];
  R: number[][];
  originalRows: number;
  originalCols: number;
}

interface DiagonalCheck {
  Q: boolean;
  R: boolean;
}

interface Statistics {
  max: number;
  min: number;
  average: number;
  sum: number;
  isDiagonal: DiagonalCheck;
}

interface MatrixResponse {
  qrResult: QRResult;
  statistics: Statistics;
}
```

Estas interfaces son la fuente de verdad para todos los componentes.
Los componentes nunca definen sus propios tipos para datos de API.

---

## Funciones del service (`src/services/matrixService.ts`)

| Función | Descripción |
|---------|-------------|
| `login(username, password)` | POST `/api/auth/token` → guarda JWT en módulo, retorna el token |
| `factorizeMatrix(matrix)` | POST `/api/matrix/qr` con Bearer JWT → retorna `MatrixResponse` |
| `setToken(token)` | Almacena el JWT en una variable de módulo |
| `clearToken()` | Limpia el JWT (logout) |

El JWT se guarda en una **variable de módulo** (`let _token`), no en localStorage.
Esto es intencional — se pierde al recargar la página (comportamiento esperado).

---

## Componentes

### `LoginForm.tsx`
- Props: `{ onLogin: () => void }`
- Llama a `matrixService.login()` al hacer click
- Muestra error si las credenciales fallan o el servidor no responde
- Valores por defecto en inputs: `username="admin"`, `password="interseguro"`

### `MatrixInput.tsx`
- Props: `{ onSubmit: (matrix: number[][]) => void, disabled?: boolean }`
- Textarea con JSON de ejemplo pre-cargado (matriz 3×2)
- Validaciones **antes** de llamar `onSubmit`:
  1. JSON parseable
  2. Es array de arrays
  3. Todas las filas tienen la misma longitud
  4. Todos los valores son `number`
  5. `rows >= cols` (requerimiento de QR)
- Muestra el error de validación inline en rojo

### `MatrixDisplay.tsx`
- Props: `{ label: string, matrix: number[][] }`
- Renderiza la matriz como `<table>` con fuente monoespaciada
- Valores formateados con `.toFixed(6)`

### `StatsDisplay.tsx`
- Props: `{ stats: Statistics }`
- Muestra 4 tarjetas numéricas: max, min, average, sum
- Muestra 2 tarjetas booleanas: isDiagonal.Q, isDiagonal.R
- Booleanos con iconos: `✅ Sí` / `❌ No`

---

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `NEXT_PUBLIC_GO_API_URL` | `http://localhost:3000` | URL base de go-api |

Usar `NEXT_PUBLIC_` prefix porque es accedida en el browser.

---

## Paleta de colores (Tailwind custom)

Definida en `tailwind.config.js`:

```js
colors: {
  brand: {
    blue:      "#0057A8",   // color primario Interseguro
    lightBlue: "#00AEEF",   // acento
    dark:      "#00356B",   // hover / títulos
  }
}
```

Usar solo estas clases custom para colores de marca: `bg-brand-blue`, `text-brand-dark`, etc.
No usar clases de color de Tailwind base (blue-500, etc.) para elementos de marca.

---

## Qué NO agregar al frontend

- Llamadas directas a `node-api` (puerto 4000) — todo pasa por `go-api`
- Estado global (Redux, Zustand, Context) — el estado local de `index.tsx` es suficiente
- Rutas adicionales (`/pages/*.tsx`) sin actualizar este SPEC.md
- `localStorage` o `sessionStorage` para el JWT
- Componentes de tabla con librerías externas — usar `<table>` HTML nativo
