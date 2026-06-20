// Local Gallery Images Configuration
// Maps local images folder to gallery_photos for development
// Production should use Cloudinary URLs

import galleryImageManifest from "../../public/images/manifest.json";

/**
 * Get gallery image URL - works in both dev and production
 * In production, this would return Cloudinary URLs
 */
export const getGalleryImageUrl = (filename) => {
  // If Cloudinary is configured, use it
  if (import.meta.env.VITE_CLOUDINARY_BASE_URL) {
    return `${import.meta.env.VITE_CLOUDINARY_BASE_URL}/${filename}`;
  }

  // Fallback to local images
  return `/images/${filename}`;
};

/**
 * Gallery categories mapped from image categories
 */
export const GALLERY_CATEGORIES = [
  { value: "windows", label: "Windows" },
  { value: "doors", label: "Doors" },
  { value: "curtain_walls", label: "Curtain Walls" },
  { value: "partitions", label: "Partitions" },
  { value: "balustrades", label: "Balustrades" },
  { value: "office_fitout", label: "Office Fit-outs" },
];

/**
 * Gallery finishes mapped from image finishes
 */
export const GALLERY_FINISHES = [
  { value: "anodized_silver", label: "Anodized Silver" },
  { value: "anodized_bronze", label: "Anodized Bronze" },
  { value: "anodized_black", label: "Anodized Black" },
  { value: "powder_coated_white", label: "Powder Coated White" },
  { value: "powder_coated_cream", label: "Powder Coated Cream" },
  { value: "wood_grain", label: "Wood Grain" },
];

// Re-export for use in components
export default {
  getGalleryImageUrl,
  CATEGORIES: GALLERY_CATEGORIES,
  FINISHES: GALLERY_FINISHES,
};
