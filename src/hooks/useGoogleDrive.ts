// ==========================================
// GOOGLE DRIVE REACT HOOK
// ==========================================
// React hook for easy Google Drive integration throughout the app

import { useState, useCallback, useEffect } from 'react';
import { googleDriveService } from '../services/googleDriveService';
import { toast } from 'react-hot-toast';

export interface UseGoogleDriveOptions {
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  autoInitialize?: boolean;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  fileId?: string;
  url?: string;
  error?: string;
}

export const useGoogleDrive = (options: UseGoogleDriveOptions = {}) => {
  const {
    maxFileSize = 10,
    allowedTypes,
    autoInitialize = true
  } = options;

  const [isInitialized, setIsInitialized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize Google Drive service
  useEffect(() => {
    if (autoInitialize) {
      initializeDrive();
    }
  }, [autoInitialize]);

  const initializeDrive = useCallback(async () => {
    try {
      const initialized = await googleDriveService.initialize();
      setIsInitialized(initialized);
      
      if (initialized) {
        const authenticated = await googleDriveService.authenticate();
        setIsAuthenticated(authenticated);
      }
    } catch (error) {
      console.error('Failed to initialize Google Drive:', error);
      toast.error('Failed to initialize Google Drive');
    }
  }, []);

  // Upload single file
  const uploadFile = useCallback(async (
    file: File,
    metadata?: {
      name?: string;
      description?: string;
      folderId?: string;
      documentType?: string;
    }
  ) => {
    try {
      // Validate file
      const validation = googleDriveService.validateFile(file, maxFileSize, allowedTypes);
      if (!validation.valid) {
        toast.error(validation.error || 'File validation failed');
        return null;
      }

      setIsUploading(true);
      
      // Create progress entry
      const progressEntry: UploadProgress = {
        file,
        progress: 0,
        status: 'uploading'
      };
      
      setUploadProgress(prev => [...prev, progressEntry]);

      // Upload file
      const result = await googleDriveService.uploadFile(file, metadata);

      // Update progress
      setUploadProgress(prev => 
        prev.map(p => 
          p.file === file 
            ? {
                ...p,
                progress: 100,
                status: result.success ? 'completed' : 'error',
                fileId: result.fileId,
                url: result.url,
                error: result.error
              }
            : p
        )
      );

      if (result.success) {
        toast.success(`File uploaded successfully: ${file.name}`);
        return {
          fileId: result.fileId!,
          url: result.url!,
          name: file.name,
          size: file.size,
          type: file.type
        };
      } else {
        toast.error(`Upload failed: ${result.error}`);
        return null;
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
      
      // Update progress with error
      setUploadProgress(prev => 
        prev.map(p => 
          p.file === file 
            ? { ...p, status: 'error', error: 'Upload failed' }
            : p
        )
      );
      
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [maxFileSize, allowedTypes]);

  // Upload multiple files
  const uploadFiles = useCallback(async (
    files: File[],
    metadata?: {
      folderId?: string;
      documentType?: string;
    }
  ) => {
    try {
      setIsUploading(true);
      const results = [];

      for (const file of files) {
        const result = await uploadFile(file, {
          ...metadata,
          name: file.name
        });
        
        if (result) {
          results.push(result);
        }
      }

      return results;
    } catch (error) {
      console.error('Batch upload error:', error);
      toast.error('Batch upload failed');
      return [];
    } finally {
      setIsUploading(false);
    }
  }, [uploadFile]);

  // Upload JSON data
  const uploadJSON = useCallback(async (
    data: any,
    filename: string = 'data.json',
    metadata?: {
      description?: string;
      folderId?: string;
    }
  ) => {
    try {
      const result = await googleDriveService.uploadJSON(data, filename, metadata);
      
      if (result.success) {
        toast.success(`JSON uploaded: ${filename}`);
        return {
          fileId: result.fileId!,
          url: result.url!,
          name: filename
        };
      } else {
        toast.error(`JSON upload failed: ${result.error}`);
        return null;
      }
    } catch (error) {
      console.error('JSON upload error:', error);
      toast.error('JSON upload failed');
      return null;
    }
  }, []);

  // Delete file
  const deleteFile = useCallback(async (fileId: string) => {
    try {
      const success = await googleDriveService.deleteFile(fileId);
      
      if (success) {
        toast.success('File deleted successfully');
        return true;
      } else {
        toast.error('Failed to delete file');
        return false;
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Delete failed');
      return false;
    }
  }, []);

  // Get file info
  const getFileInfo = useCallback(async (fileId: string) => {
    try {
      return await googleDriveService.getFileInfo(fileId);
    } catch (error) {
      console.error('Get file info error:', error);
      return null;
    }
  }, []);

  // Create folder
  const createFolder = useCallback(async (name: string, parentId?: string) => {
    try {
      const folderId = await googleDriveService.createFolder(name, parentId);
      
      if (folderId) {
        toast.success(`Folder created: ${name}`);
        return folderId;
      } else {
        toast.error('Failed to create folder');
        return null;
      }
    } catch (error) {
      console.error('Create folder error:', error);
      toast.error('Failed to create folder');
      return null;
    }
  }, []);

  // Clear upload progress
  const clearProgress = useCallback(() => {
    setUploadProgress([]);
  }, []);

  // Get file URL for display
  const getFileUrl = useCallback((fileId: string) => {
    return googleDriveService.getFileUrl(fileId);
  }, []);

  // Get download URL
  const getDownloadUrl = useCallback((fileId: string) => {
    return googleDriveService.getDownloadUrl(fileId);
  }, []);

  return {
    // State
    isInitialized,
    isAuthenticated,
    isUploading,
    uploadProgress,
    
    // Actions
    initializeDrive,
    uploadFile,
    uploadFiles,
    uploadJSON,
    deleteFile,
    getFileInfo,
    createFolder,
    clearProgress,
    getFileUrl,
    getDownloadUrl,
    
    // Utils
    validateFile: (file: File) => googleDriveService.validateFile(file, maxFileSize, allowedTypes)
  };
};

export default useGoogleDrive;