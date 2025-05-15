// Helper functions for handling image uploads and manipulation

// Convert file to base64 for preview
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Validate file type
export const isValidImageType = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
};

// Validate file size (in MB)
export const isValidFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// Extract file extension
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

// Generate a random filename with original extension
export const generateRandomFilename = (originalFilename: string): string => {
  const extension = getFileExtension(originalFilename);
  const randomString = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now();
  return `${randomString}_${timestamp}.${extension}`;
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

// Create FormData for image upload
export const createImageFormData = (
  file: File, 
  fieldName: string = 'image', 
  additionalData: Record<string, string> = {}
): FormData => {
  const formData = new FormData();
  formData.append(fieldName, file);
  
  // Add any additional fields to the form data
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  return formData;
};

// Helper to handle image upload errors
export const getImageUploadError = (error: any): string => {
  if (error.response) {
    if (error.response.status === 413) {
      return 'The image file is too large. Please upload a smaller image.';
    }
    if (error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
  }
  return 'Error uploading image. Please try again.';
};

// Remove the base URL from an image path
export const normalizeImagePath = (imagePath: string): string => {
  if (!imagePath) return '';
  // If the path is already a full URL, return it
  if (imagePath.startsWith('http')) return imagePath;
  
  // If the path doesn't start with /, add it
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
};
