-- First, ensure we have a default store
INSERT INTO stores (store_id, seller_id, store_name, description, created_at, email, street, city, state, postal_code, country)
SELECT 
    1,
    1,
    'Default Store',
    'Default store for sample products',
    NOW(),
    'store@example.com',
    '123 Main St',
    'New York',
    'NY',
    '10001',
    'USA'
WHERE NOT EXISTS (
    SELECT 1 FROM stores WHERE store_id = 1
);

-- Get the fashion category ID
SET @fashion_category_id = (SELECT category_id FROM categories WHERE slug = 'fashion');

-- Add fashion products if they don't exist
INSERT INTO products (name, description, price, stock_quantity, category_id, store_id, approved, free_shipping, fast_delivery, created_at, updated_at)
SELECT 
    'Summer Dress',
    'Beautiful summer dress with floral pattern',
    49.99,
    100,
    @fashion_category_id,
    1,
    true,
    false,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE name = 'Summer Dress' AND category_id = @fashion_category_id
);

INSERT INTO products (name, description, price, stock_quantity, category_id, store_id, approved, free_shipping, fast_delivery, created_at, updated_at)
SELECT 
    'Denim Jacket',
    'Classic denim jacket for all seasons',
    79.99,
    50,
    @fashion_category_id,
    1,
    true,
    true,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE name = 'Denim Jacket' AND category_id = @fashion_category_id
);

INSERT INTO products (name, description, price, stock_quantity, category_id, store_id, approved, free_shipping, fast_delivery, created_at, updated_at)
SELECT 
    'Leather Boots',
    'Stylish leather boots for women',
    129.99,
    30,
    @fashion_category_id,
    1,
    true,
    true,
    false,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE name = 'Leather Boots' AND category_id = @fashion_category_id
);

-- Add product images
INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
    p.product_id,
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500',
    true
FROM products p
WHERE p.name = 'Summer Dress'
AND NOT EXISTS (
    SELECT 1 FROM product_images WHERE product_id = p.product_id
);

INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
    p.product_id,
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500',
    true
FROM products p
WHERE p.name = 'Denim Jacket'
AND NOT EXISTS (
    SELECT 1 FROM product_images WHERE product_id = p.product_id
);

INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
    p.product_id,
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500',
    true
FROM products p
WHERE p.name = 'Leather Boots'
AND NOT EXISTS (
    SELECT 1 FROM product_images WHERE product_id = p.product_id
); 