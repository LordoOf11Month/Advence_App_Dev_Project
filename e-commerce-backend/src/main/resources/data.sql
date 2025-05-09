-- Sample Data for E-commerce Application

-- Users
-- Note: Passwords are now stored as plaintext for development purposes ONLY - NOT SECURE FOR PRODUCTION
INSERT INTO users (user_id, first_name, last_name, email, phone_number, password_hash, role, created_at, stripe_customer_id, is_banned, banned_at, ban_reason, avatar_url)
VALUES
(1, 'John', 'Admin', 'admin@example.com', '1234567890', 'password', 'admin', NOW(), 'cus_admin123', false, NULL, NULL, 'https://randomuser.me/api/portraits/men/1.jpg'),
(2, 'Jane', 'Seller', 'seller@example.com', '0987654321', 'password', 'seller', NOW(), 'cus_seller123', false, NULL, NULL, 'https://randomuser.me/api/portraits/women/1.jpg'),
(3, 'Alice', 'Customer', 'customer@example.com', '1122334455', 'password', 'customer', NOW(), 'cus_cust123', false, NULL, NULL, 'https://randomuser.me/api/portraits/women/2.jpg'),
(4, 'Bob', 'Seller', 'seller2@example.com', '5544332211', 'password', 'seller', NOW(), 'cus_seller456', false, NULL, NULL, 'https://randomuser.me/api/portraits/men/2.jpg'),
(5, 'Charlie', 'Customer', 'customer2@example.com', '6677889900', 'password', 'customer', NOW(), 'cus_cust456', false, NULL, NULL, 'https://randomuser.me/api/portraits/men/3.jpg');

-- Categories with parent-child relationships
INSERT INTO categories (category_id, name, parent_category_id)
VALUES
(1, 'Electronics', NULL),
(2, 'Clothing', NULL),
(3, 'Home & Kitchen', NULL),
(4, 'Books', NULL),
(5, 'Laptops', 1),
(6, 'Smartphones', 1),
(7, 'Audio', 1),
(8, 'Men''s Clothing', 2),
(9, 'Women''s Clothing', 2),
(10, 'Kitchen Appliances', 3),
(11, 'Bedding', 3),
(12, 'Fiction', 4),
(13, 'Non-Fiction', 4);

-- Stores
INSERT INTO stores (store_id, seller_id, store_name, description, created_at, average_rating, total_sales, is_banned, banned_date, ban_reason, email, bank_name, account_holder, account_number, street, city, state, postal_code, country)
VALUES
(1, 2, 'Tech Haven', 'Your one-stop shop for the latest electronics and gadgets', NOW(), 4.7, 250, false, NULL, NULL, 'techhaven@example.com', 'Global Bank', 'Jane Seller', '1234567890', '123 Tech Street', 'Silicon Valley', 'CA', '94043', 'USA'),
(2, 4, 'Fashion Forward', 'Trendy clothes for all seasons', NOW(), 4.3, 180, false, NULL, NULL, 'fashionforward@example.com', 'City Bank', 'Bob Seller', '0987654321', '456 Fashion Avenue', 'New York', 'NY', '10001', 'USA');

-- Products
INSERT INTO products (product_id, store_id, category_id, name, description, price, stock_quantity, average_rating, rating_count, total_rating, total_sales)
VALUES
(1, 1, 5, 'Ultra Slim Laptop Pro', 'Powerful and lightweight laptop with 16GB RAM and 512GB SSD', 1299.99, 50, 4.8, 24, 115, 35),
(2, 1, 6, 'SmartPhone X', 'Latest generation smartphone with advanced camera and long battery life', 899.99, 100, 4.6, 42, 193, 75),
(3, 1, 7, 'Wireless Earbuds Pro', 'Noise-canceling earbuds with crystal clear sound', 159.99, 200, 4.5, 31, 140, 120),
(4, 2, 8, 'Classic Men''s Suit', 'Elegant suit for business and formal occasions', 299.99, 25, 4.7, 15, 71, 18),
(5, 2, 9, 'Summer Dress Collection', 'Light and colorful dresses for the summer', 79.99, 150, 4.4, 28, 123, 95),
(6, 2, 9, 'Designer Handbag', 'Stylish and spacious handbag for everyday use', 129.99, 75, 4.6, 19, 87, 42);

