-- Drop the unique constraint if it exists
ALTER TABLE reviews DROP INDEX IF EXISTS UK_product_id_user_id;

-- Check if the ID column exists, if not add it
-- First create a temporary column
ALTER TABLE reviews ADD COLUMN temp_id BIGINT AUTO_INCREMENT PRIMARY KEY;

-- Create a backup of the reviews table first
CREATE TABLE IF NOT EXISTS reviews_backup AS SELECT * FROM reviews;

-- Drop and recreate the reviews table with a proper ID column
DROP TABLE IF EXISTS reviews;

CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rating INT NOT NULL,
    comment VARCHAR(2000),
    created_at DATETIME,
    updated_at DATETIME,
    verified_purchase BOOLEAN DEFAULT FALSE,
    product_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    UNIQUE KEY UK_product_user (product_id, user_id)
);

-- Restore any existing data from the backup
INSERT INTO reviews (rating, comment, created_at, updated_at, verified_purchase, product_id, user_id)
SELECT rating, comment, created_at, updated_at, verified_purchase, product_id, user_id
FROM reviews_backup;

-- Add foreign key constraints
ALTER TABLE reviews 
ADD CONSTRAINT FK_reviews_product FOREIGN KEY (product_id) REFERENCES products (product_id),
ADD CONSTRAINT FK_reviews_user FOREIGN KEY (user_id) REFERENCES users (user_id);

-- Keep the backup table for safety (can be manually dropped later)
-- DROP TABLE reviews_backup; 