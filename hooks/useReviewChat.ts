// hooks/useReviewChat.ts
import { useState, useCallback, useEffect } from 'react';
import { useStreamChat } from '@/contexts/StreamChatContext';
import { createReviewChannelOnDemand } from '@/lib/api/streamChat';
import { ReviewWithChat } from '@/types';
import { Channel } from 'stream-chat';

export const useReviewChat = (review: ReviewWithChat) => {
  const { client, isReady } = useStreamChat();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isChannelReady, setIsChannelReady] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createChannel = useCallback(async () => {
    console.log('🔄 createChannel called', { isReady, hasClient: !!client, isCreating });
    
    if (!isReady || !client) {
      console.log('❌ Stream Chat not ready');
      setError(new Error('Stream Chat not ready'));
      return;
    }

    if (isCreating) {
      console.log('⏳ Already creating channel, skipping...');
      return;
    }

    try {
      setIsCreating(true);
      setIsChannelReady(false);
      setError(null);

      console.log('📞 Calling backend to get/create channel...');
      const response = await createReviewChannelOnDemand(review._id);

      console.log('📥 Backend response:', response);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create channel');
      }

      const { channelId, channelType } = response.data;
      
      console.log('🔌 Connecting to channel:', { channelId, channelType });
      
      const streamChannel = client.channel(channelType, channelId);
      
      console.log('👀 Watching channel...');
      await streamChannel.watch();
      
      console.log('✅ Channel ready!');

      setChannel(streamChannel);
      setIsChannelReady(true);
      
    } catch (err: any) {
      console.error('❌ Error in createChannel:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Unknown error'));
      setChannel(null);
      setIsChannelReady(false);
    } finally {
      console.log('🏁 Finally block - setting isCreating to false');
      setIsCreating(false);
    }
  }, [isReady, client, review._id, isCreating]);

  const openChat = useCallback(async () => {
    console.log('🔵 openChat called', { isChannelReady, isCreating });
    
    setIsChatOpen(true);
    
    if (!isChannelReady && !isCreating) {
      console.log('🚀 Starting channel creation...');
      await createChannel();
    } else {
      console.log('ℹ️ Channel already ready or being created');
    }
  }, [isChannelReady, isCreating, createChannel]);

  const closeChat = useCallback(() => {
    console.log('🔴 Closing chat...');
    setIsChatOpen(false);
  }, []);

  return {
    channel,
    isChannelReady,
    isCreating,
    error,
    createChannel,
    openChat,
    closeChat,
    isChatOpen,
  };
};