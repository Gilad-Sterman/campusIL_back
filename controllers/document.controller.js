import documentService from '../services/document.service.js';

class DocumentController {
  // GET /api/documents - Get user's documents
  async getUserDocuments(req, res) {
    try {
      const userId = req.user.id;
      
      const documents = await documentService.getUserDocuments(userId);

      res.status(200).json({
        success: true,
        data: documents,
        count: documents.length
      });
    } catch (error) {
      console.error('DocumentController.getUserDocuments error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/documents - Upload document
  async uploadDocument(req, res) {
    try {
      const userId = req.user.id;
      const documentData = { ...req.body, user_id: userId };

      // Basic validation
      if (!documentData.document_type || !documentData.original_filename || !documentData.s3_key) {
        return res.status(400).json({
          success: false,
          error: 'Document type, filename, and S3 key are required'
        });
      }

      const newDocument = await documentService.uploadDocument(documentData);

      res.status(201).json({
        success: true,
        data: newDocument,
        message: 'Document uploaded successfully'
      });
    } catch (error) {
      console.error('DocumentController.uploadDocument error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // PUT /api/documents/:id - Update document
  async updateDocument(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Document ID is required'
        });
      }

      const updatedDocument = await documentService.updateDocument(id, userId, updateData);

      res.status(200).json({
        success: true,
        data: updatedDocument,
        message: 'Document updated successfully'
      });
    } catch (error) {
      console.error('DocumentController.updateDocument error:', error);
      
      const statusCode = error.message === 'Document not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  // DELETE /api/documents/:id - Delete document
  async deleteDocument(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Document ID is required'
        });
      }

      await documentService.deleteDocument(id, userId);

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      console.error('DocumentController.deleteDocument error:', error);
      
      const statusCode = error.message === 'Document not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/documents/:id/view-url - Get signed URL for viewing document
  async getDocumentViewUrl(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const signedUrl = await documentService.getDocumentViewUrl(id, userId);

      res.status(200).json({
        success: true,
        data: {
          signedUrl,
          expiresIn: '1 hour'
        }
      });
    } catch (error) {
      console.error('DocumentController.getDocumentViewUrl error:', error);
      
      const statusCode = error.message === 'Document not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }
}

export default new DocumentController();
