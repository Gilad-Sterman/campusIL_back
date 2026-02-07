import express from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../config/db.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and SVG files are allowed.'));
    }
  }
});

// Generate unique filename
const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `logo_${timestamp}_${randomString}.${extension}`;
};

// POST /api/upload/university-logo - Upload university logo
router.post('/university-logo', authenticateUser, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const file = req.file;
    const fileName = generateFileName(file.originalname);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('university-logos')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return res.status(500).json({
        success: false,
        error: `Upload failed: ${error.message}`
      });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('university-logos')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    res.status(200).json({
      success: true,
      data: {
        url: publicUrl,
        fileName: fileName,
        size: file.size,
        type: file.mimetype
      },
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Upload failed'
    });
  }
});

// DELETE /api/upload/university-logo/:fileName - Delete university logo
router.delete('/university-logo/:fileName', authenticateUser, async (req, res) => {
  try {
    const { fileName } = req.params;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        error: 'File name is required'
      });
    }

    // Delete from Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from('university-logos')
      .remove([fileName]);

    if (error) {
      console.error('Storage delete error:', error);
      return res.status(500).json({
        success: false,
        error: `Delete failed: ${error.message}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Delete failed'
    });
  }
});

export default router;
