// Package services contains the business logic for the Go API.
package services

import (
	"fmt"
	"math"
)

// QRDecomposition performs QR factorization using the Gram-Schmidt process.
// It returns Q (orthogonal) and R (upper-triangular) such that A = Q * R.
//
// Constraints:
//   - matrix must have rows >= cols (tall or square)
//   - matrix must not be empty
func QRDecomposition(matrix [][]float64) (Q, R [][]float64, err error) {
	rows := len(matrix)
	if rows == 0 {
		return nil, nil, fmt.Errorf("matrix must not be empty")
	}
	cols := len(matrix[0])
	if cols == 0 {
		return nil, nil, fmt.Errorf("matrix columns must not be empty")
	}
	if rows < cols {
		return nil, nil, fmt.Errorf("matrix must have rows >= cols for QR decomposition (got %dx%d)", rows, cols)
	}

	// Extract column vectors from A
	A := make([][]float64, cols)
	for j := 0; j < cols; j++ {
		A[j] = make([]float64, rows)
		for i := 0; i < rows; i++ {
			A[j][i] = matrix[i][j]
		}
	}

	// Gram-Schmidt orthogonalization
	qCols := make([][]float64, cols) // orthonormal basis vectors
	R = make([][]float64, cols)
	for j := range R {
		R[j] = make([]float64, cols)
	}

	for j := 0; j < cols; j++ {
		v := make([]float64, rows)
		copy(v, A[j])

		// Subtract projections onto previous basis vectors
		for i := 0; i < j; i++ {
			dot := dotProduct(qCols[i], A[j])
			R[i][j] = dot
			for k := 0; k < rows; k++ {
				v[k] -= dot * qCols[i][k]
			}
		}

		norm := vectorNorm(v)
		if norm < 1e-10 {
			return nil, nil, fmt.Errorf("matrix columns are linearly dependent (norm ~0 at column %d)", j)
		}
		R[j][j] = norm

		qCols[j] = make([]float64, rows)
		for k := 0; k < rows; k++ {
			qCols[j][k] = v[k] / norm
		}
	}

	// Build Q matrix (rows x cols) from column vectors
	Q = make([][]float64, rows)
	for i := 0; i < rows; i++ {
		Q[i] = make([]float64, cols)
		for j := 0; j < cols; j++ {
			Q[i][j] = roundFloat(qCols[j][i], 8)
		}
	}

	// Round R for clean output
	for i := 0; i < cols; i++ {
		for j := 0; j < cols; j++ {
			R[i][j] = roundFloat(R[i][j], 8)
		}
	}

	return Q, R, nil
}

// dotProduct computes the dot product of two equal-length float64 slices.
func dotProduct(a, b []float64) float64 {
	sum := 0.0
	for i := range a {
		sum += a[i] * b[i]
	}
	return sum
}

// vectorNorm computes the Euclidean (L2) norm of a float64 slice.
func vectorNorm(v []float64) float64 {
	return math.Sqrt(dotProduct(v, v))
}

// roundFloat rounds a float64 to the given number of decimal places.
func roundFloat(val float64, precision uint) float64 {
	ratio := math.Pow(10, float64(precision))
	return math.Round(val*ratio) / ratio
}
