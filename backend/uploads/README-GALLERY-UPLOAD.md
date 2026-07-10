# Gallery Image Upload Instructions

## Overview
You have 56 new images to upload to replace the existing gallery content. This guide explains how to use the new direct file upload feature.

## Prerequisites
✅ Admin dashboard access
✅ Images ready locally
✅ TablePlus for database cleanup

## Step-by-Step Process

### Step 1: Clean Existing Gallery (via TablePlus)

1. Open TablePlus and connect to your Render database
2. Run the SQL from `gallery-cleanup.sql`:
```sql
-- Safety check
SELECT COUNT(*) as total_images FROM gallery_photos;

-- Delete all gallery images
DELETE FROM gallery_photos;

-- Verify
SELECT COUNT(*) as remaining FROM gallery_photos;
```

### Step 2: Prepare Your Image Files

Create a folder: `backend/uploads/gallery/`

Organize your images with numbered prefixes:
```
backend/uploads/gallery/
├── 01-kitchen-cabinets-1.jpg
├── 02-kitchen-cabinets-2.jpg
├── 03-frameless-doors.jpg
├── ... (all 56 images)
└── 56-louvre-frames.jpg
```

📝 **Tip**: Use the CSV template to help name and organize your files!

### Step 3: Upload Images via Admin Dashboard

1. Go to your admin dashboard: `https://your-domain.com/admin`
2. Navigate to Gallery Management
3. Click "+ Add Media" button
4. For each image:
   - Click the file upload button (not the URL field)
   - Select your image file
   - **Preview appears automatically** ✓
   - Fill in metadata:
     - **Category**: windows, doors, curtain_walls, partitions, balustrades
     - **Finish**: mill, silver, black, champagne, bronze
     - **Project Name**: From WhatsApp messages
     - **Location**: City, County
     - **Description**: Brief description
   - Click "Upload Media"
   - **Progress indicator shows** ✓

### Step 4: Update CSV Template

The CSV template (`gallery-images-template.csv`) already contains:
- ✅ All 56 images mapped from your WhatsApp messages
- ✅ Suggested categories based on project type
- ✅ Suggested finishes based on descriptions
- ✅ Locations inferred from messages

📝 **Review and adjust** the CSV data as needed before uploading.

## Category Mapping Reference

| Project Type | Category | Finish Suggestions |
|--------------|----------|-------------------|
| Kitchen cabinets | partitions | mill, champagne |
| Doors (frameless, swing, sliding) | doors | mill, bronze |
| Windows | windows | mill, black, grey |
| Partitions (gypsum, office) | partitions | mill, champagne |
| Shower cubicles | windows | mill, bronze |
| Shop displays | partitions | silver, champagne |
| Golf estate projects | partitions | bronze, champagne |

## Finish Color Guide

- **mill**: Natural aluminium colour
- **silver**: Silver/steel finish
- **black**: Black/dark finish
- **champagne**: Warm champagne/beige tone
- **bronze**: Wood finish/warm tone

## Troubleshooting

### ❓ No upload button visible?
- Make sure you're logged in as admin
- Check that your user role is "admin" in the database

### ❓ Image preview not showing?
- Check file format (JPG, PNG, WebP, GIF supported)
- Check file size (< 50MB)

### ❓ Upload fails?
- Check internet connection
- Try refreshing the page
- Check browser console for errors

### ❓ Wrong metadata?
- Edit directly in the gallery view
- Click pencil icon to edit any field

## Success Criteria

✅ All 56 images uploaded
✅ Categories correctly assigned
✅ Finishes match project descriptions
✅ Locations accurate
✅ Images appear on frontend gallery page
✅ Video images (if any) play correctly

## Need Help?

Contact your development team or:
- Check browser console (F12 → Console tab)
- Review network errors (F12 → Network tab)
- Check server logs in Render dashboard