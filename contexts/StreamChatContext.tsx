// contexts/StreamChatContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { StreamChat } from 'stream-chat';
import { getStreamChatToken } from '@/lib/api/streamChat';
import { StreamChatUser, StreamChatContextValue, StreamChatGenerics  } from '@/types';
import { useAuth } from '@/contexts/AuthContext'; // Adjust path to your auth context

// ==========================================
// CONTEXT
// ==========================================

const StreamChatContext = createContext<StreamChatContextValue | undefined>(undefined);

// ==========================================
// PROVIDER PROPS
// ==========================================

interface StreamChatProviderProps {
  children: React.ReactNode;
  apiKey: string; // Stream Chat API key from environment
}

// ==========================================
// PROVIDER
// ==========================================

export const StreamChatProvider: React.FC<StreamChatProviderProps> = ({
  children,
  apiKey,
}) => {
  const { user: authUser, isAuthenticated } = useAuth(); // Get current user from auth context
  
  const [client, setClient] = useState<StreamChat | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [streamUser, setStreamUser] = useState<StreamChatUser | null>(null);

  /**
   * Connect user to Stream Chat
   */
  const connectUser = useCallback(async (userData: StreamChatUser) => {
    if (!apiKey) return;

    try {
        setIsLoading(true);
        setError(null);

        const chatClient = StreamChat.getInstance(apiKey);

        const tokenResponse = await getStreamChatToken();
        
        if (!tokenResponse.success || !tokenResponse.data) {
        throw new Error('Failed to get Stream Chat token');
        }

        const { token } = tokenResponse.data;

        // FIX HERE: Cast the object to 'any' to bypass the 'email' error
        await chatClient.connectUser(
        {
            id: userData.id,
            name: userData.name,
            email: userData.email, // This will now be sent to Stream correctly
            image: userData.image,
            role: userData.role,
        } as any, 
        token
        );

        console.log('✅ Connected to Stream Chat:', userData.id);

        setClient(chatClient);
        setStreamUser(userData);
        setIsReady(true);
    } catch (err) {
        console.error('Failed to connect to Stream Chat:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
        setIsLoading(false);
    }
    }, [apiKey]);

  /**
   * Disconnect user from Stream Chat
   */
  const disconnectUser = useCallback(async () => {
    if (client) {
      try {
        await client.disconnectUser();
        console.log('✅ Disconnected from Stream Chat');
      } catch (err) {
        console.error('Error disconnecting from Stream Chat:', err);
      } finally {
        setClient(null);
        setStreamUser(null);
        setIsReady(false);
      }
    }
  }, [client]);

  /**
   * Auto-connect when user is authenticated
   */
  useEffect(() => {
    if (isAuthenticated && authUser && !isReady && !isLoading) {
      const streamUserData: StreamChatUser = {
        id: authUser._id,
        name: authUser.name,
        email: authUser.email,
        image: authUser.photo,
        role: authUser.primaryRole,
      };

      connectUser(streamUserData);
    }
  }, [isAuthenticated, authUser, isReady, isLoading, connectUser]);

  /**
   * Auto-disconnect when user logs out
   */
  useEffect(() => {
    if (!isAuthenticated && isReady) {
      disconnectUser();
    }
  }, [isAuthenticated, isReady, disconnectUser]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (client) {
        client.disconnectUser().catch(console.error);
      }
    };
  }, [client]);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value: StreamChatContextValue = {
    client,
    isReady,
    isLoading,
    error,
    user: streamUser,
    connectUser,
    disconnectUser,
  };

  return (
    <StreamChatContext.Provider value={value}>
      {children}
    </StreamChatContext.Provider>
  );
};

// ==========================================
// HOOK
// ==========================================

/**
 * Hook to access Stream Chat context
 */
export const useStreamChat = () => {
  const context = useContext(StreamChatContext);
  
  if (context === undefined) {
    throw new Error('useStreamChat must be used within a StreamChatProvider');
  }
  
  return context;
};

// ==========================================
// EXPORT
// ==========================================

export default StreamChatContext;