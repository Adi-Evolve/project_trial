// ImgBB Image Upload Service
// Replaces Google Drive for image storage in simplified ProjectForge platform

import { toast } from 'react-hot-toast';

interface ImgBBUploadResult {
  success: boolean;
  url?: string;
  delete_url?: string;
  error?: string;
}

class ImgBBService {
  private apiKey: string;
  private baseUrl = 'https://api.imgbb.com/1/upload';

  constructor() {
    this.apiKey = process.env.REACT_APP_IMGBB_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('ImgBB API key not configured. Image uploads will fail.');
    }
  }

  // Check if ImgBB is properly configured
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Upload a single image to ImgBB
  async uploadImage(file: File): Promise<ImgBBUploadResult> {
    if (!this.isConfigured()) {
      const error = 'ImgBB API key not configured';
      toast.error(error);
      return { success: false, error };
    }

    if (!this.isValidImageFile(file)) {
      const error = 'Invalid file type. Please upload JPG, PNG, GIF, or WebP images.';
      toast.error(error);
      return { success: false, error };
    }

    if (file.size > 32 * 1024 * 1024) { // 32MB limit
      const error = 'File too large. Maximum size is 32MB.';
      toast.error(error);
      return { success: false, error };
    }

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('key', this.apiKey);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          url: data.data.url,
          delete_url: data.data.delete_url
        };
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('ImgBB upload error:', error);
      const errorMessage = error.message || 'Failed to upload image';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Upload multiple images
  async uploadMultipleImages(files: File[]): Promise<ImgBBUploadResult[]> {
    if (!this.isConfigured()) {
      toast.error('ImgBB API key not configured');
      return [];
    }

    const results = await Promise.all(
      files.map(file => this.uploadImage(file))
    );

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} image(s)`);
    }
    if (failCount > 0) {
      toast.error(`Failed to upload ${failCount} image(s)`);
    }

    return results;
  }

  // Validate image file type
  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }

  // Get file size in a readable format
  getReadableFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Generate thumbnail URL from ImgBB URL (if needed)
  generateThumbnailUrl(originalUrl: string, width: number = 300): string {
    // ImgBB doesn't have built-in thumbnail generation, so return original
    // You could implement client-side resizing or use a different service
    return originalUrl;
  }
}

// Export singleton instance
export const imgbbService = new ImgBBService();
export default imgbbService;