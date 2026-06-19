// Package agents implements the SDD (Spec-Driven Development) agent layer.
// Each agent is responsible for a single bounded workflow: it reads a spec,
// executes services, and produces a well-typed output.
//
// The QRAgent orchestrates:
//  1. Validate the input matrix against MatrixInput spec
//  2. Delegate to QRService for factorization
//  3. Forward results to the Node.js statistics agent via HTTP
package agents

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/interseguro/go-api/internal/services"
	"github.com/interseguro/go-api/internal/specs"
)

// QRAgent is the orchestrator agent for the QR factorization workflow.
type QRAgent struct {
	nodeAPIURL string
	httpClient *http.Client
}

// NewQRAgent creates a new QRAgent using the NODE_API_URL env var.
func NewQRAgent() *QRAgent {
	nodeURL := os.Getenv("NODE_API_URL")
	if nodeURL == "" {
		nodeURL = "http://node-api:4000"
	}
	return &QRAgent{
		nodeAPIURL: nodeURL,
		httpClient: &http.Client{Timeout: 15 * time.Second},
	}
}

// AgentResponse is the final result returned to the HTTP handler.
type AgentResponse struct {
	QRResult   specs.QRResult         `json:"qrResult"`
	Statistics map[string]interface{} `json:"statistics"`
}

// Run executes the full QR → stats pipeline.
func (a *QRAgent) Run(input specs.MatrixInput) (*AgentResponse, error) {
	// ── Step 1: QR Factorization ─────────────────────────────────────────────
	Q, R, err := services.QRDecomposition(input.Matrix)
	if err != nil {
		return nil, fmt.Errorf("qr factorization failed: %w", err)
	}

	qrResult := specs.QRResult{
		Q:            Q,
		R:            R,
		OriginalRows: len(input.Matrix),
		OriginalCols: len(input.Matrix[0]),
	}

	// ── Step 2: Forward to Node.js API ──────────────────────────────────────
	stats, err := a.forwardToNodeAPI(qrResult)
	if err != nil {
		return nil, fmt.Errorf("node api communication failed: %w", err)
	}

	return &AgentResponse{
		QRResult:   qrResult,
		Statistics: stats,
	}, nil
}

// forwardToNodeAPI sends the QR matrices to the Node.js statistics service.
func (a *QRAgent) forwardToNodeAPI(qrResult specs.QRResult) (map[string]interface{}, error) {
	payload := specs.NodeAPIRequest{QRResult: qrResult}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal payload: %w", err)
	}

	url := fmt.Sprintf("%s/api/matrix/stats", a.nodeAPIURL)
	resp, err := a.httpClient.Post(url, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return nil, fmt.Errorf("http request to node api failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("node api returned status %d", resp.StatusCode)
	}

	rawBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read node api response: %w", err)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(rawBody, &result); err != nil {
		return nil, fmt.Errorf("failed to parse node api response: %w", err)
	}

	return result, nil
}
