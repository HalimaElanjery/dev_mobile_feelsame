/**
 * Service Socket.IO pour les fonctionnalités temps réel
 * Version compatible React Native
 */

import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../config/apiConfig';
import { getAuthToken } from './api';

// Types pour les messages
export interface Message {
  id: string;
  discussionId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface PrivateMessage {
  id: string;
  discussionId: string;
  userId: string;
  content: string;
  createdAt: string;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  // Callbacks pour les événements
  private messageCallbacks: ((message: Message) => void)[] = [];
  private privateMessageCallbacks: ((message: PrivateMessage) => void)[] = [];
  private typingCallbacks: ((data: { userId: string; isTyping: boolean }) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];

  /**
   * Initialise la connexion Socket.IO
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    try {
      const token = await getAuthToken();
      if (!token) {
        console.warn('No auth token available for socket connection');
        return;
      }

      // Utiliser l'URL de base sans /api pour Socket.IO
      const socketUrl = API_CONFIG.BASE_URL.replace('/api', '');

      console.log('Connecting to Socket.IO:', socketUrl);

      this.socket = io(socketUrl, {
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        forceNew: true
      });

      this.setupEventListeners();

    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  /**
   * Configure les écouteurs d'événements
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.isConnected = true;
      this.notifyConnectionCallbacks(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
      this.notifyConnectionCallbacks(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    // Événements de messages
    this.socket.on('message-received', (message: any) => {
      console.log('📨 Message received (raw):', message);
      const formattedMessage: Message = {
        id: message.id,
        discussionId: message.discussionId || message.discussion_id,
        userId: message.userId || message.user_id,
        content: message.content,
        createdAt: message.createdAt || message.created_at
      };
      this.notifyMessageCallbacks(formattedMessage);
    });

    this.socket.on('private-message-received', (message: any) => {
      console.log('🔒 Private message received (raw):', message);
      const formattedMessage: PrivateMessage = {
        id: message.id,
        discussionId: message.discussionId || message.discussion_id,
        userId: message.userId || message.user_id,
        content: message.content,
        createdAt: message.createdAt || message.created_at
      };
      this.notifyPrivateMessageCallbacks(formattedMessage);
    });

    // Événements de frappe
    this.socket.on('user-typing', (data: { userId: string; isTyping: boolean }) => {
      console.log('⌨️ User typing:', data);
      this.notifyTypingCallbacks(data);
    });
  }

  /**
   * Déconnecte le socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.notifyConnectionCallbacks(false);
    console.log('🔌 Socket disconnected');
  }

  /**
   * Rejoint une discussion
   */
  joinDiscussion(discussionId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-discussion', discussionId);
      console.log('🚪 Joined discussion:', discussionId);
    }
  }

  /**
   * Quitte une discussion
   */
  leaveDiscussion(discussionId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-discussion', discussionId);
      console.log('🚪 Left discussion:', discussionId);
    }
  }

  /**
   * Envoie un nouveau message (pour notification temps réel)
   */
  sendMessage(discussionId: string, message: Message): void {
    if (this.socket?.connected) {
      this.socket.emit('new-message', {
        ...message,
        discussionId
      });
      console.log('📤 Message sent:', message.id);
    }
  }

  /**
   * Indique qu'un utilisateur est en train de taper
   */
  setTyping(discussionId: string, userId: string, isTyping: boolean): void {
    if (this.socket?.connected) {
      this.socket.emit('typing', {
        discussionId,
        userId,
        isTyping
      });
    }
  }

  /**
   * Vérifie si le socket est connecté
   */
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Méthodes pour gérer les callbacks

  /**
   * Ajoute un callback pour les nouveaux messages
   */
  onMessage(callback: (message: Message) => void): () => void {
    this.messageCallbacks.push(callback);

    // Retourne une fonction pour supprimer le callback
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Ajoute un callback pour les nouveaux messages privés
   */
  onPrivateMessage(callback: (message: PrivateMessage) => void): () => void {
    this.privateMessageCallbacks.push(callback);

    return () => {
      const index = this.privateMessageCallbacks.indexOf(callback);
      if (index > -1) {
        this.privateMessageCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Ajoute un callback pour les événements de frappe
   */
  onTyping(callback: (data: { userId: string; isTyping: boolean }) => void): () => void {
    this.typingCallbacks.push(callback);

    return () => {
      const index = this.typingCallbacks.indexOf(callback);
      if (index > -1) {
        this.typingCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Ajoute un callback pour les changements de connexion
   */
  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.push(callback);

    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  // Méthodes privées pour notifier les callbacks

  private notifyMessageCallbacks(message: Message): void {
    this.messageCallbacks.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in message callback:', error);
      }
    });
  }

  private notifyPrivateMessageCallbacks(message: PrivateMessage): void {
    this.privateMessageCallbacks.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in private message callback:', error);
      }
    });
  }

  private notifyTypingCallbacks(data: { userId: string; isTyping: boolean }): void {
    this.typingCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in typing callback:', error);
      }
    });
  }

  private notifyConnectionCallbacks(connected: boolean): void {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }
}

// Instance singleton
export const socketService = new SocketService();

// Hook React pour utiliser le service Socket.IO
export const useSocket = () => {
  return {
    connect: () => socketService.connect(),
    disconnect: () => socketService.disconnect(),
    joinDiscussion: (discussionId: string) => socketService.joinDiscussion(discussionId),
    leaveDiscussion: (discussionId: string) => socketService.leaveDiscussion(discussionId),
    sendMessage: (discussionId: string, message: Message) => socketService.sendMessage(discussionId, message),
    setTyping: (discussionId: string, userId: string, isTyping: boolean) => socketService.setTyping(discussionId, userId, isTyping),
    isConnected: () => socketService.isSocketConnected(),
    onMessage: (callback: (message: Message) => void) => socketService.onMessage(callback),
    onPrivateMessage: (callback: (message: PrivateMessage) => void) => socketService.onPrivateMessage(callback),
    onTyping: (callback: (data: { userId: string; isTyping: boolean }) => void) => socketService.onTyping(callback),
    onConnectionChange: (callback: (connected: boolean) => void) => socketService.onConnectionChange(callback),
  };
};