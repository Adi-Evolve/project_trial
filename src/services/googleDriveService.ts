// ❌ DEPRECATED: This file is no longer needed
// The simplified ProjectForge platform uses ImgBB for image storage
// Google Drive integration has been removed as it's not needed
// This file can be safely deleted

// For image uploads, use ImgBB API directly:
// https://api.imgbb.com/1/upload

// Example ImgBB upload function:
// const uploadToImgBB = async (file: File) => {
//   const formData = new FormData();
//   formData.append('image', file);
//   const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
//     method: 'POST',
//     body: formData
//   });
//   const data = await response.json();
//   return data.data.url;
// };

export default null;
    this.folderId = process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID || '';
  }

  /**
   * Check if Google Drive credentials are properly configured
   */
  private isDriveConfigured(): boolean {
    return !!(this.clientId && this.apiKey);
  }

  /**
   * Generate a mock file ID for development when Google Drive is not configured
   */
  private generateMockFileId(): string {
    return 'mock_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Initialize Google API and authenticate
   */
  async initialize(): Promise<boolean> {
    try {
      if (!this.isDriveConfigured()) {
        console.warn('⚠️ Google Drive credentials not configured, using mock file IDs');
        return true; // Allow mock mode
      }

      // Load Google API
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      await window.gapi.load('auth2', () => {
        window.gapi.auth2.init({
          client_id: this.clientId,
        });
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize Google Drive API:', error);
      return false;
    }
  }

  /**
   * Load Google API script
   */
  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  /**
   * Authenticate user with Google
   */
  async authenticate(): Promise<boolean> {
    try {
      if (!this.isDriveConfigured()) {
        console.warn('⚠️ Google Drive not configured, skipping authentication');
        return true;
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }

      const user = authInstance.currentUser.get();
      this.accessToken = user.getAuthResponse().access_token;
      return true;
    } catch (error) {
      console.error('Google Drive authentication failed:', error);
      return false;
    }
  }

  /**
   * Upload file to Google Drive
   */
  async uploadFile(
    file: File, 
    metadata?: {
      name?: string;
      description?: string;
      folderId?: string;
      documentType?: string;
      uploadedBy?: string;
    }
  ): Promise<GoogleDriveUploadResult> {
    try {
      if (!this.isDriveConfigured()) {
        console.warn('⚠️ Google Drive credentials not configured, using mock file ID');
        return {
          success: true,
          fileId: this.generateMockFileId(),
          url: `https://drive.google.com/file/d/${this.generateMockFileId()}/view`
        };
      }

      // Ensure authentication
      if (!this.accessToken) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Failed to authenticate with Google Drive');
        }
      }

      // Create file metadata
      const fileMetadata = {
        name: metadata?.name || file.name,
        description: metadata?.description || `Uploaded via ProjectForge - ${metadata?.documentType || 'Document'}`,
        parents: [metadata?.folderId || this.folderId].filter(Boolean),
      };

      // Upload file using multipart upload
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: form,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Make file publicly viewable (optional)
      await this.setFilePermissions(result.id, 'reader', 'anyone');

      return {
        success: true,
        fileId: result.id,
        url: `https://drive.google.com/file/d/${result.id}/view`
      };

    } catch (error: any) {
      console.error('Google Drive upload error:', error);
      return {
        success: false,
        error: error.message || 'Upload failed'
      };
    }
  }

  /**
   * Upload JSON data to Google Drive
   */
  async uploadJSON(
    data: any, 
    filename: string = 'data.json',
    metadata?: {
      description?: string;
      folderId?: string;
    }
  ): Promise<GoogleDriveUploadResult> {
    try {
      const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const file = new File([jsonBlob], filename, { type: 'application/json' });

      return await this.uploadFile(file, {
        name: filename,
        description: metadata?.description || 'JSON data uploaded via ProjectForge',
        folderId: metadata?.folderId,
        documentType: 'json'
      });

    } catch (error: any) {
      console.error('Google Drive JSON upload error:', error);
      return {
        success: false,
        error: error.message || 'JSON upload failed'
      };
    }
  }

  /**
   * Set file permissions
   */
  async setFilePermissions(fileId: string, role: string = 'reader', type: string = 'anyone'): Promise<boolean> {
    try {
      if (!this.isDriveConfigured() || !this.accessToken) {
        return true; // Mock success
      }

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          type
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to set file permissions:', error);
      return false;
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(fileId: string): Promise<GoogleDriveFile | null> {
    try {
      if (!this.isDriveConfigured() || !this.accessToken) {
        // Return mock data
        return {
          id: fileId,
          name: 'Mock File',
          mimeType: 'application/octet-stream',
          size: '1024',
          webViewLink: `https://drive.google.com/file/d/${fileId}/view`,
          webContentLink: `https://drive.google.com/file/d/${fileId}/export`,
          createdTime: new Date().toISOString(),
          modifiedTime: new Date().toISOString()
        };
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,webViewLink,webContentLink,createdTime,modifiedTime`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get file info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  /**
   * Delete file from Google Drive
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      if (!this.isDriveConfigured() || !this.accessToken) {
        console.warn('⚠️ Google Drive not configured, simulating file deletion');
        return true;
      }

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Create folder in Google Drive
   */
  async createFolder(name: string, parentId?: string): Promise<string | null> {
    try {
      if (!this.isDriveConfigured() || !this.accessToken) {
        return this.generateMockFileId();
      }

      const fileMetadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : [this.folderId].filter(Boolean),
      };

      const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fileMetadata),
      });

      if (!response.ok) {
        throw new Error(`Failed to create folder: ${response.statusText}`);
      }

      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('Error creating folder:', error);
      return null;
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(folderId?: string, query?: string): Promise<GoogleDriveFile[]> {
    try {
      if (!this.isDriveConfigured() || !this.accessToken) {
        // Return mock files
        return [
          {
            id: 'mock1',
            name: 'Mock Document 1.pdf',
            mimeType: 'application/pdf',
            size: '2048',
            webViewLink: 'https://drive.google.com/file/d/mock1/view',
            webContentLink: 'https://drive.google.com/file/d/mock1/export',
            createdTime: new Date().toISOString(),
            modifiedTime: new Date().toISOString()
          }
        ];
      }

      let queryString = `trashed=false`;
      if (folderId) {
        queryString += ` and '${folderId}' in parents`;
      }
      if (query) {
        queryString += ` and name contains '${query}'`;
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(queryString)}&fields=files(id,name,mimeType,size,webViewLink,webContentLink,createdTime,modifiedTime)`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`);
      }

      const result = await response.json();
      return result.files || [];
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, maxSizeMB: number = 10, allowedTypes?: string[]): { valid: boolean, error?: string } {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`
      };
    }

    // Check file type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    // Check for empty file
    if (file.size === 0) {
      return {
        valid: false,
        error: 'File is empty'
      };
    }

    return { valid: true };
  }

  /**
   * Create metadata for document uploads
   */
  createDocumentMetadata(
    documentType: string,
    userId: string,
    additionalData?: any
  ): any {
    return {
      name: `${documentType}_${userId}_${Date.now()}`,
      description: `${documentType} uploaded by user ${userId} via ProjectForge`,
      documentType,
      uploadedBy: userId,
      timestamp: new Date().toISOString(),
      version: '1.0',
      ...additionalData
    };
  }

  /**
   * Batch upload multiple files
   */
  async batchUploadFiles(
    files: File[], 
    onProgress?: (completed: number, total: number) => void,
    folderId?: string
  ): Promise<{ successful: GoogleDriveUploadResult[], failed: GoogleDriveUploadResult[] }> {
    const successful: GoogleDriveUploadResult[] = [];
    const failed: GoogleDriveUploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadFile(files[i], {
          name: `batch_${i}_${files[i].name}`,
          folderId: folderId,
          documentType: 'batch_upload'
        });

        if (result.success) {
          successful.push(result);
        } else {
          failed.push(result);
        }

        if (onProgress) {
          onProgress(i + 1, files.length);
        }

      } catch (error) {
        failed.push({
          success: false,
          error: `Failed to upload ${files[i].name}: ${error}`
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Get file URL for viewing
   */
  getFileUrl(fileId: string): string {
    return `https://drive.google.com/file/d/${fileId}/view`;
  }

  /**
   * Get direct download URL
   */
  getDownloadUrl(fileId: string): string {
    return `https://drive.google.com/uc?id=${fileId}&export=download`;
  }
}

// Global types for Google API
declare global {
  interface Window {
    gapi: any;
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService();
export default GoogleDriveService;