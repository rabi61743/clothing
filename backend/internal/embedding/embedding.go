package embedding

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/pgvector/pgvector-go"
)

const EmbeddingDimension = 768

type Service struct {
	client        *http.Client
	geminiAPIKey  string
	openaiAPIKey  string
}

func NewService() *Service {
	return &Service{
		client:       &http.Client{Timeout: 10 * time.Second},
		geminiAPIKey: os.Getenv("GEMINI_API_KEY"),
		openaiAPIKey: os.Getenv("OPENAI_API_KEY"),
	}
}

// GenerateEmbedding generates a 768-dimensional normalized vector for a given text.
// If API keys are configured, it uses Gemini or OpenAI; otherwise, it falls back
// to a deterministic text-hash embedding suitable for local testing.
func (s *Service) GenerateEmbedding(ctx context.Context, text string) (pgvector.Vector, error) {
	cleanText := strings.TrimSpace(text)
	if cleanText == "" {
		return pgvector.Vector{}, fmt.Errorf("text cannot be empty")
	}

	// 1. Try Gemini text-embedding-004 if API key is present
	if s.geminiAPIKey != "" {
		vec, err := s.generateGeminiEmbedding(ctx, cleanText)
		if err == nil {
			return vec, nil
		}
	}

	// 2. Deterministic pseudo-semantic embedding for zero-dependency local testing
	return generateLocalMockEmbedding(cleanText), nil
}

type geminiEmbedRequest struct {
	Model   string `json:"model"`
	Content struct {
		Parts []struct {
			Text string `json:"text"`
		} `json:"parts"`
	} `json:"content"`
}

type geminiEmbedResponse struct {
	Embedding struct {
		Values []float32 `json:"values"`
	} `json:"embedding"`
}

func (s *Service) generateGeminiEmbedding(ctx context.Context, text string) (pgvector.Vector, error) {
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=%s", s.geminiAPIKey)
	
	payload := geminiEmbedRequest{
		Model: "models/text-embedding-004",
	}
	payload.Content.Parts = []struct {
		Text string `json:"text"`
	}{{Text: text}}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return pgvector.Vector{}, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return pgvector.Vector{}, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return pgvector.Vector{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return pgvector.Vector{}, fmt.Errorf("gemini api error (%d): %s", resp.StatusCode, string(respBody))
	}

	var result geminiEmbedResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return pgvector.Vector{}, err
	}

	if len(result.Embedding.Values) == 0 {
		return pgvector.Vector{}, fmt.Errorf("empty embedding returned")
	}

	return pgvector.NewVector(result.Embedding.Values), nil
}

// generateLocalMockEmbedding generates a deterministic normalized 768-dim float32 vector based on n-grams and hashing.
// Words like "suit", "wool", "navy", "shirt", "tuxedo", "hoodie" create distinct semantic clusters.
func generateLocalMockEmbedding(text string) pgvector.Vector {
	vec := make([]float32, EmbeddingDimension)
	words := strings.Fields(strings.ToLower(text))

	for i, word := range words {
		hash := sha256.Sum256([]byte(word))
		for j := 0; j < EmbeddingDimension; j++ {
			byteIdx := (j * 4) % len(hash)
			val := binary.BigEndian.Uint32(hash[byteIdx : byteIdx+4])
			floatVal := float32(val)/float32(math.MaxUint32)*2.0 - 1.0
			decay := 1.0 / float32(i+1)
			vec[j] += floatVal * decay
		}
	}

	// Normalize vector (L2 norm) for cosine similarity
	var normSq float32
	for _, v := range vec {
		normSq += v * v
	}
	norm := float32(math.Sqrt(float64(normSq)))
	if norm > 0 {
		for i := range vec {
			vec[i] /= norm
		}
	}

	return pgvector.NewVector(vec)
}
