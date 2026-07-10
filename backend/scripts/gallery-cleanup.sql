-- ============================================================
-- Gallery Cleanup Script
-- Run this in TablePlus to clear existing gallery images
-- ============================================================

-- Safety check - show how many images will be deleted
SELECT COUNT(*) as total_images_to_delete FROM gallery_photos;

-- Delete ALL gallery images
-- (If you want to keep specific images, use WHERE clause)
DELETE FROM gallery_photos;

-- Verify deletion
SELECT COUNT(*) as remaining_images FROM gallery_photos;

-- Reset auto-increment if using serial (PostgreSQL)
-- ALTER SEQUENCE gallery_photos_id_seq RESTART WITH 1;