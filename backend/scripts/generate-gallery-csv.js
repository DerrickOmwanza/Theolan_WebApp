#!/usr/bin/env node

/**
 * CSV Generator from WhatsApp Messages
 * 
 * Creates a ready-to-use CSV template with your actual product data
 * based on the WhatsApp messages you received.
 */

import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// ============================================================
// YOUR ACTUAL PRODUCT DATA FROM WHATSAPP
// ============================================================

// Based on your WhatsApp messages, I've mapped out the projects
const whatsappMessages = [
  "Kitchen cabinets",
  "Kitchen cabinets",
  "Frameless doors",
  "Gypsum wall and glass partitioning",
  "Frameless shower cubicles",
  "Wood finish aluminium door and windows",
  "Aluminium glass and board office partitioning",
  "Double door,swing door",
  "Aluminium shower cubicle with frost glass",
  "Gypsum walls and ceilings",
  "Sliding doors in karen estate",
  "Frameless shower cubicles",
  "Aluminium shower cubicle design for small spaces",
  "Sliding doors",
  "Aluminium windows and doors in  Diani,kwale county",
  "Projected windows/ top hung windows",
  "Aluminium partitioning with louvres for ventilation",
  "Grey aluminium with tinted grey glass",
  "Wood finish aluminium,in karen estate",
  "Kitchen cabinets in south C, Nairobi",
  "Closet cabinets",
  "Gypsum partition with aluminium double door and glass",
  "Aluminium sliding windows at Eastleigh estate",
  "Aluminium work in isiolo county,sericho",
  "Office partitioning",
  "Champagne finish",
  "Ojwang hardware,Oyugis,homabay county",
  "Shop counter display",
  "Shower cubicle",
  "Gold pearl restaurant,Oyugis, homa bay",
  "Shop display/ reception counter tops",
  "Gypsum wall, aluminium and glass partitioning with acoustic ceiling",
  "At GTC, westlands",
  "Aluminium work at migaa golf estate,Kiambu",
  "Hizi ni louvre frames,for ventilation. Champagne colour"
  // Add remaining messages as needed
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const determineCategory = (message) => {
  const msg = message.toLowerCase();
  
  if (msg.includes('kitchen') || msg.includes('cabinet')) return 'partitions';
  if (msg.includes('shower')) return 'windows';
  if (msg.includes('door')) return 'doors';
  if (msg.includes('window')) return 'windows';
  if (msg.includes('partition')) return 'partitions';
  if (msg.includes('wall') || msg.includes('ceiling')) return 'partitions';
  if (msg.includes('shop') || msg.includes('counter')) return 'partitions';
  if (msg.includes('office')) return 'partitions';
  if (msg.includes('closet')) return 'partitions';
  
  return 'windows';
};

const determineFinish = (message) => {
  const msg = message.toLowerCase();
  
  if (msg.includes('champagne')) return 'champagne';
  if (msg.includes('wood') || msg.includes('wooden')) return 'bronze';
  if (msg.includes('gold')) return 'silver';
  if (msg.includes('grey') || msg.includes('tinted')) return 'black';
  if (msg.includes('white')) return 'mill';
  
  return 'mill';
};

const determineLocation = (message) => {
  const msg = message.toLowerCase();
  
  if (msg.includes('karen')) return 'Karen Estate, Nairobi';
  if (msg.includes('diani') || msg.includes('kwale')) return 'Diani, Kwale County';
  if (msg.includes('eastleigh')) return 'Eastleigh Estate, Nairobi';
  if (msg.includes('isiolo') || msg.includes('sericho')) return 'Isiolo County';
  if (msg.includes('south c')) return 'South C, Nairobi';
  if (msg.includes('homa bay') || msg.includes('oyugis')) return 'Oyugis, Homa Bay County';
  if (msg.includes('westlands') || msg.includes('gtc')) return 'Westlands, Nairobi';
  if (msg.includes('kiambu') || msg.includes('migaa')) return 'Migaa Golf Estate, Kiambu';
  
  return 'Nairobi, Kenya';
};

// ============================================================
// CSV GENERATION
// ============================================================

const generateCSV = () => {
  const header = 'fileName,category,finish,projectName,location,description\n';
  
  let csvContent = '# Theolan Aluminium Gallery Images\n';
  csvContent += '# Generated from WhatsApp messages\n';
  csvContent += '# Format: fileName,category,finish,projectName,location,description\n\n';
  csvContent += header;
  
  whatsappMessages.forEach((message, index) => {
    const fileName = `galley-image-${index + 1}.jpg`;
    const category = determineCategory(message);
    const finish = determineFinish(message);
    const location = determineLocation(message);
    const description = message;
    
    csvContent += `${fileName},${category},${finish},${message},${location},"${description}"\n`;
  });
  
  return csvContent;
};

// ============================================================
// MAIN EXECUTION
// ============================================================

const main = () => {
  console.log('=== CSV Generator for Gallery Images ===\n');
  
  try {
    const csvContent = generateCSV();
    const outputPath = path.resolve(process.cwd(), 'uploads', 'gallery-images.csv');
    
    // Ensure uploads directory exists
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Write CSV file
    fs.writeFileSync(outputPath, csvContent, 'utf8');
    
    console.log(`✅ CSV file created: ${outputPath}`);
    console.log(`📝 Contains ${whatsappMessages.length} image entries`);
    console.log('\nNEXT STEPS:');
    console.log('1. Copy images to: backend/uploads/gallery/');
    console.log('   Rename them to match the fileName in CSV (e.g., gallery-image-1.jpg)');
    console.log('2. Open the CSV file and review/edit metadata if needed');
    console.log('3. Upload images through the admin dashboard');
    console.log('\n💡 TIP: The upload form now accepts file uploads directly!');
    
  } catch (error) {
    console.error('❌ Error generating CSV:', error.message);
    process.exit(1);
  }
};

main();