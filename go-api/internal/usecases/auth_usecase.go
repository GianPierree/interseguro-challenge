package usecases

import (
	"errors"

	"github.com/interseguro/go-api/internal/domain"
)

// AuthUseCase handles credential validation and token generation.
// The signing mechanism is injected via the TokenSigner interface (DIP).
type AuthUseCase struct {
	signer domain.TokenSigner
}

// NewAuthUseCase constructs the auth use case.
func NewAuthUseCase(signer domain.TokenSigner) *AuthUseCase {
	return &AuthUseCase{signer: signer}
}

// ErrInvalidCredentials is returned when credentials do not match.
var ErrInvalidCredentials = errors.New("invalid credentials")

// Login validates credentials and returns a signed token.
// Credential storage is intentionally simple for this challenge.
// In production, replace with a UserRepository interface.
func (uc *AuthUseCase) Login(creds domain.Credentials) (string, error) {
	if creds.Username != "admin" || creds.Password != "interseguro" {
		return "", ErrInvalidCredentials
	}
	return uc.signer.Sign(creds.Username)
}
