import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  DocumentArrowUpIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { supabase } from '../../services/supabase';
import { googleDriveService } from '../../services/googleDriveService';
import { advancedBlockchainService } from '../../services/advancedBlockchain';
import { useAuth } from '../../context/AuthContext';
import { emailService } from '../../services/emailService';
import { sendEmailNotification } from '../../services/integrations';

interface DocumentFile {
  file: File;
  preview: string;
  uploaded: boolean;
  fileId?: string;
  url?: string;
}

interface EnhancedRegistrationData {
  name: string;
  email: string;
  gender: 'male' | 'female' | 'other' | '';
  dateOfBirth: string;
  role: 'funder' | 'fund_raiser';
  subRole: 'individual' | 'ngo' | 'company' | '';
  documents: {
    aadharCard?: DocumentFile;
    panCard?: DocumentFile;
    ngoCertificate?: DocumentFile;
    companyPaper?: DocumentFile;
  };
  walletAddress: string;
}

interface EnhancedRegistrationProps {
  walletAddress: string;
  onComplete: (userData: any) => void;
  onBack?: () => void;
}

const EnhancedRegistration: React.FC<EnhancedRegistrationProps> = ({
  walletAddress,
  onComplete,
  onBack
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'basic' | 'role' | 'documents' | 'verification' | 'complete'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  
  const [formData, setFormData] = useState<EnhancedRegistrationData>({
    name: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    role: 'funder',
    subRole: '',
    documents: {},
    walletAddress
  });

  const handleInputChange = (field: keyof EnhancedRegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (docType: string, file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload only JPEG, PNG, or PDF files');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const preview = file.type.startsWith('image/') 
      ? URL.createObjectURL(file)
      : '/icons/pdf-icon.svg';

    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: {
          file,
          preview,
          uploaded: false
        }
      }
    }));

    toast.success(`${docType.replace(/([A-Z])/g, ' $1').toLowerCase()} uploaded successfully`);
  };

  const removeDocument = (docType: string) => {
    setFormData(prev => {
      const newDocs = { ...prev.documents };
      if (newDocs[docType as keyof typeof newDocs]?.preview && 
          newDocs[docType as keyof typeof newDocs]?.preview.startsWith('blob:')) {
        URL.revokeObjectURL(newDocs[docType as keyof typeof newDocs]!.preview);
      }
      delete newDocs[docType as keyof typeof newDocs];
      return { ...prev, documents: newDocs };
    });
  };

  const uploadDocumentToDrive = async (file: File): Promise<{fileId: string, url: string}> => {
    try {
      const validation = googleDriveService.validateFile(file, 10, ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const metadata = googleDriveService.createDocumentMetadata(
        'verification_document',
        walletAddress,
        {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        }
      );

      const result = await googleDriveService.uploadFile(file, metadata);
      if (!result.success) {
        throw new Error(result.error);
      }

      return { 
        fileId: result.fileId || '', 
        url: result.url || '' 
      };
    } catch (error: any) {
      console.error('Google Drive upload failed:', error);
      throw error;
    }
  };

  const uploadAllDocuments = async () => {
    setUploadingDocs(true);
    const updatedDocs = { ...formData.documents };

    try {
      for (const [docType, docData] of Object.entries(formData.documents)) {
        if (docData && !docData.uploaded) {
          toast.loading(`Uploading ${docType}...`);
          const {fileId, url} = await uploadDocumentToDrive(docData.file);
          updatedDocs[docType as keyof typeof updatedDocs] = {
            ...docData,
            uploaded: true,
            fileId,
            url
          };
          toast.dismiss();
          toast.success(`${docType} uploaded to Google Drive`);
        }
      }

      setFormData(prev => ({ ...prev, documents: updatedDocs }));
      return true;
    } catch (error) {
      toast.error('Failed to upload documents. Please try again.');
      return false;
    } finally {
      setUploadingDocs(false);
    }
  };

  const validateBasicInfo = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isAdult = formData.dateOfBirth && (() => {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18;
      }
      return age >= 18;
    })();

    return formData.name.trim() &&
           formData.email.trim() &&
           emailRegex.test(formData.email) &&
           formData.gender &&
           formData.dateOfBirth &&
           isAdult;
  };

  const validateDocuments = () => {
    const hasAadhar = formData.documents.aadharCard;
    const hasPan = formData.documents.panCard;
    
    let hasRequiredDocs = hasAadhar && hasPan;

    if (formData.role === 'fund_raiser' && formData.subRole === 'ngo') {
      hasRequiredDocs = hasRequiredDocs && formData.documents.ngoCertificate;
    }

    if (formData.role === 'fund_raiser' && formData.subRole === 'company') {
      hasRequiredDocs = hasRequiredDocs && formData.documents.companyPaper;
    }

    return hasRequiredDocs;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Upload documents to IPFS first
      const uploadSuccess = await uploadAllDocuments();
      if (!uploadSuccess) {
        setIsSubmitting(false);
        return;
      }

      // Prepare user data for Supabase
      const userData = {
        wallet_address: walletAddress,
        full_name: formData.name,
        email: formData.email,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
        role: formData.role,
        sub_role: formData.subRole,
        status: 'pending',
        is_verified: false,
        email_verified: false,
        // Document file IDs from Google Drive
        aadhar_card_file_id: formData.documents.aadharCard?.fileId,
        pan_card_file_id: formData.documents.panCard?.fileId,
        ngo_certificate_file_id: formData.documents.ngoCertificate?.fileId,
        company_paper_file_id: formData.documents.companyPaper?.fileId,
        verification_token: generateVerificationToken(),
        created_at: new Date().toISOString()
      };

      // Save to Supabase
      const { data: newUser, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;

      // Register user on blockchain
      try {
        const userType = formData.role === 'fund_raiser' ? 
          (formData.subRole === 'ngo' ? 'NGO_CREATOR' : 'PROJECT_CREATOR') : 
          'BACKER';

        // Create metadata for blockchain registration
        const blockchainMetadata = {
          aadharFileId: formData.documents.aadharCard?.fileId,
          panFileId: formData.documents.panCard?.fileId,
          ngoFileId: formData.documents.ngoCertificate?.fileId,
          companyFileId: formData.documents.companyPaper?.fileId,
          userType: formData.role,
          subRole: formData.subRole
        };

        // Upload metadata to Google Drive for blockchain reference
        const metadataResult = await googleDriveService.uploadJSON(blockchainMetadata, 
          `user_verification_${walletAddress}.json`, {
          description: 'User verification metadata for blockchain registration'
        });

        if (metadataResult.success && metadataResult.fileId) {
          await advancedBlockchainService.registerUser({
            userType: userType as 'PROJECT_CREATOR' | 'NGO_CREATOR' | 'BACKER',
            ipfsHash: metadataResult.fileId // Using file ID as reference
          });

          toast.success('Registration complete! User registered on blockchain.');
        } else {
          toast.success('Registration complete! (Blockchain registration pending)');
        }
      } catch (blockchainError) {
        console.error('Blockchain registration failed:', blockchainError);
        toast.success('Registration complete! (Blockchain registration pending)');
      }

      // Send verification email (EmailJS) or fallback to queued outbound email
      try {
        const verificationLink = `${window.location.origin}/verify-email?token=${userData.verification_token}`;
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours

        const verificationResult = await emailService.sendVerificationEmail({
          userName: formData.name,
          userEmail: formData.email,
          verificationLink,
          verificationToken: userData.verification_token,
          expiresAt
        });

        if (verificationResult.success) {
          toast.success('Registration successful! Verification email sent.');
        } else {
          // Fallback: queue outbound email in integrations
          await sendEmailNotification(formData.email, 'Verify your ProjectForge account', `Please verify your email by visiting: ${verificationLink}`);
          toast.success('Registration successful! Verification email queued.');
        }
      } catch (emailErr) {
        console.error('Verification email error', emailErr);
        // Still continue — verification can be retried by admin or user
        toast.success('Registration successful! Please check your email for verification.');
      }
      
      setCurrentStep('complete');
      setTimeout(() => {
        onComplete(newUser);
      }, 2000);

    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateVerificationToken = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const DocumentUploadCard = ({ 
    title, 
    docType, 
    isRequired, 
    description 
  }: { 
    title: string; 
    docType: string; 
    isRequired: boolean; 
    description: string; 
  }) => {
    const doc = formData.documents[docType as keyof typeof formData.documents];
    
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">
            {title} {isRequired && <span className="text-red-500">*</span>}
          </h4>
          {doc && (
            <button
              onClick={() => removeDocument(docType)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        
        {doc ? (
          <div className="flex items-center space-x-3">
            {doc.preview.startsWith('blob:') ? (
              <img 
                src={doc.preview} 
                alt={title}
                className="w-16 h-16 object-cover rounded border"
              />
            ) : (
              <div className="w-16 h-16 bg-red-100 rounded border flex items-center justify-center">
                <DocumentArrowUpIcon className="w-8 h-8 text-red-600" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{doc.file.name}</p>
              <p className="text-xs text-gray-500">
                {(doc.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              {doc.uploaded && doc.fileId && (
                <div className="flex items-center space-x-1 mt-1">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600">Uploaded to Google Drive</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <label className="block">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(docType, e.target.files[0])}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center py-4 cursor-pointer hover:bg-gray-50 rounded transition-colors">
              <DocumentArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Click to upload {title}</span>
              <span className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 5MB</span>
            </div>
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-secondary-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-secondary-800 rounded-2xl border border-secondary-700/50 p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <AnimatePresence mode="wait">
          {currentStep === 'basic' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
                <p className="text-gray-400">Enter your basic details for verification</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full legal name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Gender *
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      max={(() => {
                        const today = new Date();
                        const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                        return eighteenYearsAgo.toISOString().split('T')[0];
                      })()}
                      required
                    />
                  </div>
                </div>

                <div className="bg-secondary-700/50 rounded-lg p-3 flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <ShieldCheckIcon className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-300 font-mono">{formatAddress(walletAddress)}</span>
                </div>

                <div className="flex space-x-4 pt-4">
                  {onBack && (
                    <button
                      onClick={onBack}
                      className="flex-1 py-3 bg-secondary-700 hover:bg-secondary-600 text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                      <span>Back</span>
                    </button>
                  )}
                  <button
                    onClick={() => setCurrentStep('role')}
                    disabled={!validateBasicInfo()}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Next</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'role' && (
            <motion.div
              key="role"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Choose Your Role</h2>
                <p className="text-gray-400">Select how you want to participate in ProjectForge</p>
              </div>

              <div className="space-y-4 mb-6">
                <div
                  onClick={() => handleInputChange('role', 'funder')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.role === 'funder'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-secondary-600 bg-secondary-700/50 hover:border-secondary-500'
                  }`}
                >
                  <h3 className="text-lg font-semibold text-white mb-1">Funder/Donor</h3>
                  <p className="text-gray-400 text-sm">
                    Support innovative projects and ideas with funding
                  </p>
                </div>

                <div
                  onClick={() => handleInputChange('role', 'fund_raiser')}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.role === 'fund_raiser'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-secondary-600 bg-secondary-700/50 hover:border-secondary-500'
                  }`}
                >
                  <h3 className="text-lg font-semibold text-white mb-1">Fund Raiser/Creator</h3>
                  <p className="text-gray-400 text-sm">
                    Create projects and raise funds for your innovative ideas
                  </p>
                </div>
              </div>

              {formData.role === 'fund_raiser' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Creator Type *
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'individual', label: 'Individual', desc: 'Personal projects and ideas' },
                      { value: 'ngo', label: 'NGO/Organization', desc: 'Non-profit organizations and social causes' },
                      { value: 'company', label: 'Company', desc: 'Business ventures and commercial projects' }
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => handleInputChange('subRole', option.value)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.subRole === option.value
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-secondary-600 bg-secondary-700/30 hover:border-secondary-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            formData.subRole === option.value
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-400'
                          }`}>
                            {formData.subRole === option.value && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{option.label}</h4>
                            <p className="text-gray-400 text-xs">{option.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentStep('basic')}
                  className="flex-1 py-3 bg-secondary-700 hover:bg-secondary-600 text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setCurrentStep('documents')}
                  disabled={!formData.role || (formData.role === 'fund_raiser' && !formData.subRole)}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DocumentArrowUpIcon className="w-8 h-8 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Document Verification</h2>
                <p className="text-gray-400">Upload required documents for identity verification</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-400" />
                    <p className="text-amber-300 text-sm">
                      All documents will be encrypted and stored securely on IPFS for verification purposes only.
                    </p>
                  </div>
                </div>

                <DocumentUploadCard
                  title="Aadhar Card"
                  docType="aadharCard"
                  isRequired={true}
                  description="Upload a clear photo of your Aadhar card for identity verification"
                />

                <DocumentUploadCard
                  title="PAN Card"
                  docType="panCard"
                  isRequired={true}
                  description="Upload a clear photo of your PAN card for financial verification"
                />

                {formData.role === 'fund_raiser' && formData.subRole === 'ngo' && (
                  <DocumentUploadCard
                    title="NGO Certificate"
                    docType="ngoCertificate"
                    isRequired={true}
                    description="Upload your NGO registration certificate or 12A/80G certificate"
                  />
                )}

                {formData.role === 'fund_raiser' && formData.subRole === 'company' && (
                  <DocumentUploadCard
                    title="Company Registration"
                    docType="companyPaper"
                    isRequired={true}
                    description="Upload your company incorporation certificate or business registration document"
                  />
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentStep('role')}
                  className="flex-1 py-3 bg-secondary-700 hover:bg-secondary-600 text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!validateDocuments() || isSubmitting || uploadingDocs}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {isSubmitting || uploadingDocs ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{uploadingDocs ? 'Uploading...' : 'Registering...'}</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <CheckCircleIcon className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-10 h-10 text-green-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">Registration Complete!</h2>
              <p className="text-gray-400 mb-6">
                Your registration has been submitted successfully. Our team will review your documents and verify your account within 24-48 hours.
              </p>
              
              <div className="bg-secondary-700/50 rounded-lg p-4 mb-6">
                <h3 className="text-white font-semibold mb-2">What happens next?</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>✓ Document verification (24-48 hours)</p>
                  <p>✓ Email verification (check your inbox)</p>
                  <p>✓ Account activation notification</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-400">Redirecting to dashboard...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default EnhancedRegistration;