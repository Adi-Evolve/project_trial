import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import {
  UserIcon as UserSolid,
  HeartIcon as HeartSolid,
  CurrencyDollarIcon as DollarSolid
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

interface UserProfileSetupProps {
  walletAddress: string;
  isNewUser: boolean;
  onComplete: (userData: UserData) => void;
  onBack?: () => void;
}

interface UserData {
  walletAddress: string;
  email: string;
  name: string;
  dateOfBirth: string;
  role: 'fund_raiser' | 'donor';
  bio?: string;
  skills?: string[];
  interests?: string[];
}

const UserProfileSetup: React.FC<UserProfileSetupProps> = ({
  walletAddress,
  isNewUser,
  onComplete,
  onBack
}) => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'basic' | 'role' | 'additional' | 'complete'>('welcome');
  const [userData, setUserData] = useState<Partial<UserData>>({
    walletAddress,
    email: '',
    name: '',
    dateOfBirth: '',
    role: 'donor',
    bio: '',
    skills: [],
    interests: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof UserData, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillsChange = (skills: string) => {
    const skillsArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill);
    handleInputChange('skills', skillsArray);
  };

  const handleInterestsChange = (interests: string) => {
    const interestsArray = interests.split(',').map(interest => interest.trim()).filter(interest => interest);
    handleInputChange('interests', interestsArray);
  };

  const validateBasicInfo = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const dobValid = userData.dateOfBirth && new Date(userData.dateOfBirth) <= new Date();
    const emailValid = userData.email && emailRegex.test(userData.email);
    
    // Check if user is at least 18 years old
    const ageValid = userData.dateOfBirth && (() => {
      const today = new Date();
      const birthDate = new Date(userData.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18;
      }
      return age >= 18;
    })();
    
    return userData.name && dobValid && emailValid && ageValid;
  };

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const dobValid = userData.dateOfBirth && new Date(userData.dateOfBirth) <= new Date();
    const emailValid = userData.email && emailRegex.test(userData.email);
    
    // Check specific validation errors
    if (!userData.name) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!userData.email || !emailValid) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (!userData.dateOfBirth || !dobValid) {
      toast.error('Please enter a valid date of birth');
      return;
    }
    
    // Check age validation
    const today = new Date();
    const birthDate = new Date(userData.dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      actualAge = age - 1;
    }
    
    if (actualAge < 18) {
      toast.error('You must be at least 18 years old to register');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mock API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentStep('complete');
      
      setTimeout(() => {
        onComplete(userData as UserData);
      }, 2000);
      
      toast.success('Profile created successfully!');
    } catch (error) {
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
      >
        <AnimatePresence mode="wait">
          {currentStep === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <SparklesIcon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                {isNewUser ? 'Welcome to ProjectForge!' : 'Welcome back!'}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                {isNewUser 
                  ? 'Let\'s set up your profile to get you started with the best experience.'
                  : 'Your wallet has been verified successfully!'
                }
              </p>
              
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <UserSolid className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-900 font-mono text-xs sm:text-sm">{formatAddress(walletAddress)}</span>
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={() => setCurrentStep(isNewUser ? 'basic' : 'complete')}
                  className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <span>{isNewUser ? 'Set Up Profile' : 'Continue to Dashboard'}</span>
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                
                {onBack && (
                  <button
                    onClick={onBack}
                    className="w-full py-3 bg-secondary-700 hover:bg-secondary-600 text-gray-300 rounded-lg font-medium transition-colors"
                  >
                    Back
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 'basic' && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <UserIcon className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
                <p className="text-sm sm:text-base text-gray-600">Tell us a bit about yourself</p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={userData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={userData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth * <span className="text-sm text-gray-500">(You must be 18 or older)</span>
                  </label>
                  <input
                    type="date"
                    value={userData.dateOfBirth || ''}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    max={(() => {
                      const today = new Date();
                      const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                      return eighteenYearsAgo.toISOString().split('T')[0];
                    })()}
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => setCurrentStep('welcome')}
                    className="w-full sm:flex-1 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep('role')}
                    disabled={!validateBasicInfo()}
                    className="w-full sm:flex-1 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <span>Next</span>
                    <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
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
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <BriefcaseIcon className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Choose Your Role</h2>
                <p className="text-sm sm:text-base text-gray-600">How would you like to participate in ProjectForge?</p>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div
                  onClick={() => handleInputChange('role', 'fund_raiser')}
                  className={`p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    userData.role === 'fund_raiser'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
                      userData.role === 'fund_raiser' ? 'bg-blue-100' : 'bg-orange-100'
                    }`}>
                      <HeartSolid className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        userData.role === 'fund_raiser' ? 'text-blue-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Fund Raiser</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        Create projects, seek funding, and bring your ideas to life with community support.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleInputChange('role', 'donor')}
                  className={`p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    userData.role === 'donor'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
                      userData.role === 'donor' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      <DollarSolid className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        userData.role === 'donor' ? 'text-blue-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Donor</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        Support innovative projects, fund promising ideas, and help creators achieve their goals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setCurrentStep('basic')}
                  className="w-full sm:flex-1 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setCurrentStep('additional')}
                  className="w-full sm:flex-1 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <span>Next</span>
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'additional' && (
            <motion.div
              key="additional"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <SparklesIcon className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Additional Details</h2>
                <p className="text-sm sm:text-base text-gray-600">Help others know more about you (optional)</p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={userData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 sm:h-24 resize-none text-sm sm:text-base"
                    placeholder="Tell us about yourself, your interests, and what you're passionate about..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={userData.skills?.join(', ') || ''}
                    onChange={(e) => handleSkillsChange(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="e.g., React, Python, UI/UX Design, Marketing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interests (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={userData.interests?.join(', ') || ''}
                    onChange={(e) => handleInterestsChange(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="e.g., Web3, AI, Climate Change, Education"
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => setCurrentStep('role')}
                    className="w-full sm:flex-1 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 py-2.5 sm:py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Setup</span>
                        <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <CheckCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Profile Complete!</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Welcome to ProjectForge, {userData.name}! Your profile has been created successfully.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="text-gray-900 capitalize">{userData.role?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wallet:</span>
                    <span className="text-gray-900 font-mono">{formatAddress(walletAddress)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-sm sm:text-base text-gray-600">Redirecting to dashboard...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default UserProfileSetup;