import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PhoneIcon,
  VideoCameraIcon,
  UserCircleIcon,
  PlusIcon,
  FaceSmileIcon,
  PaperClipIcon,
  ArchiveBoxIcon,
  TrashIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  CheckCircleIcon as CheckCircleIconSolid
} from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'system';
  read: boolean;
  edited?: boolean;
  editedAt?: string;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'file';
  size: number;
}

interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  type: 'direct' | 'group';
  name?: string; // For group conversations
  description?: string;
}

const MessagesPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock data
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        type: 'direct',
        participants: [
          {
            id: '2',
            name: 'Alex Rodriguez',
            username: 'alexdev',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            isOnline: true
          }
        ],
        lastMessage: {
          id: '1',
          content: 'Hey! I saw your AI project, would love to collaborate on it. Do you have some time to discuss?',
          senderId: '2',
          timestamp: '2024-01-20T14:30:00Z',
          type: 'text',
          read: false
        },
        unreadCount: 2,
        isPinned: true,
        isArchived: false,
        createdAt: '2024-01-18T09:00:00Z'
      },
      {
        id: '2',
        type: 'direct',
        participants: [
          {
            id: '3',
            name: 'Sarah Chen',
            username: 'sarahchen',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b563?w=150&h=150&fit=crop&crop=face',
            isOnline: false,
            lastSeen: '2024-01-20T12:15:00Z'
          }
        ],
        lastMessage: {
          id: '2',
          content: 'Thanks for the feedback on the UI mockups! I\'ll update them based on your suggestions.',
          senderId: '3',
          timestamp: '2024-01-20T11:45:00Z',
          type: 'text',
          read: true
        },
        unreadCount: 0,
        isPinned: false,
        isArchived: false,
        createdAt: '2024-01-15T14:20:00Z'
      },
      {
        id: '3',
        type: 'group',
        name: 'EcoTracker Team',
        description: 'Discussion for the EcoTracker project',
        participants: [
          {
            id: '4',
            name: 'Mike Johnson',
            username: 'mikej',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            isOnline: true
          },
          {
            id: '5',
            name: 'Emily Davis',
            username: 'emilyd',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            isOnline: false,
            lastSeen: '2024-01-20T10:30:00Z'
          },
          {
            id: '6',
            name: 'David Kim',
            username: 'davidk',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            isOnline: true
          }
        ],
        lastMessage: {
          id: '3',
          content: 'Great progress on the API integration! The carbon tracking feature is working perfectly.',
          senderId: '4',
          timestamp: '2024-01-20T09:20:00Z',
          type: 'text',
          read: true
        },
        unreadCount: 0,
        isPinned: false,
        isArchived: false,
        createdAt: '2024-01-10T16:45:00Z'
      },
      {
        id: '4',
        type: 'direct',
        participants: [
          {
            id: '7',
            name: 'Lisa Wang',
            username: 'lisawang',
            avatar: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=150&h=150&fit=crop&crop=face',
            isOnline: false,
            lastSeen: '2024-01-19T18:00:00Z'
          }
        ],
        lastMessage: {
          id: '4',
          content: 'The blockchain integration looks solid. Let me know when you\'re ready for the smart contract review.',
          senderId: '1',
          timestamp: '2024-01-19T16:30:00Z',
          type: 'text',
          read: true
        },
        unreadCount: 0,
        isPinned: false,
        isArchived: false,
        createdAt: '2024-01-12T11:00:00Z'
      }
    ];

    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Hi there! I hope you\'re doing well.',
        senderId: '2',
        timestamp: '2024-01-20T14:00:00Z',
        type: 'text',
        read: true
      },
      {
        id: '2',
        content: 'I saw your AI project on the platform and I\'m really impressed with the approach you\'ve taken.',
        senderId: '2',
        timestamp: '2024-01-20T14:05:00Z',
        type: 'text',
        read: true
      },
      {
        id: '3',
        content: 'Thanks! I\'ve been working on it for a few months now. What aspects interested you the most?',
        senderId: '1',
        timestamp: '2024-01-20T14:10:00Z',
        type: 'text',
        read: true
      },
      {
        id: '4',
        content: 'The machine learning model for task prioritization is fascinating. I have experience with similar algorithms and would love to contribute.',
        senderId: '2',
        timestamp: '2024-01-20T14:15:00Z',
        type: 'text',
        read: true
      },
      {
        id: '5',
        content: 'That sounds great! I could definitely use help with optimizing the ML pipeline. Are you familiar with TensorFlow?',
        senderId: '1',
        timestamp: '2024-01-20T14:20:00Z',
        type: 'text',
        read: true
      },
      {
        id: '6',
        content: 'Absolutely! I\'ve been working with TensorFlow for about 3 years now. I also have experience with PyTorch if needed.',
        senderId: '2',
        timestamp: '2024-01-20T14:25:00Z',
        type: 'text',
        read: true
      },
      {
        id: '7',
        content: 'Perfect! Would you like to schedule a call to discuss the technical details? I can show you the current architecture.',
        senderId: '1',
        timestamp: '2024-01-20T14:28:00Z',
        type: 'text',
        read: true
      },
      {
        id: '8',
        content: 'Hey! I saw your AI project, would love to collaborate on it. Do you have some time to discuss?',
        senderId: '2',
        timestamp: '2024-01-20T14:30:00Z',
        type: 'text',
        read: false
      }
    ];

    setTimeout(() => {
      setConversations(mockConversations);
      setActiveConversation('1');
      setMessages(mockMessages);
      setLoading(false);
    }, 1000);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    const messageId = Date.now().toString();
    const newMsg: Message = {
      id: messageId,
      content: newMessage.trim(),
      senderId: currentUser?.id || '1',
      timestamp: new Date().toISOString(),
      type: 'text',
      read: false
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');

    // Update conversation's last message
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation 
        ? { ...conv, lastMessage: newMsg }
        : conv
    ));

    // Simulate typing indicator and response
    setTimeout(() => {
      const responseMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Thanks for your message! I\'ll get back to you soon.',
        senderId: '2',
        timestamp: new Date().toISOString(),
        type: 'text',
        read: false
      };
      setMessages(prev => [...prev, responseMsg]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const markAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, unreadCount: 0 }
        : conv
    ));
  };

  const togglePin = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, isPinned: !conv.isPinned }
        : conv
    ));
    toast.success('Conversation updated');
  };

  const archiveConversation = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, isArchived: true }
        : conv
    ));
    toast.success('Conversation archived');
  };

  const getOtherParticipant = (conversation: Conversation): User | null => {
    if (conversation.type === 'group') return null;
    return conversation.participants[0];
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (conv.isArchived) return false;
    
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    if (conv.type === 'group') {
      return conv.name?.toLowerCase().includes(query) ||
             conv.participants.some(p => p.name.toLowerCase().includes(query));
    } else {
      const participant = getOtherParticipant(conv);
      return participant?.name.toLowerCase().includes(query) ||
             participant?.username.toLowerCase().includes(query);
    }
  });

  // Sort conversations: pinned first, then by last message time
  const sortedConversations = filteredConversations.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
    const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
    return bTime - aTime;
  });

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Messages
            </h1>
            <button
              onClick={() => setShowNewConversation(true)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {sortedConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <UserCircleIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No conversations found</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {sortedConversations.map((conversation) => {
                const participant = getOtherParticipant(conversation);
                const isActive = activeConversation === conversation.id;
                
                return (
                  <motion.div
                    key={conversation.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => {
                      setActiveConversation(conversation.id);
                      if (conversation.unreadCount > 0) {
                        markAsRead(conversation.id);
                      }
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {conversation.type === 'group' ? (
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {conversation.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        ) : participant?.avatar ? (
                          <img
                            src={participant.avatar}
                            alt={participant.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <UserCircleIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                        
                        {/* Online indicator */}
                        {conversation.type === 'direct' && participant?.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <h3 className={`font-medium truncate ${
                              isActive 
                                ? 'text-blue-900 dark:text-blue-100' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {conversation.type === 'group' 
                                ? conversation.name 
                                : participant?.name}
                            </h3>
                            {conversation.isPinned && (
                              <StarIconSolid className="w-3 h-3 text-yellow-500" />
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            {conversation.lastMessage && (
                              <span className={`text-xs ${
                                isActive 
                                  ? 'text-blue-600 dark:text-blue-400' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {formatTime(conversation.lastMessage.timestamp)}
                              </span>
                            )}
                            {conversation.unreadCount > 0 && (
                              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] text-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {conversation.lastMessage && (
                          <p className={`text-sm truncate ${
                            isActive 
                              ? 'text-blue-700 dark:text-blue-300' 
                              : conversation.unreadCount > 0
                              ? 'text-gray-900 dark:text-white font-medium'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {conversation.lastMessage.senderId === currentUser?.id && 'You: '}
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const conversation = conversations.find(c => c.id === activeConversation);
                    const participant = conversation ? getOtherParticipant(conversation) : null;
                    
                    return (
                      <>
                        <div className="relative">
                          {conversation?.type === 'group' ? (
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {conversation.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          ) : participant?.avatar ? (
                            <img
                              src={participant.avatar}
                              alt={participant.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <UserCircleIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                          
                          {conversation?.type === 'direct' && participant?.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                          )}
                        </div>

                        <div>
                          <h2 className="font-semibold text-gray-900 dark:text-white">
                            {conversation?.type === 'group' ? conversation.name : participant?.name}
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {conversation?.type === 'group' 
                              ? `${conversation.participants.length} members`
                              : participant?.isOnline 
                              ? 'Online' 
                              : participant?.lastSeen 
                              ? `Last seen ${formatTime(participant.lastSeen)}`
                              : 'Offline'
                            }
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <PhoneIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <VideoCameraIcon className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.senderId === currentUser?.id;
                const sender = conversations
                  .find(c => c.id === activeConversation)
                  ?.participants.find(p => p.id === message.senderId);

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-2 max-w-xs md:max-w-md ${
                      isOwnMessage ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                    }`}>
                      {!isOwnMessage && (
                        <div className="flex-shrink-0">
                          {sender?.avatar ? (
                            <img
                              src={sender.avatar}
                              alt={sender.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <UserCircleIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                        </div>
                      )}

                      <div className={`rounded-2xl px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwnMessage 
                            ? 'text-blue-100' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatTime(message.timestamp)}
                          {isOwnMessage && message.read && (
                            <CheckCircleIconSolid className="inline w-3 h-3 ml-1" />
                          )}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-end space-x-3">
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <PaperClipIcon className="w-5 h-5" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-12"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <FaceSmileIcon className="w-5 h-5" />
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          // No conversation selected
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <UserCircleIcon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to Messages
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Select a conversation to start messaging or create a new one.
              </p>
              <button
                onClick={() => setShowNewConversation(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Start New Conversation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <AnimatePresence>
        {showNewConversation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowNewConversation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                New Conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This feature is coming soon! You'll be able to start new conversations with other users.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewConversation(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessagesPage;