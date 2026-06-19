package gateway

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/interseguro/go-api/internal/domain"
)

// nodeAPIRequest is the payload sent to the Node.js statistics service.
// Kept private — it's an infrastructure detail, not a domain concept.
type nodeAPIRequest struct {
	QRResult domain.QRResult `json:"qrResult"`
}

// HTTPStatisticsGateway implements domain.StatisticsGateway by calling
// the Node.js API over HTTP. The use case only sees the interface.
type HTTPStatisticsGateway struct {
	baseURL    string
	httpClient *http.Client
}

// NewHTTPStatisticsGateway constructs the gateway with a configurable base URL.
func NewHTTPStatisticsGateway(baseURL string) *HTTPStatisticsGateway {
	return &HTTPStatisticsGateway{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

// FetchStatistics sends the QR result to node-api and returns statistics.
// Implements domain.StatisticsGateway.
func (g *HTTPStatisticsGateway) FetchStatistics(qr domain.QRResult) (*domain.Statistics, error) {
	payload, err := json.Marshal(nodeAPIRequest{QRResult: qr})
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	url := g.baseURL + "/api/matrix/stats"
	resp, err := g.httpClient.Post(url, "application/json", bytes.NewBuffer(payload))
	if err != nil {
		return nil, fmt.Errorf("http call to node-api failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("node-api returned %d: %s", resp.StatusCode, string(body))
	}

	var stats domain.Statistics
	if err := json.NewDecoder(resp.Body).Decode(&stats); err != nil {
		return nil, fmt.Errorf("failed to decode node-api response: %w", err)
	}

	return &stats, nil
}
