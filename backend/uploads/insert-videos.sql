-- Insert uploaded videos into gallery_photos table
-- Run this in TablePlus or your preferred SQL client

INSERT INTO gallery_photos 
  (image_url, category, finish, project_name, location, description, published, media_type, uploaded_by, created_at)
VALUES
  -- Video 1: Shop counter assembly
  ('https://res.cloudinary.com/dutrcfqnq/video/upload/v1783554664/Video6_eu5rne.mp4', 'partitions', 'silver', 'Shop counter assembly', 'Mombasa', 'Shop counter display/reception counter tops', true, 'video', NULL, NOW()),
  
  -- Video 2: Kitchen cabinet installation  
  ('https://res.cloudinary.com/dutrcfqnq/video/upload/v1783554663/Video5_adcbjp.mp4', 'partitions', 'mill', 'Kitchen cabinet installation', 'Nairobi', 'Kitchen cabinets in South C, Nairobi', true, 'video', NULL, NOW()),
  
  -- Video 3: Bathroom renovation timelapse
  ('https://res.cloudinary.com/dutrcfqnq/video/upload/v1783554651/Video3_amqky3.mp4', 'windows', 'mill', 'Bathroom renovation timelapse', 'Nairobi', 'Frameless shower cubicles', true, 'video', NULL, NOW()),
  
  -- Video 4: Door fitting demonstration
  ('https://res.cloudinary.com/dutrcfqnq/video/upload/v1783554630/Video4_tlvyaa.mp4', 'doors', 'mill', 'Door fitting demonstration', 'Kenya', 'Double door swing door', true, 'video', NULL, NOW()),
  
  -- Video 5: Office partition installation
  ('https://res.cloudinary.com/dutrcfqnq/video/upload/v1783554624/Video1_burjf5.mp4', 'partitions', 'mill', 'Office partition installation', 'Westlands', 'Office partitioning', true, 'video', NULL, NOW()),
  
  -- Video 6: Window installation process
  ('https://res.cloudinary.com/dutrcfqnq/video/upload/v1783554618/Video2_uekgjw.mp4', 'windows', 'mill', 'Window installation process', 'Nairobi', 'Projected windows/top hung windows', true, 'video', NULL, NOW());

-- Verify videos were added
SELECT * FROM gallery_photos WHERE media_type = 'video' ORDER BY created_at DESC;