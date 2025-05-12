-- First, ensure we have the fashion category
INSERT INTO categories (name, slug, description, is_active)
SELECT 'Fashion', 'fashion', 'Fashion and clothing products', true
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE slug = 'fashion'
);

-- Get the fashion category ID
SET @fashion_category_id = (SELECT category_id FROM categories WHERE slug = 'fashion');

-- Add the products if they don't exist
INSERT INTO products (name, description, price, stock_quantity, category_id, store_id, approved, free_shipping, fast_delivery, created_at, updated_at)
SELECT 
    'Classic White T-Shirt',
    'A comfortable and versatile white t-shirt made from 100% cotton.',
    19.99,
    100,
    @fashion_category_id,
    1,
    true,
    false,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE name = 'Classic White T-Shirt'
);

INSERT INTO products (name, description, price, stock_quantity, category_id, store_id, approved, free_shipping, fast_delivery, created_at, updated_at)
SELECT 
    'Blue Denim Jeans',
    'Classic blue denim jeans with a modern fit.',
    49.99,
    50,
    @fashion_category_id,
    1,
    true,
    true,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE name = 'Blue Denim Jeans'
);

INSERT INTO products (name, description, price, stock_quantity, category_id, store_id, approved, free_shipping, fast_delivery, created_at, updated_at)
SELECT 
    'Black Leather Jacket',
    'Stylish black leather jacket with a classic design.',
    199.99,
    25,
    @fashion_category_id,
    1,
    true,
    true,
    false,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE name = 'Black Leather Jacket'
);

-- Add some sample images for the products
INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
    p.product_id,
    'https://example.com/images/white-tshirt.jpg',
    true
FROM products p
WHERE p.name = 'Classic White T-Shirt'
AND NOT EXISTS (
    SELECT 1 FROM product_images WHERE product_id = p.product_id
);

INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
    p.product_id,
    'https://example.com/images/blue-jeans.jpg',
    true
FROM products p
WHERE p.name = 'Blue Denim Jeans'
AND NOT EXISTS (
    SELECT 1 FROM product_images WHERE product_id = p.product_id
);

INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
    p.product_id,
    'https://example.com/images/leather-jacket.jpg',
    true
FROM products p
WHERE p.name = 'Black Leather Jacket'
AND NOT EXISTS (
    SELECT 1 FROM product_images WHERE product_id = p.product_id
); 