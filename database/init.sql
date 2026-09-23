-- Initialize pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(64) UNIQUE NOT NULL,
    brand VARCHAR(64) NOT NULL DEFAULT 'BOSS', -- 'BOSS' or 'HUGO'
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    details TEXT,
    material_care TEXT,
    sustainability_note TEXT,
    category_id UUID REFERENCES categories(id),
    base_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Variants (Size, Color, Stock, SKU)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_sku VARCHAR(64) UNIQUE NOT NULL,
    color_name VARCHAR(64) NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    size VARCHAR(16) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 10,
    price_override DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color_name VARCHAR(64),
    url TEXT NOT NULL,
    alt_text TEXT,
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE
);

-- AI Embeddings Table
-- Dimension: 768 (standard for Gemini text-embedding-004, CLIP, or BERT variants)
CREATE TABLE IF NOT EXISTS product_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    embedding_type VARCHAR(32) NOT NULL DEFAULT 'text_semantic', -- 'text_semantic' or 'visual_style'
    embedding vector(768) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);

-- HNSW Vector Index for Sub-10ms Cosine Similarity Search
CREATE INDEX IF NOT EXISTS idx_product_embeddings_hnsw 
ON product_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Seed Categories
INSERT INTO categories (id, name, slug, description) VALUES
('11111111-1111-1111-1111-111111111111', 'Suits & Tailoring', 'suits-tailoring', 'Crafted Italian virgin wool two-piece and three-piece suits'),
('22222222-2222-2222-2222-222222222222', 'Shirts', 'shirts', 'Egyptian cotton dress shirts and casual woven button-downs'),
('33333333-3333-3333-3333-333333333333', 'Jackets & Coats', 'jackets-coats', 'Tailored overcoats, blazers, and luxury outerwear'),
('44444444-4444-4444-4444-444444444444', 'Shoes', 'shoes', 'Italian leather oxfords, monk straps, and minimalist sneakers'),
('55555555-5555-5555-5555-555555555555', 'Fragrance & Grooming', 'fragrance-grooming', 'Signature elixirs, parmums, and luxury grooming essentials'),
('66666666-6666-6666-6666-666666666666', 'Accessories & Watches', 'accessories-watches', 'Swiss chronographs, leather belts, and cufflinks'),
('77777777-7777-7777-7777-777777777777', 'Trousers', 'trousers', 'Tailored slacks, chinos, and technical streetwear utility trousers')
ON CONFLICT (slug) DO NOTHING;

-- Seed Products
INSERT INTO products (id, sku, brand, name, slug, description, details, material_care, sustainability_note, category_id, base_price, currency, is_featured) VALUES
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'HB-SUIT-001',
    'BOSS',
    'Two-Piece Slim-Fit Suit in Italian Virgin Wool',
    'two-piece-slim-fit-suit-italian-virgin-wool',
    'An impeccably tailored two-piece suit crafted from super-fine Italian virgin wool with natural stretch. Features a two-button jacket with notch lapels and flat-front trousers.',
    'Slim fit; Notch lapels; 2 buttons; Kissing buttons at cuffs; Side vents; Fully lined; Creased trousers with hook-and-bar closure.',
    '100% Virgin Wool. Lining: 100% Viscose. Do not wash; Gentle chemical dry clean only; Low iron.',
    'RESPONSIBLE: Made with at least 60% certified sustainable raw wool sourced from verified animal-welfare farms.',
    '11111111-1111-1111-1111-111111111111',
    895.00,
    'USD',
    TRUE
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'HB-SUIT-002',
    'BOSS',
    'Double-Breasted Tuxedo in Virgin Wool with Silk Trims',
    'double-breasted-tuxedo-virgin-wool-silk',
    'Elevate black-tie moments with this double-breasted tuxedo featuring refined silk peak lapels and covered satin buttons.',
    'Regular fit; Peak lapels in pure silk; Double-breasted closure; Piped pockets; Satin side stripes on trousers.',
    'Fabric: 98% Virgin Wool, 2% Elastane. Facing: 100% Silk. Dry clean only.',
    'Crafted with responsibly sourced wool and traceable silk fibers.',
    '11111111-1111-1111-1111-111111111111',
    1195.00,
    'USD',
    TRUE
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'HB-SHIRT-001',
    'BOSS',
    'Slim-Fit Dress Shirt in Structured Cotton Poplin',
    'slim-fit-dress-shirt-cotton-poplin',
    'A crisp, versatile dress shirt woven from long-staple Egyptian cotton poplin with an easy-iron finish and kent collar.',
    'Slim fit; Kent collar; Squared cuffs; Shirttail hem; Mother-of-pearl buttons.',
    '100% Cotton. Machine wash warm (40°C); Medium iron; Tumble dry low.',
    'Made with certified organic cotton reducing water impact.',
    '22222222-2222-2222-2222-222222222222',
    148.00,
    'USD',
    TRUE
),
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'HB-COAT-001',
    'BOSS',
    'Single-Breasted Overcoat in Cashmere-Blend Wool',
    'single-breasted-overcoat-cashmere-blend',
    'A timeless overcoat with an ultra-soft handle, crafted in a rich wool and cashmere blend. Designed with clean architectural lines for effortless layering.',
    'Regular fit; Stand collar with lapel notch; 3-button closure; Interior ticket pocket; Back vent.',
    '90% Virgin Wool, 10% Cashmere. Lining: 100% Cupro. Dry clean only.',
    'Responsibly sourced cashmere certified under the Sustainable Fibre Alliance.',
    '33333333-3333-3333-3333-333333333333',
    995.00,
    'USD',
    TRUE
),
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'HG-HOOD-001',
    'HUGO',
    'Oversized Logo Hoodie in Heavy French Terry',
    'oversized-logo-hoodie-french-terry',
    'A contemporary streetwear essential featuring a high-density red HUGO logo badge across the chest and heavyweight 450gsm organic looped cotton.',
    'Oversized relaxed fit; Drawstring hood with branded aglets; Kangaroo pocket; Ribbed trims.',
    '100% Heavyweight Organic Cotton. Machine wash cold inside out; Do not tumble dry.',
    'GOTS Certified Organic Cotton.',
    '33333333-3333-3333-3333-333333333333',
    228.00,
    'USD',
    TRUE
),
(
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'HB-FRAG-001',
    'BOSS',
    'BOSS Bottled Elixir Parfum Intense 100ml',
    'boss-bottled-elixir-parfum-intense',
    'An intense, sophisticated ambery woody fragrance that radiates confidence and contemporary masculinity. Features notes of warm incense, cardamom, earthy patchouli, and rich cedarwood essence.',
    '100ml Eau de Parfum Intense; Signature flacon with double-lacquered deep-black finish and gold branding; Magnetic cap.',
    'Keep in a cool, dry place away from direct sunlight.',
    'Crafted with responsibly sourced natural essences and recyclable glass bottle.',
    '55555555-5555-5555-5555-555555555555',
    145.00,
    'USD',
    TRUE
),
(
    '11111111-2222-3333-4444-555555555555',
    'HB-SHOE-001',
    'BOSS',
    'Cap-Toe Oxford Shoes in Italian Burnished Calfskin',
    'cap-toe-oxford-shoes-italian-calfskin',
    'Exquisite formal lace-up Oxford shoes crafted in Italy from full-grain calfskin leather, hand-burnished to achieve a rich depth of color. Finished with a durable Blake-stitched leather sole and subtle embossed monogram.',
    'Closed lacing with 5 eyelets; Chiselled cap toe; Blake-stitched leather sole with rubber heel insert; Soft cognac leather lining; Handcrafted in Italy.',
    '100% Calfskin Upper. Leather sole. Clean with soft cloth; Nourish with high-grade beeswax polish.',
    'Leather sourced from Leather Working Group (LWG) Gold-Rated Italian tanneries.',
    '44444444-4444-4444-4444-444444444444',
    495.00,
    'USD',
    TRUE
),
(
    '22222222-3333-4444-5555-666666666666',
    'HB-WATCH-001',
    'BOSS',
    'Black Dial Automatic Chronograph with Ceramic Bezel',
    'black-dial-automatic-chronograph-ceramic',
    'An architectural Swiss-engineered chronograph combining athletic dynamism and timeless black-tie refinement. Engineered with a scratch-resistant black ceramic tachymeter bezel, sunray brushed dial, and an integrated stainless-steel bracelet.',
    '44mm 316L stainless steel case; Swiss automatic movement with 48h power reserve; 10 ATM water resistance; Sapphire crystal with anti-reflective coating.',
    'Rinse with fresh water after saltwater exposure; Annual gasket check recommended.',
    'Manufactured using 80% recycled medical-grade stainless steel.',
    '66666666-6666-6666-6666-666666666666',
    795.00,
    'USD',
    TRUE
),
(
    '33333333-4444-5555-6666-777777777777',
    'HG-CARGO-001',
    'HUGO',
    'Relaxed-Fit Cargo Trousers in Technical Ripstop',
    'relaxed-fit-cargo-trousers-technical-ripstop',
    'Progressive streetwear trousers engineered from high-tenacity matte ripstop. Features asymmetrical bellows cargo pockets, articulated knee darts, and red logo accent pull-tabs.',
    'Relaxed silhouette; Elasticated bungee drawcord waist; 6 utility pockets; Adjustable ankle cinches; Water-repellent finish.',
    '100% Recycled Polyamide Ripstop. Machine wash cold; Hang dry.',
    'Certified Recycled Ocean-bound Plastic Polyamide.',
    '77777777-7777-7777-7777-777777777777',
    248.00,
    'USD',
    TRUE
)
ON CONFLICT (slug) DO NOTHING;

