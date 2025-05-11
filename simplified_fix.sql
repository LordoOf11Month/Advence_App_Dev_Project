-- Create a backup of existing reviews
CREATE TABLE reviews_backup AS SELECT * FROM reviews;

-- Drop the existing table
DROP TABLE reviews;

-- Recreate the table with an ID column
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

-- Restore the data
INSERT INTO reviews (rating, comment, created_at, updated_at, verified_purchase, product_id, user_id)
SELECT rating, comment, created_at, updated_at, verified_purchase, product_id, user_id
FROM reviews_backup;

-- Add the foreign keys
ALTER TABLE reviews 
ADD CONSTRAINT FK_reviews_product FOREIGN KEY (product_id) REFERENCES products (product_id),
ADD CONSTRAINT FK_reviews_user FOREIGN KEY (user_id) REFERENCES users (user_id); 