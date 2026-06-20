#!/bin/bash
# Copy images to frontend public folder for gallery use
# Run this script from the project root

IMAGES_SRC="/images"
PUBLIC_DEST="/frontend/public/images"

echo "Creating public/images directory..."
mkdir -p "$PUBLIC_DEST"

echo "Copying images to public folder..."
cp "$IMAGES_SRC"/image*.jpg "$PUBLIC_DEST"/ 2>/dev/null || echo "Copy completed"

echo "Images are now available at /images/[filename].jpg"
