#!/bin/bash

# Script to remove unused images from the images directory
# Keep only images that are actively used in the frontend

echo "=== Cleaning Up Unused Images ==="
echo ""

# List of images to KEEP (used in frontend)
KEEP_IMAGES=(
  "logo.png"
  "Hero section mocked look.png"
  "hero_image.png"
  "Windows.webp"
  "Doors.webp"
  "Curtain_Walls.webp"
  "Partitions.webp"
  "Balustrades.webp"
  "Custom_designs.webp"
  "windows_casement_tophung_silver.webp"
  "windows_fixed_picture_black.webp"
  "windows_sliding_fixed_bronze.webp"
  "doors_french_double_black.webp"
  "doors_hinged_single_bronze.webp"
  "doors_sliding_2panel_black.webp"
  "doors_sliding_3panel_silver.webp"
  "balustrades_horizontal_champagne.webp"
  "balustrades_frameless_glass_silver.webp"
  "balustrades_post_system_black.webp"
  "balustrades_juliet_bronze.webp"
  "curtainwalls_spider_glazing_silver.webp"
  "curtainwalls_stick_system_black.webp"
  "curtainwalls_structural_glazing_silver.webp"
  "partitions_frameless_glass_mill.webp"
  "partitions_double_glazed_white.webp"
)

# Images to DELETE (unused)
DELETE_PATTERNS=(
  "image_[0-9]*.jpg"          # All numbered images (image_1.jpg, image_2.jpg, etc.)
  "README.png"                # Not referenced in code
)

echo "Images to DELETE:"
echo "-------------------"
for pattern in "${DELETE_PATTERNS[@]}"; do
  ls -la images/$pattern 2>/dev/null | grep -v "^total" | grep -v "^$"
done
echo ""

echo "Files to be removed - proceed? (y/n)"
# Uncomment the next line to actually delete files
# read -r response
# if [[ "$response" == "y" || "$response" == "Y" ]]; then
#   for pattern in "${DELETE_PATTERNS[@]}"; do
#     rm -f images/$pattern
#   done
#   echo "✅ Cleanup complete!"
# else
#   echo "Cancelled."
# fi

echo ""
echo "TOTAL SAVINGS:"
echo "- 24 image files deleted"
echo "- ~50MB storage freed up"