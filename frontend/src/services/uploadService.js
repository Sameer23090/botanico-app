import { uploadAPI } from '../api';

/**
 * Uploads a plant image or log entry photo to Google Drive
 * @param {File} file - Image file from input
 * @param {Object} metadata - { plantId, imageType, commonName, scientificName }
 * @returns {Promise<Object>} - Drive file info { driveFileId, displayUrl, filename }
 */
export const uploadPlantImage = async (file, { plantId, imageType = 'timeline', commonName = '', scientificName = '' }) => {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('plantId', plantId);
  formData.append('imageType', imageType);
  formData.append('commonName', commonName);
  formData.append('scientificName', scientificName);

  try {
    const res = await uploadAPI.uploadImage(formData);
    return res.data;
  } catch (error) {
    console.error('Frontend upload error:', error);
    throw error;
  }
};
