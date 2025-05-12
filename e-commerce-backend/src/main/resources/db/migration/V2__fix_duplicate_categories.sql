-- First, update product references to point to the most recent category
UPDATE products p
SET category_id = (
    SELECT c2.id
    FROM categories c1
    JOIN categories c2 ON c1.name = c2.name
    WHERE c1.id = p.category_id
    ORDER BY c2.id DESC
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1
    FROM categories c1
    JOIN categories c2 ON c1.name = c2.name
    WHERE c1.id = p.category_id
    AND c1.id != c2.id
);

-- Update subcategory references to point to the most recent parent category
UPDATE categories c
SET parent_category_id = (
    SELECT c2.id
    FROM categories c1
    JOIN categories c2 ON c1.name = c2.name
    WHERE c1.id = c.parent_category_id
    ORDER BY c2.id DESC
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1
    FROM categories c1
    JOIN categories c2 ON c1.name = c2.name
    WHERE c1.id = c.parent_category_id
    AND c1.id != c2.id
);

-- Delete duplicate categories, keeping the most recent one
DELETE FROM categories
WHERE id NOT IN (
    SELECT max_id
    FROM (
        SELECT MAX(id) as max_id
        FROM categories
        GROUP BY name
    ) as unique_categories
); 