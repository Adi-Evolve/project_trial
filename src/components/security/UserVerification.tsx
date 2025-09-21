import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  IdentificationIcon,
  CameraIcon,
  DocumentCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { analyzeProfileSecurity, SecurityFlags } from '../../utils/security';

interface UserVerificationProps {
  userId: string;
  onVerificationComplete?: (level: string) => void;
  className?: string;
}

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  required: boolean;
  estimatedTime: string;
}

const UserVerification: React.FC<UserVerificationProps> = ({ 
  userId, 
  onVerificationComplete, 
  className = '' 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      id: 'email',
      title: 'Email Verification',
      description: 'Verify your email address to secure your account',
      icon: EnvelopeIcon,
      status: 'completed',
      required: true,
      estimatedTime: '2 minutes'
    },
    {
      id: 'phone',
      title: 'Phone Verification',
      description: 'Add a phone number for two-factor authentication',
      icon: DevicePhoneMobileIcon,
      status: 'pending',
      required: false,
      estimatedTime: '3 minutes'
    },
    {
      id: 'identity',
      title: 'Identity Verification',
      description: 'Upload a government-issued ID for premium verification',
      icon: IdentificationIcon,
      status: 'pending',
      required: false,
      estimatedTime: '5 minutes'
    },
    {
      id: 'biometric',
      title: 'Biometric Verification',
      description: 'Take a selfie to confirm your identity',
      icon: CameraIcon,
      status: 'pending',
      required: false,
      estimatedTime: '2 minutes'
    }
  ]);
  
  const [securityAnalysis, setSecurityAnalysis] = useState<SecurityFlags | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const [showCodeInput, setShowCodeInput] = useState(false);

  useEffect(() => {
    // Analyze user security profile
    const mockProfile = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      emailVerified: true,
      phoneVerified: false,
      identityVerified: false,
      createdAt: new Date().toISOString(),
      projectsCreated: 2,
      skills: ['React', 'Node.js'],
      fieldsOfInterest: ['Web Development']
    };
    
    const analysis = analyzeProfileSecurity(mockProfile);
    setSecurityAnalysis(analysis);
  }, [userId]);

  const handlePhoneVerification = async () => {
    if (!phoneNumber) return;
    
    setVerificationSteps(prev => prev.map(step => 
      step.id === 'phone' 
        ? { ...step, status: 'in-progress' }
        : step
    ));

    // Simulate sending verification code
    setTimeout(() => {
      setShowCodeInput(true);
    }, 1000);
  };

  const handlePhoneCodeVerification = async () => {
    if (verificationCode.length !== 6) return;

    // Simulate code verification
    setTimeout(() => {
      setVerificationSteps(prev => prev.map(step => 
        step.id === 'phone' 
          ? { ...step, status: 'completed' }
          : step
      ));
      setShowCodeInput(false);
      setCurrentStep(2);
    }, 1000);
  };

  const handleIdUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIdDocument(file);
      setVerificationSteps(prev => prev.map(step => 
        step.id === 'identity' 
          ? { ...step, status: 'in-progress' }
          : step
      ));

      // Simulate ID verification processing
      setTimeout(() => {
        setVerificationSteps(prev => prev.map(step => 
          step.id === 'identity' 
            ? { ...step, status: 'completed' }
            : step
        ));
        setCurrentStep(3);
      }, 3000);
    }
  };

  const handleSelfieCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelfieImage(file);
      setVerificationSteps(prev => prev.map(step => 
        step.id === 'biometric' 
          ? { ...step, status: 'in-progress' }
          : step
      ));

      // Simulate biometric verification
      setTimeout(() => {
        setVerificationSteps(prev => prev.map(step => 
          step.id === 'biometric' 
            ? { ...step, status: 'completed' }
            : step
        ));
        onVerificationComplete?.('premium');
      }, 2000);
    }
  };

  const getStatusColor = (status: VerificationStep['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'in-progress': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'failed': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-secondary-400 bg-secondary-400/10 border-secondary-400/20';
    }
  };

  const getStatusIcon = (status: VerificationStep['status']) => {
    switch (status) {
      case 'completed': return CheckCircleIcon;
      case 'in-progress': return ClockIcon;
      case 'failed': return XCircleIcon;
      default: return ExclamationCircleIcon;
    }
  };

  const completedSteps = verificationSteps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / verificationSteps.length) * 100;

  return (
    <div className={`bg-secondary-800/50 backdrop-blur-sm rounded-xl border border-secondary-700/50 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-secondary-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Account Verification</h2>
              <p className="text-secondary-400">Secure your account and unlock premium features</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{completedSteps}/{verificationSteps.length}</div>
            <div className="text-sm text-secondary-400">Steps Completed</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-secondary-400">Verification Progress</span>
            <span className="text-sm font-medium text-white">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-secondary-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Security Analysis */}
      {securityAnalysis && (
        <div className="p-6 border-b border-secondary-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Security Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary-700/30 rounded-lg p-4">
              <div className="text-sm text-secondary-400">Verification Level</div>
              <div className={`text-lg font-bold capitalize ${
                securityAnalysis.profileVerificationLevel === 'premium' ? 'text-purple-400' :
                securityAnalysis.profileVerificationLevel === 'verified' ? 'text-green-400' :
                securityAnalysis.profileVerificationLevel === 'basic' ? 'text-blue-400' :
                'text-gray-400'
              }`}>
                {securityAnalysis.profileVerificationLevel}
              </div>
            </div>
            <div className="bg-secondary-700/30 rounded-lg p-4">
              <div className="text-sm text-secondary-400">Risk Score</div>
              <div className={`text-lg font-bold ${
                securityAnalysis.riskScore > 60 ? 'text-red-400' :
                securityAnalysis.riskScore > 30 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {securityAnalysis.riskScore}/100
              </div>
            </div>
            <div className="bg-secondary-700/30 rounded-lg p-4">
              <div className="text-sm text-secondary-400">Security Flags</div>
              <div className="text-lg font-bold text-white">{securityAnalysis.flags.length}</div>
            </div>
          </div>
          
          {securityAnalysis.flags.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium text-orange-400 mb-2">Security Recommendations:</div>
              <div className="space-y-1">
                {securityAnalysis.flags.map((flag, index) => (
                  <div key={index} className="text-sm text-orange-300">• {flag}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Verification Steps */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Verification Steps</h3>
        
        <div className="space-y-6">
          {verificationSteps.map((step, index) => {
            const Icon = step.icon;
            const StatusIcon = getStatusIcon(step.status);
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-secondary-700/30 rounded-lg p-6 border transition-all duration-200 ${
                  currentStep === index 
                    ? 'border-primary-500/50 bg-primary-500/5' 
                    : 'border-secondary-600/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg border ${
                      step.status === 'completed' ? 'bg-green-500/20 border-green-500/30' :
                      step.status === 'in-progress' ? 'bg-yellow-500/20 border-yellow-500/30' :
                      'bg-secondary-600/50 border-secondary-500/30'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        step.status === 'completed' ? 'text-green-400' :
                        step.status === 'in-progress' ? 'text-yellow-400' :
                        'text-secondary-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-semibold text-white">{step.title}</h4>
                        {step.required && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-secondary-400 mb-3">{step.description}</p>
                      <div className="text-sm text-secondary-500">
                        Estimated time: {step.estimatedTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded border text-sm font-medium ${getStatusColor(step.status)}`}>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="w-4 h-4" />
                        <span className="capitalize">{step.status === 'in-progress' ? 'Processing' : step.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step Content */}
                <AnimatePresence>
                  {currentStep === index && step.status === 'pending' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-secondary-600/50"
                    >
                      {step.id === 'phone' && (
                        <div className="space-y-4">
                          {!showCodeInput ? (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                  Phone Number
                                </label>
                                <input
                                  type="tel"
                                  value={phoneNumber}
                                  onChange={(e) => setPhoneNumber(e.target.value)}
                                  placeholder="+1 (555) 123-4567"
                                  className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                />
                              </div>
                              <button
                                onClick={handlePhoneVerification}
                                disabled={!phoneNumber}
                                className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <span>Send Verification Code</span>
                                <ArrowRightIcon className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                  Verification Code
                                </label>
                                <input
                                  type="text"
                                  value={verificationCode}
                                  onChange={(e) => setVerificationCode(e.target.value)}
                                  placeholder="Enter 6-digit code"
                                  maxLength={6}
                                  className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                />
                              </div>
                              <button
                                onClick={handlePhoneCodeVerification}
                                disabled={verificationCode.length !== 6}
                                className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                <span>Verify Code</span>
                                <CheckCircleIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {step.id === 'identity' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">
                              Government-issued ID
                            </label>
                            <p className="text-sm text-secondary-400 mb-4">
                              Upload a clear photo of your driver's license, passport, or national ID card
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleIdUpload}
                              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary-600 file:text-white file:cursor-pointer"
                            />
                          </div>
                        </div>
                      )}

                      {step.id === 'biometric' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">
                              Selfie Verification
                            </label>
                            <p className="text-sm text-secondary-400 mb-4">
                              Take a clear selfie to verify your identity matches your ID document
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              capture="user"
                              onChange={handleSelfieCapture}
                              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary-600 file:text-white file:cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="mt-8 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-lg p-6 border border-primary-500/20">
          <h4 className="text-lg font-semibold text-white mb-4">Verification Benefits</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <span className="text-secondary-300">Increased project visibility</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <span className="text-secondary-300">Higher funding success rate</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <span className="text-secondary-300">Access to premium features</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
              <span className="text-secondary-300">Enhanced security protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserVerification;