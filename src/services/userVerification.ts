// Enhanced user verification service with document management
import { supabase } from './supabase';
import { ipfsStorageService, DocumentMetadata } from './ipfsStorage';

export type UserVerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';
export type UserType = 'PROJECT_CREATOR' | 'NGO_CREATOR' | 'BACKER';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  verificationStatus: UserVerificationStatus;
  documents: UserDocument[];
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  verificationComments?: string;
  verifiedBy?: string;
}

export interface UserDocument {
  id: string;
  userId: string;
  documentType: 'aadhar' | 'pan' | 'ngo_certificate' | 'address_proof' | 'photo' | 'other';
  documentName: string;
  ipfsHash: string;
  verificationStatus: UserVerificationStatus;
  uploadedAt: string;
  verifiedAt?: string;
  verificationComments?: string;
  verifiedBy?: string;
  metadata: DocumentMetadata;
}

export interface UserVerificationRequest {
  userId: string;
  userType: UserType;
  documents: {
    type: UserDocument['documentType'];
    file: File;
    name: string;
    description?: string;
  }[];
  additionalInfo?: {
    organizationName?: string;
    registrationNumber?: string;
    address?: string;
    contactNumber?: string;
  };
}

export interface AdminVerificationAction {
  documentId: string;
  status: UserVerificationStatus;
  comments?: string;
  adminId: string;
}

class UserVerificationService {
  // Initialize the service
  async initialize(): Promise<void> {
    await ipfsStorageService.initialize();
  }

  // Submit user verification request
  async submitVerificationRequest(request: UserVerificationRequest): Promise<{ success: boolean; message: string }> {
    try {
      await this.initialize();

      // Upload documents to IPFS
      const uploadedDocuments: UserDocument[] = [];
      
      for (const doc of request.documents) {
        try {
          const uploadResult = await ipfsStorageService.uploadDocument(doc.file, {
            name: doc.name,
            type: doc.type === 'aadhar' ? 'aadhar' : 
                  doc.type === 'pan' ? 'pan' : 
                  doc.type === 'ngo_certificate' ? 'ngo_certificate' : 'other',
            description: doc.description,
            userId: request.userId
          });

          const userDocument: UserDocument = {
            id: uploadResult.metadata.id || `doc_${Date.now()}_${Math.random()}`,
            userId: request.userId,
            documentType: doc.type,
            documentName: doc.name,
            ipfsHash: uploadResult.ipfsHash,
            verificationStatus: 'pending',
            uploadedAt: new Date().toISOString(),
            metadata: uploadResult.metadata
          };

          uploadedDocuments.push(userDocument);
        } catch (error) {
          console.error(`Failed to upload document ${doc.name}:`, error);
          throw new Error(`Failed to upload document: ${doc.name}`);
        }
      }

      // Store user verification request in database
      const { data: existingUser, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', request.userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Database error: ${fetchError.message}`);
      }

      const userProfile: Partial<UserProfile> = {
        id: request.userId,
        userType: request.userType,
        verificationStatus: 'pending',
        updatedAt: new Date().toISOString(),
        ...(!existingUser && { createdAt: new Date().toISOString() })
      };

      // Upsert user profile
      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert(userProfile);

      if (upsertError) {
        throw new Error(`Failed to update user profile: ${upsertError.message}`);
      }

      // Insert documents
      const { error: documentsError } = await supabase
        .from('user_documents')
        .insert(uploadedDocuments.map(doc => ({
          id: doc.id,
          user_id: doc.userId,
          document_type: doc.documentType,
          document_name: doc.documentName,
          ipfs_hash: doc.ipfsHash,
          verification_status: doc.verificationStatus,
          uploaded_at: doc.uploadedAt,
          metadata: doc.metadata
        })));

      if (documentsError) {
        throw new Error(`Failed to store documents: ${documentsError.message}`);
      }

      // Store additional info if provided
      if (request.additionalInfo) {
        const { error: additionalInfoError } = await supabase
          .from('user_additional_info')
          .upsert({
            user_id: request.userId,
            organization_name: request.additionalInfo.organizationName,
            registration_number: request.additionalInfo.registrationNumber,
            address: request.additionalInfo.address,
            contact_number: request.additionalInfo.contactNumber,
            updated_at: new Date().toISOString()
          });

        if (additionalInfoError) {
          console.error('Failed to store additional info:', additionalInfoError);
          // Don't throw here as it's not critical
        }
      }

      return {
        success: true,
        message: `Verification request submitted successfully. ${uploadedDocuments.length} documents uploaded to IPFS.`
      };

    } catch (error) {
      console.error('Verification request submission failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit verification request'
      };
    }
  }

