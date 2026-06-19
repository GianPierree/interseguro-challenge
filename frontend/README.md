# Frontend — QR Matrix Tool

Aplicación **Next.js 14 + Tailwind CSS** que consume la Go API para factorización QR y muestra las estadísticas retornadas por el Node.js API.

## Flujo de uso

1. Login → obtiene JWT de la Go API
2. Ingresa matriz JSON → Go API factoriza y reenvía a Node API
3. Frontend muestra matrices Q, R + estadísticas

## Ejecución local

```bash
cp .env.example .env.local
npm install
npm run dev
# → http://localhost:3001
```

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `NEXT_PUBLIC_GO_API_URL` | `http://localhost:3000` | URL del servicio Go |
