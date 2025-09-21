import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-md"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute -top-4 -right-4 z-10 p-2 rounded-full bg-secondary-800 border border-secondary-600 hover:bg-secondary-700 transition-colors duration-200 group"
            >
              <XMarkIcon className="h-5 w-5 text-secondary-400 group-hover:text-white" />
            </button>

            {/* Modal Content */}
            <div className="glass rounded-2xl shadow-2xl border border-secondary-700/50 overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -left-10 w-20 h-20 bg-primary-500/10 rounded-full blur-xl animate-pulse-slow"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl animate-bounce-light"></div>
              </div>

              {/* Form Content */}
              <div className="relative z-10">
                <AnimatePresence mode="wait">
                  {mode === 'login' ? (
                    <LoginForm key="login" />
                  ) : (
                    <SignUpForm key="signup" />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;