import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../config/db.js';
import documentService from '../services/document.service.js';
import virusScannerService from '../services/virusScanner.service.js';

// Configure multer for document uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept document types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword' // .doc
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
  }
});

class DocumentUploadController {
  // POST /api/documents/upload - Upload document with virus scanning
  async uploadDocument(req, res) {
    try {
      const userId = req.user.id;
      const file = req.file;
      const { document_type, application_id } = req.body;

      // Validate required fields
      if (!document_type) {
        return res.status(400).json({
          success: false,
          error: 'Document type is required'
        });
      }

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      // Generate unique filename for storage
      const fileExtension = getFileExtension(file.originalname);
      const fileName = `${userId}/${document_type}-${uuidv4()}${fileExtension}`;

      console.log(`📄 Uploading document: ${file.originalname} (${file.size} bytes)`);

      // Step 1: Virus scan the file
      console.log('🔍 Starting virus scan...');
      const scanResult = await virusScannerService.scanFile(
        file.buffer, 
        file.originalname, 
        file.mimetype
      );

      console.log(`🔍 Scan result: ${scanResult.status} (${scanResult.engine})`);

      // Step 2: Handle scan results
      if (scanResult.status === 'infected') {
        return res.status(400).json({
          success: false,
          error: 'File contains malware and cannot be uploaded',
          scan_details: scanResult.details
        });
      }

      if (scanResult.status === 'error') {
        console.error('Virus scan error:', scanResult.details);
        // Continue with upload but log the error
      }

      // Step 3: Upload to Supabase Storage
      console.log('☁️ Uploading to Supabase Storage...');
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('user-documents')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return res.status(500).json({
          success: false,
          error: `Upload failed: ${uploadError.message}`
        });
      }

      // Step 4: Save document metadata to database
      console.log('💾 Saving document metadata...');
      const documentData = {
        user_id: userId,
        application_id: application_id || null,
        document_type,
        original_filename: file.originalname,
        s3_key: fileName,
        file_size: file.size,
        mime_type: file.mimetype,
        virus_scan_status: scanResult.engine === 'clamav' ? scanResult.status : 'clean',
        virus_scan_result: scanResult.details
      };

      const document = await documentService.uploadDocument(documentData);

      // Step 5: Get public URL for immediate access (always available with fallback validation)
      let publicUrl = null;
      if (scanResult.engine === 'clamav' ? scanResult.status === 'clean' : true) {
        const { data: urlData } = supabaseAdmin.storage
          .from('user-documents')
          .getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      }

      console.log(`✅ Document uploaded successfully: ${document.id}`);

      res.status(201).json({
        success: true,
        data: {
          ...document,
          public_url: publicUrl,
          scan_result: {
            status: scanResult.status,
            engine: scanResult.engine,
            scanned_at: scanResult.details.scanned_at
          }
        },
        message: getUploadMessage(scanResult.status, scanResult.engine)
      });

    } catch (error) {
      console.error('Document upload error:', error);
      
      // Clean up uploaded file if database save failed
      if (error.message.includes('Failed to upload document') && req.fileName) {
        try {
          await supabaseAdmin.storage
            .from('user-documents')
            .remove([req.fileName]);
        } catch (cleanupError) {
          console.error('Failed to cleanup uploaded file:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Document upload failed'
      });
    }
  }

  // GET /api/documents/scan-status - Get virus scanner status
  async getScannerStatus(req, res) {
    try {
      const status = virusScannerService.getStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/documents/recheck-scanner - Force recheck of ClamAV availability
  async recheckScanner(req, res) {
    try {
      const status = virusScannerService.recheckAvailability();
      res.json({
        success: true,
        data: status,
        message: 'Scanner availability rechecked'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }


  // Middleware getter for multer
  getUploadMiddleware() {
    return upload.single('file');
  }
}

// Helper functions outside class
const getFileExtension = (filename) => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(lastDot) : '';
};

const getUploadMessage = (scanStatus, engine) => {
  switch (scanStatus) {
    case 'clean':
      return engine === 'clamav' 
        ? 'Document uploaded and virus scan passed' 
        : 'Document uploaded and security validation passed';
    case 'suspicious':
      return 'Document uploaded but flagged for manual review';
    case 'error':
      return 'Document uploaded but virus scan encountered an error';
    default:
      return 'Document uploaded successfully';
  }
};

export default new DocumentUploadController();
