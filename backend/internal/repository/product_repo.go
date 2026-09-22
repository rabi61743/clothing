package repository

import (
	"context"
	"fmt"
	"log"

	"clothing-backend/internal/database"
	"clothing-backend/internal/embedding"
	"clothing-backend/internal/models"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/pgvector/pgvector-go"
)

type ProductRepository struct {
	db *database.DB
}

func NewProductRepository(db *database.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) ListProducts(ctx context.Context, brand, categorySlug string, limit, offset int) ([]models.Product, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	query := `
		SELECT 
			p.id, p.sku, p.brand, p.name, p.slug, p.description, p.details, 
			p.material_care, p.sustainability_note, p.category_id, c.name as category_name,
			p.base_price, p.currency, p.is_active, p.is_featured, p.created_at, p.updated_at
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.is_active = TRUE
	`
	args := []interface{}{}
	argIdx := 1

	if brand != "" {
		query += fmt.Sprintf(" AND UPPER(p.brand) = UPPER($%d)", argIdx)
		args = append(args, brand)
		argIdx++
	}

	if categorySlug != "" {
		query += fmt.Sprintf(" AND c.slug = $%d", argIdx)
		args = append(args, categorySlug)
		argIdx++
	}

	query += fmt.Sprintf(" ORDER BY p.is_featured DESC, p.created_at DESC LIMIT $%d OFFSET $%d", argIdx, argIdx+1)
	args = append(args, limit, offset)

	rows, err := r.db.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("error querying products: %w", err)
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		err := rows.Scan(
			&p.ID, &p.SKU, &p.Brand, &p.Name, &p.Slug, &p.Description, &p.Details,
			&p.MaterialCare, &p.SustainabilityNote, &p.CategoryID, &p.CategoryName,
			&p.BasePrice, &p.Currency, &p.IsActive, &p.IsFeatured, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning product: %w", err)
		}
		products = append(products, p)
	}

	// Populate images & variants for each product
	for i := range products {
		images, err := r.getProductImages(ctx, products[i].ID)
		if err == nil {
			products[i].Images = images
		}
		variants, err := r.getProductVariants(ctx, products[i].ID)
		if err == nil {
			products[i].Variants = variants
		}
	}

	return products, nil
}

func (r *ProductRepository) GetProductBySlug(ctx context.Context, slug string) (*models.Product, error) {
	query := `
		SELECT 
			p.id, p.sku, p.brand, p.name, p.slug, p.description, p.details, 
			p.material_care, p.sustainability_note, p.category_id, c.name as category_name,
			p.base_price, p.currency, p.is_active, p.is_featured, p.created_at, p.updated_at
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.slug = $1 AND p.is_active = TRUE
	`
	var p models.Product
	err := r.db.Pool.QueryRow(ctx, query, slug).Scan(
		&p.ID, &p.SKU, &p.Brand, &p.Name, &p.Slug, &p.Description, &p.Details,
		&p.MaterialCare, &p.SustainabilityNote, &p.CategoryID, &p.CategoryName,
		&p.BasePrice, &p.Currency, &p.IsActive, &p.IsFeatured, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("error querying product by slug: %w", err)
	}

	images, err := r.getProductImages(ctx, p.ID)
	if err == nil {
		p.Images = images
	}
	variants, err := r.getProductVariants(ctx, p.ID)
	if err == nil {
		p.Variants = variants
	}

	return &p, nil
}

