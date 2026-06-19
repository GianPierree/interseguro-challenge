// Package handlers contains the Fiber HTTP handlers for the Go API.
package handlers

import (
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"

	"github.com/interseguro/go-api/internal/agents"
	"github.com/interseguro/go-api/internal/specs"
)

// QRFactorizationHandler handles POST /api/matrix/qr
// It parses the input matrix, delegates to the QRAgent, and returns
// both the factorized matrices and the statistics from the Node.js API.
func QRFactorizationHandler(c *fiber.Ctx) error {
	var input specs.MatrixInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body: " + err.Error(),
		})
	}

	if len(input.Matrix) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "matrix must not be empty",
		})
	}

	agent := agents.NewQRAgent()
	result, err := agent.Run(input)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(result)
}

// GenerateToken handles POST /api/auth/token
// Issues a signed JWT for the provided credentials.
// In production, replace the hardcoded check with a real user store.
func GenerateToken(c *fiber.Ctx) error {
	var req specs.TokenRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	// Simple credential check — replace with DB lookup in production
	if req.Username != "admin" || req.Password != "interseguro" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid credentials",
		})
	}

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "super-secret-key"
	}

	claims := jwt.MapClaims{
		"sub": req.Username,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "could not generate token",
		})
	}

	return c.JSON(specs.TokenResponse{Token: signed})
}
