-- Sample Data for E-commerce Application

-- Users
-- Note: Passwords should be properly hashed in a real application.
INSERT INTO users (user_id, first_name, last_name, email, phone_number, password_hash, role, created_at, stripe_customer_id, is_banned, banned_at, ban_reason, avatar_url)
VALUES
(1, 'John', 'Doe', 'john.doe@admin.com', '1234567890', '$2a$10$placeholderhashadmin', 'admin', NOW(), 'cus_admin123', false, NULL, NULL, NULL),
(2, 'Jane', 'Smith', 'jane.smith@seller.com', '0987654321', '$2a$10$placeholderhashseller1', 'seller', NOW(), 'cus_seller123', false, NULL, NULL, NULL),
(3, 'Alice', 'Brown', 'alice.brown@customer.com', '1122334455', '$2a$10$placeholderhashcust1', 'customer', NOW(), 'cus_cust123', false, NULL, NULL, NULL),
(4, 'Bob', 'White', 'bob.white@seller.com', '5544332211', '$2a$10$placeholderhashseller2', 'seller', NOW(), 'cus_seller456', true, NOW(), 'Violated terms of service', NULL),
(5, 'Charlie', 'Green', 'charlie.green@customer.com', '6677889900', '$2a$10$placeholderhashcust2', 'customer', NOW(), 'cus_cust456', false, NULL, NULL, NULL);

-- Categories
INSERT INTO categories (category_id, name, parent_category_id)
VALUES
(1, 'Electronics', NULL),
(2, 'Clothing', NULL),
(3, 'Laptops', 1),
(4, 'Smartphones', 1),
(5, 'T-Shirts', 2);

-- Stores (Link to seller users)
-- Assuming user_id 2 (Jane Smith) and user_id 4 (Bob White) are sellers
INSERT INTO stores (store_id, seller_id, store_name, description, created_at, average_rating, total_sales, is_banned, banned_date, ban_reason, email, bank_name, account_holder, account_number, street, city, state, postal_code, country)
VALUES
(1, 2, 'Janes Gadgets', 'Latest electronic gadgets and accessories', NOW(), 4.5, 150, false, NULL, NULL, 'jane.store@example.com', 'Example Bank', 'Jane Smith Store', '111222333', '123 Tech Ave', 'Gadget City', 'CA', '90210', 'USA'),
(2, 4, 'Bobs Apparel', 'Trendy and classic clothing items', NOW(), 3.8, 85, true, NOW(), 'Account suspended due to policy violation', 'bob.store@example.com', 'Another Bank', 'Bob White Store', '444555666', '456 Fashion St', 'Style Town', 'NY', '10001', 'USA');

-- Products (Link to stores and categories)
INSERT INTO products (product_id, store_id, category_id, name, description, price, stock_quantity, average_rating, rating_count, total_rating, total_sales)
VALUES
(1, 1, 3, 'Gaming Laptop X', 'High-performance gaming laptop with RTX 4090', 2499.99, 15, 4.8, 25, 120, 50),
(2, 1, 4, 'Smartphone Pro', 'Latest generation smartphone with advanced camera', 1099.00, 50, 4.6, 110, 506, 100),
(3, 2, 5, 'Graphic T-Shirt - Cool Design', 'Comfortable cotton t-shirt with a unique graphic print', 29.95, 100, 4.2, 30, 126, 60),
(4, 2, 5, 'Basic Plain T-Shirt - Black', 'Simple and versatile black cotton t-shirt', 15.50, 200, 4.0, 15, 60, 25);

-- You can add more INSERT statements for other tables like:
-- addresses, payment_methods, orders, order_items, reviews, cart_items, etc.
-- Remember to respect foreign key constraints.

-- Example Address for User 3 (Alice Brown)
-- INSERT INTO addresses (address_id, user_id, street, city, state, postal_code, country, is_default)
-- VALUES (1, 3, '789 Home Ln', 'Resident Town', 'TX', '75001', 'USA', true);

-- Example Payment Method for User 5 (Charlie Green)
-- INSERT INTO payment_methods (id, user_id, stripe_payment_method_id, brand, is_default, last_4_digits, exp_month, exp_year)
-- VALUES (1, 5, 'pm_123abcDEF456', 'VISA', true, '4242', 12, 2025);