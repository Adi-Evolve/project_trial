import axios from 'axios';
import FormData from 'form-data';
// This file is deprecated. All IPFS/Pinata logic removed. Use Google Drive or Supabase Storage instead.
// Pinata IPFS configuration
const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.REACT_APP_PINATA_SECRET_API_KEY;
const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;

const PINATA_BASE_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs';

export interface DocumentMetadata {
  id?: string;
  name: string;
  type: 'aadhar' | 'pan' | 'ngo_certificate' | 'project_proposal' | 'milestone_proof' | 'address_proof' | 'photo' | 'other';
  description?: string;
  userId: string;
  campaignId?: string;
  milestoneIndex?: number;
  uploadedAt: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationStatus?: DocumentVerificationStatus;
  verificationComments?: string;
  ipfsHash?: string;
  size?: number;
  mimeType?: string;
}

export type DocumentVerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export interface DocumentSearchFilters {
  userId?: string;
  campaignId?: string;
  milestoneIndex?: number;
  types?: DocumentMetadata['type'][];
  verificationStatus?: DocumentVerificationStatus;
  sortBy?: 'uploadedAt' | 'name' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

export interface PinataListResponse {
  count: number;
  rows: Array<{
    id: string;
    ipfs_pin_hash: string;
    size: number;
    user_id: string;
    date_pinned: string;
    date_unpinned: string | null;
    metadata: {
      name: string;
      keyvalues: DocumentMetadata;
    };
    regions: Array<{
      regionId: string;
      currentReplicationCount: number;
      desiredReplicationCount: number;
    }>;
  }>;
}

export interface DocumentUploadResult {
  ipfsHash: string;
  pinSize: number;
  timestamp: string;
  metadata: DocumentMetadata;
}

export interface DocumentVerificationInfo {
  ipfsHash: string;
  verified: boolean;
  verificationDate?: string;
  verifiedBy?: string;
  rejectionReason?: string;
}

class IPFSStorageService {
  private apiKey: string;
  private secretKey: string;
  private jwt: string;
  private initialized = false;

  constructor() {
    this.apiKey = PINATA_API_KEY || '';
    this.secretKey = PINATA_SECRET_API_KEY || '';
    this.jwt = PINATA_JWT || '';
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (!this.apiKey || !this.secretKey) {
      throw new Error('Pinata API keys not configured. Please set REACT_APP_PINATA_API_KEY and REACT_APP_PINATA_SECRET_API_KEY');
    }

    try {
      // Test authentication
      await this.testAuthentication();
      this.initialized = true;
    } catch (error) {
      throw new Error('Failed to initialize IPFS storage: Invalid API credentials');
    }
  }

  private async testAuthentication(): Promise<void> {
    const response = await axios.get(`${PINATA_BASE_URL}/data/testAuthentication`, {
      headers: {
        'pinata_api_key': this.apiKey,
        'pinata_secret_api_key': this.secretKey
      }
    });

    if (response.data.message !== 'Congratulations! You are communicating with the Pinata API!') {
      throw new Error('Authentication failed');
    }
  }

  // Upload document to IPFS
  async uploadDocument(
    file: File,
    metadata: Omit<DocumentMetadata, 'uploadedAt' | 'verified'>
  ): Promise<DocumentUploadResult> {
    await this.initialize();

    const formData = new FormData();
    formData.append('file', file);

    const completeMetadata: DocumentMetadata = {
      ...metadata,
      uploadedAt: new Date().toISOString(),
      verified: false
    };

    const pinataMetadata = {
      name: file.name,
      keyvalues: completeMetadata
    };

    const pinataOptions = {
      cidVersion: 0,
      customPinPolicy: {
        regions: [
          {
            id: 'FRA1',
            desiredReplicationCount: 1
          },
          {
            id: 'NYC1',
            desiredReplicationCount: 1
          }
        ]
      }
    };

    formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
    formData.append('pinataOptions', JSON.stringify(pinataOptions));

    try {
      const response = await axios.post<PinataResponse>(
        `${PINATA_BASE_URL}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.secretKey
          },
          maxContentLength: 100 * 1024 * 1024, // 100MB limit
          maxBodyLength: 100 * 1024 * 1024
        }
      );

      return {
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
        metadata: completeMetadata
      };
    } catch (error: any) {
      throw new Error(`Failed to upload document: ${error.response?.data?.error || error.message}`);
    }
  }

  // Upload JSON data to IPFS
  async uploadJSON(
    data: any,
    metadata: Omit<DocumentMetadata, 'uploadedAt' | 'verified'>
  ): Promise<DocumentUploadResult> {
    await this.initialize();

    const completeMetadata: DocumentMetadata = {
      ...metadata,
      uploadedAt: new Date().toISOString(),
      verified: false
    };

    const pinataMetadata = {
      name: metadata.name,
      keyvalues: completeMetadata
    };

    const pinataOptions = {
      cidVersion: 0,
      customPinPolicy: {
        regions: [
          {
            id: 'FRA1',
            desiredReplicationCount: 1
          },
          {
            id: 'NYC1',
            desiredReplicationCount: 1
          }
        ]
      }
    };

    try {
      const response = await axios.post<PinataResponse>(
        `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`,
        {
          pinataContent: data,
          pinataMetadata,
          pinataOptions
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.secretKey
          }
        }
      );

      return {
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp,
        metadata: completeMetadata
      };
    } catch (error: any) {
      throw new Error(`Failed to upload JSON: ${error.response?.data?.error || error.message}`);
    }
  }

  // Retrieve document from IPFS
  async getDocument(ipfsHash: string): Promise<Blob> {
    try {
      const response = await axios.get(`${PINATA_GATEWAY_URL}/${ipfsHash}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to retrieve document: ${error.message}`);
    }
  }

  // Retrieve JSON data from IPFS
  async getJSON(ipfsHash: string): Promise<any> {
    try {
      const response = await axios.get(`${PINATA_GATEWAY_URL}/${ipfsHash}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to retrieve JSON: ${error.message}`);
    }
  }

  // Get document URL for direct access
  getDocumentURL(ipfsHash: string): string {
    return `${PINATA_GATEWAY_URL}/${ipfsHash}`;
  }

  // List documents by user
  async getUserDocuments(userId: string): Promise<DocumentUploadResult[]> {
    await this.initialize();

    try {
      const response = await axios.get<PinataListResponse>(
        `${PINATA_BASE_URL}/data/pinList`,
        {
          headers: {
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.secretKey
          },
          params: {
            status: 'pinned',
            metadata: JSON.stringify({
              keyvalues: {
                userId: {
                  value: userId,
                  op: 'eq'
                }
              }
            }),
            pageLimit: 100
          }
        }
      );

      return response.data.rows.map(row => ({
        ipfsHash: row.ipfs_pin_hash,
        pinSize: row.size,
        timestamp: row.date_pinned,
        metadata: row.metadata.keyvalues
      }));
    } catch (error: any) {
      throw new Error(`Failed to list user documents: ${error.response?.data?.error || error.message}`);
    }
  }

  // List documents by campaign
  async getCampaignDocuments(campaignId: string): Promise<DocumentUploadResult[]> {
    await this.initialize();

    try {
      const response = await axios.get<PinataListResponse>(
        `${PINATA_BASE_URL}/data/pinList`,
        {
          headers: {
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.secretKey
          },
          params: {
            status: 'pinned',
            metadata: JSON.stringify({
              keyvalues: {
                campaignId: {
                  value: campaignId,
                  op: 'eq'
                }
              }
            }),
            pageLimit: 100
          }
        }
      );

      return response.data.rows.map(row => ({
        ipfsHash: row.ipfs_pin_hash,
        pinSize: row.size,
        timestamp: row.date_pinned,
        metadata: row.metadata.keyvalues
      }));
    } catch (error: any) {
      throw new Error(`Failed to list campaign documents: ${error.response?.data?.error || error.message}`);
    }
  }

  // Get documents pending verification
  async getPendingVerificationDocuments(): Promise<DocumentUploadResult[]> {
    await this.initialize();

    try {
      const response = await axios.get<PinataListResponse>(
        `${PINATA_BASE_URL}/data/pinList`,
        {
          headers: {
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.secretKey
          },
          params: {
            status: 'pinned',
            metadata: JSON.stringify({
              keyvalues: {
                verified: {
                  value: 'false',
                  op: 'eq'
                }
              }
            }),
            pageLimit: 100
          }
        }
      );

      return response.data.rows.map(row => ({
        ipfsHash: row.ipfs_pin_hash,
        pinSize: row.size,
        timestamp: row.date_pinned,
        metadata: row.metadata.keyvalues
      }));
    } catch (error: any) {
      throw new Error(`Failed to list pending documents: ${error.response?.data?.error || error.message}`);
    }
  }

  // Update document metadata (verification status)
  async updateDocumentMetadata(
    ipfsHash: string,
    updates: Partial<DocumentMetadata>
  ): Promise<void> {
    await this.initialize();

    try {
      // Get current metadata
      const currentResponse = await axios.get<PinataListResponse>(
        `${PINATA_BASE_URL}/data/pinList`,
        {
          headers: {
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.secretKey
          },
          params: {
            hashContains: ipfsHash
          }
        }
      );

      if (currentResponse.data.rows.length === 0) {
        throw new Error('Document not found');
      }

      const currentMetadata = currentResponse.data.rows[0].metadata.keyvalues;
      const updatedMetadata = { ...currentMetadata, ...updates };

      // Update metadata
      await axios.put(
        `${PINATA_BASE_URL}/pinning/hashMetadata`,
        {
          ipfsPinHash: ipfsHash,
          name: currentResponse.data.rows[0].metadata.name,
          keyvalues: updatedMetadata
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.secretKey
          }
        }
      );
    } catch (error: any) {
      throw new Error(`Failed to update document metadata: ${error.response?.data?.error || error.message}`);
    }
  }

  // Verify document (admin function)
  async verifyDocument(
    ipfsHash: string,
    verifiedBy: string,
    approved: boolean,
    rejectionReason?: string
  ): Promise<void> {
    const updates: Partial<DocumentMetadata> = {
      verified: approved,
      verifiedBy,
      verifiedAt: new Date().toISOString()
    };

    if (!approved && rejectionReason) {
      (updates as any).rejectionReason = rejectionReason;
    }

    await this.updateDocumentMetadata(ipfsHash, updates);
  }

  // Remove document from IPFS
  async removeDocument(ipfsHash: string): Promise<void> {
    await this.initialize();

    try {
      await axios.delete(`${PINATA_BASE_URL}/pinning/unpin/${ipfsHash}`, {
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.secretKey
        }
      });
    } catch (error: any) {
      throw new Error(`Failed to remove document: ${error.response?.data?.error || error.message}`);
    }
  }

  // Get storage usage statistics
  async getStorageStats(): Promise<{
    totalSize: number;
    documentCount: number;
    verifiedDocuments: number;
    pendingDocuments: number;
  }> {
    await this.initialize();

    try {
      const response = await axios.get<PinataListResponse>(
        `${PINATA_BASE_URL}/data/pinList`,
        {
          headers: {
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.secretKey
          },
          params: {
            status: 'pinned',
            pageLimit: 1000
          }
        }
      );

      const totalSize = response.data.rows.reduce((sum, row) => sum + row.size, 0);
      const documentCount = response.data.rows.length;
      const verifiedDocuments = response.data.rows.filter(
        row => row.metadata.keyvalues.verified === true
      ).length;
      const pendingDocuments = documentCount - verifiedDocuments;

      return {
        totalSize,
        documentCount,
        verifiedDocuments,
        pendingDocuments
      };
    } catch (error: any) {
      throw new Error(`Failed to get storage stats: ${error.response?.data?.error || error.message}`);
    }
  }

  // Generate secure sharing link with expiration
  generateSecureLink(ipfsHash: string, expirationHours: number = 24): string {
    // In a production environment, you'd implement signed URLs
    // For now, return the standard gateway URL with expiration note
    const expirationTime = new Date(Date.now() + expirationHours * 60 * 60 * 1000);
    return `${PINATA_GATEWAY_URL}/${ipfsHash}?expires=${expirationTime.toISOString()}`;
  }

  // Batch upload multiple documents
  async uploadDocumentBatch(
    files: Array<{
      file: File;
      metadata: Omit<DocumentMetadata, 'uploadedAt' | 'verified'>;
    }>
  ): Promise<DocumentUploadResult[]> {
    const results: DocumentUploadResult[] = [];
    const errors: string[] = [];

    for (const { file, metadata } of files) {
      try {
        const result = await this.uploadDocument(file, metadata);
        results.push(result);
      } catch (error) {
        errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (errors.length > 0) {
      console.warn('Some uploads failed:', errors);
    }

    return results;
  }

  // Search documents by type and verification status
  async searchDocuments(searchTerm: string = '', filters: DocumentSearchFilters = {}): Promise<DocumentUploadResult[]> {
    await this.initialize();

    const keyvalues: any = {};

    if (filters.types && filters.types.length > 0) {
      keyvalues.type = { value: filters.types[0], op: 'eq' }; // Pinata only supports single value
    }
    if (filters.userId) {
      keyvalues.userId = { value: filters.userId, op: 'eq' };
    }
    if (filters.campaignId) {
      keyvalues.campaignId = { value: filters.campaignId, op: 'eq' };
    }
    if (filters.verificationStatus) {
      keyvalues.verificationStatus = { value: filters.verificationStatus, op: 'eq' };
    }

    try {
      const response = await axios.get<PinataListResponse>(
        `${PINATA_BASE_URL}/data/pinList`,
        {
          headers: {
            'pinata_api_key': this.apiKey,
            'pinata_secret_api_key': this.secretKey
          },
          params: {
            status: 'pinned',
            metadata: Object.keys(keyvalues).length > 0 ? JSON.stringify({ keyvalues }) : undefined,
            pageLimit: 1000
          }
        }
      );

      let results = response.data.rows.map(row => ({
        ipfsHash: row.ipfs_pin_hash,
        pinSize: row.size,
        timestamp: row.date_pinned,
        metadata: {
          ...row.metadata.keyvalues,
          id: row.id,
          ipfsHash: row.ipfs_pin_hash,
          size: row.size,
          mimeType: row.metadata.keyvalues.mimeType
        }
      }));

      // Apply search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        results = results.filter(result => 
          result.metadata.name.toLowerCase().includes(searchLower) ||
          (result.metadata.description && result.metadata.description.toLowerCase().includes(searchLower)) ||
          result.metadata.type.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      if (filters.sortBy) {
        results.sort((a, b) => {
          const aValue = a.metadata[filters.sortBy!];
          const bValue = b.metadata[filters.sortBy!];
          
          if (filters.sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });
      }

      return results;
    } catch (error: any) {
      throw new Error(`Failed to search documents: ${error.response?.data?.error || error.message}`);
    }
  }

  // Update verification status for a document
  async updateVerificationStatus(
    documentId: string, 
    status: DocumentVerificationStatus, 
    comments?: string
  ): Promise<void> {
    // This would typically update metadata in your database
    // For IPFS, metadata is immutable, so you'd need to track verification status separately
    console.log(`Verification status update: ${documentId} -> ${status}`, comments);
    // Implementation would depend on your backend database
  }

  // Download document from IPFS
  async downloadDocument(ipfsHash: string): Promise<Blob> {
    try {
      const response = await axios.get(`${PINATA_GATEWAY_URL}/${ipfsHash}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to download document: ${error.message}`);
    }
  }

  // Search documents (legacy method for backward compatibility)
  async searchDocumentsLegacy(filters: {
    type?: DocumentMetadata['type'];
    verified?: boolean;
    userId?: string;
    campaignId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<DocumentUploadResult[]> {
    const newFilters: DocumentSearchFilters = {
      types: filters.type ? [filters.type] : undefined,
      userId: filters.userId,
      campaignId: filters.campaignId
    };
    
    return this.searchDocuments('', newFilters);
  }
}

// Export singleton instance
export const ipfsStorageService = new IPFSStorageService();
export default IPFSStorageService;