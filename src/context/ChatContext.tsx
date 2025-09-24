import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { ensureValidUserUUID } from '../utils/userUtils';

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
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ [chatId: string]: string[] }>({});
  const [loading, setLoading] = useState(true);
  
  // Helper function to get valid user UUID
  const getValidUserUUID = async (): Promise<string | null> => {
    if (!user || !user.id) return null;
    return await ensureValidUserUUID(user.id);
  };

  useEffect(() => {
    if (user) {
      initializeRealData();
      setupRealtimeSubscriptions();
    }
    
    return () => {
      // Cleanup subscriptions
    };
  }, [user?.id]); // Only depend on user ID to prevent infinite re-renders

  const initializeRealData = async () => {
    try {
      setLoading(true);
      await loadUserChats();
      setIsConnected(true);
    } catch (error) {
      console.error('Error initializing chat data:', error);
      toast.error('Failed to load chat data');
    } finally {
      setLoading(false);
    }
  };

  const loadUserChats = async () => {
    if (!user) return;

    try {
      // Ensure we have a valid UUID for the user
      const validUserUUID = await ensureValidUserUUID(user.id);
      
      if (!validUserUUID) {
        console.warn('Could not get valid UUID for user, skipping chat loading');
        setChats([]);
        setLoading(false);
        return;
      }
      
      // Load user's chats from Supabase - simplified query
      // For now, just get basic chat data without complex joins
      const { data: chatData, error } = await supabase
        .from('chats')
        .select('*')
        .eq('created_by', validUserUUID)
        .order('created_at', { ascending: false }); // Use created_at instead of last_activity

      if (error) {
        console.error('Error loading chats:', error);
        // Don't return - continue with empty chats for development
        setChats([]);
        setLoading(false);
        return;
      }

      // Transform the data to match our Chat interface
      const transformedChats: Chat[] = chatData?.map(chat => ({
        id: chat.id,
        type: chat.type,
        name: chat.name,
        description: chat.description,
        participants: chat.chat_participants?.map((p: any) => p.user_id) || [],
        lastActivity: new Date(chat.created_at || new Date()),
        unreadCount: chat.unread_count || 0,
        avatar: chat.avatar,
        projectId: chat.project_id,
        isActive: chat.is_active
      })) || [];

      setChats(transformedChats);

      // Load messages for each chat
      const allMessages: { [chatId: string]: Message[] } = {};
      for (const chat of transformedChats) {
        const messages = await loadChatMessages(chat.id);
        allMessages[chat.id] = messages;
      }
      setMessages(allMessages);

    } catch (error) {
      console.error('Error in loadUserChats:', error);
    }
  };

  const loadChatMessages = async (chatId: string): Promise<Message[]> => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          users(username, full_name, avatar_url)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        .limit(100); // Load last 100 messages

      if (error) {
        console.error('Error loading messages:', error);
        return [];
      }

      return data?.map(msg => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.sender_id,
        senderName: msg.users?.full_name || msg.users?.username || 'Unknown',
        senderAvatar: msg.users?.avatar_url || '',
        timestamp: new Date(msg.created_at),
        chatId: msg.chat_id,
        type: msg.message_type || 'text',
        edited: msg.edited,
        editedAt: msg.edited_at ? new Date(msg.edited_at) : undefined,
        reactions: msg.reactions || {},
        replyTo: msg.reply_to
      })) || [];

    } catch (error) {
      console.error('Error loading chat messages:', error);
      return [];
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!user) return;

    // Subscribe to new messages
    const messageSubscription = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          handleNewMessage(payload.new as any);
        }
      )
      .subscribe();

    // Subscribe to chat updates
    const chatSubscription = supabase
      .channel('chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats'
        },
        (payload) => {
          handleChatUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
      chatSubscription.unsubscribe();
    };
  };

  const handleNewMessage = async (newMessage: any) => {
    // Load sender info
    const { data: senderData } = await supabase
      .from('users')
      .select('username, full_name, avatar_url')
      .eq('id', newMessage.sender_id)
      .single();

    const message: Message = {
      id: newMessage.id,
      content: newMessage.content,
      senderId: newMessage.sender_id,
      senderName: senderData?.full_name || senderData?.username || 'Unknown',
      senderAvatar: senderData?.avatar_url || '',
      timestamp: new Date(newMessage.created_at),
      chatId: newMessage.chat_id,
      type: newMessage.message_type || 'text',
      edited: newMessage.edited,
      editedAt: newMessage.edited_at ? new Date(newMessage.edited_at) : undefined,
      reactions: newMessage.reactions || {},
      replyTo: newMessage.reply_to
    };

    setMessages(prev => ({
      ...prev,
      [message.chatId]: [...(prev[message.chatId] || []), message]
    }));

    // Update chat last activity and unread count if not current user's message
    if (newMessage.sender_id !== user?.id) {
      setChats(prev => prev.map(chat => 
        chat.id === message.chatId 
          ? { 
              ...chat, 
              lastActivity: new Date(),
              unreadCount: activeChat?.id === chat.id ? 0 : chat.unreadCount + 1
            }
          : chat
      ));
    }
  };

  const handleChatUpdate = (payload: any) => {
    // Handle chat updates (new chats, chat info changes, etc.)
    if (payload.eventType === 'INSERT') {
      // New chat created
      loadUserChats(); // Reload to get the new chat
    } else if (payload.eventType === 'UPDATE') {
      // Chat updated
      setChats(prev => prev.map(chat => 
        chat.id === payload.new.id 
          ? { ...chat, ...payload.new }
          : chat
      ));
    }
  };

  const sendMessage = async (content: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!activeChat || !content.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: activeChat.id,
          sender_id: user.id,
          content: content.trim(),
          message_type: type
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
        return;
      }

      // The message will be added via realtime subscription
      
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast.error('Failed to send message');
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!activeChat || !user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({
          content: newContent,
          edited: true,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id); // Ensure user can only edit their own messages

      if (error) {
        console.error('Error editing message:', error);
        toast.error('Failed to edit message');
        return;
      }

      // Update local state
      setMessages(prev => ({
        ...prev,
        [activeChat.id]: prev[activeChat.id]?.map(msg => 
          msg.id === messageId
            ? { ...msg, content: newContent, edited: true, editedAt: new Date() }
            : msg
        ) || []
      }));

    } catch (error) {
      console.error('Error in editMessage:', error);
      toast.error('Failed to edit message');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!activeChat || !user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id); // Ensure user can only delete their own messages

      if (error) {
        console.error('Error deleting message:', error);
        toast.error('Failed to delete message');
        return;
      }

      // Update local state
      setMessages(prev => ({
        ...prev,
        [activeChat.id]: prev[activeChat.id]?.filter(msg => msg.id !== messageId) || []
      }));

    } catch (error) {
      console.error('Error in deleteMessage:', error);
      toast.error('Failed to delete message');
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!activeChat || !user || !user.id) return;

    try {
      // Get current message to update reactions
      const currentMessage = messages[activeChat.id]?.find(msg => msg.id === messageId);
      if (!currentMessage) return;

      const updatedReactions = { ...currentMessage.reactions };
      if (updatedReactions[emoji]) {
        if (!updatedReactions[emoji].includes(user.id)) {
          updatedReactions[emoji].push(user.id);
        }
      } else {
        updatedReactions[emoji] = [user.id];
      }

      const { error } = await supabase
        .from('chat_messages')
        .update({ reactions: updatedReactions })
        .eq('id', messageId);

      if (error) {
        console.error('Error adding reaction:', error);
        return;
      }

      // Update local state
      setMessages(prev => ({
        ...prev,
        [activeChat.id]: prev[activeChat.id]?.map(msg => 
          msg.id === messageId ? { ...msg, reactions: updatedReactions } : msg
        ) || []
      }));

    } catch (error) {
      console.error('Error in addReaction:', error);
    }
  };

  const removeReaction = async (messageId: string, emoji: string) => {
    if (!activeChat || !user || !user.id) return;

    try {
      // Get current message to update reactions
      const currentMessage = messages[activeChat.id]?.find(msg => msg.id === messageId);
      if (!currentMessage) return;

      const updatedReactions = { ...currentMessage.reactions };
      if (updatedReactions[emoji]) {
        updatedReactions[emoji] = updatedReactions[emoji].filter(id => id !== user.id);
        if (updatedReactions[emoji].length === 0) {
          delete updatedReactions[emoji];
        }
      }

      const { error } = await supabase
        .from('chat_messages')
        .update({ reactions: updatedReactions })
        .eq('id', messageId);

      if (error) {
        console.error('Error removing reaction:', error);
        return;
      }

      // Update local state
      setMessages(prev => ({
        ...prev,
        [activeChat.id]: prev[activeChat.id]?.map(msg => 
          msg.id === messageId ? { ...msg, reactions: updatedReactions } : msg
        ) || []
      }));

    } catch (error) {
      console.error('Error in removeReaction:', error);
    }
  };

  const markAsRead = async (chatId: string) => {
    if (!user) return;

    try {
      // Update unread count in database
      const { error } = await supabase
        .from('chat_participants')
        .update({ unread_count: 0 })
        .eq('chat_id', chatId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking chat as read:', error);
        return;
      }

      // Update local state
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      ));

    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  const createChat = async (type: 'direct' | 'group' | 'project', participants: string[], name?: string, projectId?: string) => {
    if (!user) return;

    try {
      // Create chat
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert({
          type,
          name: name || 'New Chat',
          project_id: projectId,
          created_by: user.id,
          is_active: true
        })
        .select()
        .single();

      if (chatError) {
        console.error('Error creating chat:', chatError);
        toast.error('Failed to create chat');
        return;
      }

      // Add participants
      const participantInserts = [...participants, user.id].map(userId => ({
        chat_id: chatData.id,
        user_id: userId,
        joined_at: new Date().toISOString()
      }));

      const { error: participantError } = await supabase
        .from('chat_participants')
        .insert(participantInserts);

      if (participantError) {
        console.error('Error adding participants:', participantError);
        toast.error('Failed to add participants to chat');
        return;
      }

      // Reload chats to include the new one
      await loadUserChats();
      
      toast.success('Chat created successfully');

    } catch (error) {
      console.error('Error in createChat:', error);
      toast.error('Failed to create chat');
    }
  };

  const joinChat = async (chatId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_participants')
        .insert({
          chat_id: chatId,
          user_id: user.id,
          joined_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error joining chat:', error);
        toast.error('Failed to join chat');
        return;
      }

      await loadUserChats();
      toast.success('Joined chat successfully');

    } catch (error) {
      console.error('Error in joinChat:', error);
      toast.error('Failed to join chat');
    }
  };

  const leaveChat = async (chatId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_participants')
        .delete()
        .eq('chat_id', chatId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error leaving chat:', error);
        toast.error('Failed to leave chat');
        return;
      }

      // Remove from local state
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[chatId];
        return newMessages;
      });

      if (activeChat?.id === chatId) {
        setActiveChat(null);
      }

      toast.success('Left chat successfully');

    } catch (error) {
      console.error('Error in leaveChat:', error);
      toast.error('Failed to leave chat');
    }
  };

  const startTyping = (chatId: string) => {
    // For real-time typing indicators, you would implement this with websockets or Supabase realtime
    console.log('Started typing in:', chatId);
  };

  const stopTyping = (chatId: string) => {
    // For real-time typing indicators, you would implement this with websockets or Supabase realtime
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

  // Show loading state while initializing
  if (loading && user) {
    return (
      <ChatContext.Provider value={value}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading chat...</p>
          </div>
        </div>
      </ChatContext.Provider>
    );
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};