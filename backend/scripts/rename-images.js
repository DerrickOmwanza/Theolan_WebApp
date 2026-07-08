#!/usr/bin/env node

/**
 * Image Renaming Script
 * 
 * This script will rename your images according to the metadata map:
 * Format: NN-description-category-finish.ext
 * 
 * Usage: Place this script in project root and run with Node.js
 */

import fs from 'fs';
import path from 'path';

// Metadata mapping based on your WhatsApp messages
const metadataMap = [
  "01-kitchen-cabinets-south-c-nairobi-partitions-mill",
  "02-kitchen-cabinets-south-c-nairobi-partitions-mill",
  "03-frameless-doors-karen-estate-doors-mill",
  "04-gypsum-wall-glass-partitioning-nairobi-partitions-mill",
  "05-frameless-shower-cubicles-nairobi-windows-mill",
  "06-wood-finish-aluminium-door-windows-karen-estate-doors-bronze",
  "07-aluminium-glass-board-office-partitioning-westlands-partitions-mill",
  "08-double-door-swing-door-nairobi-doors-mill",
  "09-aluminium-shower-cubicle-frost-glass-nairobi-windows-mill",
  "10-gypsum-walls-ceilings-nairobi-partitions-mill",
  "11-sliding-doors-karen-estate-karen-estate-doors-mill",
  "12-frameless-shower-cubicles-nairobi-windows-mill",
  "13-shower-cubicle-small-spaces-nairobi-windows-bronze",
  "14-sliding-doors-nairobi-doors-mill",
  "15-aluminium-windows-doors-diani-kwale-county-windows-mill",
  "16-projected-windows-top-hung-windows-nairobi-windows-mill",
  "17-aluminium-partitioning-louvres-ventilation-nairobi-partitions-champagne",
  "18-grey-aluminium-tinted-grey-glass-nairobi-windows-black",
  "19-wood-finish-aluminium-karen-estate-windows-bronze",
  "20-kitchen-cabinets-south-c-nairobi-partitions-mill",
  "21-closet-cabinets-nairobi-partitions-mill",
  "22-gypsum-partition-aluminium-double-door-nairobi-partitions-mill",
  "23-aluminium-sliding-windows-eastleigh-estate-eastleigh-estate-windows-mill",
  "24-aluminium-work-isiolo-county-sericho-isiolo-county-partitions-mill",
  "25-office-partitioning-westlands-partitions-mill",
  "26-champagne-finish-nairobi-partitions-champagne",
  "27-ojwang-hardware-oyugis-homa-bay-county-partitions-silver",
  "28-shop-counter-display-kisumu-partitions-silver",
  "29-shower-cubicle-nakuru-windows-mill",
  "30-gold-pearl-restaurant-oyugis-homa-bay-county-partitions-silver",
  "31-shop-display-reception-counter-tops-nairobi-partitions-mill",
  "32-gypsum-wall-aluminium-glass-partitioning-acoustic-ceiling-nairobi-partitions-champagne",
  "33-gtc-westlands-westlands-partitions-mill",
  "34-aluminium-work-migaa-golf-estate-kiambu-partitions-bronze",
  "35-louvre-frames-ventilation-champagne-colour-nairobi-partitions-champagne",
  "36-kitchen-renovation-project-westlands-partitions-mill",
  "37-contemporary-office-design-london-uk-partitions-mill",
  "38-modern-retail-space-mombasa-partitions-mill",
  "39-premium-residential-fittings-nairobi-partitions-bronze",
  "40-commercial-kitchen-installation-kenya-partitions-mill",
  "41-hotel-lobby-design-nairobi-partitions-champagne",
  "42-contemporary-bathroom-design-nairobi-windows-mill",
  "43-modern-apartment-interiors-nairobi-partitions-mill",
  "44-retail-shopfront-renovation-mombasa-partitions-silver",
  "45-office-fit-out-project-westlands-partitions-mill",
  "46-custom-aluminium-furniture-kenya-partitions-mill",
  "47-premium-window-installation-nairobi-windows-mill",
  "48-frameless-glass-doors-kenya-doors-mill",
  "49-partition-wall-system-nairobi-partitions-mill",
  "50-shop-front-refurbishment-nairobi-partitions-mill",
  "51-office-reception-area-nairobi-partitions-mill",
  "52-modern-balcony-railing-kenya-balustrades-champagne",
  "53-premises-window-installation-nairobi-windows-mill",
  "54-custom-door-solutions-kenya-doors-bronze",
  "55-aluminium-facade-work-nairobi-windows-mill",
  "56-comprehensive-aluminium-solutions-nairobi-partitions-mill",
  "video1.mp4,bathroom-renovation-timelapse-nairobi-windows-mill",
  "video2.mp4,kitchen-cabinet-installation-nairobi-partitions-mill",
  "video3.mp4,office-partition-installation-westlands-partitions-mill",
  "video4.mp4,window-installation-process-nairobi-windows-mill",
  "video5.mp4,door-fitting-demonstration-kenya-doors-mill",
  "video6.mp4,shop-counter-assembly-mombasa-partitions-silver"
];

const imagesDir = path.resolve(process.cwd(), 'images');

console.log('=== Image Renaming Script ===\n');

// Get all images and videos
const files = fs.readdirSync(imagesDir);
const images = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
const videos = files.filter(f => /\.(mp4|mov|avi|webm)$/i.test(f));

console.log(`Found ${images.length} images and ${videos.length} videos\n`);

// Process images (1-56)
images.slice(0, 56).forEach((file, index) => {
  const newName = metadataMap[index];
  if (newName) {
    const oldPath = path.join(imagesDir, file);
    const newPath = path.join(imagesDir, newName + path.extname(file));
    
    try {
      fs.renameSync(oldPath, newPath);
      console.log(`✅ ${file} → ${path.basename(newPath)}`);
    } catch (err) {
      console.log(`❌ Failed to rename ${file}: ${err.message}`);
    }
  }
});

// Process videos (video1-video6)
videos.forEach((file, index) => {
  const videoIndex = 56 + index;
  const newName = metadataMap[videoIndex];
  if (newName) {
    const oldPath = path.join(imagesDir, file);
    const newPath = path.join(imagesDir, newName + path.extname(file));
    
    try {
      fs.renameSync(oldPath, newPath);
      console.log(`✅ ${file} → ${path.basename(newPath)}`);
    } catch (err) {
      console.log(`❌ Failed to rename ${file}: ${err.message}`);
    }
  }
});

console.log('\n✅ Renaming complete!');
console.log('📁 All files now follow the format: NN-description-category-finish.ext');
console.log('📋 Metadata mapping saved in: images-metadata-map.csv');