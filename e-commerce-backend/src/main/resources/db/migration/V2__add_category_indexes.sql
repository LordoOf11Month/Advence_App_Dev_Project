-- Add indexes for category-related queries
CREATE INDEX IF NOT EXISTS idx_category_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_category_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_product_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_category_parent ON categories(parent_category_id);

-- Add composite index for category name and parent for faster hierarchical queries
CREATE INDEX IF NOT EXISTS idx_category_name_parent ON categories(name, parent_category_id);

-- Add index for category active status
CREATE INDEX IF NOT EXISTS idx_category_active ON categories(is_active); 