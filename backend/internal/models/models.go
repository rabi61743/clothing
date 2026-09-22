package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/pgvector/pgvector-go"
)

type Category struct {
	ID          uuid.UUID  `json:"id"`
	Name        string     `json:"name"`
	Slug        string     `json:"slug"`
	Description *string    `json:"description,omitempty"`
	ParentID    *uuid.UUID `json:"parent_id,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}

type ProductImage struct {
	ID           uuid.UUID `json:"id"`
	ProductID    uuid.UUID `json:"product_id"`
	ColorName    *string   `json:"color_name,omitempty"`
	URL          string    `json:"url"`
	AltText      *string   `json:"alt_text,omitempty"`
	DisplayOrder int       `json:"display_order"`
	IsPrimary    bool      `json:"is_primary"`
}

type ProductVariant struct {
	ID            uuid.UUID `json:"id"`
	ProductID     uuid.UUID `json:"product_id"`
	VariantSKU    string    `json:"variant_sku"`
	ColorName     string    `json:"color_name"`
	ColorHex      string    `json:"color_hex"`
	Size          string    `json:"size"`
	StockQuantity int       `json:"stock_quantity"`
	PriceOverride *float64  `json:"price_override,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}

type Product struct {
	ID                 uuid.UUID        `json:"id"`
	SKU                string           `json:"sku"`
	Brand              string           `json:"brand"` // "BOSS" or "HUGO"
	Name               string           `json:"name"`
	Slug               string           `json:"slug"`
	Description        *string          `json:"description,omitempty"`
	Details            *string          `json:"details,omitempty"`
	MaterialCare       *string          `json:"material_care,omitempty"`
	SustainabilityNote *string          `json:"sustainability_note,omitempty"`
	CategoryID         *uuid.UUID       `json:"category_id,omitempty"`
	CategoryName       *string          `json:"category_name,omitempty"`
	BasePrice          float64          `json:"base_price"`
	Currency           string           `json:"currency"`
	IsActive           bool             `json:"is_active"`
	IsFeatured         bool             `json:"is_featured"`
	Images             []ProductImage   `json:"images,omitempty"`
	Variants           []ProductVariant `json:"variants,omitempty"`
	CreatedAt          time.Time        `json:"created_at"`
	UpdatedAt          time.Time        `json:"updated_at"`
}

type ProductSimilarityResult struct {
	Product    Product `json:"product"`
	Similarity float32 `json:"similarity"`
}

type SemanticSearchRequest struct {
	Query     string `json:"query"`
	Limit     int    `json:"limit"`
	Brand     string `json:"brand,omitempty"`
	MinScore  float32 `json:"min_score,omitempty"`
}

type ProductEmbedding struct {
	ID            uuid.UUID       `json:"id"`
	ProductID     uuid.UUID       `json:"product_id"`
	EmbeddingType string          `json:"embedding_type"`
	Embedding     pgvector.Vector `json:"embedding"`
	CreatedAt     time.Time       `json:"created_at"`
}

type OrderItem struct {
	ID          uuid.UUID  `json:"id"`
	OrderID     uuid.UUID  `json:"order_id"`
	ProductID   *uuid.UUID `json:"product_id,omitempty"`
	VariantSKU  string     `json:"variant_sku"`
	ProductName string     `json:"product_name"`
	Price       float64    `json:"price"`
	Quantity    int        `json:"quantity"`
}

type Order struct {
	ID              uuid.UUID   `json:"id"`
	OrderNumber     string      `json:"order_number"`
	CustomerEmail   string      `json:"customer_email"`
	CustomerName    string      `json:"customer_name"`
	ShippingAddress string      `json:"shipping_address"`
	TotalAmount     float64     `json:"total_amount"`
	Currency        string      `json:"currency"`
	Status          string      `json:"status"`
	Items           []OrderItem `json:"items,omitempty"`
	CreatedAt       time.Time   `json:"created_at"`
}

type CreateOrderRequest struct {
	CustomerEmail   string `json:"customer_email"`
	CustomerName    string `json:"customer_name"`
	ShippingAddress string `json:"shipping_address"`
	Items           []struct {
		ProductID   *uuid.UUID `json:"product_id,omitempty"`
		VariantSKU  string     `json:"variant_sku"`
		ProductName string     `json:"product_name"`
		Price       float64    `json:"price"`
		Quantity    int        `json:"quantity"`
	} `json:"items"`
}

type CreateProductRequest struct {
	SKU                string   `json:"sku"`
	Brand              string   `json:"brand"`
	Name               string   `json:"name"`
	Slug               string   `json:"slug"`
	Description        string   `json:"description"`
	Details            string   `json:"details"`
	MaterialCare       string   `json:"material_care"`
	SustainabilityNote string   `json:"sustainability_note"`
	CategoryID         string   `json:"category_id"`
	BasePrice          float64  `json:"base_price"`
	Currency           string   `json:"currency"`
	ImageURL           string   `json:"image_url"`
	ColorName          string   `json:"color_name"`
	ColorHex           string   `json:"color_hex"`
	Sizes              []string `json:"sizes"`
}

type AdminStats struct {
	TotalRevenue      float64 `json:"total_revenue"`
	TotalOrders       int     `json:"total_orders"`
	TotalProducts     int     `json:"total_products"`
	TotalEmbeddings   int     `json:"total_embeddings"`
}


