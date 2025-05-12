-- Add stripe_charge_id column to order_items table if it doesn't exist
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS stripe_charge_id VARCHAR(255) DEFAULT NULL;

-- Add stripe_charge_id column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_charge_id VARCHAR(255) DEFAULT NULL; 