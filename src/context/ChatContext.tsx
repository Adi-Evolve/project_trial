import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  timestamp: Date;
  chatId: string;
  type: 'text' | 'image' | 'file' | 'emoji';
  edited?: boolean;
  editedAt?: Date;
  reactions?: { [emoji: string]: string[] }; // emoji -> user IDs
  replyTo?: string; // message ID
}

interface Chat {
  id: string;
  type: 'direct' | 'group' | 'project';
  name: string;
  description?: string;
  participants: string[];
  lastMessage?: Message;
  lastActivity: Date;
  unreadCount: number;
  avatar?: string;
  projectId?: string;
  isActive: boolean;
}

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  messages: { [chatId: string]: Message[] };
  onlineUsers: string[];
  isConnected: boolean;
  
  // Actions
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (content: string, type?: 'text' | 'image' | 'file') => void;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
  markAsRead: (chatId: string) => void;
  createChat: (type: 'direct' | 'group' | 'project', participants: string[], name?: string, projectId?: string) => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  
  // Real-time features
  startTyping: (chatId: string) => void;
  stopTyping: (chatId: string) => void;
  typingUsers: { [chatId: string]: string[] };
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ [chatId: string]: string[] }>({});

  // Mock current user - in real app, this would come from auth context
  const currentUserId = 'user-1';
  const currentUser = {
    id: 'user-1',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
  };

  useEffect(() => {
    // Initialize mock data
    initializeMockData();

    // In a real app, initialize socket connection here
    // const newSocket = io('ws://localhost:3001');
    // setSocket(newSocket);
    
    // Mock connection status
    setIsConnected(true);
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const initializeMockData = () => {
    const mockChats: Chat[] = [
      {
        id: 'chat-1',
        type: 'project',
        name: 'AI Code Assistant Team',
        description: 'Development discussions for the AI Code Assistant project',
        participants: ['user-1', 'user-2', 'user-3'],
        lastActivity: new Date(),
        unreadCount: 3,
        projectId: 'project-1',
        isActive: true,
        avatar: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=40&h=40&fit=crop'
      },
      {
        id: 'chat-2',
        type: 'direct',
        name: 'Sarah Chen',
        participants: ['user-1', 'user-2'],
        lastActivity: new Date(Date.now() - 1000 * 60 * 30),
        unreadCount: 0,
        isActive: true,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
      },
      {
        id: 'chat-3',
        type: 'group',
        name: 'Frontend Developers',
        description: 'React, Vue, and Angular discussions',
        participants: ['user-1', 'user-2', 'user-3', 'user-4'],
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
        unreadCount: 12,
        isActive: true,
        avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=40&h=40&fit=crop'
      }
    ];

    const mockMessages: { [chatId: string]: Message[] } = {
      'chat-1': [
        {
          id: 'msg-1',
          content: 'Hey team! I\'ve finished the API integration for the code completion feature. Ready for testing!',
          senderId: 'user-2',
          senderName: 'Sarah Chen',
          senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
          chatId: 'chat-1',
          type: 'text',
          reactions: { '🎉': ['user-1', 'user-3'], '👏': ['user-1'] }
        },
        {
          id: 'msg-2',
          content: 'Awesome work Sarah! I\'ll test it this afternoon. Should we schedule a demo for tomorrow?',
          senderId: 'user-3',
          senderName: 'Alex Rodriguez',
          senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
          timestamp: new Date(Date.now() - 1000 * 60 * 8),
          chatId: 'chat-1',
          type: 'text'
        },
        {
          id: 'msg-3',
          content: 'Perfect! Let\'s do it at 2 PM. I\'ll send calendar invites.',
          senderId: 'user-1',
          senderName: 'John Doe',
          senderAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          chatId: 'chat-1',
          type: 'text'
        }
      ],
      'chat-2': [
        {
          id: 'msg-4',
          content: 'Hi John! Are you available for a quick call about the project timeline?',
          senderId: 'user-2',
          senderName: 'Sarah Chen',
          senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          chatId: 'chat-2',
          type: 'text'
        }
      ]
    };

    setChats(mockChats);
    setMessages(mockMessages);
    setOnlineUsers(['user-1', 'user-2', 'user-3']);
  };

  const sendMessage = (content: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!activeChat || !content.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: content.trim(),
      senderId: currentUserId,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      timestamp: new Date(),
      chatId: activeChat.id,
      type
    };

    setMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage]
    }));

    // Update last activity
    setChats(prev => prev.map(chat => 
      chat.id === activeChat.id 
        ? { ...chat, lastMessage: newMessage, lastActivity: new Date() }
        : chat
    ));

    // In real app, emit to socket
    // socket?.emit('send_message', newMessage);
  };

  const editMessage = (messageId: string, newContent: string) => {
    if (!activeChat) return;

    setMessages(prev => ({
      ...prev,
      [activeChat.id]: prev[activeChat.id]?.map(msg => 
        msg.id === messageId && msg.senderId === currentUserId
          ? { ...msg, content: newContent, edited: true, editedAt: new Date() }
          : msg
      ) || []
    }));
  };

  const deleteMessage = (messageId: string) => {
    if (!activeChat) return;

    setMessages(prev => ({
      ...prev,
      [activeChat.id]: prev[activeChat.id]?.filter(msg => 
        !(msg.id === messageId && msg.senderId === currentUserId)
      ) || []
    }));
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!activeChat) return;

    setMessages(prev => ({
      ...prev,
      [activeChat.id]: prev[activeChat.id]?.map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...msg.reactions };
          if (reactions[emoji]) {
            if (!reactions[emoji].includes(currentUserId)) {
              reactions[emoji].push(currentUserId);
            }
          } else {
            reactions[emoji] = [currentUserId];
          }
          return { ...msg, reactions };
        }
        return msg;
      }) || []
    }));
  };

  const removeReaction = (messageId: string, emoji: string) => {
    if (!activeChat) return;

    setMessages(prev => ({
      ...prev,
      [activeChat.id]: prev[activeChat.id]?.map(msg => {
        if (msg.id === messageId && msg.reactions?.[emoji]) {
          const reactions = { ...msg.reactions };
          reactions[emoji] = reactions[emoji].filter(id => id !== currentUserId);
          if (reactions[emoji].length === 0) {
            delete reactions[emoji];
          }
          return { ...msg, reactions };
        }
        return msg;
      }) || []
    }));
  };

  const markAsRead = (chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
    ));
  };

  const createChat = (type: 'direct' | 'group' | 'project', participants: string[], name?: string, projectId?: string) => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      type,
      name: name || 'New Chat',
      participants: [...participants, currentUserId],
      lastActivity: new Date(),
      unreadCount: 0,
      projectId,
      isActive: true
    };

    setChats(prev => [newChat, ...prev]);
    setMessages(prev => ({ ...prev, [newChat.id]: [] }));
  };

  const joinChat = (chatId: string) => {
    // In real app, emit to socket
    console.log('Joining chat:', chatId);
  };

  const leaveChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    setMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[chatId];
      return newMessages;
    });
  };

  const startTyping = (chatId: string) => {
    // In real app, emit to socket
    console.log('Started typing in:', chatId);
  };

  const stopTyping = (chatId: string) => {
    // In real app, emit to socket
    console.log('Stopped typing in:', chatId);
  };

  const value: ChatContextType = {
    chats,
    activeChat,
    messages,
    onlineUsers,
    isConnected,
    typingUsers,
    
    setActiveChat,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    markAsRead,
    createChat,
    joinChat,
    leaveChat,
    startTyping,
    stopTyping
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};