-- Product Images
INSERT INTO product_images (image_id, product_id, image_url, is_primary)
VALUES
(1, 1, 'https://placehold.co/600x400?text=Laptop+Pro', true),
(2, 1, 'https://placehold.co/600x400?text=Laptop+Pro+Side', false),
(3, 2, 'https://placehold.co/600x400?text=Smartphone+X', true),
(4, 2, 'https://placehold.co/600x400?text=Smartphone+X+Back', false),
(5, 3, 'https://placehold.co/600x400?text=Wireless+Earbuds', true),
(6, 4, 'https://placehold.co/600x400?text=Classic+Suit', true),
(7, 5, 'https://placehold.co/600x400?text=Summer+Dress', true),
(8, 6, 'https://placehold.co/600x400?text=Designer+Handbag', true);

-- Addresses for users
INSERT INTO addresses (address_id, user_id, street, city, state, postal_code, country, is_default)
VALUES
(1, 3, '789 Maple Street', 'Springfield', 'IL', '62704', 'USA', true),
(2, 3, '101 Pine Avenue', 'Springfield', 'IL', '62704', 'USA', false),
(3, 5, '456 Oak Boulevard', 'Rivertown', 'CA', '90210', 'USA', true);

-- Payment Methods
INSERT INTO payment_methods (id, user_id, stripe_payment_method_id, brand, is_default, last_4_digits, exp_month, exp_year)
VALUES
(1, 3, 'pm_123456789', 'VISA', true, '4242', 12, 2025),
(2, 3, 'pm_987654321', 'MASTERCARD', false, '5678', 6, 2024),
(3, 5, 'pm_456789123', 'AMERICAN_EXPRESS', true, '9876', 9, 2026);

-- Orders
INSERT INTO orders (order_id, user_id, total_amount, status, created_at, shipping_address, payment_method_id, tracking_number)
VALUES
(1, 3, 1459.98, 'DELIVERED', NOW() - INTERVAL 30 DAY, 1, 1, 'TRK123456789'),
(2, 3, 159.99, 'SHIPPED', NOW() - INTERVAL 7 DAY, 1, 1, 'TRK987654321'),
(3, 5, 409.98, 'PROCESSING', NOW(), 3, 3, NULL);

-- Order Items
INSERT INTO order_items (order_item_id, order_id, product_id, quantity, price_at_purchase, discount_amount)
VALUES
(1, 1, 1, 1, 1299.99, 0),
(2, 1, 3, 1, 159.99, 0),
(3, 2, 3, 1, 159.99, 0),
(4, 3, 4, 1, 299.99, 0),
(5, 3, 5, 1, 79.99, 0);

-- Reviews
INSERT INTO reviews (user_id, product_id, rating, comment, created_at)
VALUES
(3, 1, 5, 'Excellent laptop! Fast and reliable.', NOW() - INTERVAL 20 DAY),
(3, 3, 4, 'Good sound quality, but battery life could be better.', NOW() - INTERVAL 5 DAY),
(5, 4, 5, 'Perfect fit and very comfortable material.', NOW() - INTERVAL 15 DAY),
(5, 5, 4, 'Lovely design, but sizing runs a bit small.', NOW() - INTERVAL 10 DAY);

-- Cart Items
INSERT INTO cart_items (id, user_id, product_id, quantity, added_at)
VALUES
(1, 3, 2, 1, NOW() - INTERVAL 1 DAY),
(2, 5, 6, 1, NOW() - INTERVAL 2 DAY);

-- Promo Codes
INSERT INTO promo_codes (id, code, discount_percent, valid_until)
VALUES
(1, 'SUMMER2023', 15, NOW() + INTERVAL 30 DAY),
(2, 'WELCOME10', 10, NOW() + INTERVAL 60 DAY);

-- Discounts
INSERT INTO discounts (product_id, start_date, end_date, discount_percent)
VALUES
(2, NOW(), NOW() + INTERVAL 7 DAY, 10),
(5, NOW(), NOW() + INTERVAL 14 DAY, 20);

-- Banners for homepage
INSERT INTO banners (id, image_url, target_url, title, position, is_active)
VALUES
(1, 'https://placehold.co/1200x300?text=Summer+Sale', '/category/2', 'Summer Sale - Up to 50% Off', 1, true),
(2, 'https://placehold.co/1200x300?text=New+Tech+Arrivals', '/category/1', 'New Tech Arrivals', 2, true),
(3, 'https://placehold.co/1200x300?text=Gift+Ideas', '/category/3', 'Gift Ideas for Everyone', 3, true);