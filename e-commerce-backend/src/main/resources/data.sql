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





-- Sample Data for E-commerce Application

-- Users
-- Note: Passwords are now stored as plaintext for development purposes ONLY - NOT SECURE FOR PRODUCTION
INSERT INTO users (user_id, first_name, last_name, email, phone_number, password_hash, role, created_at, stripe_customer_id, is_banned, banned_at, ban_reason, avatar_url)
VALUES
(1, 'john', 'doe', 'admin@example.com', '1234567890', 'password', 'admin', NOW(), 'cus_admin123', false, NULL, NULL, 'https://randomuser.me/api/portraits/men/1.jpg'),
(2, 'jane', 'doe', 'seller@example.com', '0987654321', 'password', 'seller', NOW(), 'cus_seller123', false, NULL, NULL, 'https://randomuser.me/api/portraits/women/1.jpg'),
(3, 'alice', 'henderson', 'customer@example.com', '1122334455', 'password', 'customer', NOW(), 'cus_cust123', false, NULL, NULL, 'https://randomuser.me/api/portraits/women/2.jpg'),
(4, 'bob', 'sanders', 'seller2@example.com', '5544332211', 'password', 'seller', NOW(), 'cus_seller456', false, NULL, NULL, 'https://randomuser.me/api/portraits/men/2.jpg'),
(5, 'charlie', 'yılmaz', 'customer2@example.com', '6677889900', 'password', 'customer', NOW(), 'cus_cust456', false, NULL, NULL, 'https://randomuser.me/api/portraits/men/3.jpg');

-- Categories from frontend mockup with enhanced fields
-- Root Categories
INSERT INTO categories (category_id, name, slug, image_url, description, is_active, parent_category_id) VALUES
(1, 'Electronics', 'electronics', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=60', 'All electronic devices and accessories', true, NULL),
(31, 'Fashion', 'fashion', 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=60', 'Clothing and accessories for all', true, NULL),
(46, 'Home & Living', 'home-and-living', 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=60', 'Everything for your home', true, NULL),
(68, 'Beauty & Personal Care', 'beauty-and-personal-care', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=60', 'Beauty and personal care products', true, NULL),
(75, 'Sports & Outdoors', 'sports-and-outdoors', 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=60', 'Sports equipment and outdoor gear', true, NULL),
(90, 'Baby & Kids', 'baby-and-kids', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=60', 'Products for babies and children', true, NULL),
(100, 'Health & Wellness', 'health-and-wellness', 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=60', 'Health and wellness products', true, NULL),
(110, 'Automotive', 'automotive', 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=60', 'Automotive parts and accessories', true, NULL),
(120, 'Grocery & Food', 'grocery-and-food', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=60', 'Food and grocery items', true, NULL),
(123, 'Books & Entertainment', 'books-and-entertainment', 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&q=60', 'Books, movies, and entertainment', true, NULL),
(130, 'Office Products', 'office-products', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=60', 'Office supplies and equipment', true, NULL),
(140, 'Pet Supplies', 'pet-supplies', 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=60', 'Supplies for pets', true, NULL),
(150, 'Jewelry & Watches', 'jewelry-and-watches', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=60', 'Jewelry and watches', true, NULL);

-- Electronics subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(2, 'Mobile Phones', 'mobile-phones', 'Smartphones and mobile devices', true, 1),
(6, 'Computers & Tablets', 'computers-and-tablets', 'Computers, laptops, and tablets', true, 1),
(12, 'TV, Audio & Video', 'tv-audio-and-video', 'Television and audio equipment', true, 1),
(18, 'Cameras & Photography', 'cameras-and-photography', 'Cameras and photography equipment', true, 1),
(23, 'Gaming', 'gaming', 'Video games and gaming equipment', true, 1),
(27, 'Smart Home', 'smart-home', 'Smart home devices and accessories', true, 1);

-- Mobile Phones subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(3, 'Smartphones', 'smartphones', 'Latest smartphones from all brands', true, 2),
(4, 'Feature Phones', 'feature-phones', 'Basic feature phones', true, 2),
(5, 'Phone Accessories', 'phone-accessories', 'Cases, chargers, and other phone accessories', true, 2);

-- Computers & Tablets subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(7, 'Laptops', 'laptops', 'Portable computers for work and play', true, 6),
(8, 'Desktops', 'desktops', 'Desktop computers for home and office', true, 6),
(9, 'Tablets', 'tablets', 'Tablet computers for mobility', true, 6),
(10, 'Computer Components', 'computer-components', 'RAM, SSDs, GPUs, and other computer parts', true, 6),
(11, 'Computer Accessories', 'computer-accessories', 'Mice, keyboards, webcams, and other peripherals', true, 6);

-- TV, Audio & Video subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(13, 'Televisions', 'televisions', 'Smart TVs and standard televisions', true, 12),
(14, 'Headphones & Earphones', 'headphones-and-earphones', 'Wireless and wired audio devices', true, 12),
(15, 'Speakers', 'speakers', 'Bluetooth and wired speakers', true, 12),
(16, 'Soundbars', 'soundbars', 'Sound enhancement for TVs', true, 12),
(17, 'Projectors', 'projectors', 'Home and office projectors', true, 12);

-- Cameras & Photography subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(19, 'Digital Cameras', 'digital-cameras', 'DSLR and mirrorless cameras', true, 18),
(20, 'Lenses', 'camera-lenses', 'Camera lenses for all types of photography', true, 18),
(21, 'Drones', 'drones', 'Camera drones for aerial photography', true, 18),
(22, 'Camera Accessories', 'camera-accessories', 'Tripods, bags, and other camera gear', true, 18);

-- Gaming subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(24, 'Gaming Consoles', 'gaming-consoles', 'PlayStation, Xbox, Nintendo, and more', true, 23),
(25, 'Games', 'games', 'Video games for all platforms', true, 23),
(26, 'Gaming Accessories', 'gaming-accessories', 'Controllers, headsets, and other gaming gear', true, 23);

-- Smart Home subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(28, 'Smart Lights', 'smart-lights', 'Smart lighting solutions for your home', true, 27),
(29, 'Smart Assistants', 'smart-assistants', 'Alexa, Google Home, and other smart assistants', true, 27),
(30, 'Smart Security', 'smart-security', 'Smart cameras, locks, and other security devices', true, 27);

-- Fashion subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(32, 'Women', 'women', 'Fashion items for women', true, 31),
(37, 'Men', 'men', 'Fashion items for men', true, 31),
(42, 'Kids', 'kids', 'Fashion items for children', true, 31);

-- Women's fashion subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(33, 'Clothing', 'women-clothing', 'Dresses, tops, pants, and jackets for women', true, 32),
(34, 'Shoes', 'women-shoes', 'Heels, sneakers, and boots for women', true, 32),
(35, 'Bags & Wallets', 'women-bags-and-wallets', 'Handbags, purses, and wallets for women', true, 32),
(36, 'Accessories', 'women-accessories', 'Scarves, belts, and hats for women', true, 32);

-- Men's fashion subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(38, 'Clothing', 'men-clothing', 'Shirts, pants, suits, and jackets for men', true, 37),
(39, 'Shoes', 'men-shoes', 'Formal, casual, and sneakers for men', true, 37),
(40, 'Bags & Wallets', 'men-bags-and-wallets', 'Bags and wallets for men', true, 37),
(41, 'Accessories', 'men-accessories', 'Ties, belts, and hats for men', true, 37);

-- Kids fashion subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(43, 'Clothing', 'kids-clothing', 'Clothing for children', true, 42),
(44, 'Shoes', 'kids-shoes', 'Shoes for children', true, 42),
(45, 'Accessories', 'kids-accessories', 'Accessories for children', true, 42);

-- Home & Living subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(47, 'Furniture', 'furniture', 'Furniture for all rooms', true, 46),
(51, 'Home Decor', 'home-decor', 'Decorative items for your home', true, 46),
(56, 'Kitchen & Dining', 'kitchen-and-dining', 'Kitchen and dining essentials', true, 46),
(60, 'Bedding', 'bedding', 'Bed sheets, pillows, and comforters', true, 46),
(64, 'Storage & Organization', 'storage-and-organization', 'Storage solutions for your home', true, 46);

-- Furniture subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(48, 'Living Room Furniture', 'living-room-furniture', 'Sofas, coffee tables, and more', true, 47),
(49, 'Bedroom Furniture', 'bedroom-furniture', 'Beds, dressers, and nightstands', true, 47),
(50, 'Office Furniture', 'office-furniture', 'Desks, office chairs, and more', true, 47);

-- Home Decor subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(52, 'Lighting', 'lighting', 'Lamps, ceiling lights, and more', true, 51),
(53, 'Wall Art', 'wall-art', 'Paintings, prints, and wall decor', true, 51),
(54, 'Rugs & Carpets', 'rugs-and-carpets', 'Area rugs, throw rugs, and carpets', true, 51),
(55, 'Curtains', 'curtains', 'Window treatments and curtains', true, 51);

-- Kitchen & Dining subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(57, 'Cookware', 'cookware', 'Pots, pans, and cooking utensils', true, 56),
(58, 'Tableware', 'tableware', 'Plates, bowls, and serving dishes', true, 56),
(59, 'Kitchen Appliances', 'kitchen-appliances', 'Blenders, mixers, and other appliances', true, 56);

-- Bedding subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(61, 'Bed Sheets', 'bed-sheets', 'Sheet sets for all bed sizes', true, 60),
(62, 'Pillows', 'pillows', 'Bed pillows of all types', true, 60),
(63, 'Comforters', 'comforters', 'Comforters and duvets for your bed', true, 60);

-- Storage & Organization subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(65, 'Wardrobes', 'wardrobes', 'Clothing storage and wardrobes', true, 64),
(66, 'Shelves', 'shelves', 'Wall shelves and bookcases', true, 64),
(67, 'Organizers', 'organizers', 'Storage bins, baskets, and organizers', true, 64);

-- Beauty & Personal Care subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(69, 'Makeup', 'makeup', 'Foundation, lipstick, and other cosmetics', true, 68),
(70, 'Skincare', 'skincare', 'Facial cleansers, moisturizers, and more', true, 68),
(71, 'Hair Care', 'hair-care', 'Shampoo, conditioner, and styling products', true, 68),
(72, 'Fragrances', 'fragrances', 'Perfumes and colognes', true, 68),
(73, 'Tools & Accessories', 'beauty-tools-and-accessories', 'Hair dryers, straighteners, and other tools', true, 68),
(74, 'Men''s Grooming', 'mens-grooming', 'Grooming products for men', true, 68);

-- Sports & Outdoors subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(76, 'Exercise & Fitness', 'exercise-and-fitness', 'Fitness equipment for home workouts', true, 75),
(80, 'Outdoor Recreation', 'outdoor-recreation', 'Camping, hiking, and outdoor activities', true, 75),
(83, 'Sportswear', 'sportswear', 'Clothing and footwear for sports', true, 75),
(86, 'Team Sports', 'team-sports', 'Equipment for team sports', true, 75);

-- Exercise & Fitness subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(77, 'Treadmills', 'treadmills', 'Running machines for home use', true, 76),
(78, 'Dumbbells', 'dumbbells', 'Free weights for strength training', true, 76),
(79, 'Yoga Mats', 'yoga-mats', 'Mats for yoga and floor exercises', true, 76);

-- Outdoor Recreation subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(81, 'Camping & Hiking Gear', 'camping-and-hiking', 'Tents, backpacks, and camping equipment', true, 80),
(82, 'Bicycles', 'bicycles', 'Road bikes, mountain bikes, and more', true, 80);

-- Sportswear subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(84, 'Clothing', 'sports-clothing', 'Athletic apparel for all sports', true, 83),
(85, 'Footwear', 'sports-footwear', 'Athletic shoes for all sports', true, 83);

-- Team Sports subcategories
INSERT INTO categories (category_id, name, slug, description, is_active, parent_category_id) VALUES
(87, 'Football', 'football', 'Footballs, goals, and equipment', true, 86),
(88, 'Basketball', 'basketball', 'Basketballs, hoops, and accessories', true, 86),
(89, 'Tennis', 'tennis', 'Tennis rackets, balls, and equipment', true, 86);

-- Stores
INSERT INTO stores (store_id, seller_id, store_name, description, created_at, average_rating, total_sales, is_banned, banned_date, ban_reason, email, bank_name, account_holder, account_number, street, city, state, postal_code, country)
VALUES
(1, 2, 'Tech Haven', 'Your one-stop shop for the latest electronics and gadgets', NOW(), 4.7, 250, false, NULL, NULL, 'techhaven@example.com', 'Global Bank', 'Jane Seller', '1234567890', '123 Tech Street', 'Silicon Valley', 'CA', '94043', 'USA'),
(2, 4, 'Fashion Forward', 'Trendy clothes for all seasons', NOW(), 4.3, 180, false, NULL, NULL, 'fashionforward@example.com', 'City Bank', 'Bob Seller', '0987654321', '456 Fashion Avenue', 'New York', 'NY', '10001', 'USA');

-- Products from products.csv
INSERT INTO products (product_id, store_id, category_id, name, description, price, stock_quantity, average_rating, rating_count, total_rating, total_sales)
VALUES
(1001, 2, 3, 'iPhone 14 Pro', 'Latest iPhone with advanced camera system Brand: Apple', 999.99, 50, 4.8, 24, 115, 35),
(1002, 2, 3, 'Samsung Galaxy S23', 'Premium Android smartphone Brand: Samsung', 899.99, 45, 4.6, 42, 193, 75),
(1003, 1, 7, 'MacBook Pro 14-inch', 'Powerful laptop for professionals Brand: Apple', 1499.99, 30, 4.9, 18, 88, 25),
(1004, 2, 7, 'Dell XPS 13', 'Ultra-portable premium laptop Brand: Dell', 1299.99, 25, 4.7, 15, 71, 20),
(1005, 2, 13, '65-inch 4K OLED TV', 'Premium OLED Smart TV Brand: LG', 1999.99, 20, 4.8, 12, 58, 15),
(1006, 2, 14, 'Noise Cancelling Headphones', 'Premium wireless headphones Brand: Sony', 349.99, 45, 4.7, 28, 132, 40),
(2001, 1, 33, 'Summer Floral Dress', 'Light and breezy summer dress with floral pattern Brand: Zara', 79.99, 100, 4.5, 35, 158, 80),
(2002, 1, 33, 'High-Waist Jeans', 'Classic high-waist denim jeans Brand: Levis', 89.99, 80, 4.6, 42, 193, 65),
(2003, 1, 33, 'Classic White Shirt', 'Formal cotton shirt for men Brand: Hugo Boss', 49.99, 120, 4.4, 28, 123, 95),
(2004, 1, 33, 'Slim Fit Blazer', 'Professional blazer for modern men Brand: Calvin Klein', 199.99, 60, 4.7, 15, 71, 45),
(2005, 1, 34, 'Designer High Heels', 'Elegant evening heels Brand: Jimmy Choo', 299.99, 30, 4.8, 22, 106, 25),
(2006, 2, 39, 'Leather Oxford Shoes', 'Classic formal shoes Brand: Cole Haan', 249.99, 40, 4.6, 18, 83, 35),
(3001, 1, 48, '3-Seater Sofa', 'Comfortable modern sofa Brand: IKEA', 899.99, 20, 4.7, 15, 71, 12),
(3002, 1, 48, 'Coffee Table', 'Minimalist wooden coffee table Brand: West Elm', 299.99, 30, 4.5, 22, 99, 25),
(3003, 1, 52, 'Modern Pendant Light', 'Contemporary ceiling light Brand: Philips', 199.99, 40, 4.6, 18, 83, 30),
(3004, 1, 53, 'Abstract Canvas Set', 'Set of 3 canvas prints Brand: Art Gallery', 149.99, 25, 4.4, 15, 66, 20),
(3005, 1, 57, 'Non-stick Pan Set', 'Premium cookware set Brand: Le Creuset', 199.99, 35, 4.8, 28, 134, 25),
(3006, 1, 58, 'Porcelain Dinner Set', '16-piece dining set Brand: Royal Doulton', 149.99, 50, 4.7, 22, 103, 35),
(4001, 2, 69, 'MAC Lipstick Collection', 'Long-lasting matte lipstick Brand: MAC', 24.99, 200, 4.6, 45, 207, 150),
(4002, 1, 69, 'Foundation SPF 30', 'Full coverage liquid foundation Brand: Estee Lauder', 39.99, 150, 4.5, 38, 171, 120),
(4003, 1, 70, 'Vitamin C Serum', 'Brightening face serum Brand: The Ordinary', 59.99, 100, 4.7, 42, 197, 80),
(4004, 2, 70, 'Night Cream', 'Hydrating night cream Brand: Neutrogena', 49.99, 80, 4.4, 35, 154, 60),
(4007, 2, 72, 'Designer Perfume', 'Luxury women''s fragrance Brand: Chanel', 129.99, 60, 4.8, 28, 134, 45),
(4008, 2, 73, 'Makeup Brush Set', 'Professional makeup brushes Brand: MAC', 79.99, 100, 4.6, 35, 161, 75),
(5001, 2, 77, 'Pro Treadmill T1000', 'Professional grade treadmill Brand: NordicTrack', 1299.99, 15, 4.7, 18, 85, 10),
(5002, 2, 78, 'Adjustable Dumbbell Set', '20kg adjustable dumbbell set Brand: Bowflex', 299.99, 50, 4.6, 25, 115, 35),
(5005, 1, 84, 'Men''s Running Jacket', 'Lightweight running jacket Brand: Nike', 89.99, 75, 4.5, 32, 144, 60),
(5006, 1, 85, 'Women''s Training Shoes', 'Cross-training athletic shoes Brand: Adidas', 129.99, 60, 4.7, 28, 131, 45),
(6001, 1, 92, 'Premium Travel Stroller', 'Lightweight travel stroller Brand: UPPAbaby', 399.99, 30, 4.8, 22, 106, 20),
(6002, 2, 93, 'Convertible Car Seat', '4-in-1 convertible car seat Brand: Graco', 299.99, 40, 4.6, 18, 83, 30),
(6003, 1, 96, 'Science Kit', 'Educational science experiment kit Brand: National Geographic', 49.99, 100, 4.5, 35, 158, 80),
(6004, 2, 97, 'Superhero Action Figure Set', 'Collection of popular superheroes Brand: Marvel', 29.99, 150, 4.7, 42, 197, 120),
(6005, 1, 98, 'Interactive Baby Doll', 'Educational baby doll with accessories Brand: Mattel', 39.99, 80, 4.4, 28, 123, 60),
(6006, 1, 99, 'Family Board Game Set', 'Classic board game collection Brand: Hasbro', 49.99, 70, 4.6, 32, 147, 55),
(7001, 1, 103, 'Multivitamin Complex', 'Daily multivitamin supplements Brand: NOW Foods', 34.99, 200, 4.5, 45, 203, 150),
(7002, 2, 104, 'First Aid Kit', 'Comprehensive first aid kit Brand: Johnson & Johnson', 49.99, 120, 4.7, 35, 165, 90),
(7003, 2, 105, 'Electric Toothbrush', 'Smart sonic toothbrush Brand: Philips', 89.99, 90, 4.6, 38, 175, 70),
(7004, 1, 106, 'Intimate Care Set', 'Personal care essentials Brand: Durex', 39.99, 150, 4.4, 42, 185, 120),
(8001, 2, 110, 'Leather Seat Cover Set', 'Premium leather car seat covers Brand: AutoPro', 129.99, 60, 4.5, 28, 126, 45),
(8002, 1, 111, '4K Dash Camera', 'High resolution dash cam with night vision Brand: VANTRUE', 199.99, 40, 4.7, 22, 103, 30),
(8003, 2, 112, 'Motorcycle Helmet', 'DOT certified safety helmet Brand: Bell', 199.99, 30, 4.8, 25, 120, 20),
(8004, 1, 113, 'Car GPS Navigator', '7-inch touchscreen GPS Brand: Garmin', 149.99, 45, 4.6, 32, 147, 35),
(9001, 2, 117, 'Organic Fruit Basket', 'Selection of seasonal organic fruits Brand: Organic Farms', 49.99, 30, 4.7, 18, 85, 25),
(9002, 2, 118, 'Gourmet Pasta Set', 'Italian pasta variety pack Brand: Barilla', 29.99, 100, 4.5, 35, 158, 80),
(9003, 2, 119, 'Premium Coffee Set', 'Specialty coffee collection Brand: Starbucks', 59.99, 120, 4.6, 42, 193, 90),
(9004, 2, 120, 'Gourmet Nuts Selection', 'Mixed premium nuts Brand: Planters', 34.99, 200, 4.5, 45, 203, 150),
(10001, 1, 125, 'Best Selling Novel Collection', 'Set of 5 bestselling novels Brand: Penguin Books', 89.99, 50, 4.7, 28, 132, 35),
(10002, 2, 126, 'Self-Development Book Set', 'Popular self-help book collection Brand: Harper Collins', 69.99, 40, 4.6, 25, 115, 30),
(10003, 2, 128, '4K Movie Collection', 'Premium movie box set Brand: Universal Pictures', 79.99, 70, 4.5, 35, 158, 55),
(10004, 1, 130, 'Vinyl Record Collection', 'Classic rock vinyl set Brand: Sony Music', 129.99, 40, 4.8, 22, 106, 30),
(11001, 1, 134, 'Premium Fountain Pen Set', 'Luxury writing instruments collection Brand: Mont Blanc', 129.99, 30, 4.7, 18, 85, 25),
(11002, 1, 135, 'Color LaserJet Printer', 'Professional office printer Brand: HP', 399.99, 25, 4.6, 22, 101, 20),
(11003, 1, 136, 'Ergonomic Office Chair', 'Premium mesh office chair Brand: Herman Miller', 299.99, 25, 4.8, 28, 134, 20),
(11004, 1, 137, 'Video Conference Camera', 'HD webcam with microphone Brand: Logitech', 199.99, 40, 4.7, 25, 118, 30),
(12001, 2, 141, 'Premium Dog Food 15kg', 'High-quality dry dog food Brand: Royal Canin', 79.99, 100, 4.6, 45, 207, 75),
(12002, 2, 142, 'Cat Tree Condo', 'Large cat climbing tower Brand: PetPals', 149.99, 40, 4.7, 28, 132, 30),
(12003, 1, 143, 'Large Bird Cage', 'Spacious parrot cage Brand: Prevue Pet', 199.99, 20, 4.5, 15, 68, 15),
(12004, 1, 144, 'Aquarium Starter Kit', 'Complete 20-gallon setup Brand: Tetra', 149.99, 30, 4.6, 22, 101, 25),
(13001, 2, 148, 'Diamond Pendant Necklace', '18K gold diamond necklace Brand: Tiffany & Co', 999.99, 10, 4.9, 15, 74, 8),
(13002, 2, 149, 'Stainless Steel Watch', 'Premium mens watch Brand: Fossil', 299.99, 30, 4.7, 25, 118, 25),
(13003, 1, 151, 'Luxury Chronograph Watch', 'Swiss-made automatic watch Brand: TAG Heuer', 1499.99, 15, 4.8, 18, 86, 12),
(13004, 2, 152, 'Rose Gold Watch', 'Elegant women''s timepiece Brand: Michael Kors', 899.99, 25, 4.7, 22, 103, 20),
(14001, 1, 156, 'Digital Microscope', 'Professional USB microscope Brand: AmScope', 799.99, 15, 4.6, 18, 83, 12),
(14002, 1, 157, 'Safety Gear Set', 'Complete workplace safety kit Brand: 3M', 199.99, 50, 4.7, 28, 132, 35),
(14003, 1, 158, 'Industrial Face Masks', 'N95 protective masks 50pc Brand: 3M', 49.99, 200, 4.5, 45, 203, 150),
(14004, 2, 159, 'Digital Caliper', 'Precision measuring tool Brand: Mitutoyo', 79.99, 40, 4.6, 25, 115, 30),
(15001, 1, 161, 'Hardshell Spinner Luggage', 'Durable travel suitcase Brand: Samsonite', 199.99, 60, 4.7, 35, 165, 45),
(15002, 2, 162, 'Travel Backpack 40L', 'Anti-theft travel backpack Brand: SwissGear', 129.99, 80, 4.6, 42, 193, 60),
(15003, 1, 163, 'Travel Adapter Set', 'Universal power adapter Brand: EPICKA', 29.99, 150, 4.5, 45, 203, 120),
(15004, 2, 164, 'Travel Toiletry Kit', 'Complete grooming essentials Brand: Victorinox', 39.99, 100, 4.6, 35, 161, 75);

-- Product Images from product_imgs.csv
INSERT INTO product_images (image_id, product_id, image_url, is_primary)
VALUES
(1, 1001, 'https://images.unsplash.com/photo-1632661674596-618be0e9d160?w=500', true),
(2, 1002, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500', true),
(3, 1003, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', true),
(4, 1004, 'https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?w=500', true),
(5, 1005, 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500', true),
(6, 1006, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', true),
(7, 2001, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500', true),
(8, 2002, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500', true),
(9, 2003, 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500', true),
(10, 2004, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500', true),
(11, 2005, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500', true),
(12, 2006, 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500', true),
(13, 3001, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500', true),
(14, 3002, 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=500', true),
(15, 3003, 'https://images.unsplash.com/photo-1524484485331-a920e742ae05?w=500', true),
(16, 3004, 'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=500', true),
(17, 3005, 'https://images.unsplash.com/photo-1584284766765-adb4e225b893?w=500', true),
(18, 3006, 'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=500', true),
(19, 4001, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500', true),
(20, 4002, 'https://images.unsplash.com/photo-1600852306771-c963331f6ed9?w=500', true),
(21, 4003, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500', true),
(22, 4004, 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500', true),
(23, 4007, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500', true),
(24, 4008, 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=500', true),
(25, 5001, 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500', true),
(26, 5002, 'https://images.unsplash.com/photo-1586401100295-7a5093aa7f9f?w=500', true),
(27, 5005, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', true),
(28, 5006, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500', true),
(29, 6001, 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=500', true),
(30, 6002, 'https://images.unsplash.com/photo-1591324535489-9c78376631dc?w=500', true),
(31, 6003, 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=500', true),
(32, 6004, 'https://images.unsplash.com/photo-1608889825271-9696283ab804?w=500', true),
(33, 6005, 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500', true),
(34, 6006, 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=500', true),
(35, 7001, 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=500', true),
(36, 7002, 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500', true),
(37, 7003, 'https://images.unsplash.com/photo-1559591937-abc3a5d51b93?w=500', true),
(38, 7004, 'https://images.unsplash.com/photo-1584473457493-17c504be510f?w=500', true),
(39, 8001, 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500', true),
(40, 8002, 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=500', true),
(41, 8003, 'https://images.unsplash.com/photo-1591378603223-e15b45a81640?w=500', true),
(42, 8004, 'https://images.unsplash.com/photo-1619615713569-696192aa3766?w=500', true),
(43, 9001, 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500', true),
(44, 9002, 'https://images.unsplash.com/photo-1551462147-37885dee2088?w=500', true),
(45, 9003, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500', true),
(46, 9004, 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=500', true),
(47, 10001, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500', true),
(48, 10002, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500', true),
(49, 10003, 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500', true),
(50, 10004, 'https://images.unsplash.com/photo-1603732551658-5fabbafa84eb?w=500', true),
(51, 11001, 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500', true),
(52, 11002, 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500', true),
(53, 11003, 'https://images.unsplash.com/photo-1589884629038-b631346a23c0?w=500', true),
(54, 11004, 'https://images.unsplash.com/photo-1596566762488-3d67e8b0c661?w=500', true),
(55, 12001, 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=500', true),
(56, 12002, 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500', true),
(57, 12003, 'https://images.unsplash.com/photo-1604848698030-c434ba08ece1?w=500', true),
(58, 12004, 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500', true),
(59, 13001, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500', true),
(60, 13002, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500', true),
(61, 13003, 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=500', true),
(62, 13004, 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500', true),
(63, 14001, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500', true),
(64, 14002, 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=500', true),
(65, 14003, 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=500', true),
(66, 14004, 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500', true),
(67, 15001, 'https://images.unsplash.com/photo-1565031491910-e57fac031c41?w=500', true),
(68, 15002, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a45?w=500', true),
(69, 15003, 'https://images.unsplash.com/photo-1484901097220-594e4f5c0b87?w=500', true),
(70, 15004, 'https://images.unsplash.com/photo-1470309864661-68328b2cd0a5?w=500', true);


INSERT INTO sub_category_relations (ancestor_id, descendant_id, depth) VALUES
(1,2,1),(1,3,2),(1,4,2),(1,5,2),(1,6,1),(1,7,2),(1,8,2),(1,9,2),(1,10,2),
(1,11,2),(1,12,1),(1,13,2),(1,14,2),(1,15,2),(1,16,2),(1,17,2),(1,18,1),
(1,19,2),(1,20,2),(1,21,2),(1,22,2),(1,23,1),(1,24,2),(1,25,2),(1,26,2),
(1,27,1),(1,28,2),(1,29,2),(1,30,2),(2,3,1),(2,4,1),(2,5,1),(6,7,1),(6,8,1),
(6,9,1),(6,10,1),(6,11,1),(12,13,1),(12,14,1),(12,15,1),(12,16,1),(12,17,1),
(18,19,1),(18,20,1),(18,21,1),(18,22,1),(23,24,1),(23,25,1),(23,26,1),(27,28,1),
(27,29,1),(27,30,1),(31,32,1),(31,33,2),(31,34,2),(31,35,2),(31,36,2),(31,37,1),
(31,38,2),(31,39,2),(31,40,2),(31,41,2),(31,42,1),(31,43,2),(31,44,2),(31,45,2),
(32,33,1),(32,34,1),(32,35,1),(32,36,1),(37,38,1),(37,39,1),(37,40,1),(37,41,1),
(42,43,1),(42,44,1),(42,45,1),(46,47,1),(46,48,2),(46,49,2),(46,50,2),(46,51,1),
(46,52,2),(46,53,2),(46,54,2),(46,55,2),(46,56,1),(46,57,2),(46,58,2),(46,59,2),
(46,60,1),(46,61,2),(46,62,2),(46,63,2),(46,64,1),(46,65,2),(46,66,2),(46,67,2),
(47,48,1),(47,49,1),(47,50,1),(51,52,1),(51,53,1),(51,54,1),(51,55,1),(56,57,1),
(56,58,1),(56,59,1),(60,61,1),(60,62,1),(60,63,1),(64,65,1),(64,66,1),(64,67,1),
(68,69,1),(68,70,1),(68,71,1),(68,72,1),(68,73,1),(68,74,1),(75,76,1),(75,77,2),
(75,78,2),(75,79,2),(75,80,1),(75,81,2),(75,82,2),(75,83,1),(75,84,2),(75,85,2),
(75,86,1),(75,87,2),(75,88,2),(75,89,2),(76,77,1),(76,78,1),(76,79,1),(80,81,1),
(80,82,1),(83,84,1),(83,85,1),(86,87,1),(86,88,1),(86,89,1),(90,91,1),(90,92,2),
(90,93,2),(90,94,2),(90,95,1),(90,96,2),(90,97,2),(90,98,2),(90,99,2),(90,100,2),
(90,101,1),(91,92,1),(91,93,1),(91,94,1),(95,96,1),(95,97,1),(95,98,1),(95,99,1),
(95,100,1),(102,103,1),(102,104,1),(102,105,1),(102,106,1),(102,107,1),(108,109,1),
(108,110,2),(108,111,2),(108,112,1),(108,113,1),(108,114,1),(108,115,1),(109,110,1),
(109,111,1),(116,117,1),(116,118,1),(116,119,1),(116,120,1),(116,121,1),(116,122,1),
(123,124,1),(123,125,2),(123,126,2),(123,127,2),(123,128,1),(123,129,1),(123,130,2),
(123,131,2),(124,125,1),(124,126,1),(124,127,1),(129,130,1),(129,131,1),(132,133,1),
(132,134,2),(132,135,2),(132,136,1),(132,137,1),(132,138,2),(132,139,2),(133,134,1),
(133,135,1),(140,141,1),(140,142,1),(140,143,1),(140,144,1),(140,145,1),(140,146,1),
(147,148,1),(147,149,1),(147,150,1),(147,151,2),(147,152,2),(147,153,1),(147,154,1),
(150,151,1),(150,152,1),(155,156,1),(155,157,1),(155,158,1),(155,159,1),(160,161,1),
(160,162,1),(160,163,1),(160,164,1);