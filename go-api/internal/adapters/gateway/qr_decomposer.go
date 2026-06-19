// Package gateway contains adapter implementations for the domain ports.
// This is the outer layer — it knows about infrastructure details
// (HTTP clients, math libraries) but is always hidden behind interfaces.
package gateway

import (
	"fmt"
	"math"

	"github.com/interseguro/go-api/internal/domain"
)

// GramSchmidtDecomposer implements domain.QRDecomposer using the
// Modified Gram-Schmidt orthogonalization process.
// Swapping to Householder only requires a new struct — the use case is untouched (OCP).
type GramSchmidtDecomposer struct{}

// NewGramSchmidtDecomposer returns a new GramSchmidtDecomposer.
func NewGramSchmidtDecomposer() *GramSchmidtDecomposer {
	return &GramSchmidtDecomposer{}
}

// Decompose performs QR factorization such that A = Q * R.
// Q is orthogonal (rows × cols), R is upper-triangular (cols × cols).
func (g *GramSchmidtDecomposer) Decompose(m *domain.Matrix) (Q, R [][]float64, err error) {
	data := m.Data()
	rows := m.Rows()
	cols := m.Cols()

	// Extract column vectors from A
	A := make([][]float64, cols)
	for j := 0; j < cols; j++ {
		A[j] = make([]float64, rows)
		for i := 0; i < rows; i++ {
			A[j][i] = data[i][j]
		}
	}

	qCols := make([][]float64, cols)
	R = make([][]float64, cols)
	for j := range R {
		R[j] = make([]float64, cols)
	}

	for j := 0; j < cols; j++ {
		v := make([]float64, rows)
		copy(v, A[j])

		for i := 0; i < j; i++ {
			dot := dotProduct(qCols[i], A[j])
			R[i][j] = dot
			for k := 0; k < rows; k++ {
				v[k] -= dot * qCols[i][k]
			}
		}

		norm := vectorNorm(v)
		if norm < 1e-10 {
			return nil, nil, fmt.Errorf(
				"columns are linearly dependent (norm ≈ 0 at column %d)", j,
			)
		}
		R[j][j] = norm

		qCols[j] = make([]float64, rows)
		for k := 0; k < rows; k++ {
			qCols[j][k] = v[k] / norm
		}
	}

	Q = make([][]float64, rows)
	for i := 0; i < rows; i++ {
		Q[i] = make([]float64, cols)
		for j := 0; j < cols; j++ {
			Q[i][j] = roundFloat(qCols[j][i], 8)
		}
	}
	for i := 0; i < cols; i++ {
		for j := 0; j < cols; j++ {
			R[i][j] = roundFloat(R[i][j], 8)
		}
	}

	return Q, R, nil
}

func dotProduct(a, b []float64) float64 {
	sum := 0.0
	for i := range a {
		sum += a[i] * b[i]
	}
	return sum
}

func vectorNorm(v []float64) float64 {
	return math.Sqrt(dotProduct(v, v))
}

func roundFloat(val float64, precision uint) float64 {
	ratio := math.Pow(10, float64(precision))
	return math.Round(val*ratio) / ratio
}
