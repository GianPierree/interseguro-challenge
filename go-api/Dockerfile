# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy everything first, then run tidy+build in one step
# (go mod tidy needs the source to resolve all imports)
COPY . .
RUN go mod tidy && \
    CGO_ENABLED=0 GOOS=linux go build -o /go-api ./cmd/server

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM alpine:3.19

WORKDIR /app

RUN apk --no-cache add ca-certificates

COPY --from=builder /go-api .

EXPOSE 3000

CMD ["./go-api"]