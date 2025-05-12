-- First, ensure we have the fashion category
INSERT INTO categories (name, slug, description, is_active)
SELECT 'Fashion', 'fashion', 'Fashion and clothing products', true
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE slug = 'fashion'
);

-- Get the fashion category ID
SET @fashion_category_id = (SELECT category_id FROM categories WHERE slug = 'fashion');

-- Update any products that should be in the fashion category
UPDATE products 
SET category_id = @fashion_category_id
WHERE name IN ('Classic White T-Shirt', 'Blue Denim Jeans', 'Black Leather Jacket')
AND (category_id IS NULL OR category_id != @fashion_category_id);

-- Add the products if they don't exist
INSERT INTO products (name, description, price, stock_quantity, category_id, store_id, approved, free_shipping, fast_delivery)
SELECT 
    'Classic White T-Shirt',
    'A comfortable and versatile white t-shirt made from 100% cotton.',
    19.99,
    100,
    @fashion_category_id,
    1,
    true,
    false,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE name = 'Classic White T-Shirt'
);

INSERT INTO products (name, description, price, stock_quantity, category_id, store_id, approved, free_shipping, fast_delivery)
SELECT 
    'Blue Denim Jeans',
    'Classic blue denim jeans with a modern fit.',
    49.99,
    50,
    @fashion_category_id,
    1,
    true,
    true,
    true
WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE name = 'Blue Denim Jeans'
);

INSERT INTO products (name, description, price, stock_quantity, category_id, store_id, approved, free_shipping, fast_delivery)
SELECT 
    'Black Leather Jacket',
    'Stylish black leather jacket with a classic design.',
    199.99,
    25,
    @fashion_category_id,
    1,
    true,
    true,
    false
WHERE NOT EXISTS (
    SELECT 1 FROM products WHERE name = 'Black Leather Jacket'
); 