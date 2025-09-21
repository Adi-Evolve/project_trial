import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  agreeToTerms?: boolean;
}

const SignInPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    agreeToTerms: false
  });

  const handleInputChange = (field: keyof AuthFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        setLoading(false);
        return;
      }
      if (!formData.agreeToTerms) {
        toast.error('Please agree to the terms and conditions');
        setLoading(false);
        return;
      }
    }

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (isLogin) {
        toast.success('Welcome back! Redirecting...');
      } else {
        toast.success('Account created successfully! Please check your email for verification.');
      }
      // Here you would handle the actual authentication
    }, 2000);
  };

  const handleSocialAuth = (provider: 'google' | 'github' | 'apple') => {
    toast.success(`Connecting with ${provider}...`);
    // Handle social authentication
  };

  const handleForgotPassword = () => {
    if (!formData.email) {
      toast.error('Please enter your email address first');
      return;
    }
    toast.success('Password reset link sent to your email');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-purple-600 to-blue-600 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="w-full h-full opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              backgroundSize: '100% 100%',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <SparklesIcon className="w-8 h-8" />
                </div>
                <span className="text-3xl font-bold">ProjectForge</span>
              </div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Transform Ideas Into
                <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  Reality
                </span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Join the world's most innovative community where creators, investors, and visionaries come together to build the future.
              </p>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex items-center space-x-4"
              >
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <ShieldCheckIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Blockchain Secured</h3>
                  <p className="text-blue-100">Your ideas and investments protected by cutting-edge technology</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center space-x-4"
              >
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <GlobeAltIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Global Community</h3>
                  <p className="text-blue-100">Connect with innovators from around the world</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="flex items-center space-x-4"
              >
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <SparklesIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI-Powered Matching</h3>
                  <p className="text-blue-100">Smart algorithms connect you with the right opportunities</p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-blue-100">Active Projects</span>
                <span className="text-2xl font-bold">1,247</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-blue-100">Total Funding</span>
                <span className="text-2xl font-bold">$12.4M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-100">Success Rate</span>
                <span className="text-2xl font-bold text-green-300">89%</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">ProjectForge</span>
            </div>
            <p className="text-gray-400">Transform your ideas into reality</p>
          </div>

          <div className="bg-secondary-800/50 backdrop-blur-xl rounded-2xl border border-secondary-700/50 p-8 shadow-2xl">
            {/* Toggle Buttons */}
            <div className="flex mb-8 bg-secondary-700/50 rounded-xl p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-200 ${
                  isLogin
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-200 ${
                  !isLogin
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {isLogin ? 'Welcome Back!' : 'Create Account'}
                  </h2>
                  <p className="text-gray-400">
                    {isLogin 
                      ? 'Enter your credentials to access your account' 
                      : 'Join thousands of innovators building the future'
                    }
                  </p>
                </div>

                {/* Name Fields (Sign Up Only) */}
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="First Name"
                        value={formData.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                        required={!isLogin}
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={formData.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <LockClosedIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-secondary-700 border border-secondary-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Confirm Password (Sign Up Only) */}
                {!isLogin && (
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <LockClosedIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword || ''}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
                      required={!isLogin}
                    />
                  </div>
                )}

                {/* Remember Me / Forgot Password */}
                {isLogin && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm text-gray-400">
                      <input
                        type="checkbox"
                        className="rounded border-secondary-600 bg-secondary-700 text-primary-500 focus:ring-primary-500"
                      />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Terms Agreement (Sign Up Only) */}
                {!isLogin && (
                  <label className="flex items-start space-x-3 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms || false}
                      onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                      className="mt-1 rounded border-secondary-600 bg-secondary-700 text-primary-500 focus:ring-primary-500"
                      required
                    />
                    <span>
                      I agree to the{' '}
                      <button type="button" className="text-primary-400 hover:text-primary-300 font-medium underline">
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button type="button" className="text-primary-400 hover:text-primary-300 font-medium underline">
                        Privacy Policy
                      </button>
                    </span>
                  </label>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className={`w-full py-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                    loading
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-400 hover:to-purple-400 shadow-lg shadow-primary-500/25'
                  } text-white`}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRightIcon className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-secondary-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-secondary-800 text-gray-400">Or continue with</span>
                  </div>
                </div>

                {/* Social Auth Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSocialAuth('google')}
                    className="p-3 bg-secondary-700 hover:bg-secondary-600 border border-secondary-600 rounded-xl transition-all duration-200 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSocialAuth('github')}
                    className="p-3 bg-secondary-700 hover:bg-secondary-600 border border-secondary-600 rounded-xl transition-all duration-200 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSocialAuth('apple')}
                    className="p-3 bg-secondary-700 hover:bg-secondary-600 border border-secondary-600 rounded-xl transition-all duration-200 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </motion.button>
                </div>

                {/* Footer Text */}
                <div className="text-center text-sm text-gray-400">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </div>
              </motion.form>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignInPage;