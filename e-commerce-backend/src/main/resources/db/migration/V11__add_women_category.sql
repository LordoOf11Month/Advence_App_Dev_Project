-- First, ensure we have the fashion category
INSERT INTO categories (name, slug, description, is_active)
SELECT 'Fashion', 'fashion', 'Fashion and clothing products', true
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE slug = 'fashion'
);

-- Get the fashion category ID
SET @fashion_category_id = (SELECT category_id FROM categories WHERE slug = 'fashion');

-- Add the Women category if it doesn't exist
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id)
SELECT 
    32,
    'Women',
    'women',
    'Fashion items for women',
    true,
    @fashion_category_id
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE slug = 'women'
);

-- Add Women's fashion subcategories if they don't exist
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id)
SELECT 
    33,
    'Clothing',
    'women-clothing',
    'Dresses, tops, pants, and jackets for women',
    true,
    32
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE slug = 'women-clothing'
);

INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id)
SELECT 
    34,
    'Shoes',
    'women-shoes',
    'Heels, sneakers, and boots for women',
    true,
    32
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE slug = 'women-shoes'
);

INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id)
SELECT 
    35,
    'Bags & Wallets',
    'women-bags-wallets',
    'Handbags, purses, and wallets for women',
    true,
    32
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE slug = 'women-bags-wallets'
);

INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id)
SELECT 
    36,
    'Accessories',
    'women-accessories',
    'Scarves, belts, and hats for women',
    true,
    32
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE slug = 'women-accessories'
); 