// SearchSemantic performs vector cosine similarity search using pgvector
func (r *ProductRepository) SearchSemantic(ctx context.Context, queryVector pgvector.Vector, limit int, brand string) ([]models.ProductSimilarityResult, error) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}

	query := `
		SELECT 
			p.id, p.sku, p.brand, p.name, p.slug, p.description, p.details, 
			p.material_care, p.sustainability_note, p.category_id, c.name as category_name,
			p.base_price, p.currency, p.is_active, p.is_featured, p.created_at, p.updated_at,
			(1 - (pe.embedding <=> $1)) as similarity
		FROM product_embeddings pe
		JOIN products p ON pe.product_id = p.id
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.is_active = TRUE
	`
	args := []interface{}{queryVector}
	argIdx := 2

	if brand != "" {
		query += fmt.Sprintf(" AND UPPER(p.brand) = UPPER($%d)", argIdx)
		args = append(args, brand)
		argIdx++
	}

	query += fmt.Sprintf(" ORDER BY pe.embedding <=> $1 ASC LIMIT $%d", argIdx)
	args = append(args, limit)

	rows, err := r.db.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("error executing semantic vector search: %w", err)
	}
	defer rows.Close()

	var results []models.ProductSimilarityResult
	for rows.Next() {
		var p models.Product
		var similarity float32
		err := rows.Scan(
			&p.ID, &p.SKU, &p.Brand, &p.Name, &p.Slug, &p.Description, &p.Details,
			&p.MaterialCare, &p.SustainabilityNote, &p.CategoryID, &p.CategoryName,
			&p.BasePrice, &p.Currency, &p.IsActive, &p.IsFeatured, &p.CreatedAt, &p.UpdatedAt,
			&similarity,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning semantic search row: %w", err)
		}

		images, _ := r.getProductImages(ctx, p.ID)
		p.Images = images
		variants, _ := r.getProductVariants(ctx, p.ID)
		p.Variants = variants

		results = append(results, models.ProductSimilarityResult{
			Product:    p,
			Similarity: similarity,
		})
	}

	return results, nil
}

// GetSimilarProducts finds visually / semantically similar items based on vector distance
func (r *ProductRepository) GetSimilarProducts(ctx context.Context, productID uuid.UUID, limit int) ([]models.ProductSimilarityResult, error) {
	if limit <= 0 || limit > 10 {
		limit = 4
	}

	query := `
		WITH target_embedding AS (
			SELECT embedding FROM product_embeddings WHERE product_id = $1 LIMIT 1
		)
		SELECT 
			p.id, p.sku, p.brand, p.name, p.slug, p.description, p.details, 
			p.material_care, p.sustainability_note, p.category_id, c.name as category_name,
			p.base_price, p.currency, p.is_active, p.is_featured, p.created_at, p.updated_at,
			(1 - (pe.embedding <=> te.embedding)) as similarity
		FROM product_embeddings pe
		CROSS JOIN target_embedding te
		JOIN products p ON pe.product_id = p.id
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.is_active = TRUE AND p.id != $1
		ORDER BY pe.embedding <=> te.embedding ASC
		LIMIT $2
	`

	rows, err := r.db.Pool.Query(ctx, query, productID, limit)
	if err != nil {
		return nil, fmt.Errorf("error finding similar products: %w", err)
	}
	defer rows.Close()

	var results []models.ProductSimilarityResult
	for rows.Next() {
		var p models.Product
		var similarity float32
		err := rows.Scan(
			&p.ID, &p.SKU, &p.Brand, &p.Name, &p.Slug, &p.Description, &p.Details,
			&p.MaterialCare, &p.SustainabilityNote, &p.CategoryID, &p.CategoryName,
			&p.BasePrice, &p.Currency, &p.IsActive, &p.IsFeatured, &p.CreatedAt, &p.UpdatedAt,
			&similarity,
		)
		if err != nil {
			return nil, err
		}

		images, _ := r.getProductImages(ctx, p.ID)
		p.Images = images
		variants, _ := r.getProductVariants(ctx, p.ID)
		p.Variants = variants

		results = append(results, models.ProductSimilarityResult{
			Product:    p,
			Similarity: similarity,
		})
	}

	return results, nil
}

func (r *ProductRepository) EnsureSeedEmbeddings(ctx context.Context, embedService *embedding.Service) error {
	products, err := r.ListProducts(ctx, "", "", 100, 0)
	if err != nil {
		return err
	}

	for _, p := range products {
		var exists bool
		err := r.db.Pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM product_embeddings WHERE product_id = $1)", p.ID).Scan(&exists)
		if err != nil {
			continue
		}

		if !exists {
			textToEmbed := fmt.Sprintf("%s %s. %s %s", p.Brand, p.Name, getStr(p.Description), getStr(p.Details))
			vec, err := embedService.GenerateEmbedding(ctx, textToEmbed)
			if err != nil {
				log.Printf("Failed generating embedding for product %s: %v", p.Name, err)
				continue
			}

			_, err = r.db.Pool.Exec(ctx, `
				INSERT INTO product_embeddings (product_id, embedding_type, embedding)
				VALUES ($1, 'text_semantic', $2)
			`, p.ID, vec)
			if err != nil {
				log.Printf("Failed saving embedding for %s: %v", p.Name, err)
			} else {
				log.Printf("Generated & stored pgvector embedding for %s (%s)", p.Name, p.SKU)
			}
		}
	}
	return nil
}

