import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import ChatInterface from './ChatInterface';

const FloatingChatButton: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg shadow-primary-500/25 flex items-center justify-center z-40 transition-colors"
        style={{ zIndex: isChatOpen ? 39 : 40 }}
      >
        <motion.div
          animate={{ rotate: isChatOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isChatOpen ? (
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-4 h-0.5 bg-white transform rotate-45 absolute" />
              <div className="w-4 h-0.5 bg-white transform -rotate-45 absolute" />
            </div>
          ) : (
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
          )}
        </motion.div>
        
        {/* Notification Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
        >
          3
        </motion.div>
      </motion.button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isChatOpen && (
          <ChatInterface
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatButton;