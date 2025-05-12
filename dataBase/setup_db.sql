-- Create the database
CREATE DATABASE IF NOT EXISTS ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create the user for localhost and 127.0.0.1
CREATE USER IF NOT EXISTS 'ecomm_admin'@'localhost' IDENTIFIED BY 'MyClearPass123!';
CREATE USER IF NOT EXISTS 'ecomm_admin'@'127.0.0.1' IDENTIFIED BY 'MyClearPass123!';

-- Grant privileges
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecomm_admin'@'localhost';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecomm_admin'@'127.0.0.1';

-- Apply changes
FLUSH PRIVILEGES; 