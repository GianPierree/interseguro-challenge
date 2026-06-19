// Package infrastructure is the outermost layer.
// It wires all dependencies together: reads config, constructs adapters,
// injects them into use cases, and mounts routes on the framework.
//
// This is the only place that knows about ALL layers simultaneously.
// Everything else depends only on layers inward from itself.
package infrastructure

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	adapterHTTP "github.com/interseguro/go-api/internal/adapters/http"
	"github.com/interseguro/go-api/internal/adapters/gateway"
	"github.com/interseguro/go-api/internal/adapters/middleware"
	"github.com/interseguro/go-api/internal/usecases"
)

// Start builds the dependency graph and starts the HTTP server.
// Dependency wiring order (outer → inner):
//
//	Config → Adapters → Use Cases → Handlers → Routes
func Start() error {
	// ── Config ───────────────────────────────────────────────────────────────
	port := getEnv("PORT", "3000")
	jwtSecret := getEnv("JWT_SECRET", "super-secret-key")
	nodeAPIURL := getEnv("NODE_API_URL", "http://node-api:4000")

	// ── Adapters (implementations of domain interfaces) ───────────────────────
	decomposer := gateway.NewGramSchmidtDecomposer()
	statsGateway := gateway.NewHTTPStatisticsGateway(nodeAPIURL)
	jwtSigner := gateway.NewJWTSigner(jwtSecret, 24*time.Hour)

	// ── Use Cases (injected with adapter implementations) ────────────────────
	qrUseCase := usecases.NewQRUseCase(decomposer, statsGateway)
	authUseCase := usecases.NewAuthUseCase(jwtSigner)

	// ── HTTP Handlers ─────────────────────────────────────────────────────────
	matrixHandler := adapterHTTP.NewMatrixHandler(qrUseCase)
	authHandler := adapterHTTP.NewAuthHandler(authUseCase)

	// ── Fiber app ─────────────────────────────────────────────────────────────
	app := fiber.New(fiber.Config{
		AppName: "Interseguro Go API v2.0",
	})

	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Authorization",
	}))

	// ── Routes ────────────────────────────────────────────────────────────────
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "go-api"})
	})

	app.Post("/api/auth/token", authHandler.HandleLogin)

	protected := app.Group("/api", middleware.JWTProtected())
	protected.Post("/matrix/qr", matrixHandler.HandleQR)

	log.Printf("🚀 Go API listening on port %s", port)
	return app.Listen(fmt.Sprintf(":%s", port))
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
