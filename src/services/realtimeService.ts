// ==========================================
// SUPABASE REAL-TIME CONFIGURATION
// ==========================================
// Setup for real-time chat functionality with typing indicators

import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10, // Limit events per second to avoid rate limiting
    },
  },
});

// Real-time subscription manager
export class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private subscriptions: Map<string, Function[]> = new Map();

  // Subscribe to chat messages
  subscribeToChatMessages(
    chatId: string,
    onMessage: (message: any) => void,
    onTyping?: (typing: any) => void
  ): () => void {
    const channelName = `chat:${chatId}`;
    
    // Remove existing channel if it exists
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          console.log('New message:', payload);
          onMessage(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          console.log('Message updated:', payload);
          onMessage(payload.new);
        }
      );

    // Add typing indicator subscription if provided
    if (onTyping) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_typing',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          console.log('Typing update:', payload);
          onTyping(payload);
        }
      );
    }

    channel.subscribe((status) => {
      console.log(`Chat ${chatId} subscription status:`, status);
    });

    this.channels.set(channelName, channel);

    // Return unsubscribe function
    return () => this.unsubscribe(channelName);
  }

  // Subscribe to user notifications
  subscribeToNotifications(
    userId: string,
    onNotification: (notification: any) => void
  ): () => void {
    const channelName = `notifications:${userId}`;
    
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('New notification:', payload);
          onNotification(payload.new);
        }
      )
      .subscribe((status) => {
        console.log(`Notifications ${userId} subscription status:`, status);
      });

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  // Subscribe to project updates
  subscribeToProjectUpdates(
    projectId: string,
    onUpdate: (update: any) => void
  ): () => void {
    const channelName = `project:${projectId}`;
    
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          console.log('Project update:', payload);
          onUpdate(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_updates',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('New project update:', payload);
          onUpdate(payload.new);
        }
      )
      .subscribe((status) => {
        console.log(`Project ${projectId} subscription status:`, status);
      });

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  // Subscribe to user presence
  subscribeToPresence(
    channelName: string,
    userId: string,
    userData: any,
    onPresenceChange: (presence: any) => void
  ): () => void {
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        console.log('Presence sync:', newState);
        onPresenceChange(newState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        onPresenceChange(channel.presenceState());
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        onPresenceChange(channel.presenceState());
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
            ...userData,
          });
        }
      });

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  // Unsubscribe from a channel
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      console.log(`Unsubscribed from ${channelName}`);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.channels.forEach((channel, name) => {
      supabase.removeChannel(channel);
      console.log(`Unsubscribed from ${name}`);
    });
    this.channels.clear();
  }

  // Get active subscriptions
  getActiveSubscriptions(): string[] {
    return Array.from(this.channels.keys());
  }

  // Send typing indicator
  async sendTypingIndicator(chatId: string, userId: string): Promise<void> {
    try {
      // Insert or update typing indicator
      await supabase
        .from('chat_typing')
        .upsert(
          {
            chat_id: chatId,
            user_id: userId,
            started_at: new Date().toISOString(),
          },
          {
            onConflict: 'chat_id,user_id',
          }
        );
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }

  // Remove typing indicator
  async removeTypingIndicator(chatId: string, userId: string): Promise<void> {
    try {
      await supabase
        .from('chat_typing')
        .delete()
        .eq('chat_id', chatId)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error removing typing indicator:', error);
    }
  }

  // Send real-time broadcast message
  async broadcastMessage(channelName: string, event: string, payload: any): Promise<void> {
    const channel = this.channels.get(channelName);
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event,
        payload,
      });
    }
  }
}

// Create singleton instance
export const realtimeManager = new RealtimeManager();

// Typing indicator utilities
export class TypingManager {
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly TYPING_TIMEOUT = 3000; // 3 seconds

  startTyping(chatId: string, userId: string): void {
    const key = `${chatId}:${userId}`;
    
    // Clear existing timeout
    const existingTimeout = this.typingTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Send typing indicator
    realtimeManager.sendTypingIndicator(chatId, userId);

    // Set timeout to remove typing indicator
    const timeout = setTimeout(() => {
      this.stopTyping(chatId, userId);
    }, this.TYPING_TIMEOUT);

    this.typingTimeouts.set(key, timeout);
  }

  stopTyping(chatId: string, userId: string): void {
    const key = `${chatId}:${userId}`;
    
    // Clear timeout
    const timeout = this.typingTimeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.typingTimeouts.delete(key);
    }

    // Remove typing indicator
    realtimeManager.removeTypingIndicator(chatId, userId);
  }

  cleanup(): void {
    this.typingTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.typingTimeouts.clear();
  }
}

export const typingManager = new TypingManager();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  realtimeManager.unsubscribeAll();
  typingManager.cleanup();
});

export default realtimeManager;