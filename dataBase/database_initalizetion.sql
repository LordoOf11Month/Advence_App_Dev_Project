-- Create database
CREATE DATABASE IF NOT EXISTS e-commerce-db;
USE e-commerce-db;


-- Create user
CREATE USER ecomm_admin WITH PASSWORD 'Asd123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE e-commerce-db TO ecomm_admin;

-- Drop tables if they exist
DROP TABLE IF EXISTS cart_items, carts, shipments, reviews, issues, payments, order_items, orders, product_images, products, stores, addresses, categories, users;

-- Users
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(20) NOT NULL,
    email VARCHAR(70) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'seller', 'platform_admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_banned BOOLEAN DEFAULT FALSE,
    banned_at TIMESTAMP NULL,
    ban_reason TEXT
);

-- Categories
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    parent_category_id INT DEFAULT NULL,
    FOREIGN KEY (parent_category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- Stores
CREATE TABLE stores (
    store_id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    store_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(user_id)
);

-- Products
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    category_id INT DEFAULT NULL,
    name VARCHAR(80) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    FOREIGN KEY (store_id) REFERENCES stores(store_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- Orders
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(12,2) NOT NULL  CHECK (total_amount >= 0),
    status VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
   
);

-- Order Items
CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    store_id INT NOT NULL  CHECK (quantity > 0),
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(12,2) NOT NULL   CHECK (price_at_purchase >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (store_id) REFERENCES stores(store_id)
);

-- Payments
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    payment_gateway VARCHAR(100) NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Issues
CREATE TABLE issues (
    issue_id INT AUTO_INCREMENT PRIMARY KEY,
    order_item_id INT NOT NULL,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    resolved_by INT DEFAULT NULL,
    FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (resolved_by) REFERENCES users(user_id)
);

-- Addresses
CREATE TABLE addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Carts
CREATE TABLE carts (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Cart Items
CREATE TABLE cart_items (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Product Images
CREATE TABLE product_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Shipments
CREATE TABLE shipments (
    shipment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    tracking_number VARCHAR(100),
    carrier VARCHAR(50),
    status VARCHAR(20),
    estimated_delivery DATE,
    actual_delivery_date DATE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Reviews
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL  CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
