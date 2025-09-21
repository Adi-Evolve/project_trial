import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
  PhotoIcon,
  MicrophoneIcon,
  PhoneIcon,
  VideoCameraIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useChat } from '../../context/ChatContext';
import { formatDistanceToNow } from 'date-fns';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose }) => {
  const {
    chats,
    activeChat,
    messages,
    onlineUsers,
    isConnected,
    typingUsers,
    setActiveChat,
    sendMessage,
    addReaction,
    markAsRead
  } = useChat();

  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.participants.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeMessages = activeChat ? messages[activeChat.id] || [] : [];

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleChatSelect = (chat: any) => {
    setActiveChat(chat);
    markAsRead(chat.id);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const isUserOnline = (userId: string) => onlineUsers.includes(userId);

  const getLastMessage = (chat: any) => {
    const chatMessages = messages[chat.id] || [];
    return chatMessages[chatMessages.length - 1];
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-4 right-4 w-96 h-[600px] bg-secondary-900/98 backdrop-blur-xl border border-secondary-700/50 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-700/50 bg-secondary-800/50">
        <div className="flex items-center space-x-3">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary-400" />
          <div>
            <h3 className="font-semibold text-white">Messages</h3>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-xs text-secondary-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat List */}
        <div className={`${activeChat ? 'hidden' : 'flex'} w-full flex-col`}>
          {/* Search */}
          <div className="p-3 border-b border-secondary-700/50">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-sm text-white placeholder-secondary-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => {
              const lastMessage = getLastMessage(chat);
              return (
                <motion.button
                  key={chat.id}
                  whileHover={{ backgroundColor: 'rgba(75, 85, 99, 0.3)' }}
                  onClick={() => handleChatSelect(chat)}
                  className="w-full p-3 text-left border-b border-secondary-700/30 hover:bg-secondary-700/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={chat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=6366f1&color=fff`}
                        alt={chat.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {chat.type === 'direct' && chat.participants.some(p => isUserOnline(p)) && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-secondary-900 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white truncate">{chat.name}</h4>
                        {lastMessage && (
                          <span className="text-xs text-secondary-400">
                            {formatDistanceToNow(lastMessage.timestamp, { addSuffix: false })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-secondary-400 truncate">
                          {lastMessage ? (
                            <>
                              {lastMessage.senderName === 'John Doe' ? 'You: ' : `${lastMessage.senderName}: `}
                              {lastMessage.content}
                            </>
                          ) : (
                            'No messages yet'
                          )}
                        </p>
                        {chat.unreadCount > 0 && (
                          <span className="ml-2 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* New Chat Button */}
          <div className="p-3 border-t border-secondary-700/50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Chat</span>
            </motion.button>
          </div>
        </div>

        {/* Chat Messages */}
        {activeChat && (
          <div className="flex flex-col w-full">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 border-b border-secondary-700/50 bg-secondary-800/30">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveChat(null)}
                  className="lg:hidden p-1 text-secondary-400 hover:text-white rounded"
                >
                  ←
                </button>
                <img
                  src={activeChat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeChat.name)}&background=6366f1&color=fff`}
                  alt={activeChat.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-white">{activeChat.name}</h4>
                  <div className="flex items-center space-x-1">
                    {activeChat.type === 'direct' ? (
                      <span className="text-xs text-secondary-400">
                        {isUserOnline(activeChat.participants.find(p => p !== 'user-1') || '') ? 'Online' : 'Offline'}
                      </span>
                    ) : (
                      <span className="text-xs text-secondary-400">
                        {activeChat.participants.length} members
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors">
                  <PhoneIcon className="w-4 h-4" />
                </button>
                <button className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors">
                  <VideoCameraIcon className="w-4 h-4" />
                </button>
                <button className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors">
                  <InformationCircleIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              <AnimatePresence>
                {activeMessages.map((message, index) => {
                  const isOwn = message.senderId === 'user-1';
                  const showAvatar = !isOwn && (index === 0 || activeMessages[index - 1].senderId !== message.senderId);
                  
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${!showAvatar && !isOwn ? 'ml-10' : ''}`}
                    >
                      <div className={`flex items-end space-x-2 max-w-[80%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {showAvatar && (
                          <img
                            src={message.senderAvatar}
                            alt={message.senderName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div className={`relative group`}>
                          <div
                            className={`px-3 py-2 rounded-2xl ${
                              isOwn
                                ? 'bg-primary-500 text-white'
                                : 'bg-secondary-700 text-white'
                            }`}
                          >
                            {!isOwn && showAvatar && (
                              <div className="text-xs text-secondary-300 mb-1">{message.senderName}</div>
                            )}
                            <div className="text-sm">{message.content}</div>
                            {message.edited && (
                              <div className="text-xs opacity-70 mt-1">(edited)</div>
                            )}
                          </div>
                          
                          {/* Reactions */}
                          {message.reactions && Object.keys(message.reactions).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(message.reactions).map(([emoji, users]) => (
                                <motion.button
                                  key={emoji}
                                  whileHover={{ scale: 1.1 }}
                                  onClick={() => addReaction(message.id, emoji)}
                                  className="bg-secondary-600 hover:bg-secondary-500 rounded-full px-2 py-1 text-xs flex items-center space-x-1"
                                >
                                  <span>{emoji}</span>
                                  <span>{users.length}</span>
                                </motion.button>
                              ))}
                            </div>
                          )}
                          
                          <div className={`text-xs text-secondary-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {/* Typing Indicator */}
              {typingUsers[activeChat.id] && typingUsers[activeChat.id].length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-secondary-400"
                >
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm">
                    {typingUsers[activeChat.id].join(', ')} {typingUsers[activeChat.id].length === 1 ? 'is' : 'are'} typing...
                  </span>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-secondary-700/50 bg-secondary-800/30">
              <div className="flex items-end space-x-2">
                <div className="flex space-x-1">
                  <button className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors">
                    <PaperClipIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors">
                    <PhotoIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-sm text-white placeholder-secondary-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                    rows={1}
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                  />
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
                  >
                    <FaceSmileIcon className="w-4 h-4" />
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="p-2 bg-primary-500 hover:bg-primary-600 disabled:bg-secondary-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatInterface;