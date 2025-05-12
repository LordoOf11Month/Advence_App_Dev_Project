-- Add a default user if it doesn't exist
INSERT INTO users (user_id, username, email, password, role, is_active)
SELECT 
    1,
    'default_seller',
    'seller@example.com',
    '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', -- password: 'password'
    'SELLER',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE user_id = 1
); 