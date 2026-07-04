import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
const CLOUD_NAME = process.env.CLOUDINARY_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Validate configuration at startup
if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.warn('⚠️  Cloudinary credentials not fully configured');
  console.warn('   Required: CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
}

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true
});

/**
 * Upload an image buffer or base64 string to Cloudinary
 * @param {Buffer|string} file - File buffer, base64, or URL
 * @param {Object} options - Upload options (folder, public_id, transformation, etc.)
 * @returns {Promise<Object>} - Upload response with secure_url, public_id, etc.
 */
export const uploadImage = async (file, options = {}) => {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error('Cloudinary not configured');
  }

  const uploadOptions = {
    folder: options.folder || 'olan_aluminium',
    transformation: options.transformation || { quality: 'auto', fetch_format: 'auto' },
    ...options
  };

  try {
    const result = await cloudinary.uploader.upload(file, uploadOptions);
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      id: result.asset_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Upload a video to Cloudinary
 * @param {Buffer|string} file - File buffer, base64, or URL
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload response
 */
export const uploadVideo = async (file, options = {}) => {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error('Cloudinary not configured');
  }

  const uploadOptions = {
    resource_type: 'video',
    folder: options.folder || 'olan_aluminium/videos',
    ...options
  };

  try {
    const result = await cloudinary.uploader.upload(file, uploadOptions);
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      duration: result.duration,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      id: result.asset_id
    };
  } catch (error) {
    console.error('Cloudinary video upload error:', error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<boolean>} - Whether deletion was successful
 */
export const deleteImage = async (publicId) => {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error('Cloudinary not configured');
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

/**
 * Generate a Cloudinary image URL with transformations
 * @param {string} publicId - Cloudinary public_id
 * @param {Object} transformations - Transformation options
 * @returns {string} - Transformed image URL
 */
export const getOptimizedUrl = (publicId, transformations = {}) => {
  if (!CLOUD_NAME) return null;

  return cloudinary.url(publicId, {
    cloud_name: CLOUD_NAME,
    secure: true,
    ...transformations
  });
};

export default cloudinary;
