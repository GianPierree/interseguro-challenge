// Package http contains the Fiber HTTP handlers.
// Handlers are interface adapters: they translate HTTP requests into
// use case inputs and use case outputs into HTTP responses.
// No business logic lives here.
package http

import (
	"errors"

	"github.com/gofiber/fiber/v2"

	"github.com/interseguro/go-api/internal/domain"
	"github.com/interseguro/go-api/internal/usecases"
)

// MatrixHandler handles all matrix-related HTTP endpoints.
// It depends on the QRUseCase, not on any infrastructure detail.
type MatrixHandler struct {
	qrUseCase *usecases.QRUseCase
}

// NewMatrixHandler constructs a MatrixHandler with its use case injected.
func NewMatrixHandler(qrUseCase *usecases.QRUseCase) *MatrixHandler {
	return &MatrixHandler{qrUseCase: qrUseCase}
}

// matrixRequest is the HTTP-layer DTO for incoming QR requests.
type matrixRequest struct {
	Matrix [][]float64 `json:"matrix"`
}

// HandleQR handles POST /api/matrix/qr
func (h *MatrixHandler) HandleQR(c *fiber.Ctx) error {
	var req matrixRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body: " + err.Error(),
		})
	}

	result, err := h.qrUseCase.Execute(usecases.QRUseCaseInput{
		Matrix: req.Matrix,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(result)
}

// AuthHandler handles authentication endpoints.
type AuthHandler struct {
	authUseCase *usecases.AuthUseCase
}

// NewAuthHandler constructs an AuthHandler.
func NewAuthHandler(authUseCase *usecases.AuthUseCase) *AuthHandler {
	return &AuthHandler{authUseCase: authUseCase}
}

// tokenResponse is the HTTP-layer DTO for auth responses.
type tokenResponse struct {
	Token string `json:"token"`
}

// HandleLogin handles POST /api/auth/token
func (h *AuthHandler) HandleLogin(c *fiber.Ctx) error {
	var creds domain.Credentials
	if err := c.BodyParser(&creds); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	token, err := h.authUseCase.Login(creds)
	if err != nil {
		if errors.Is(err, usecases.ErrInvalidCredentials) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "invalid credentials",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "could not generate token",
		})
	}

	return c.JSON(tokenResponse{Token: token})
}
