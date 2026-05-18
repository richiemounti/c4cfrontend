// stores/useInboxStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Conversation,
  Message,
  Notification,
  UnreadCount,
  ContextLink,
} from '@/lib/api/inbox';
import * as inboxApi from '@/lib/api/inbox';

// ─────────────────────────────────────────────────────────────────────────────
// Typing indicator state
// ─────────────────────────────────────────────────────────────────────────────

interface TypingUser {
  userId: string;
  userName: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store shape
// ─────────────────────────────────────────────────────────────────────────────

interface InboxStore {
  // ── Panel UI ───────────────────────────────────────────────────────────────
  isPanelOpen: boolean;
  activeTab: 'messages' | 'notifications';
  activeConversationId: string | null;

  // ── Conversations ──────────────────────────────────────────────────────────
  conversations: Conversation[];
  conversationsLoading: boolean;
  conversationsError: string | null;

  // ── Active conversation messages ───────────────────────────────────────────
  messages: Message[];
  messagesLoading: boolean;
  messagesHasMore: boolean;
  // ISO timestamp of the oldest loaded message — used as `before` cursor
  messagesCursor: string | null;

  // ── Notifications ──────────────────────────────────────────────────────────
  notifications: Notification[];
  notificationsLoading: boolean;
  notificationsTotal: number;
  notificationsPage: number;
  notificationsHasMore: boolean;

  // ── Unread counts (for nav badge) ──────────────────────────────────────────
  unreadCount: UnreadCount;
  unreadCountLoading: boolean;

  // ── Typing indicators per conversation ────────────────────────────────────
  // { conversationId: { userId: { userId, userName } } }
  typingUsers: Record<string, Record<string, TypingUser>>;

  // ─────────────────────────────────────────────────────────────────────────
  // Panel actions
  // ─────────────────────────────────────────────────────────────────────────

  openPanel: (tab?: 'messages' | 'notifications') => void;
  closePanel: () => void;
  setActiveTab: (tab: 'messages' | 'notifications') => void;

  // ─────────────────────────────────────────────────────────────────────────
  // Conversation actions
  // ─────────────────────────────────────────────────────────────────────────

  /** Load the conversation list for the current user */
  fetchConversations: () => Promise<void>;

  /** Open a specific conversation and load its first page of messages */
  openConversation: (conversationId: string) => Promise<void>;

  /** Close the conversation view (back to list) */
  closeConversation: () => void;

  /** Start a new DM or group conversation */
  startConversation: (payload: {
    type: 'direct' | 'group';
    participantIds: string[];
    organizationId: string;
    name?: string;
    projectId?: string;
  }) => Promise<Conversation>;

  /** Archive a conversation for the current user */
  archiveConversation: (conversationId: string) => Promise<void>;

  // ─────────────────────────────────────────────────────────────────────────
  // Message actions
  // ─────────────────────────────────────────────────────────────────────────

  /** Load an older page of messages (scroll-up pagination) */
  loadMoreMessages: () => Promise<void>;

  /** Send a message — optimistic update then confirm */
  sendMessage: (payload: {
    content: string;
    mentionIds?: string[];
    contextLink?: ContextLink;
  }) => Promise<void>;

  /** Edit a message */
  editMessage: (messageId: string, content: string) => Promise<void>;

  /** Soft-delete a message */
  deleteMessage: (messageId: string) => Promise<void>;

  // ─────────────────────────────────────────────────────────────────────────
  // Notification actions
  // ─────────────────────────────────────────────────────────────────────────

  fetchNotifications: (opts?: { reset?: boolean }) => Promise<void>;
  fetchMoreNotifications: () => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // ─────────────────────────────────────────────────────────────────────────
  // Unread count
  // ─────────────────────────────────────────────────────────────────────────

  fetchUnreadCount: () => Promise<void>;

