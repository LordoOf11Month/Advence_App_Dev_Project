-- Database initialization and schema creation for e-commerce application

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS ecommerce_db;

-- Create database user and grant privileges (from application.properties)
CREATE USER IF NOT EXISTS 'ecomm_admin'@'localhost' IDENTIFIED BY 'MyClearPass123!';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecomm_admin'@'localhost';
FLUSH PRIVILEGES;

USE ecommerce_db;

-- Create tables based on entity models

-- User table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    email VARCHAR(70) NOT NULL UNIQUE,
    phone_number VARCHAR(30),
    password_hash VARCHAR(128) NOT NULL,
    role ENUM('customer', 'seller', 'admin') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    stripe_customer_id VARCHAR(255),
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    banned_at TIMESTAMP NULL,
    ban_reason TEXT,
    avatar_url TEXT
);

-- Address table
CREATE TABLE IF NOT EXISTS addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Store table
CREATE TABLE IF NOT EXISTS stores (
    store_id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (seller_id) REFERENCES users(user_id)
);

-- Category table
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    parent_id INT,
    image_url TEXT,
    FOREIGN KEY (parent_id) REFERENCES categories(category_id)
);

-- Sub-category relation table
CREATE TABLE IF NOT EXISTS subcategory_relations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_category_id INT NOT NULL,
    child_category_id INT NOT NULL,
    FOREIGN KEY (parent_category_id) REFERENCES categories(category_id),
    FOREIGN KEY (child_category_id) REFERENCES categories(category_id)
);

-- Product table
CREATE TABLE IF NOT EXISTS products (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    category_id INT,
    name VARCHAR(80) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    free_shipping BOOLEAN NOT NULL DEFAULT FALSE,
    fast_delivery BOOLEAN NOT NULL DEFAULT FALSE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    average_rating FLOAT,
    rating_count INT,
    total_rating INT,
    total_sales INT,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (store_id) REFERENCES stores(store_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- ProductImage table
CREATE TABLE IF NOT EXISTS product_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Banner table
CREATE TABLE IF NOT EXISTS banners (
    banner_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    link_url VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Order table
CREATE TABLE IF NOT EXISTS orders (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    shipping_address_id INT,
    payment_method_id INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    tracking_number VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (shipping_address_id) REFERENCES addresses(address_id)
);

-- OrderItem table
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- PaymentMethod table
CREATE TABLE IF NOT EXISTS payment_methods (
    payment_method_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    account_number VARCHAR(30),
    expiry_date VARCHAR(10),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Review table
CREATE TABLE IF NOT EXISTS reviews (
    review_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Refund table
CREATE TABLE IF NOT EXISTS refunds (
    refund_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Notification table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- CartItem table
CREATE TABLE IF NOT EXISTS cart_items (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Discount table
CREATE TABLE IF NOT EXISTS discounts (
    discount_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- PromoCode table
CREATE TABLE IF NOT EXISTS promo_codes (
    promo_code_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    discount_percentage DECIMAL(5,2) NOT NULL
);

-- User favorite products (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_favorite_products (
    user_id INT NOT NULL,
    product_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Insert a default customer user
INSERT INTO users (first_name, last_name, email, phone_number, password_hash, role, created_at)
VALUES ('Default', 'Customer', 'customer@example.com', '+1234567890', 
        '$2a$10$xPJQdJ.qPY1qQzwK4r0SWecQM/O6.iYbw0aYp9l.zIGULxlVtCHs.', -- hashed password: 'password123'
        'customer', NOW());

-- Commit the transaction
COMMIT; 