  // Get user profile with documents
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          return null; // User not found
        }
        throw new Error(`Failed to fetch user profile: ${profileError.message}`);
      }

      // Get user documents
      const { data: documents, error: documentsError } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

      if (documentsError) {
        throw new Error(`Failed to fetch user documents: ${documentsError.message}`);
      }

      const userDocuments: UserDocument[] = documents.map(doc => ({
        id: doc.id,
        userId: doc.user_id,
        documentType: doc.document_type,
        documentName: doc.document_name,
        ipfsHash: doc.ipfs_hash,
        verificationStatus: doc.verification_status,
        uploadedAt: doc.uploaded_at,
        verifiedAt: doc.verified_at,
        verificationComments: doc.verification_comments,
        verifiedBy: doc.verified_by,
        metadata: doc.metadata
      }));

      return {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        userType: userProfile.user_type,
        verificationStatus: userProfile.verification_status,
        documents: userDocuments,
        createdAt: userProfile.created_at,
        updatedAt: userProfile.updated_at,
        verifiedAt: userProfile.verified_at,
        verificationComments: userProfile.verification_comments,
        verifiedBy: userProfile.verified_by
      };

    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  }

  // Get all pending verification requests (for admins)
  async getPendingVerifications(): Promise<UserProfile[]> {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('verification_status', ['pending', 'under_review'])
        .order('created_at', { ascending: true });

      if (profilesError) {
        throw new Error(`Failed to fetch pending verifications: ${profilesError.message}`);
      }

      const userProfiles: UserProfile[] = [];

      for (const profile of profiles) {
        const { data: documents, error: documentsError } = await supabase
          .from('user_documents')
          .select('*')
          .eq('user_id', profile.id)
          .order('uploaded_at', { ascending: false });

        if (documentsError) {
          console.error(`Failed to fetch documents for user ${profile.id}:`, documentsError);
          continue;
        }

        const userDocuments: UserDocument[] = documents.map(doc => ({
          id: doc.id,
          userId: doc.user_id,
          documentType: doc.document_type,
          documentName: doc.document_name,
          ipfsHash: doc.ipfs_hash,
          verificationStatus: doc.verification_status,
          uploadedAt: doc.uploaded_at,
          verifiedAt: doc.verified_at,
          verificationComments: doc.verification_comments,
          verifiedBy: doc.verified_by,
          metadata: doc.metadata
        }));

        userProfiles.push({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          userType: profile.user_type,
          verificationStatus: profile.verification_status,
          documents: userDocuments,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
          verifiedAt: profile.verified_at,
          verificationComments: profile.verification_comments,
          verifiedBy: profile.verified_by
        });
      }

      return userProfiles;

    } catch (error) {
      console.error('Failed to get pending verifications:', error);
      throw error;
    }
  }

  // Admin action: Verify user documents
  async verifyUserDocuments(action: AdminVerificationAction): Promise<{ success: boolean; message: string }> {
    try {
      const { error: documentError } = await supabase
        .from('user_documents')
        .update({
          verification_status: action.status,
          verification_comments: action.comments,
          verified_by: action.adminId,
          verified_at: action.status === 'approved' ? new Date().toISOString() : null
        })
        .eq('id', action.documentId);

      if (documentError) {
        throw new Error(`Failed to update document: ${documentError.message}`);
      }

      // Get the user ID from the document
      const { data: document, error: fetchError } = await supabase
        .from('user_documents')
        .select('user_id')
        .eq('id', action.documentId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch document: ${fetchError.message}`);
      }

      // Check if all user documents are approved
      const { data: userDocuments, error: userDocsError } = await supabase
        .from('user_documents')
        .select('verification_status')
        .eq('user_id', document.user_id);

      if (userDocsError) {
        throw new Error(`Failed to fetch user documents: ${userDocsError.message}`);
      }

      // Determine overall user verification status
      let overallStatus: UserVerificationStatus = 'pending';
      const statuses = userDocuments.map(doc => doc.verification_status);
      
      if (statuses.every(status => status === 'approved')) {
        overallStatus = 'approved';
      } else if (statuses.some(status => status === 'rejected')) {
        overallStatus = 'rejected';
      } else if (statuses.some(status => status === 'under_review')) {
        overallStatus = 'under_review';
      }

      // Update user profile verification status
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          verification_status: overallStatus,
          verified_at: overallStatus === 'approved' ? new Date().toISOString() : null,
          verified_by: overallStatus === 'approved' ? action.adminId : null,
          verification_comments: overallStatus === 'rejected' ? action.comments : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', document.user_id);

      if (profileError) {
        throw new Error(`Failed to update user profile: ${profileError.message}`);
      }

      return {
        success: true,
        message: `Document verification updated. User status: ${overallStatus}`
      };

    } catch (error) {
      console.error('Document verification failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to verify document'
      };
    }
  }

  // Update user verification status (for admins)
  async updateUserVerificationStatus(
    userId: string, 
    status: UserVerificationStatus, 
    comments?: string, 
    adminId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          verification_status: status,
          verification_comments: comments,
          verified_by: status === 'approved' ? adminId : null,
          verified_at: status === 'approved' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw new Error(`Failed to update user verification: ${error.message}`);
      }

      return {
        success: true,
        message: `User verification status updated to: ${status}`
      };

    } catch (error) {
      console.error('User verification update failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update verification status'
      };
    }
  }

  // Get verification statistics (for admin dashboard)
  async getVerificationStatistics(): Promise<{
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    byUserType: Record<UserType, number>;
  }> {
    try {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('verification_status, user_type');

      if (error) {
        throw new Error(`Failed to fetch verification statistics: ${error.message}`);
      }

      const stats = {
        total: profiles.length,
        pending: 0,
        underReview: 0,
        approved: 0,
        rejected: 0,
        byUserType: {
          PROJECT_CREATOR: 0,
          NGO_CREATOR: 0,
          BACKER: 0
        } as Record<UserType, number>
      };

      profiles.forEach(profile => {
        // Count by status
        switch (profile.verification_status) {
          case 'pending':
            stats.pending++;
            break;
          case 'under_review':
            stats.underReview++;
            break;
          case 'approved':
            stats.approved++;
            break;
          case 'rejected':
            stats.rejected++;
            break;
        }

        // Count by user type
        if (profile.user_type in stats.byUserType) {
          stats.byUserType[profile.user_type as UserType]++;
        }
      });

      return stats;

    } catch (error) {
      console.error('Failed to get verification statistics:', error);
      throw error;
    }
  }

  // Check if user is verified
  async isUserVerified(userId: string): Promise<boolean> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('verification_status')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return false; // User not found
        }
        throw new Error(`Failed to check user verification: ${error.message}`);
      }

      return profile.verification_status === 'approved';

    } catch (error) {
      console.error('Failed to check user verification:', error);
      return false;
    }
  }

  // Get required documents for user type
  getRequiredDocuments(userType: UserType): UserDocument['documentType'][] {
    const commonDocs: UserDocument['documentType'][] = ['aadhar', 'pan', 'photo'];
    
    switch (userType) {
      case 'NGO_CREATOR':
        return [...commonDocs, 'ngo_certificate', 'address_proof'];
      case 'PROJECT_CREATOR':
        return [...commonDocs, 'address_proof'];
      case 'BACKER':
        return ['aadhar', 'pan']; // Minimal requirements for backers
      default:
        return commonDocs;
    }
  }

  // Validate if user has all required documents
  async validateUserDocuments(userId: string, userType: UserType): Promise<{
    isComplete: boolean;
    missing: UserDocument['documentType'][];
    uploaded: UserDocument['documentType'][];
  }> {
    try {
      const userProfile = await this.getUserProfile(userId);
      const requiredDocs = this.getRequiredDocuments(userType);
      
      if (!userProfile) {
        return {
          isComplete: false,
          missing: requiredDocs,
          uploaded: []
        };
      }

      const uploadedDocTypes = userProfile.documents.map(doc => doc.documentType);
      const missing = requiredDocs.filter(docType => !uploadedDocTypes.includes(docType));

      return {
        isComplete: missing.length === 0,
        missing,
        uploaded: uploadedDocTypes
      };

    } catch (error) {
      console.error('Failed to validate user documents:', error);
      throw error;
    }
  }
}

export const userVerificationService = new UserVerificationService();