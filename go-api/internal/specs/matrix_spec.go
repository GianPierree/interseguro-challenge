// Package specs defines the data contracts (specs) used by the SDD agents.
// Each spec describes the input/output shape of an operation so that
// agents can be composed and validated independently.
package specs

// MatrixInput is the expected request body for the QR endpoint.
type MatrixInput struct {
	// Matrix is a rectangular array of float64 values.
	// Rows must be >= Cols for QR to be well-defined.
	Matrix [][]float64 `json:"matrix" validate:"required,min=1"`
}

// QRResult holds the two factor matrices returned by QR decomposition.
type QRResult struct {
	// Q is an orthogonal matrix (rows x rows)
	Q [][]float64 `json:"Q"`
	// R is an upper-triangular matrix (rows x cols)
	R [][]float64 `json:"R"`
	// OriginalRows is the number of rows in the input matrix
	OriginalRows int `json:"originalRows"`
	// OriginalCols is the number of columns in the input matrix
	OriginalCols int `json:"originalCols"`
}

// NodeAPIRequest is the payload sent from Go API → Node.js API.
type NodeAPIRequest struct {
	QRResult QRResult `json:"qrResult"`
}

// TokenRequest is used for JWT generation.
type TokenRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// TokenResponse returns a signed JWT.
type TokenResponse struct {
	Token string `json:"token"`
}
