import React, { useState } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import MetaMaskAuth from './MetaMaskAuth';
import EnhancedRegistration from './EnhancedRegistration';
import EmailVerification from './EmailVerification';
import { useAuth } from '../../context/AuthContext';

interface AuthFlowProps {
  onAuthComplete?: () => void;
  defaultMode?: 'login' | 'signup';
  onBack?: () => void;
}

export const AuthFlow: React.FC<AuthFlowProps> = ({ 
  onAuthComplete, 
  defaultMode = 'login',
  onBack 
}) => {
  const { isAuthenticated, user, login } = useAuth();
  const [currentStep, setCurrentStep] = useState<'wallet' | 'profile' | 'email-verification'>('wallet');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isNewUser, setIsNewUser] = useState<boolean>(defaultMode === 'signup');
  const [tempUserData, setTempUserData] = useState<any>(null);

  const handleAuthSuccess = (address: string, newUser: boolean) => {
    setWalletAddress(address);
    setIsNewUser(newUser);
    setCurrentStep('profile');
  };

  const handleProfileComplete = (userData: any) => {
    // The EnhancedRegistration component already handles everything
    // including blockchain registration and email verification
    login(userData.wallet_address, userData);
    onAuthComplete?.();
  };

  const handleEmailVerificationComplete = () => {
    // Update the user data with email verification status
    const finalUserData = {
      ...tempUserData,
      isEmailVerified: true
    };
    
    // Log the user in with the verified data
    login(walletAddress, finalUserData);
    onAuthComplete?.();
  };

  const handleSkipEmailVerification = () => {
    // Log the user in without email verification
    const finalUserData = {
      ...tempUserData,
      isEmailVerified: false
    };
    
    login(walletAddress, finalUserData);
    onAuthComplete?.();
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
          <p className="text-gray-600 mb-6">You're already authenticated as {user.name}</p>
          <div className="space-y-2 text-sm text-gray-500">
            <p><span className="font-medium">Role:</span> {user.role === 'fund_raiser' ? 'Fund Raiser' : 'Donor'}</p>
            <p><span className="font-medium">Wallet:</span> {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Back Button */}
      {onBack && currentStep === 'wallet' && (
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>
      )}

      {currentStep === 'wallet' && (
        <MetaMaskAuth 
          onAuthSuccess={handleAuthSuccess}
        />
      )}
      
      {currentStep === 'profile' && (
        <EnhancedRegistration 
          walletAddress={walletAddress}
          onComplete={handleProfileComplete}
          onBack={() => setCurrentStep('wallet')}
        />
      )}
      
      {currentStep === 'email-verification' && (
        <EmailVerification
          email={userEmail}
          onVerificationComplete={handleEmailVerificationComplete}
          onBack={() => setCurrentStep('profile')}
          onSkip={handleSkipEmailVerification}
          allowSkip={true}
        />
      )}
    </div>
  );
};

export default AuthFlow;