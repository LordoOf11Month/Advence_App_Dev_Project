-- Update categories with null slugs
UPDATE categories
SET slug = LOWER(REPLACE(name, ' ', '-'))
WHERE slug IS NULL;

-- Update categories with invalid slugs
UPDATE categories
SET slug = LOWER(REPLACE(name, ' ', '-'))
WHERE slug NOT REGEXP '^[a-z0-9]+(?:-[a-z0-9]+)*$';

-- Ensure unique slugs by appending ID if necessary
UPDATE categories c1
SET slug = CONCAT(c1.slug, '-', c1.id)
WHERE EXISTS (
    SELECT 1
    FROM categories c2
    WHERE c2.slug = c1.slug
    AND c2.id < c1.id
); 