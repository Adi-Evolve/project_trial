import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { EmailVerificationManager, validateEmail } from '../../services/emailVerification';

interface EmailVerificationProps {
  email: string;
  onVerificationComplete: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  allowSkip?: boolean;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerificationComplete,
  onBack,
  onSkip,
  allowSkip = false
}) => {
  const { verifyEmail } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationManager] = useState(() => 
    new EmailVerificationManager(email, (state) => {
      setVerificationSent(state.isVerificationSent);
    })
  );

  useEffect(() => {
    // Auto-send verification email when component mounts
    if (validateEmail(email)) {
      handleSendVerification();
    }
  }, [email]);

  useEffect(() => {
    // Countdown timer for resend cooldown
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendVerification = async () => {
    if (!validateEmail(email)) {
      toast.error('Please provide a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await verificationManager.sendVerification();
      
      if (success) {
        setVerificationSent(true);
        setResendCooldown(60); // 60 second cooldown
        toast.success('Verification code sent to your email!');
      } else {
        toast.error('Failed to send verification email. Please try again.');
      }
    } catch (error) {
      console.error('Error sending verification:', error);
      toast.error('Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      toast.error('Please enter a valid verification code');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await verifyEmail(verificationCode);
      
      if (success) {
        toast.success('Email verified successfully!');
        onVerificationComplete();
      } else {
        toast.error('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      toast.error('Failed to verify email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    if (!verificationManager.canResend()) {
      toast.error('Too many attempts. Please wait before requesting another code.');
      return;
    }

    await handleSendVerification();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && verificationCode.length >= 6) {
      handleVerifyCode();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <EnvelopeIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
          <p className="text-gray-600">
            We've sent a verification code to{' '}
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
        </div>

        {/* Verification Status */}
        {verificationSent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 text-sm">Verification email sent successfully!</span>
            </div>
          </motion.div>
        )}

        {/* Verification Code Input */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="000000"
              maxLength={6}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerifyCode}
            disabled={isLoading || verificationCode.length < 6}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                Verifying...
              </div>
            ) : (
              'Verify Email'
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || isLoading}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                'Resend verification code'
              )}
            </button>
          </div>

          {/* Warning about email verification */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-yellow-800 text-sm">
                <p className="font-medium mb-1">Email verification required</p>
                <p>
                  You need to verify your email address to access certain features and 
                  receive important notifications about your projects.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Back
            </button>
          )}
          
          {allowSkip && onSkip && (
            <button
              onClick={onSkip}
              className="flex-1 text-gray-500 hover:text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Skip for now
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Check your spam folder if you don't see the email. The verification code expires in 10 minutes.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerification;