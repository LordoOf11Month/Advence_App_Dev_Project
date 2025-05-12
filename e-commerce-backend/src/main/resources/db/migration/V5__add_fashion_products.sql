-- First, get the fashion category ID
SET @fashion_category_id = (SELECT id FROM categories WHERE slug = 'fashion');

-- Insert sample fashion products
INSERT INTO products (name, description, price, stock_quantity, category_id, store_id, created_at, updated_at)
SELECT 
    'Summer Dress',
    'Beautiful summer dress with floral pattern',
    49.99,
    100,
    @fashion_category_id,
    (SELECT id FROM stores LIMIT 1),
    NOW(),
    NOW()
WHERE @fashion_category_id IS NOT NULL;

INSERT INTO products (name, description, price, stock_quantity, category_id, store_id, created_at, updated_at)
SELECT 
    'Denim Jacket',
    'Classic denim jacket for all seasons',
    79.99,
    50,
    @fashion_category_id,
    (SELECT id FROM stores LIMIT 1),
    NOW(),
    NOW()
WHERE @fashion_category_id IS NOT NULL;

INSERT INTO products (name, description, price, stock_quantity, category_id, store_id, created_at, updated_at)
SELECT 
    'Leather Boots',
    'Stylish leather boots for women',
    129.99,
    30,
    @fashion_category_id,
    (SELECT id FROM stores LIMIT 1),
    NOW(),
    NOW()
WHERE @fashion_category_id IS NOT NULL; 