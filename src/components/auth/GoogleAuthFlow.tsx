import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

interface GoogleAuthFlowProps {
  onClose?: () => void;
  redirectTo?: string;
}

const GoogleAuthFlow: React.FC<GoogleAuthFlowProps> = ({ onClose, redirectTo }) => {
  const [loading, setLoading] = useState(false);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [agreedToDisclosure, setAgreedToDisclosure] = useState(false);
  const [originalWork, setOriginalWork] = useState(true);
  const [creditToOriginal, setCreditToOriginal] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    // Check for authentication result from Google OAuth callback
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session && !user) {
        // User authenticated but not in our system yet
        await handleUserRegistration(data.session.user);
      }
    };

    handleAuthCallback();
  }, [user]);

  const handleGoogleAuth = async () => {
    if (!agreedToDisclosure) {
      setShowDisclosure(true);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        throw error;
      }

      toast.success('Redirecting to Google...');
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast.error('Failed to initiate Google authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleUserRegistration = async (googleUser: any) => {
    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', googleUser.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingUser) {
        // User exists, just sign them in
        toast.success('Welcome back!');
        return;
      }

      // New user registration
      const userData = {
        id: googleUser.id,
        email: googleUser.email,
        full_name: googleUser.user_metadata?.full_name || googleUser.user_metadata?.name,
        avatar_url: googleUser.user_metadata?.avatar_url,
        wallet_address: `temp_${googleUser.id}`, // Temporary wallet address
        username: `user_${googleUser.id.substring(0, 8)}`,
        email_verified: true,
        status: 'active',
        is_verified: false,
        role: 'fund_raiser', // Default role
        preferences: {
          originalWork: originalWork,
          creditToOriginal: creditToOriginal || null,
          agreedToDisclosure: true,
          registrationDate: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      };

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      toast.success('Registration successful! Welcome to ProjectForge!');
      
      if (onClose) {
        onClose();
      }

    } catch (error: any) {
      console.error('User registration error:', error);
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleDisclosureSubmit = () => {
    if (!originalWork && !creditToOriginal.trim()) {
      toast.error('Please provide credit to the original creator');
      return;
    }
    
    setAgreedToDisclosure(true);
    setShowDisclosure(false);
    handleGoogleAuth();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <UserIcon className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Welcome to ProjectForge</h1>
          <p className="text-gray-600 mt-2">Sign in or create an account with Google</p>
        </div>

        {!showDisclosure ? (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">One-click authentication</p>
                  <p>Use your Google account to sign in or create a new account automatically.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDisclosure(true)}
              disabled={loading}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>{loading ? 'Processing...' : 'Continue with Google'}</span>
            </button>

            <div className="text-xs text-gray-500 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </div>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <ExclamationTriangleIcon className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-gray-900">Originality Disclosure</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Please confirm the originality of your work
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-2">Legal Notice:</p>
                  <p>
                    By using ProjectForge, you affirm that any projects, ideas, or content you submit are original works created by you. 
                    If you submit copied, plagiarized, or derivative work without proper attribution, you may be subject to legal action 
                    including but not limited to copyright infringement claims, account termination, and potential damages.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="originalWork"
                    checked={originalWork}
                    onChange={(e) => setOriginalWork(e.target.checked)}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="originalWork" className="text-sm text-gray-700">
                    I confirm that all work I submit will be my original creation and not copied from others
                  </label>
                </div>

                {!originalWork && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="ml-7"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credit to Original Creator(s) *
                    </label>
                    <textarea
                      value={creditToOriginal}
                      onChange={(e) => setCreditToOriginal(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Please provide detailed credit and attribution to the original creator(s) of this work..."
                      rows={4}
                      required={!originalWork}
                    />
                  </motion.div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDisclosure(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleDisclosureSubmit}
                  disabled={!originalWork && !creditToOriginal.trim()}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
};

export default GoogleAuthFlow;