// components/reviews/modals/ReviewChatModal.tsx
'use client';

import React, { useEffect } from 'react';
import { X, Users, Loader2, AlertCircle, MessageSquare } from 'lucide-react';
import { Chat, Channel as StreamChannel, Window, MessageList, MessageInput, Thread } from 'stream-chat-react';
import { useStreamChat } from '@/contexts/StreamChatContext';
import { ReviewWithChat } from '@/types';
import { Channel } from 'stream-chat';

import 'stream-chat-react/dist/css/v2/index.css';

interface ReviewChatModalProps {
  review: ReviewWithChat;
  isOpen: boolean;
  onClose: () => void;
  channel: Channel | null;
  isChannelReady: boolean;
  error: Error | null;
}

export const ReviewChatModal: React.FC<ReviewChatModalProps> = ({
  review,
  isOpen,
  onClose,
  channel,
  isChannelReady,
  error,
}) => {
  const { client } = useStreamChat();

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Custom Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-concrete-200 bg-gradient-to-r from-stratosphere-50 to-sky-50 flex-shrink-0">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2.5 bg-sky-100 rounded-xl flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-sky-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-stratosphere-900 mb-0.5">
                  Review Discussion
                </h2>
                <p className="text-sm text-concrete-700 truncate">
                  {review.title}
                </p>
              </div>
            </div>
            
            {/* Participants Count */}
            {review.chatParticipants && review.chatParticipants.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm text-sky-600 border border-sky-200 mr-3 flex-shrink-0 shadow-sm">
                <Users className="w-4 h-4" />
                <span className="font-semibold">{review.chatParticipants.length}</span>
                <span className="text-concrete-700">participants</span>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-concrete-100 rounded-full transition-all flex-shrink-0 hover:scale-110"
              title="Close chat"
            >
              <X className="w-5 h-5 text-concrete-700" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            {/* Error State */}
            {error && (
              <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-concrete-50 to-stratosphere-50">
                <div className="text-center max-w-md px-4 py-8 bg-white rounded-2xl shadow-lg border border-concrete-200">
                  <div className="w-16 h-16 bg-clay-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-clay-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-stratosphere-900 mb-2">
                    Failed to Load Chat
                  </h3>
                  <p className="text-sm text-concrete-700 mb-6">
                    {error.message || 'An error occurred while loading the chat'}
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-medium shadow-md hover:shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {!error && !isChannelReady && (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-concrete-50 to-stratosphere-50">
                <div className="text-center py-8 px-6 bg-white rounded-2xl shadow-lg border border-concrete-200">
                  <Loader2 className="w-12 h-12 text-sky-500 animate-spin mx-auto mb-4" />
                  <p className="text-stratosphere-900 font-semibold text-lg mb-2">
                    Loading discussion...
                  </p>
                  <p className="text-sm text-concrete-600">
                    Connecting to chat server
                  </p>
                </div>
              </div>
            )}

            {/* Chat Interface - Let Stream Chat handle everything */}
            {!error && isChannelReady && channel && client && (
              <div className="h-full review-chat-themed">
                <Chat client={client} theme="str-chat__theme-light">
                  <StreamChannel channel={channel}>
                    <Window>
                      <MessageList />
                      <MessageInput />
                    </Window>
                    <Thread />
                  </StreamChannel>
                </Chat>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Minimal Brand Theming Only */}
      <style jsx global>{`
        /* Just hide the Stream Chat header since we have our own */
        .review-chat-themed .str-chat__header-livestream,
        .review-chat-themed .str-chat__channel-header {
          display: none;
        }

        /* Apply brand colors to primary elements */
        .review-chat-themed .str-chat__message--me .str-chat__message-bubble {
          background-color: #89a0ae;
        }

        .review-chat-themed .str-chat__send-button {
          background-color: #89a0ae;
        }

        .review-chat-themed .str-chat__send-button:hover {
          background-color: #6e8595;
        }

        /* Use brand font */
        .review-chat-themed .str-chat {
          font-family: var(--font-sora), sans-serif;
        }

        /* Smooth scrollbar */
        .review-chat-themed .str-chat__list::-webkit-scrollbar {
          width: 8px;
        }

        .review-chat-themed .str-chat__list::-webkit-scrollbar-thumb {
          background: #e4e0e1;
          border-radius: 10px;
        }

        .review-chat-themed .str-chat__list::-webkit-scrollbar-thumb:hover {
          background: #a8a1a3;
        }
      `}</style>
    </>
  );
};

export default ReviewChatModal;