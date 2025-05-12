-- Insert the fashion category if it doesn't exist
INSERT INTO categories (name, slug, description, is_active)
SELECT 'Fashion', 'fashion', 'Fashion and clothing products', true
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE slug = 'fashion'
); 