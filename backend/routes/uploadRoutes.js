const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const authMiddleware = require('../middleware/auth');
const dbQueries = require('../db/dbQueries');
const { getOrCreateFolder, uploadToDrive } = require('../services/driveService');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * POST /api/upload
 * High-quality image compression with Sharp and upload to Google Drive
 */
router.post('/', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { plantId, imageType, commonName, scientificName } = req.body;
    if (!plantId) {
      return res.status(400).json({ error: 'plantId is required' });
    }

    const user = await dbQueries.users.findById(req.user.id);
    const plant = await dbQueries.plants.findById(plantId);

    if (!plant || plant.userId !== req.user.id) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // 1. Process image with Sharp
    // Resize to max 1920x1920, convert to WebP, quality 92, fix orientation
    const processedBuffer = await sharp(req.file.buffer)
      .rotate() // Auto-rotate based on EXIF
      .resize({ 
        width: 1920, 
        height: 1920, 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .webp({ quality: 92 })
      .toBuffer();

    // 2. Generate filename
    // {plant_common_name}_{scientific_name}_{user_id}_{YYYY-MM-DD}_{timestamp}.webp
    const dateStr = new Date().toISOString().split('T')[0];
    const timestamp = Math.floor(Date.now() / 1000);
    const cleanCommon = String(String(commonName) || plant.commonName || 'plant').toLowerCase().replace(/\s+/g, '-');
    const cleanScientific = String(String(scientificName) || plant.scientificName || 'unknown').toLowerCase().replace(/\s+/g, '-');
    const userIdShort = user.displayId.split('_')[1].substring(0, 8);
    
    const filename = `${cleanCommon}_${cleanScientific}_usr_${userIdShort}_${dateStr}_${timestamp}.webp`;

    // 3. Try Google Drive first
    try {
      const rootFolderId = process.env.DRIVE_ROOT_FOLDER_ID;
      if (!rootFolderId) throw new Error('DRIVE_ROOT_FOLDER_ID not set');
      
      const userFolderId = await getOrCreateFolder(user.displayId, rootFolderId);
      const plantFolderId = await getOrCreateFolder(plant.displayId, userFolderId);
      const driveResult = await uploadToDrive(processedBuffer, filename, plantFolderId, 'image/webp');

      return res.json({
        message: 'Image uploaded successfully to Google Drive',
        driveFileId: driveResult.fileId,
        displayUrl: driveResult.displayUrl,
        originalFilename: req.file.originalname,
        filename: filename,
        imageType: imageType || 'timeline'
      });
    } catch (driveError) {
      console.warn('⚠️ Google Drive fallback triggered:', driveError.message);
      
      // 4. Local Fallback
      const uploadPath = path.join(__dirname, '../uploads', filename);
      console.log('📂 Saving locally to:', uploadPath);
      fs.writeFileSync(uploadPath, processedBuffer);
      
      const protocol = req.protocol;
      const host = req.get('host');
      const localUrl = `${protocol}://${host}/uploads/${filename}`;

      res.json({
        message: 'Image uploaded successfully to local storage (Fallback)',
        displayUrl: localUrl,
        originalFilename: req.file.originalname,
        filename: filename,
        imageType: imageType || 'timeline',
        isLocal: true
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image. Please try again.' });
  }
});

module.exports = router;
