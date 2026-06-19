# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache)
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /go-api ./cmd/server

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM alpine:3.19

WORKDIR /app

# Add CA certs for HTTPS calls to Node API
RUN apk --no-cache add ca-certificates

COPY --from=builder /go-api .

EXPOSE 3000

CMD ["./go-api"]