  // ─────────────────────────────────────────────────────────────────────────
  // Socket event handlers — called by useSocket, not by components directly
  // ─────────────────────────────────────────────────────────────────────────

  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  addNotification: (notification: Notification) => void;
  updateConversationLastMessage: (conversationId: string, message: Message) => void;
  markConversationMessagesRead: (conversationId: string, readByUserId: string, readAt: string) => void;
  setTypingUser: (conversationId: string, userId: string, userName: string) => void;
  clearTypingUser: (conversationId: string, userId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store implementation
// ─────────────────────────────────────────────────────────────────────────────

export const useInboxStore = create<InboxStore>()(
  devtools(
    (set, get) => ({
      // ── Initial state ──────────────────────────────────────────────────────

      isPanelOpen: false,
      activeTab: 'messages',
      activeConversationId: null,

      conversations: [],
      conversationsLoading: false,
      conversationsError: null,

      messages: [],
      messagesLoading: false,
      messagesHasMore: false,
      messagesCursor: null,

      notifications: [],
      notificationsLoading: false,
      notificationsTotal: 0,
      notificationsPage: 1,
      notificationsHasMore: false,

      unreadCount: { notifications: 0, messages: 0, total: 0 },
      unreadCountLoading: false,

      typingUsers: {},

      // ── Panel ──────────────────────────────────────────────────────────────

      openPanel: (tab = 'messages') => {
        set({ isPanelOpen: true, activeTab: tab }, false, 'openPanel');
        // Refresh unread count whenever the panel opens
        get().fetchUnreadCount();
      },

      closePanel: () => {
        set({ isPanelOpen: false, activeConversationId: null }, false, 'closePanel');
      },

      setActiveTab: (tab) => {
        set({ activeTab: tab }, false, 'setActiveTab');
        if (tab === 'notifications') {
          get().fetchNotifications({ reset: true });
        }
      },

      // ── Conversations ──────────────────────────────────────────────────────

      fetchConversations: async () => {
        set({ conversationsLoading: true, conversationsError: null }, false, 'fetchConversations/start');
        try {
          const response = await inboxApi.getConversations();
          set(
            { conversations: response.data, conversationsLoading: false },
            false,
            'fetchConversations/success'
          );
        } catch (err) {
          set(
            {
              conversationsLoading: false,
              conversationsError: err instanceof Error ? err.message : 'Failed to load conversations',
            },
            false,
            'fetchConversations/error'
          );
        }
      },

      openConversation: async (conversationId) => {
        set(
            {
            activeConversationId: conversationId,
            messages: [],
            messagesLoading: true,
            messagesHasMore: false,
            messagesCursor: null,
            },
            false,
            'openConversation/start'
        );

        try {
            const response = await inboxApi.getConversation(conversationId);
            const { messages } = response.data;

            // Single set() call — combines message load + unread clear into one render
            set(
            (state) => ({
                messages,
                messagesLoading: false,
                messagesHasMore: messages.length === 30,
                messagesCursor: messages.length > 0 ? messages[0].createdAt : null,
                conversations: state.conversations.map((c) =>
                c._id === conversationId ? { ...c, unreadCount: 0 } : c
                ),
                // Decrement the badge count locally — avoids an extra API round-trip
                unreadCount: {
                ...state.unreadCount,
                messages: Math.max(0, state.unreadCount.messages - 1),
                total: Math.max(0, state.unreadCount.total - 1),
                },
            }),
            false,
            'openConversation/success'
            );
        } catch (err) {
            set({ messagesLoading: false }, false, 'openConversation/error');
            console.error('Failed to open conversation:', err);
        }
      },

      closeConversation: () => {
        set(
          {
            activeConversationId: null,
            messages: [],
            messagesHasMore: false,
            messagesCursor: null,
          },
          false,
          'closeConversation'
        );
      },

      startConversation: async (payload) => {
        const response = await inboxApi.createConversation(payload);
        const conversation = response.data;

        // Add to list if it's not already there
        set(
          (state) => {
            const exists = state.conversations.some((c) => c._id === conversation._id);
            return exists
              ? {}
              : { conversations: [conversation, ...state.conversations] };
          },
          false,
          'startConversation'
        );

        return conversation;
      },

      archiveConversation: async (conversationId) => {
        await inboxApi.archiveConversation(conversationId);
        set(
          (state) => ({
            conversations: state.conversations.filter((c) => c._id !== conversationId),
            activeConversationId:
              state.activeConversationId === conversationId ? null : state.activeConversationId,
          }),
          false,
          'archiveConversation'
        );
      },

      // ── Messages ───────────────────────────────────────────────────────────

      loadMoreMessages: async () => {
        const { activeConversationId, messagesCursor, messagesHasMore, messagesLoading } = get();

        if (!activeConversationId || !messagesHasMore || messagesLoading || !messagesCursor) return;

        set({ messagesLoading: true }, false, 'loadMoreMessages/start');

        try {
          const response = await inboxApi.getMessages(activeConversationId, {
            before: messagesCursor,
            limit: 30,
          });

          const olderMessages = response.data;

          set(
            (state) => ({
              // Prepend older messages — they are already in chronological order
              messages: [...olderMessages, ...state.messages],
              messagesLoading: false,
              messagesHasMore: response.hasMore,
              messagesCursor:
                olderMessages.length > 0 ? olderMessages[0].createdAt : state.messagesCursor,
            }),
            false,
            'loadMoreMessages/success'
          );
        } catch (err) {
          set({ messagesLoading: false }, false, 'loadMoreMessages/error');
          console.error('Failed to load more messages:', err);
        }
      },

      sendMessage: async (payload) => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;

        try {
          // API call — socket will broadcast new_message back, which addMessage handles
          await inboxApi.sendMessage(activeConversationId, payload);
        } catch (err) {
          console.error('Failed to send message:', err);
          throw err;
        }
      },

      editMessage: async (messageId, content) => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;

        try {
          await inboxApi.editMessage(activeConversationId, messageId, content);
          // Socket broadcasts message_edited → updateMessage handles the state update
        } catch (err) {
          console.error('Failed to edit message:', err);
          throw err;
        }
      },

      deleteMessage: async (messageId) => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;

        try {
          await inboxApi.deleteMessage(activeConversationId, messageId);
          // Socket broadcasts message_deleted → removeMessage handles the state update
        } catch (err) {
          console.error('Failed to delete message:', err);
          throw err;
        }
      },

      // ── Notifications ──────────────────────────────────────────────────────

      fetchNotifications: async ({ reset = false } = {}) => {
        const { notificationsPage } = get();
        const page = reset ? 1 : notificationsPage;

        set({ notificationsLoading: true }, false, 'fetchNotifications/start');

        try {
          const response = await inboxApi.getNotifications({ page, limit: 20 });

          set(
            (state) => ({
              notifications: reset
                ? response.data
                : [...state.notifications, ...response.data],
              notificationsLoading: false,
              notificationsTotal: response.total,
              notificationsPage: page,
              notificationsHasMore: page < response.pages,
            }),
            false,
            'fetchNotifications/success'
          );
        } catch (err) {
          set({ notificationsLoading: false }, false, 'fetchNotifications/error');
          console.error('Failed to fetch notifications:', err);
        }
      },

      fetchMoreNotifications: async () => {
        const { notificationsHasMore, notificationsLoading, notificationsPage } = get();
        if (!notificationsHasMore || notificationsLoading) return;

        set(
          { notificationsPage: notificationsPage + 1 },
          false,
          'fetchMoreNotifications/increment'
        );

        await get().fetchNotifications();
      },

      markNotificationRead: async (notificationId) => {
        try {
          await inboxApi.markNotificationRead(notificationId);
          set(
            (state) => ({
              notifications: state.notifications.map((n) =>
                n._id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
              ),
              unreadCount: {
                ...state.unreadCount,
                notifications: Math.max(0, state.unreadCount.notifications - 1),
                total: Math.max(0, state.unreadCount.total - 1),
              },
            }),
            false,
            'markNotificationRead'
          );
        } catch (err) {
          console.error('Failed to mark notification as read:', err);
        }
      },

      markAllNotificationsRead: async () => {
        try {
          await inboxApi.markAllNotificationsRead();
          set(
            (state) => ({
              notifications: state.notifications.map((n) => ({
                ...n,
                read: true,
                readAt: new Date().toISOString(),
              })),
              unreadCount: {
                ...state.unreadCount,
                notifications: 0,
                total: state.unreadCount.messages,
              },
            }),
            false,
            'markAllNotificationsRead'
          );
        } catch (err) {
          console.error('Failed to mark all notifications as read:', err);
        }
      },

      // ── Unread count ───────────────────────────────────────────────────────

      fetchUnreadCount: async () => {
        set({ unreadCountLoading: true }, false, 'fetchUnreadCount/start');
        try {
          const response = await inboxApi.getUnreadCount();
          set(
            { unreadCount: response.data, unreadCountLoading: false },
            false,
            'fetchUnreadCount/success'
          );
        } catch (err) {
          set({ unreadCountLoading: false }, false, 'fetchUnreadCount/error');
          console.error('Failed to fetch unread count:', err);
        }
      },

      // ── Socket event handlers ──────────────────────────────────────────────

      addMessage: (message) => {
        const { activeConversationId } = get();

        // Only append to the messages array if this is the active conversation
        if (message.conversation === activeConversationId) {
          set(
            (state) => ({
              // Avoid duplicates (e.g. sender receives their own message via socket)
              messages: state.messages.some((m) => m._id === message._id)
                ? state.messages
                : [...state.messages, message],
            }),
            false,
            'socket/addMessage'
          );
        }

        // Always bump unread count if the conversation is not currently open
        if (message.conversation !== activeConversationId) {
          set(
            (state) => ({
              conversations: state.conversations.map((c) =>
                c._id === message.conversation
                  ? { ...c, unreadCount: (c.unreadCount ?? 0) + 1 }
                  : c
              ),
              unreadCount: {
                ...state.unreadCount,
                messages: state.unreadCount.messages + 1,
                total: state.unreadCount.total + 1,
              },
            }),
            false,
            'socket/addMessage/bumpUnread'
          );
        }
      },

      updateMessage: (message) => {
        set(
          (state) => ({
            messages: state.messages.map((m) => (m._id === message._id ? message : m)),
          }),
          false,
          'socket/updateMessage'
        );
      },

      removeMessage: (conversationId, messageId) => {
        const { activeConversationId } = get();
        if (conversationId !== activeConversationId) return;

        set(
          (state) => ({
            messages: state.messages.map((m) =>
              m._id === messageId
                ? { ...m, deleted: true, content: '[Message deleted]' }
                : m
            ),
          }),
          false,
          'socket/removeMessage'
        );
      },

      addNotification: (notification) => {
        set(
          (state) => ({
            // Prepend — newest first
            notifications: [notification, ...state.notifications],
            notificationsTotal: state.notificationsTotal + 1,
            unreadCount: {
              ...state.unreadCount,
              notifications: state.unreadCount.notifications + 1,
              total: state.unreadCount.total + 1,
            },
          }),
          false,
          'socket/addNotification'
        );
      },

      updateConversationLastMessage: (conversationId, message) => {
        set(
          (state) => ({
            conversations: state.conversations
              .map((c) =>
                c._id === conversationId
                  ? {
                      ...c,
                      lastMessage: {
                        _id: message._id,
                        content: message.content,
                        sender: message.sender,
                        createdAt: message.createdAt,
                        deleted: message.deleted,
                      },
                      lastActivityAt: message.createdAt,
                    }
                  : c
              )
              // Re-sort by lastActivityAt descending so the active conversation bubbles up
              .sort(
                (a, b) =>
                  new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
              ),
          }),
          false,
          'socket/updateConversationLastMessage'
        );
      },

      markConversationMessagesRead: (conversationId, readByUserId, readAt) => {
        const { activeConversationId } = get();
        if (conversationId !== activeConversationId) return;

        set(
          (state) => ({
            messages: state.messages.map((m) => {
              // Skip if already marked read by this user
              if (m.readBy.some((r) => r.user === readByUserId)) return m;
              return {
                ...m,
                readBy: [...m.readBy, { user: readByUserId, readAt }],
              };
            }),
          }),
          false,
          'socket/markConversationMessagesRead'
        );
      },

      setTypingUser: (conversationId, userId, userName) => {
        set(
          (state) => ({
            typingUsers: {
              ...state.typingUsers,
              [conversationId]: {
                ...(state.typingUsers[conversationId] ?? {}),
                [userId]: { userId, userName },
              },
            },
          }),
          false,
          'socket/setTypingUser'
        );
      },

      clearTypingUser: (conversationId, userId) => {
        set(
          (state) => {
            const conversationTypers = { ...(state.typingUsers[conversationId] ?? {}) };
            delete conversationTypers[userId];
            return {
              typingUsers: {
                ...state.typingUsers,
                [conversationId]: conversationTypers,
              },
            };
          },
          false,
          'socket/clearTypingUser'
        );
      },
    }),
    { name: 'InboxStore' }
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// Derived selectors — use these in components to avoid re-renders on
// unrelated state changes.
// ─────────────────────────────────────────────────────────────────────────────

/** Total unread badge number for the nav icon */
export const selectTotalUnread = (state: InboxStore) => state.unreadCount.total;

/** Typing users for the active conversation */
const EMPTY_TYPING: TypingUser[] = [];

export const selectActiveTypingUsers = (state: InboxStore): TypingUser[] => {
  const { activeConversationId, typingUsers } = state;
  if (!activeConversationId) return EMPTY_TYPING;
  const typers = typingUsers[activeConversationId];
  if (!typers || Object.keys(typers).length === 0) return EMPTY_TYPING;
  return Object.values(typers);
};

/** The active Conversation object */
export const selectActiveConversation = (state: InboxStore): Conversation | null => {
  const { activeConversationId, conversations } = state;
  if (!activeConversationId) return null;
  return conversations.find((c) => c._id === activeConversationId) ?? null;
};