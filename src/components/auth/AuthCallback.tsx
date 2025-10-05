import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../services/supabase';
import { toast } from 'react-hot-toast';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Handle the OAuth callback
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      if (data?.session?.user) {
        const user = data.session.user;
        
        // Check if user exists in our database
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingUser) {
          // Existing user - redirect to dashboard
          setStatus('success');
          setMessage('Welcome back! Redirecting to dashboard...');
          
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          // New user - create account
          await createUserAccount(user);
        }
      } else {
        throw new Error('No session found');
      }
    } catch (error: any) {
      console.error('Auth callback error:', error);
      setStatus('error');
      setMessage('Authentication failed. Please try again.');
      
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    }
  };

  const createUserAccount = async (googleUser: any) => {
    try {
      const userData = {
        id: googleUser.id,
        email: googleUser.email,
        full_name: googleUser.user_metadata?.full_name || googleUser.user_metadata?.name,
        avatar_url: googleUser.user_metadata?.avatar_url,
        wallet_address: `google_${googleUser.id}`, // Use Google ID as wallet address
        username: `user_${googleUser.id.substring(0, 8)}`,
        email_verified: true,
        status: 'active',
        is_verified: false,
        role: 'fund_raiser', // Default role
        preferences: {
          authMethod: 'google',
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

      setStatus('success');
      setMessage('Account created successfully! Welcome to ProjectForge!');
      
      toast.success('Welcome to ProjectForge!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('User creation error:', error);
      setStatus('error');
      setMessage('Failed to create account. Please try again.');
      
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md text-center"
      >
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Completing Sign In</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">Success!</h2>
            <p className="text-gray-600">{message}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-green-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2 }}
              />
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">Error</h2>
            <p className="text-gray-600">{message}</p>
            <button
              onClick={() => navigate('/auth')}
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallback;