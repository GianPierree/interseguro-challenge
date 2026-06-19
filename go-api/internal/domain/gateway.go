// Package domain — gateway interfaces.
// Interfaces are defined HERE (inner layer) and implemented in the adapters
// layer (outer layer). This is the Dependency Inversion Principle in practice:
// high-level policy (use cases) depends on abstractions, not on concrete HTTP.
package domain

// StatisticsGateway is the port that the use case depends on to obtain
// statistics from an external service. The use case never knows whether
// the implementation talks HTTP, gRPC, or reads from a file.
//
// Any adapter that satisfies this interface can be injected.
type StatisticsGateway interface {
	FetchStatistics(qr QRResult) (*Statistics, error)
}

// QRDecomposer is the port for the QR factorization algorithm.
// Keeping it as an interface allows swapping implementations
// (e.g. Gram-Schmidt → Householder) without touching the use case.
type QRDecomposer interface {
	Decompose(m *Matrix) (Q, R [][]float64, err error)
}

// TokenSigner is the port for generating signed auth tokens.
type TokenSigner interface {
	Sign(username string) (string, error)
}
