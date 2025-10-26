/**
 * Utility functions for handling avatar URLs
 */

/**
 * Constructs the full avatar URL from the backend path
 * @param {string} avatarPath - The avatar path from the backend (e.g., "/uploads/avatars/filename.jpg")
 * @returns {string} - The full URL to the avatar image
 */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  
  // If it's already a full URL, return as is
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }
  
  // If it starts with '/', it's a backend path, construct the full URL
  if (avatarPath.startsWith('/')) {
    return `http://localhost:3000${avatarPath}`;
  }
  
  // If it doesn't start with '/', assume it's just a filename and construct the path
  return `http://localhost:3000/uploads/avatars/${avatarPath}`;
};

/**
 * Validates if an avatar URL is accessible
 * @param {string} url - The avatar URL to validate
 * @returns {Promise<boolean>} - True if the image is accessible, false otherwise
 */
export const validateAvatarUrl = async (url) => {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('Avatar URL validation failed:', error);
    return false;
  }
};

/**
 * Gets a fallback avatar URL or null
 * @returns {string|null} - Fallback avatar URL or null
 */
export const getFallbackAvatarUrl = () => {
  return null; // Return null to show the default icon
};