-- Seed Product Variants
INSERT INTO product_variants (product_id, variant_sku, color_name, color_hex, size, stock_quantity) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'HB-SUIT-001-NVY-38R', 'Dark Navy', '#0B132B', '38R', 8),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'HB-SUIT-001-NVY-40R', 'Dark Navy', '#0B132B', '40R', 14),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'HB-SUIT-001-NVY-42R', 'Dark Navy', '#0B132B', '42R', 6),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'HB-SUIT-001-BLK-40R', 'Black', '#111111', '40R', 12),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'HB-SUIT-002-BLK-40R', 'Deep Black', '#000000', '40R', 5),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'HB-SUIT-002-BLK-42R', 'Deep Black', '#000000', '42R', 4),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'HB-SHIRT-001-WHT-15H', 'Optical White', '#FFFFFF', '15.5', 25),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'HB-SHIRT-001-WHT-16H', 'Optical White', '#FFFFFF', '16.0', 30),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'HB-SHIRT-001-LBL-15H', 'Sky Blue', '#A0C4E2', '15.5', 18),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'HB-COAT-001-CML-40R', 'Camel', '#C4A076', '40R', 7),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'HB-COAT-001-BLK-40R', 'Black', '#111111', '40R', 9),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'HG-HOOD-001-BLK-M', 'Black / Red', '#000000', 'M', 20),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'HG-HOOD-001-BLK-L', 'Black / Red', '#000000', 'L', 15),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'HB-FRAG-001-100ML', 'Amber Gold', '#D4AF37', '100ml', 35),
('11111111-2222-3333-4444-555555555555', 'HB-SHOE-001-COG-42', 'Cognac Brown', '#8B4513', '42 EU / 9 US', 10),
('22222222-3333-4444-5555-666666666666', 'HB-WATCH-001-STEEL-44', 'Brushed Steel', '#222222', 'One Size (44mm)', 8),
('33333333-4444-5555-6666-777777777777', 'HG-CARGO-001-BLK-32', 'Pitch Black', '#0D0D0D', '32W', 18)
ON CONFLICT (variant_sku) DO NOTHING;

-- Seed Images
INSERT INTO product_images (product_id, color_name, url, alt_text, display_order, is_primary) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dark Navy', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=85&w=1200&h=1600', 'Two-Piece Slim-Fit Suit in Italian Virgin Wool front view', 1, TRUE),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dark Navy', 'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&q=85&w=1200&h=1600', 'Two-Piece Slim-Fit Suit styled profile', 2, FALSE),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Deep Black', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=85&w=1200&h=1600', 'Double-Breasted Tuxedo in Virgin Wool with Silk Trims', 1, TRUE),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Optical White', 'https://images.unsplash.com/photo-1620012253295-c15c429f6f60?auto=format&fit=crop&q=85&w=1200&h=1600', 'Slim-Fit Dress Shirt in Structured Cotton Poplin', 1, TRUE),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Camel', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=85&w=1200&h=1600', 'Single-Breasted Overcoat in Cashmere-Blend Wool in Camel', 1, TRUE),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Black / Red', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=85&w=1200&h=1600', 'Oversized Logo Hoodie in Heavy French Terry', 1, TRUE),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Amber Gold', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=85&w=1200&h=1600', 'BOSS Bottled Elixir Parfum Intense bottle front view', 1, TRUE),
('11111111-2222-3333-4444-555555555555', 'Cognac Brown', 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&q=85&w=1200&h=1600', 'Cap-Toe Oxford Shoes in Italian Burnished Calfskin side profile', 1, TRUE),
('22222222-3333-4444-5555-666666666666', 'Brushed Steel', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=85&w=1200&h=1600', 'Black Dial Automatic Chronograph watch face and steel bracelet', 1, TRUE),
('33333333-4444-5555-6666-777777777777', 'Pitch Black', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=85&w=1200&h=1600', 'Relaxed-Fit Cargo Trousers in Technical Ripstop full length', 1, TRUE);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(32) UNIQUE NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    shipping_address TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(32) DEFAULT 'CONFIRMED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_sku VARCHAR(64),
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1
);

