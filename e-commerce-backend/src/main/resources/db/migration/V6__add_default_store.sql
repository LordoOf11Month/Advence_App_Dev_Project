-- Add a default store if it doesn't exist
INSERT INTO stores (store_id, name, description, seller_id, is_active)
SELECT 
    1,
    'Default Store',
    'Default store for sample products',
    1, -- Assuming user_id 1 exists
    true
WHERE NOT EXISTS (
    SELECT 1 FROM stores WHERE store_id = 1
); 