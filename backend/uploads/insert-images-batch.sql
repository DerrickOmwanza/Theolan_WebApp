-- Batch insert for existing numbered images (Image1.jpeg/Image2.jpeg etc)
-- These are placeholder entries - metadata can be edited later in admin panel

-- First, clean up any previous entries for these numbered images
DELETE FROM gallery_photos WHERE image_url LIKE '%Image1.jpeg%' 
   OR image_url LIKE '%Image2.jpeg%' 
   OR image_url LIKE '%Image3.jpeg%' 
   OR image_url LIKE '%Image4.jpeg%'
   OR image_url LIKE '%Image56.jpeg%';

-- Base URL pattern for your Cloudinary folder
-- You'll need to replace this with actual URLs after uploading

-- Example batch insert (you'll need to get actual Cloudinary URLs for all 56 images):
INSERT INTO gallery_photos 
  (image_url, category, finish, project_name, location, description, published, media_type)
VALUES
  ('https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/V_PATH/Image1.jpeg', 'partitions', 'mill', 'Kitchen cabinets', 'South C, Nairobi', 'Modern kitchen cabinets', true, 'image'),
  ('https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/V_PATH/Image2.jpeg', 'partitions', 'mill', 'Kitchen cabinets', 'South C, Nairobi', 'Modern kitchen cabinets', true, 'image'),
  ('https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/V_PATH/Image3.jpeg', 'doors', 'mill', 'Frameless doors', 'Karen Estate', 'Premium frameless aluminium doors', true, 'image'),
  ('https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/V_PATH/Image4.jpeg', 'partitions', 'mill', 'Gypsum wall partitioning', 'Nairobi', 'Professional gypsum wall with glass partition', true, 'image'),
  ('https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/V_PATH/Image5.jpeg', 'windows', 'mill', 'Frameless shower cubicles', 'Nairobi', 'Custom frameless shower cubicle installations', true, 'image');
-- Continue for all 56 images...

-- Check what's in your database
SELECT COUNT(*) as total_images FROM gallery_photos WHERE media_type = 'image';
SELECT COUNT(*) as total_videos FROM gallery_photos WHERE media_type = 'video';