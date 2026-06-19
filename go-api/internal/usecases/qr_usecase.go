// Package usecases contains application-specific business rules.
// Use cases orchestrate the flow of data to and from entities,
// and direct those entities to use their business rules to achieve goals.
//
// This layer depends ONLY on the domain layer.
// It knows nothing about HTTP, Fiber, or any framework.
package usecases

import (
	"fmt"

	"github.com/interseguro/go-api/internal/domain"
)

// QRUseCaseInput is the raw input coming from the delivery layer.
type QRUseCaseInput struct {
	Matrix [][]float64
}

// QRUseCaseOutput is the structured result returned to the delivery layer.
type QRUseCaseOutput struct {
	QRResult   domain.QRResult   `json:"qrResult"`
	Statistics domain.Statistics `json:"statistics"`
}

// QRUseCase orchestrates the QR factorization workflow:
//  1. Validate and construct the Matrix entity
//  2. Decompose via the injected QRDecomposer
//  3. Fetch statistics via the injected StatisticsGateway
//
// Both dependencies are interfaces defined in the domain layer (DIP).
// The use case is completely agnostic of transport and infrastructure.
type QRUseCase struct {
	decomposer domain.QRDecomposer
	gateway    domain.StatisticsGateway
}

// NewQRUseCase constructs the use case with its required dependencies.
// Dependencies are injected — never instantiated inside the use case (DIP).
func NewQRUseCase(
	decomposer domain.QRDecomposer,
	gateway domain.StatisticsGateway,
) *QRUseCase {
	return &QRUseCase{
		decomposer: decomposer,
		gateway:    gateway,
	}
}

// Execute runs the full QR → statistics pipeline.
func (uc *QRUseCase) Execute(input QRUseCaseInput) (*QRUseCaseOutput, error) {
	// ── Step 1: Construct and validate the domain entity ────────────────────
	matrix, err := domain.NewMatrix(input.Matrix)
	if err != nil {
		return nil, fmt.Errorf("invalid matrix: %w", err)
	}

	// ── Step 2: Decompose (delegated to injected port) ───────────────────────
	Q, R, err := uc.decomposer.Decompose(matrix)
	if err != nil {
		return nil, fmt.Errorf("qr decomposition failed: %w", err)
	}

	qrResult := domain.QRResult{
		Q:            Q,
		R:            R,
		OriginalRows: matrix.Rows(),
		OriginalCols: matrix.Cols(),
	}

	// ── Step 3: Fetch statistics (delegated to injected gateway) ────────────
	stats, err := uc.gateway.FetchStatistics(qrResult)
	if err != nil {
		return nil, fmt.Errorf("statistics gateway failed: %w", err)
	}

	return &QRUseCaseOutput{
		QRResult:   qrResult,
		Statistics: *stats,
	}, nil
}
