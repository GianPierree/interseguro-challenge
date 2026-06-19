// Package domain contains the core business entities and rules.
// This layer has zero dependencies on frameworks, HTTP, or infrastructure.
// It is the innermost ring of Clean Architecture.
package domain

import "fmt"

// Matrix represents a rectangular 2D array of float64 values.
// It is the central entity of this system.
type Matrix struct {
	data [][]float64
	rows int
	cols int
}

// NewMatrix constructs a validated Matrix entity.
// Business rules enforced here:
//   - Must not be empty
//   - All rows must have the same number of columns
//   - rows >= cols (required for QR decomposition)
//   - Columns must not all be zero (linear independence check deferred to QR)
func NewMatrix(data [][]float64) (*Matrix, error) {
	if len(data) == 0 {
		return nil, fmt.Errorf("matrix must not be empty")
	}
	cols := len(data[0])
	if cols == 0 {
		return nil, fmt.Errorf("matrix columns must not be empty")
	}
	for i, row := range data {
		if len(row) != cols {
			return nil, fmt.Errorf("row %d has %d columns, expected %d", i, len(row), cols)
		}
	}
	if len(data) < cols {
		return nil, fmt.Errorf(
			"QR decomposition requires rows >= cols, got %dx%d",
			len(data), cols,
		)
	}
	return &Matrix{data: data, rows: len(data), cols: cols}, nil
}

// Data returns the underlying 2D slice.
func (m *Matrix) Data() [][]float64 { return m.data }

// Rows returns the number of rows.
func (m *Matrix) Rows() int { return m.rows }

// Cols returns the number of columns.
func (m *Matrix) Cols() int { return m.cols }

// QRResult holds the two factor matrices produced by QR decomposition.
// This is a domain value object — immutable once created.
type QRResult struct {
	Q            [][]float64 `json:"Q"`
	R            [][]float64 `json:"R"`
	OriginalRows int         `json:"originalRows"`
	OriginalCols int         `json:"originalCols"`
}

// Statistics holds the descriptive statistics computed by the Node.js service.
type Statistics struct {
	Max        float64     `json:"max"`
	Min        float64     `json:"min"`
	Average    float64     `json:"average"`
	Sum        float64     `json:"sum"`
	IsDiagonal DiagonalMap `json:"isDiagonal"`
}

// DiagonalMap reports whether each factor matrix is diagonal.
type DiagonalMap struct {
	Q bool `json:"Q"`
	R bool `json:"R"`
}

// Credentials holds login credentials for JWT generation.
type Credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
