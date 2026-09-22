package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"clothing-backend/internal/embedding"
	"clothing-backend/internal/models"
	"clothing-backend/internal/repository"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type ProductHandler struct {
	repo         *repository.ProductRepository
	embedService *embedding.Service
}

func NewProductHandler(repo *repository.ProductRepository, embedService *embedding.Service) *ProductHandler {
	return &ProductHandler{
		repo:         repo,
		embedService: embedService,
	}
}

func (h *ProductHandler) ListProducts(w http.ResponseWriter, r *http.Request) {
	brand := r.URL.Query().Get("brand")
	category := r.URL.Query().Get("category")
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	products, err := h.repo.ListProducts(r.Context(), brand, category, limit, offset)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"count":    len(products),
		"products": products,
	})
}

func (h *ProductHandler) GetProductBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	if slug == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "product slug is required"})
		return
	}

	product, err := h.repo.GetProductBySlug(r.Context(), slug)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	if product == nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "product not found"})
		return
	}

	respondJSON(w, http.StatusOK, product)
}

func (h *ProductHandler) SearchSemantic(w http.ResponseWriter, r *http.Request) {
	var req models.SemanticSearchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	if req.Query == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "query cannot be empty"})
		return
	}

	// 1. Generate embedding vector for user natural language query
	queryVector, err := h.embedService.GenerateEmbedding(r.Context(), req.Query)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed generating query embedding: " + err.Error()})
		return
	}

	// 2. Perform pgvector similarity search
	results, err := h.repo.SearchSemantic(r.Context(), queryVector, req.Limit, req.Brand)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"query":   req.Query,
		"count":   len(results),
		"results": results,
	})
}

func (h *ProductHandler) GetSimilarProducts(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	productID, err := uuid.Parse(idStr)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid product id UUID"})
		return
	}

	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	similar, err := h.repo.GetSimilarProducts(r.Context(), productID, limit)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"product_id": productID,
		"similar":    similar,
	})
}

func (h *ProductHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, map[string]string{
		"status":  "healthy",
		"service": "clothing-backend",
		"vector":  "pgvector enabled",
	})
}

func (h *ProductHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	var req models.CreateOrderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid order request body"})
		return
	}

	if req.CustomerEmail == "" || len(req.Items) == 0 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "customer_email and at least one item are required"})
		return
	}

	order, err := h.repo.CreateOrder(r.Context(), req)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed creating order: " + err.Error()})
		return
	}

	respondJSON(w, http.StatusCreated, order)
}

func (h *ProductHandler) ListOrders(w http.ResponseWriter, r *http.Request) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	orders, err := h.repo.ListOrders(r.Context(), limit)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"count":  len(orders),
		"orders": orders,
	})
}

func (h *ProductHandler) GetAdminStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.repo.GetAdminStats(r.Context())
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, stats)
}

func (h *ProductHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var req models.CreateProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid product payload"})
		return
	}

	if req.Name == "" || req.SKU == "" || req.BasePrice <= 0 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "name, sku, and valid base_price are required"})
		return
	}

	if req.Slug == "" {
		req.Slug = req.SKU
	}

	product, err := h.repo.CreateProduct(r.Context(), req, h.embedService)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed creating product: " + err.Error()})
		return
	}

	respondJSON(w, http.StatusCreated, product)
}

func (h *ProductHandler) UpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	orderID, err := uuid.Parse(idStr)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid order id UUID"})
		return
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Status == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "valid status is required"})
		return
	}

	if err := h.repo.UpdateOrderStatus(r.Context(), orderID, req.Status); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed updating order status: " + err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"order_id": orderID,
		"status":   req.Status,
		"updated":  true,
	})
}

func (h *ProductHandler) InspectVectors(w http.ResponseWriter, r *http.Request) {
	items, err := h.repo.InspectVectors(r.Context())
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"count": len(items),
		"index": "HNSW (cosine_ops, m=16, ef_construction=64)",
		"items": items,
	})
}




func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
