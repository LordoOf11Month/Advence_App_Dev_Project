--brand field add to products table

ALTER TABLE products
ADD COLUMN brand VARCHAR(70);

--Cart table droped and Cart item table updated
DROP TABLE carts IF EXISTS;

ALTER TABLE cart_items RENAME COLUMN cart_id TO user_id;

--order_items table updated
ALTER TABLE order_items ADD COLUMN  rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE order_items DROP COLUMN store_id;

--reviews table droped
DROP TABLE reviews IF EXISTS;

--order updated
ALTER TABLE orders ADD COLUMN    
    tracking_number VARCHAR(100),
    carrier VARCHAR(50),
    status VARCHAR(20),
    estimated_delivery DATE,
    actual_delivery_date DATE;

--shiment droped
DROP TABLE shipments;