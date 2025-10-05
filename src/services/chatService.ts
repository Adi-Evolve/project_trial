import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name?: string;
  sender_avatar?: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  metadata?: any;
  reply_to_id?: string;
  reactions?: { [emoji: string]: string[] }; // emoji -> user_ids[]
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  name: string;
  description?: string;
  chat_type: 'direct' | 'group' | 'project';
  project_id?: string;
  avatar_url?: string;
  participants: ChatParticipant[];
  last_message?: ChatMessage;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatParticipant {
  user_id: string;
  chat_id: string;
  name: string;
  avatar_url?: string;
  role: 'member' | 'admin' | 'owner';
  last_read_at?: string;
  joined_at: string;
}

export interface TypingIndicator {
  user_id: string;
  chat_id: string;
  user_name: string;
  started_at: string;
}

class ChatService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private typingTimeout: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Get all chats for current user
   */
  async getUserChats(userId: string): Promise<Chat[]> {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          chat_participants!inner(
            user_id,
            role,
            last_read_at,
            joined_at,
            users(name, avatar_url)
          )
        `)
        .eq('chat_participants.user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data?.map(chat => ({
        ...chat,
        participants: chat.chat_participants.map((p: any) => ({
          user_id: p.user_id,
          chat_id: chat.id,
          name: p.users.name,
          avatar_url: p.users.avatar_url,
          role: p.role,
          last_read_at: p.last_read_at,
          joined_at: p.joined_at
        })),
        unread_count: 0 // Will be calculated separately
      })) || [];
    } catch (error) {
      console.error('Error fetching user chats:', error);
      return [];
    }
  }

  /**
   * Get messages for a chat
   */
  async getChatMessages(chatId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          users(name, avatar_url)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data?.map(message => ({
        ...message,
        sender_name: message.users?.name,
        sender_avatar: message.users?.avatar_url
      })).reverse() || [];
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
  }

  /**
   * Send a message
   */
  async sendMessage(chatId: string, senderId: string, content: string, messageType: string = 'text', metadata?: any): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: senderId,
          content,
          message_type: messageType,
          metadata: metadata || {},
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          users(name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Update chat's last message timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

      return {
        ...data,
        sender_name: data.users?.name,
        sender_avatar: data.users?.avatar_url
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  /**
   * Create a new chat
   */
  async createChat(name: string, chatType: string, creatorId: string, participantIds: string[], projectId?: string): Promise<Chat | null> {
    try {
      // Create chat
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          name,
          chat_type: chatType,
          project_id: projectId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Add participants
      const participants = [creatorId, ...participantIds].map(userId => ({
        chat_id: chat.id,
        user_id: userId,
        role: userId === creatorId ? 'owner' : 'member',
        joined_at: new Date().toISOString()
      }));

      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      return chat;
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  }

  /**
   * Join a chat
   */
  async joinChat(chatId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_participants')
        .insert({
          chat_id: chatId,
          user_id: userId,
          role: 'member',
          joined_at: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      console.error('Error joining chat:', error);
      return false;
    }
  }

  /**
   * Leave a chat
   */
  async leaveChat(chatId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_participants')
        .delete()
        .eq('chat_id', chatId)
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Error leaving chat:', error);
      return false;
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(chatId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('chat_id', chatId)
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  /**
   * Add reaction to message
   */
  async addReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
    try {
      // Get current message
      const { data: message, error: fetchError } = await supabase
        .from('chat_messages')
        .select('reactions')
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;

      const reactions = message.reactions || {};
      
      if (!reactions[emoji]) {
        reactions[emoji] = [];
      }

      // Toggle reaction
      const userIndex = reactions[emoji].indexOf(userId);
      if (userIndex > -1) {
        reactions[emoji].splice(userIndex, 1);
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      } else {
        reactions[emoji].push(userId);
      }

      const { error } = await supabase
        .from('chat_messages')
        .update({ reactions })
        .eq('id', messageId);

      return !error;
    } catch (error) {
      console.error('Error adding reaction:', error);
      return false;
    }
  }

  /**
   * Subscribe to chat updates
   */
  subscribeToChat(chatId: string, callbacks: {
    onMessage?: (message: ChatMessage) => void;
    onTyping?: (typing: TypingIndicator) => void;
    onTypingStopped?: (userId: string) => void;
  }): RealtimeChannel {
    const channel = supabase
      .channel(`chat_${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        if (callbacks.onMessage) {
          callbacks.onMessage(payload.new as ChatMessage);
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_typing',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        if (callbacks.onTyping) {
          callbacks.onTyping(payload.new as TypingIndicator);
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'chat_typing',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        if (callbacks.onTypingStopped) {
          callbacks.onTypingStopped(payload.old.user_id);
        }
      })
      .subscribe();

    this.channels.set(chatId, channel);
    return channel;
  }

  /**
   * Unsubscribe from chat updates
   */
  unsubscribeFromChat(chatId: string): void {
    const channel = this.channels.get(chatId);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(chatId);
    }
  }

  /**
   * Start typing indicator
   */
  async startTyping(chatId: string, userId: string, userName: string): Promise<void> {
    try {
      // Clear existing timeout
      const timeoutKey = `${chatId}_${userId}`;
      const existingTimeout = this.typingTimeout.get(timeoutKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Insert/update typing indicator
      await supabase
        .from('chat_typing')
        .upsert({
          chat_id: chatId,
          user_id: userId,
          user_name: userName,
          started_at: new Date().toISOString()
        });

      // Set timeout to remove typing indicator
      const timeout = setTimeout(() => {
        this.stopTyping(chatId, userId);
      }, 3000); // 3 seconds

      this.typingTimeout.set(timeoutKey, timeout);
    } catch (error) {
      console.error('Error starting typing indicator:', error);
    }
  }

  /**
   * Stop typing indicator
   */
  async stopTyping(chatId: string, userId: string): Promise<void> {
    try {
      await supabase
        .from('chat_typing')
        .delete()
        .eq('chat_id', chatId)
        .eq('user_id', userId);

      // Clear timeout
      const timeoutKey = `${chatId}_${userId}`;
      const existingTimeout = this.typingTimeout.get(timeoutKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        this.typingTimeout.delete(timeoutKey);
      }
    } catch (error) {
      console.error('Error stopping typing indicator:', error);
    }
  }

  /**
   * Get unread message count for a chat
   */
  async getUnreadCount(chatId: string, userId: string): Promise<number> {
    try {
      // Get user's last read timestamp
      const { data: participant, error: participantError } = await supabase
        .from('chat_participants')
        .select('last_read_at')
        .eq('chat_id', chatId)
        .eq('user_id', userId)
        .single();

      if (participantError) throw participantError;

      if (!participant.last_read_at) {
        // Count all messages
        const { count, error } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chatId);

        return count || 0;
      }

      // Count messages after last read
      const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('chat_id', chatId)
        .gt('created_at', participant.last_read_at);

      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Search messages in a chat
   */
  async searchMessages(chatId: string, query: string, limit: number = 20): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          users(name, avatar_url)
        `)
        .eq('chat_id', chatId)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(message => ({
        ...message,
        sender_name: message.users?.name,
        sender_avatar: message.users?.avatar_url
      })) || [];
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    // Clear all typing timeouts
    this.typingTimeout.forEach(timeout => clearTimeout(timeout));
    this.typingTimeout.clear();

    // Unsubscribe from all channels
    this.channels.forEach(channel => supabase.removeChannel(channel));
    this.channels.clear();
  }
}

export const chatService = new ChatService();
export default ChatService;