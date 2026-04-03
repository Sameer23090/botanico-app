const { google } = require('googleapis');
const { Readable } = require('stream');

let auth = null;
let drive = null;

try {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON);
    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });
    drive = google.drive({ version: 'v3', auth });
    console.log("✅ Google Drive Service initialized successfully.");
  } else {
    console.warn("⚠️ Google Drive credentials missing. Drive upload features will be disabled.");
  }
} catch (error) {
  console.error("❌ Failed to initialize Google Drive Service:", error.message);
}

const getOrCreateFolder = async (name, parentId) => {
  if (!drive) throw new Error('Google Drive service is not configured.');
  try {
    const response = await drive.files.list({
      q: `name = '${name}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive'
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id;
    }

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

const uploadToDrive = async (buffer, filename, folderId, mimeType = 'image/webp') => {
  if (!drive) throw new Error('Google Drive service is not configured.');
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
