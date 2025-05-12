-- Revised script to fix category slugs more robustly (using category_id)

-- Step 1: For all categories with NULL slugs, generate a slug from name + category_id to ensure initial uniqueness.
UPDATE categories
SET slug = CONCAT(
    LOWER(REPLACE(REPLACE(REPLACE(TRIM(name), ' & ', '-and-'), ' ', '-'), '(', '')), -- base slug part
    '-', category_id -- ensure provisional uniqueness part
)
WHERE slug IS NULL OR slug = '';

-- Step 2: Clean up ALL slugs (those newly set and any pre-existing ones)
-- Remove any characters that are not lowercase letters, numbers, or hyphens
UPDATE categories
SET slug = REGEXP_REPLACE(slug, '[^a-z0-9-]', '')
WHERE slug IS NOT NULL AND slug != '';

-- Replace multiple hyphens with a single hyphen
UPDATE categories
SET slug = REGEXP_REPLACE(slug, '-+', '-')
WHERE slug IS NOT NULL AND slug != '';

-- Remove leading or trailing hyphens
UPDATE categories
SET slug = TRIM(BOTH '-' FROM slug)
WHERE slug IS NOT NULL AND slug != '';

-- Step 3: Final uniqueness enforcement.
-- If, after cleaning, any slugs are still duplicates, append the category_id AGAIN to the one with the larger category_id to resolve it.
UPDATE categories c1
JOIN (
    SELECT slug, MIN(category_id) as min_category_id_for_slug
    FROM categories
    WHERE slug IS NOT NULL AND slug != ''
    GROUP BY slug
    HAVING COUNT(*) > 1
) c2 ON c1.slug = c2.slug AND c1.category_id > c2.min_category_id_for_slug
SET c1.slug = CONCAT(c1.slug, '-', c1.category_id);

-- Re-run cleanup for any slugs modified in the previous step (Step 3 might introduce -- or ---)
UPDATE categories
SET slug = REGEXP_REPLACE(slug, '-+', '-')
WHERE slug IS NOT NULL AND slug != '';

UPDATE categories
SET slug = TRIM(BOTH '-' FROM slug)
WHERE slug IS NOT NULL AND slug != '';


-- Step 4: Set active to true for all categories that are not explicitly set, or are false
SET SQL_SAFE_UPDATES = 0; -- Temporarily disable safe update mode

UPDATE categories
SET is_active = true
WHERE (is_active IS NULL OR is_active = false) AND category_id IS NOT NULL; -- Added category_id IS NOT NULL just in case, though safe_updates=0 is the main fix here

SET SQL_SAFE_UPDATES = 1; -- Re-enable safe update mode

SELECT category_id, name, slug, is_active FROM categories ORDER BY name; 