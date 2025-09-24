import axios from 'axios';
import { toast } from 'react-hot-toast';

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

interface DocumentUploadResult {
  success: boolean;
  ipfsHash?: string;
  error?: string;
}

class IPFSService {
  private pinataApiKey: string;
  private pinataSecretKey: string;
  private pinataJWT: string;
  private pinataGateway: string;

  constructor() {
    // These should be set in your .env file
    this.pinataApiKey = process.env.REACT_APP_PINATA_API_KEY || '';
    this.pinataSecretKey = process.env.REACT_APP_PINATA_SECRET_KEY || '';
    this.pinataJWT = process.env.REACT_APP_PINATA_JWT || '';
    this.pinataGateway = process.env.REACT_APP_PINATA_GATEWAY || 'https://gateway.pinata.cloud';
  }

  /**
   * Check if Pinata credentials are properly configured
   */
  private isPinataConfigured(): boolean {
    return !!(this.pinataJWT || (this.pinataApiKey && this.pinataSecretKey));
  }

  /**
   * Generate a mock IPFS hash for development when Pinata is not configured
   */
  private generateMockHash(): string {
    return 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Upload file to IPFS via Pinata
   */
  async uploadFile(file: File, metadata?: any): Promise<DocumentUploadResult> {
    try {
      if (!this.isPinataConfigured()) {
        console.warn('⚠️ Pinata credentials not configured, using mock IPFS hash');
        // Return a mock hash for development
        return {
          success: true,
          ipfsHash: this.generateMockHash()
        };
      }

      const formData = new FormData();
      formData.append('file', file);

      // Add metadata if provided
      if (metadata) {
        formData.append('pinataMetadata', JSON.stringify({
          name: metadata.name || file.name,
          keyvalues: {
            type: metadata.type || 'document',
            uploadedBy: metadata.uploadedBy || 'user',
            timestamp: new Date().toISOString(),
            ...metadata.custom
          }
        }));
      }

      // Add Pinata options
      formData.append('pinataOptions', JSON.stringify({
        cidVersion: 1,
        wrapWithDirectory: false
      }));

      const headers: any = {
        'Content-Type': 'multipart/form-data',
      };

      // Use JWT if available, otherwise use API key/secret
      if (this.pinataJWT) {
        headers['Authorization'] = `Bearer ${this.pinataJWT}`;
      } else {
        headers['pinata_api_key'] = this.pinataApiKey;
        headers['pinata_secret_api_key'] = this.pinataSecretKey;
      }

      const response = await axios.post<PinataResponse>(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        { headers }
      );

      if (response.data.IpfsHash) {
        return {
          success: true,
          ipfsHash: response.data.IpfsHash
        };
      } else {
        throw new Error('No IPFS hash returned from Pinata');
      }

    } catch (error: any) {
      console.error('IPFS upload error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Upload failed'
      };
    }
  }

  /**
   * Upload JSON data to IPFS
   */
  async uploadJSON(data: any, metadata?: any): Promise<DocumentUploadResult> {
    try {
      if (!this.isPinataConfigured()) {
        console.warn('⚠️ Pinata credentials not configured, using mock IPFS hash for JSON');
        // Return a mock hash for development
        return {
          success: true,
          ipfsHash: this.generateMockHash()
        };
      }

      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (this.pinataJWT) {
        headers['Authorization'] = `Bearer ${this.pinataJWT}`;
      } else {
        headers['pinata_api_key'] = this.pinataApiKey;
        headers['pinata_secret_api_key'] = this.pinataSecretKey;
      }

      const requestData = {
        pinataContent: data,
        pinataMetadata: {
          name: metadata?.name || 'json-data',
          keyvalues: {
            type: 'json',
            timestamp: new Date().toISOString(),
            ...metadata?.custom
          }
        },
        pinataOptions: {
          cidVersion: 1
        }
      };

      const response = await axios.post<PinataResponse>(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        requestData,
        { headers }
      );

      if (response.data.IpfsHash) {
        return {
          success: true,
          ipfsHash: response.data.IpfsHash
        };
      } else {
        throw new Error('No IPFS hash returned from Pinata');
      }

    } catch (error: any) {
      console.error('IPFS JSON upload error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'JSON upload failed'
      };
    }
  }

  /**
   * Get file URL from IPFS hash
   */
  getFileUrl(ipfsHash: string): string {
    return `${this.pinataGateway}/ipfs/${ipfsHash}`;
  }

  /**
   * Get file data from IPFS
   */
  async getFileData(ipfsHash: string): Promise<any> {
    try {
      const response = await axios.get(this.getFileUrl(ipfsHash));
      return response.data;
    } catch (error) {
      console.error('Error fetching IPFS data:', error);
      throw error;
    }
  }

  /**
   * Pin existing IPFS hash to Pinata
   */
  async pinByHash(ipfsHash: string, metadata?: any): Promise<DocumentUploadResult> {
    try {
      if (!this.pinataJWT && (!this.pinataApiKey || !this.pinataSecretKey)) {
        throw new Error('Pinata credentials not configured');
      }

      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (this.pinataJWT) {
        headers['Authorization'] = `Bearer ${this.pinataJWT}`;
      } else {
        headers['pinata_api_key'] = this.pinataApiKey;
        headers['pinata_secret_api_key'] = this.pinataSecretKey;
      }

      const requestData = {
        hashToPin: ipfsHash,
        pinataMetadata: metadata || {}
      };

      await axios.post(
        'https://api.pinata.cloud/pinning/pinByHash',
        requestData,
        { headers }
      );

      return {
        success: true,
        ipfsHash
      };

    } catch (error: any) {
      console.error('IPFS pin by hash error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Pin by hash failed'
      };
    }
  }

  /**
   * Unpin file from Pinata
   */
  async unpinFile(ipfsHash: string): Promise<boolean> {
    try {
      if (!this.pinataJWT && (!this.pinataApiKey || !this.pinataSecretKey)) {
        throw new Error('Pinata credentials not configured');
      }

      const headers: any = {};

      if (this.pinataJWT) {
        headers['Authorization'] = `Bearer ${this.pinataJWT}`;
      } else {
        headers['pinata_api_key'] = this.pinataApiKey;
        headers['pinata_secret_api_key'] = this.pinataSecretKey;
      }

      await axios.delete(
        `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`,
        { headers }
      );

      return true;

    } catch (error) {
      console.error('IPFS unpin error:', error);
      return false;
    }
  }

  /**
   * Get pinned files list
   */
  async getPinnedFiles(filters?: any): Promise<any> {
    try {
      if (!this.pinataJWT && (!this.pinataApiKey || !this.pinataSecretKey)) {
        throw new Error('Pinata credentials not configured');
      }

      const headers: any = {};

      if (this.pinataJWT) {
        headers['Authorization'] = `Bearer ${this.pinataJWT}`;
      } else {
        headers['pinata_api_key'] = this.pinataApiKey;
        headers['pinata_secret_api_key'] = this.pinataSecretKey;
      }

      const params = new URLSearchParams();
      if (filters) {
        Object.keys(filters).forEach(key => {
          params.append(key, filters[key]);
        });
      }

      const response = await axios.get(
        `https://api.pinata.cloud/data/pinList?${params.toString()}`,
        { headers }
      );

      return response.data;

    } catch (error) {
      console.error('Error getting pinned files:', error);
      throw error;
    }
  }

  /**
   * Test authentication with Pinata
   */
  async testAuthentication(): Promise<boolean> {
    try {
      if (!this.pinataJWT && (!this.pinataApiKey || !this.pinataSecretKey)) {
        return false;
      }

      const headers: any = {};

      if (this.pinataJWT) {
        headers['Authorization'] = `Bearer ${this.pinataJWT}`;
      } else {
        headers['pinata_api_key'] = this.pinataApiKey;
        headers['pinata_secret_api_key'] = this.pinataSecretKey;
      }

      const response = await axios.get(
        'https://api.pinata.cloud/data/testAuthentication',
        { headers }
      );

      return response.status === 200;

    } catch (error) {
      console.error('Pinata authentication test failed:', error);
      return false;
    }
  }

  /**
   * Batch upload multiple files
   */
  async batchUploadFiles(
    files: File[], 
    onProgress?: (completed: number, total: number) => void
  ): Promise<{ successful: DocumentUploadResult[], failed: DocumentUploadResult[] }> {
    const successful: DocumentUploadResult[] = [];
    const failed: DocumentUploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadFile(files[i], {
          name: `batch_${i}_${files[i].name}`,
          type: 'batch_upload'
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
   * Generate IPFS hash locally (for verification)
   */
  async generateFileHash(file: File): Promise<string> {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      console.error('Error generating file hash:', error);
      throw error;
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, maxSizeMB: number = 5, allowedTypes?: string[]): { valid: boolean, error?: string } {
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
    walletAddress: string,
    additionalData?: any
  ): any {
    return {
      name: `${documentType}_${walletAddress}_${Date.now()}`,
      type: 'verification_document',
      uploadedBy: walletAddress,
      documentType,
      timestamp: new Date().toISOString(),
      version: '1.0',
      ...additionalData
    };
  }
}

// Export singleton instance
export const ipfsService = new IPFSService();
export default IPFSService;