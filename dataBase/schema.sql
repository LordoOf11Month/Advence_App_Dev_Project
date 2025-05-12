-- Drop existing tables if they exist (in reverse order to avoid foreign key constraint issues)
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS discounts;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS banners;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS promo_codes;
DROP TABLE IF EXISTS sub_category_relations;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- Create tables
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    email VARCHAR(70) NOT NULL UNIQUE,
    phone_number VARCHAR(30),
    password_hash VARCHAR(128) NOT NULL,
    role ENUM('admin', 'seller', 'customer') NOT NULL,
    created_at TIMESTAMP NOT NULL,
    stripe_customer_id VARCHAR(255),
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    banned_at TIMESTAMP NULL,
    ban_reason TEXT,
    avatar_url TEXT
);

CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    parent_category_id INT,
    FOREIGN KEY (parent_category_id) REFERENCES categories(category_id)
);

CREATE TABLE stores (
    store_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    store_name VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    average_rating FLOAT,
    total_sales INT,
    is_banned BOOLEAN,
    banned_date TIMESTAMP,
    ban_reason TEXT,
    email VARCHAR(70) NOT NULL,
    bank_name VARCHAR(100),
    account_holder VARCHAR(100),
    account_number VARCHAR(50),
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    FOREIGN KEY (seller_id) REFERENCES users(user_id)
);

CREATE TABLE products (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    category_id INT,
    name VARCHAR(80) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL,
    average_rating FLOAT,
    rating_count INT,
    total_rating INT,
    total_sales INT,
    FOREIGN KEY (store_id) REFERENCES stores(store_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE product_images (
    image_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE addresses (
    address_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE payment_methods (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    stripe_payment_method_id VARCHAR(255) NOT NULL,
    brand ENUM('VISA', 'MASTERCARD', 'AMERICAN_EXPRESS', 'DISCOVER', 'OTHER') NOT NULL,
    is_default BOOLEAN NOT NULL,
    last_4_digits VARCHAR(4),
    exp_month INT NOT NULL,
    exp_year INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE orders (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address BIGINT NOT NULL,
    payment_method_id BIGINT,
    stripe_charge_id VARCHAR(255),
    tracking_number VARCHAR(50),
    actual_delivery_date TIMESTAMP,
    estimated_delivery DATE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (shipping_address) REFERENCES addresses(address_id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
);

CREATE TABLE order_items (
    order_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment VARCHAR(2000),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    likes INT,
    dislikes INT,
    UNIQUE KEY unique_user_product (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    added_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE banners (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    image_url TEXT NOT NULL,
    target_url VARCHAR(255) NOT NULL,
    title VARCHAR(100) NOT NULL,
    position INT NOT NULL,
    is_active BOOLEAN NOT NULL
);

CREATE TABLE discounts (
    product_id BIGINT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    discount_percent INT NOT NULL,
    PRIMARY KEY (product_id, start_date),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE promo_codes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    discount_percent INT NOT NULL,
    valid_until TIMESTAMP NOT NULL
);

CREATE TABLE sub_category_relations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ancestor_id INT NOT NULL,
    descendant_id INT NOT NULL,
    depth INT NOT NULL,
    FOREIGN KEY (ancestor_id) REFERENCES categories(category_id),
    FOREIGN KEY (descendant_id) REFERENCES categories(category_id),
    UNIQUE KEY unique_relation (ancestor_id, descendant_id)
); 