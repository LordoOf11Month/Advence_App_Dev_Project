-- Check if the unique constraint exists and drop it if it does
SET @db_name = DATABASE();
SET @table_name = 'reviews';
SET @index_name = 'UK_product_id_user_id';

SELECT COUNT(1) INTO @index_exists FROM information_schema.statistics 
WHERE table_schema = @db_name 
AND table_name = @table_name
AND index_name = @index_name;

SET @drop_statement = IF(@index_exists > 0, 
    CONCAT('ALTER TABLE ', @table_name, ' DROP INDEX ', @index_name), 
    'SELECT 1');

PREPARE stmt FROM @drop_statement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Recreate the reviews table with a proper ID column
-- First back up existing data if any
CREATE TABLE IF NOT EXISTS reviews_backup LIKE reviews;
INSERT INTO reviews_backup SELECT * FROM reviews;

-- Drop and recreate the table
DROP TABLE reviews;

CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rating INT NOT NULL,
    comment VARCHAR(2000),
    created_at DATETIME,
    updated_at DATETIME,
    verified_purchase BOOLEAN DEFAULT FALSE,
    product_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    CONSTRAINT UK_product_user UNIQUE (product_id, user_id)
);

-- Restore any existing data (excluding the id column which is now auto-generated)
INSERT INTO reviews (rating, comment, created_at, updated_at, verified_purchase, product_id, user_id)
SELECT rating, comment, created_at, updated_at, verified_purchase, product_id, user_id
FROM reviews_backup;

-- Add references to related tables
ALTER TABLE reviews 
ADD CONSTRAINT FK_reviews_product FOREIGN KEY (product_id) REFERENCES products (product_id),
ADD CONSTRAINT FK_reviews_user FOREIGN KEY (user_id) REFERENCES users (user_id);

-- You can drop the backup table if everything is ok
-- DROP TABLE reviews_backup; 