func (r *ProductRepository) getProductImages(ctx context.Context, productID uuid.UUID) ([]models.ProductImage, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT id, product_id, color_name, url, alt_text, display_order, is_primary
		FROM product_images WHERE product_id = $1 ORDER BY display_order ASC
	`, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var images []models.ProductImage
	for rows.Next() {
		var img models.ProductImage
		if err := rows.Scan(&img.ID, &img.ProductID, &img.ColorName, &img.URL, &img.AltText, &img.DisplayOrder, &img.IsPrimary); err == nil {
			images = append(images, img)
		}
	}
	return images, nil
}

func (r *ProductRepository) getProductVariants(ctx context.Context, productID uuid.UUID) ([]models.ProductVariant, error) {
	rows, err := r.db.Pool.Query(ctx, `
		SELECT id, product_id, variant_sku, color_name, color_hex, size, stock_quantity, price_override, created_at
		FROM product_variants WHERE product_id = $1 ORDER BY size ASC
	`, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var variants []models.ProductVariant
	for rows.Next() {
		var v models.ProductVariant
		if err := rows.Scan(&v.ID, &v.ProductID, &v.VariantSKU, &v.ColorName, &v.ColorHex, &v.Size, &v.StockQuantity, &v.PriceOverride, &v.CreatedAt); err == nil {
			variants = append(variants, v)
		}
	}
	return variants, nil
}

func getStr(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func (r *ProductRepository) CreateOrder(ctx context.Context, req models.CreateOrderRequest) (*models.Order, error) {
	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("error starting transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	orderNumber := fmt.Sprintf("HB-%d", time.Now().UnixNano()%100000000)
	var totalAmount float64
	for _, item := range req.Items {
		totalAmount += item.Price * float64(item.Quantity)
	}

	var orderID uuid.UUID
	var createdAt time.Time
	err = tx.QueryRow(ctx, `
		INSERT INTO orders (order_number, customer_email, customer_name, shipping_address, total_amount, currency, status)
		VALUES ($1, $2, $3, $4, $5, 'USD', 'CONFIRMED')
		RETURNING id, created_at
	`, orderNumber, req.CustomerEmail, req.CustomerName, req.ShippingAddress, totalAmount).Scan(&orderID, &createdAt)
	if err != nil {
		return nil, fmt.Errorf("error inserting order: %w", err)
	}

	var items []models.OrderItem
	for _, it := range req.Items {
		var itemID uuid.UUID
		err = tx.QueryRow(ctx, `
			INSERT INTO order_items (order_id, product_id, variant_sku, product_name, price, quantity)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id
		`, orderID, it.ProductID, it.VariantSKU, it.ProductName, it.Price, it.Quantity).Scan(&itemID)
		if err != nil {
			return nil, fmt.Errorf("error inserting order item: %w", err)
		}
		items = append(items, models.OrderItem{
			ID:          itemID,
			OrderID:     orderID,
			ProductID:   it.ProductID,
			VariantSKU:  it.VariantSKU,
			ProductName: it.ProductName,
			Price:       it.Price,
			Quantity:    it.Quantity,
		})
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("error committing order: %w", err)
	}

	return &models.Order{
		ID:              orderID,
		OrderNumber:     orderNumber,
		CustomerEmail:   req.CustomerEmail,
		CustomerName:    req.CustomerName,
		ShippingAddress: req.ShippingAddress,
		TotalAmount:     totalAmount,
		Currency:        "USD",
		Status:          "CONFIRMED",
		Items:           items,
		CreatedAt:       createdAt,
	}, nil
}

