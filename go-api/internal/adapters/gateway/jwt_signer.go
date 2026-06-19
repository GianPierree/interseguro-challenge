package gateway

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTSigner implements domain.TokenSigner using HS256 JWT tokens.
type JWTSigner struct {
	secret []byte
	ttl    time.Duration
}

// NewJWTSigner constructs a JWTSigner with the given secret and TTL.
func NewJWTSigner(secret string, ttl time.Duration) *JWTSigner {
	return &JWTSigner{
		secret: []byte(secret),
		ttl:    ttl,
	}
}

// Sign creates a signed JWT for the given subject (username).
// Implements domain.TokenSigner.
func (s *JWTSigner) Sign(username string) (string, error) {
	claims := jwt.MapClaims{
		"sub": username,
		"exp": time.Now().Add(s.ttl).Unix(),
		"iat": time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(s.secret)
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}
	return signed, nil
}
