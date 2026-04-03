const { google } = require('googleapis');
const { Readable } = require('stream');

// Initialize Google Drive API with Service Account
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON),
  scopes: ['https://www.googleapis.com/auth/drive.file']
});

const drive = google.drive({ version: 'v3', auth });

/**
 * Ensures a directory exists in Google Drive, creates it if not.
 * @param {string} name - Folder name
 * @param {string} parentId - Parent folder ID
 * @returns {Promise<string>} - Folder ID
 */
const getOrCreateFolder = async (name, parentId) => {
  try {
    const response = await drive.files.list({
      q: `name = '${name}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Create folder
    const folderMetadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    };

    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: 'id'
    });

    return folder.data.id;
  } catch (error) {
    console.error('Error in getOrCreateFolder:', error);
    throw error;
  }
};

/**
 * Uploads a buffer to Google Drive
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Filename on Drive
 * @param {string} folderId - Destination folder ID
 * @param {string} mimeType - MIME type
 * @returns {Promise<Object>} - Drive file ID and public URL
 */
const uploadToDrive = async (buffer, filename, folderId, mimeType = 'image/webp') => {
  try {
    const fileMetadata = {
      name: filename,
      parents: [folderId]
    };

    const media = {
      mimeType: mimeType,
      body: Readable.from(buffer)
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id'
    });

    // Make file public (readable by anyone)
    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    const displayUrl = `https://drive.google.com/uc?export=view&id=${file.data.id}`;

    return {
      fileId: file.data.id,
      displayUrl: displayUrl
    };
  } catch (error) {
    console.error('Error in uploadToDrive:', error);
    throw error;
  }
};

module.exports = {
  getOrCreateFolder,
  uploadToDrive
};
