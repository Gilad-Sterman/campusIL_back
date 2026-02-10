import { supabase } from '../config/db.js';

class DocumentService {
  // Get user's documents
  async getUserDocuments(userId) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch documents: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('DocumentService.getUserDocuments error:', error);
      throw error;
    }
  }

  // Upload document
  async uploadDocument(documentData) {
    try {
      const { 
        user_id, 
        document_type, 
        original_filename, 
        s3_key, 
        file_size,
        mime_type,
        virus_scan_status,
        virus_scan_result,
        status
      } = documentData;

      // Validate required fields
      if (!user_id || !document_type || !original_filename || !s3_key) {
        throw new Error('User ID, document type, filename, and S3 key are required');
      }

      // Check if document of this type already exists for user
      const { data: existingDoc } = await supabase
        .from('documents')
        .select('id')
        .eq('user_id', user_id)
        .eq('document_type', document_type)
        .single();

      let data, error;
      
      if (existingDoc) {
        // Update existing document (replacement)
        const result = await supabase
          .from('documents')
          .update({
            original_filename: original_filename.trim(),
            s3_key: s3_key.trim(),
            file_size: file_size || null,
            mime_type: mime_type || null,
            virus_scan_status: virus_scan_status || 'pending',
            virus_scan_result: virus_scan_result || null,
            status: status || 'uploaded',
            uploaded_at: new Date().toISOString()
          })
          .eq('id', existingDoc.id)
          .select()
          .single();
          
        data = result.data;
        error = result.error;
      } else {
        // Insert new document
        const result = await supabase
          .from('documents')
          .insert([{
            user_id,
            document_type,
            original_filename: original_filename.trim(),
            s3_key: s3_key.trim(),
            file_size: file_size || null,
            mime_type: mime_type || null,
            virus_scan_status: virus_scan_status || 'pending',
            virus_scan_result: virus_scan_result || null,
            status: status || 'uploaded'
          }])
          .select()
          .single();
          
        data = result.data;
        error = result.error;
      }

      if (error) {
        throw new Error(`Failed to upload document: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('DocumentService.uploadDocument error:', error);
      throw error;
    }
  }

  // Update document
  async updateDocument(documentId, userId, updateData) {
    try {
      // First verify the document belongs to the user
      const { data: existingDoc } = await supabase
        .from('documents')
        .select('id')
        .eq('id', documentId)
        .eq('user_id', userId)
        .single();

      if (!existingDoc) {
        throw new Error('Document not found');
      }

      const { data, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', documentId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update document: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('DocumentService.updateDocument error:', error);
      throw error;
    }
  }

  // Delete document
  async deleteDocument(documentId, userId) {
    try {
      // First verify the document belongs to the user
      const { data: existingDoc } = await supabase
        .from('documents')
        .select('id, s3_key')
        .eq('id', documentId)
        .eq('user_id', userId)
        .single();

      if (!existingDoc) {
        throw new Error('Document not found');
      }

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to delete document: ${error.message}`);
      }

      // TODO: Also delete from S3 storage
      // await deleteFromS3(existingDoc.s3_key);

      return true;
    } catch (error) {
      console.error('DocumentService.deleteDocument error:', error);
      throw error;
    }
  }

  // Get document by type for user
  async getDocumentByType(userId, documentType) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .eq('document_type', documentType)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Failed to fetch document: ${error.message}`);
      }

      return data || null;
    } catch (error) {
      console.error('DocumentService.getDocumentByType error:', error);
      throw error;
    }
  }

  // Get signed URL for viewing document
  async getDocumentViewUrl(documentId, userId) {
    try {
      // First verify the document belongs to the user
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('s3_key, original_filename')
        .eq('id', documentId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !document) {
        throw new Error('Document not found');
      }

      // Generate signed URL for viewing (1 hour expiry)
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('user-documents')
        .createSignedUrl(document.s3_key, 3600); // 1 hour

      if (urlError) {
        throw new Error(`Failed to generate signed URL: ${urlError.message}`);
      }

      return signedUrlData.signedUrl;
    } catch (error) {
      console.error('DocumentService.getDocumentViewUrl error:', error);
      throw error;
    }
  }
}

export default new DocumentService();
