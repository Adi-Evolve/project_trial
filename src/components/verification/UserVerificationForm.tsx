import React, { useState, useEffect } from 'react';
import { 
  userVerificationService, 
  UserVerificationRequest, 
  UserProfile, 
  UserType,
  UserDocument 
} from '../../services/userVerification';
import { DocumentUpload } from '../ipfs/DocumentUpload';
import DocumentViewer from '../ipfs/DocumentViewer';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert, AlertDescription } from '../ui/Alert';
import { 
  User, 
  Shield, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Building,
  CreditCard,
  UserCheck
} from 'lucide-react';

interface UserVerificationFormProps {
  userId: string;
  userEmail: string;
  userName: string;
  onVerificationSubmitted?: (success: boolean, message: string) => void;
  className?: string;
}

export const UserVerificationForm: React.FC<UserVerificationFormProps> = ({
  userId,
  userEmail,
  userName,
  onVerificationSubmitted,
  className
}) => {
  const [selectedUserType, setSelectedUserType] = useState<UserType>('BACKER');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [requiredDocuments, setRequiredDocuments] = useState<UserDocument['documentType'][]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState({
    organizationName: '',
    registrationNumber: '',
    address: '',
    contactNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  useEffect(() => {
    const docs = userVerificationService.getRequiredDocuments(selectedUserType);
    setRequiredDocuments(docs);
  }, [selectedUserType]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const profile = await userVerificationService.getUserProfile(userId);
      setUserProfile(profile);
      
      if (profile) {
        setSelectedUserType(profile.userType);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVerification = async () => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      // Validate required fields
      if (!selectedUserType) {
        throw new Error('Please select user type');
      }

      // Check if all required documents are uploaded
      const validation = await userVerificationService.validateUserDocuments(userId, selectedUserType);
      if (!validation.isComplete && validation.missing.length > 0) {
        throw new Error(`Missing required documents: ${validation.missing.join(', ')}`);
      }

      // Validate additional info for NGO creators
      if (selectedUserType === 'NGO_CREATOR') {
        if (!additionalInfo.organizationName || !additionalInfo.registrationNumber) {
          throw new Error('Organization name and registration number are required for NGO creators');
        }
      }

      const request: UserVerificationRequest = {
        userId,
        userType: selectedUserType,
        documents: [], // Documents already uploaded via DocumentUpload component
        additionalInfo: selectedUserType === 'NGO_CREATOR' ? additionalInfo : undefined
      };

      const result = await userVerificationService.submitVerificationRequest(request);
      
      if (result.success) {
        setSuccess(result.message);
        await loadUserProfile(); // Reload to show updated status
        if (onVerificationSubmitted) {
          onVerificationSubmitted(true, result.message);
        }
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit verification';
      setError(errorMessage);
      if (onVerificationSubmitted) {
        onVerificationSubmitted(false, errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getVerificationStatusBadge = (status: UserProfile['verificationStatus']) => {
    const badges = {
      pending: <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>,
      under_review: <Badge variant="warning"><AlertTriangle className="w-3 h-3 mr-1" />Under Review</Badge>,
      approved: <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>,
      rejected: <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
    };
    return badges[status] || badges.pending;
  };

  const getUserTypeIcon = (userType: UserType) => {
    const icons = {
      PROJECT_CREATOR: <User className="w-4 h-4" />,
      NGO_CREATOR: <Building className="w-4 h-4" />,
      BACKER: <CreditCard className="w-4 h-4" />
    };
    return icons[userType];
  };

  const getDocumentTypeDisplayName = (type: UserDocument['documentType']) => {
    const names = {
      aadhar: 'Aadhar Card',
      pan: 'PAN Card',
      ngo_certificate: 'NGO Certificate',
      address_proof: 'Address Proof',
      photo: 'Profile Photo',
      other: 'Other Document'
    };
    return names[type] || type;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading verification status...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Current Verification Status */}
      {userProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getUserTypeIcon(userProfile.userType)}
                <div>
                  <p className="font-medium">{userName}</p>
                  <p className="text-sm text-gray-600">{userEmail}</p>
                  <p className="text-sm text-gray-500">
                    {userProfile.userType.replace('_', ' ')} Account
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                {getVerificationStatusBadge(userProfile.verificationStatus)}
                {userProfile.verifiedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Verified on {new Date(userProfile.verifiedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {userProfile.verificationComments && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Admin Comments:</p>
                <p className="text-sm text-gray-600 mt-1">{userProfile.verificationComments}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* User Type Selection (only if not already verified) */}
      {(!userProfile || userProfile.verificationStatus === 'rejected') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="w-5 h-5 mr-2" />
              Account Type Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select your account type to determine the required verification documents:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['BACKER', 'PROJECT_CREATOR', 'NGO_CREATOR'] as UserType[]).map(type => (
                  <div
                    key={type}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedUserType === type 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedUserType(type)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={selectedUserType === type}
                        onChange={() => setSelectedUserType(type)}
                        className="text-blue-600"
                      />
                      {getUserTypeIcon(type)}
                      <div>
                        <p className="font-medium">{type.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-600">
                          {type === 'BACKER' && 'Fund and support projects'}
                          {type === 'PROJECT_CREATOR' && 'Create and manage projects'}
                          {type === 'NGO_CREATOR' && 'Create NGO-backed projects'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Required Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Required Documents ({requiredDocuments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Please upload the following documents for verification:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {requiredDocuments.map(docType => (
                <div key={docType} className="flex items-center space-x-2 p-2 border rounded">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{getDocumentTypeDisplayName(docType)}</span>
                  {userProfile?.documents.some(doc => doc.documentType === docType) && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information (for NGO creators) */}
      {selectedUserType === 'NGO_CREATOR' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              NGO Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Organization Name *</label>
                <input
                  type="text"
                  value={additionalInfo.organizationName}
                  onChange={(e) => setAdditionalInfo(prev => ({ 
                    ...prev, 
                    organizationName: e.target.value 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter organization name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Registration Number *</label>
                <input
                  type="text"
                  value={additionalInfo.registrationNumber}
                  onChange={(e) => setAdditionalInfo(prev => ({ 
                    ...prev, 
                    registrationNumber: e.target.value 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter registration number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contact Number</label>
                <input
                  type="tel"
                  value={additionalInfo.contactNumber}
                  onChange={(e) => setAdditionalInfo(prev => ({ 
                    ...prev, 
                    contactNumber: e.target.value 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter contact number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <textarea
                  value={additionalInfo.address}
                  onChange={(e) => setAdditionalInfo(prev => ({ 
                    ...prev, 
                    address: e.target.value 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Enter organization address"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Upload */}
      {(!userProfile || userProfile.verificationStatus !== 'approved') && (
        <DocumentUpload
          userId={userId}
          allowedTypes={requiredDocuments}
          onUploadSuccess={() => {
            loadUserProfile(); // Reload to show uploaded documents
          }}
          onUploadError={(error) => setError(error)}
        />
      )}

      {/* Uploaded Documents Viewer */}
      {userProfile && userProfile.documents.length > 0 && (
        <DocumentViewer
          userId={userId}
          allowedTypes={requiredDocuments}
          className="mt-6"
        />
      )}

      {/* Submit Verification */}
      {(!userProfile || 
        (userProfile.verificationStatus !== 'approved' && 
         userProfile.verificationStatus !== 'pending' &&
         userProfile.verificationStatus !== 'under_review')) && (
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={handleSubmitVerification}
              disabled={submitting || !selectedUserType}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border border-white border-t-transparent mr-2" />
                  Submitting Verification...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit for Verification
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              Your documents will be reviewed by our team within 24-48 hours
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserVerificationForm;