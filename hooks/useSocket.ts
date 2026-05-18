// hooks/useSocket.ts
'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getToken } from '@/lib/utils/token';
import { useInboxStore } from '@/stores/useInboxStore';

// ─────────────────────────────────────────────────────────────────────────────
// Singleton — one socket instance shared across the entire app.
// Stored outside React so it survives re-renders and component unmounts.
// ─────────────────────────────────────────────────────────────────────────────

let socketInstance: Socket | null = null;
let connectPromise: Promise<Socket> | null = null;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ||
  'http://localhost:5500';

function getOrCreateSocket(): Socket {
  if (socketInstance?.connected) return socketInstance;

  const token = getToken();

  socketInstance = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    // Don't auto-connect — we connect manually after token is confirmed
    autoConnect: false,
  });

  return socketInstance;
}

/**
 * Disconnect and destroy the singleton.
 * Called on logout so the next login gets a fresh authenticated socket.
 */
export function destroySocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    connectPromise = null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  // Pull only the actions we need — avoids re-renders on every state change
  const {
    addMessage,
    updateMessage,
    removeMessage,
    addNotification,
    updateConversationLastMessage,
    markConversationMessagesRead,
    setTypingUser,
    clearTypingUser,
  } = useInboxStore.getState();

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = getOrCreateSocket();
    socketRef.current = socket;

    // Connect if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // ── Core lifecycle ──────────────────────────────────────────────────────

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    // ── Message events ──────────────────────────────────────────────────────

    socket.on('new_message', (message) => {
      addMessage(message);
      updateConversationLastMessage(message.conversation, message);
    });

    socket.on('message_edited', (message) => {
      updateMessage(message);
    });

    socket.on('message_deleted', ({ messageId, conversationId }: { messageId: string; conversationId: string }) => {
      removeMessage(conversationId, messageId);
    });

    socket.on('messages_read', ({ conversationId, readBy, readAt }: {
      conversationId: string;
      readBy: string;
      readAt: string;
    }) => {
      markConversationMessagesRead(conversationId, readBy, readAt);
    });

    // ── Notification events ─────────────────────────────────────────────────

    socket.on('notification', (notification) => {
      addNotification(notification);
    });

    // ── Typing indicators ───────────────────────────────────────────────────

    socket.on('typing_start', ({ userId, userName, conversationId }: {
      userId: string;
      userName: string;
      conversationId: string;
    }) => {
      setTypingUser(conversationId, userId, userName);
    });

    socket.on('typing_stop', ({ userId, conversationId }: {
      userId: string;
      conversationId: string;
    }) => {
      clearTypingUser(conversationId, userId);
    });

    // ── Auth logout — destroy socket so it doesn't linger ──────────────────

    const handleAuthLogout = () => {
      destroySocket();
    };

    window.addEventListener('auth:logout', handleAuthLogout);

    // ── Cleanup ─────────────────────────────────────────────────────────────
    // We remove event listeners but do NOT disconnect — the singleton stays
    // alive for the lifetime of the browser session.

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('new_message');
      socket.off('message_edited');
      socket.off('message_deleted');
      socket.off('messages_read');
      socket.off('notification');
      socket.off('typing_start');
      socket.off('typing_stop');
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  // ── Helpers exposed to components ─────────────────────────────────────────

  const joinConversation = (conversationId: string) => {
    socketRef.current?.emit('join_conversation', conversationId);
  };

  const leaveConversation = (conversationId: string) => {
    socketRef.current?.emit('leave_conversation', conversationId);
  };

  const emitTypingStart = (conversationId: string) => {
    socketRef.current?.emit('typing_start', { conversationId });
  };

  const emitTypingStop = (conversationId: string) => {
    socketRef.current?.emit('typing_stop', { conversationId });
  };

  return {
    socket: socketRef.current,
    joinConversation,
    leaveConversation,
    emitTypingStart,
    emitTypingStop,
  };
}