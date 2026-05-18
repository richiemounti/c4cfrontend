// lib/api/inbox.ts
import { apiClient } from './client';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ResourceType =
  | 'project'
  | 'project_site'
  | 'survey'
  | 'survey_response'
  | 'stakeholder_group'
  | 'stakeholder_action'
  | 'risk_register_entry'
  | 'theory_of_change'
  | 'consultation_plan'
  | 'review'
  | 'report'
  | 'project_setup'
  | 'site_setup';

export type ConversationType = 'direct' | 'group';

export type NotificationType =
  | 'mention_in_message'
  | 'mention_on_page'
  | 'new_message'
  | 'system';

export interface ContextLink {
  label: string;
  resourceType: ResourceType;
  resourceId: string;
  projectId?: string;
  siteId?: string;
  href: string;
}

export interface PageContext {
  resourceType: ResourceType;
  resourceId: string;
  label: string;
  href: string;
}

export interface InboxUser {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  userName: string;
  primaryRole?: string;
}

export interface ReadReceipt {
  user: string;
  readAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  organization: string;
  sender: InboxUser;
  content: string;
  mentions: InboxUser[];
  contextLink?: ContextLink;
  readBy: ReadReceipt[];
  editedAt?: string;
  deleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  organization: string;
  project?: string;
  type: ConversationType;
  name?: string;
  participants: InboxUser[];
  createdBy: InboxUser;
  lastMessage?: Pick<Message, '_id' | 'content' | 'sender' | 'createdAt' | 'deleted'>;
  lastActivityAt: string;
  archivedBy: string[];
  archived: boolean;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  organization: string;
  type: NotificationType;
  triggeredBy: InboxUser;
  conversation?: string;
  message?: string;
  pageContext?: PageContext;
  contextLink?: ContextLink;
  preview: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnreadCount {
  notifications: number;
  messages: number;
  total: number;
}

export interface PaginatedMessages {
  success: boolean;
  hasMore: boolean;
  count: number;
  data: Message[];
}

export interface PaginatedNotifications {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Notification[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Conversations
// ─────────────────────────────────────────────────────────────────────────────

export const getConversations = async (): Promise<{ success: boolean; count: number; data: Conversation[] }> => {
  const response = await apiClient.get('/inbox/conversations');
  return response.data;
};

export const getConversation = async (id: string): Promise<{
  success: boolean;
  data: { conversation: Conversation; messages: Message[] };
}> => {
  const response = await apiClient.get(`/inbox/conversations/${id}`);
  return response.data;
};

export const createConversation = async (payload: {
  type: ConversationType;
  participantIds: string[];
  organizationId: string;
  name?: string;
  projectId?: string;
}): Promise<{ success: boolean; data: Conversation }> => {
  const response = await apiClient.post('/inbox/conversations', payload);
  return response.data;
};

export const archiveConversation = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/inbox/conversations/${id}`);
  return response.data;
};

export const markConversationRead = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post(`/inbox/conversations/${id}/read`);
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Messages
// ─────────────────────────────────────────────────────────────────────────────

export const getMessages = async (
  conversationId: string,
  params?: { before?: string; limit?: number }
): Promise<PaginatedMessages> => {
  const response = await apiClient.get(`/inbox/conversations/${conversationId}/messages`, {
    params,
  });
  return response.data;
};

export const sendMessage = async (
  conversationId: string,
  payload: {
    content: string;
    mentionIds?: string[];
    contextLink?: ContextLink;
  }
): Promise<{ success: boolean; data: Message }> => {
  const response = await apiClient.post(`/inbox/conversations/${conversationId}/messages`, payload);
  return response.data;
};

export const editMessage = async (
  conversationId: string,
  messageId: string,
  content: string
): Promise<{ success: boolean; data: Message }> => {
  const response = await apiClient.patch(
    `/inbox/conversations/${conversationId}/messages/${messageId}`,
    { content }
  );
  return response.data;
};

export const deleteMessage = async (
  conversationId: string,
  messageId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(
    `/inbox/conversations/${conversationId}/messages/${messageId}`
  );
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────────────────────

export const getNotifications = async (params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<PaginatedNotifications> => {
  const response = await apiClient.get('/inbox/notifications', { params });
  return response.data;
};

export const getUnreadCount = async (): Promise<{ success: boolean; data: UnreadCount }> => {
  const response = await apiClient.get('/inbox/notifications/unread-count');
  return response.data;
};

export const markNotificationRead = async (
  id: string
): Promise<{ success: boolean; data: Notification }> => {
  const response = await apiClient.patch(`/inbox/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsRead = async (): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post('/inbox/notifications/read-all');
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Mentions
// ─────────────────────────────────────────────────────────────────────────────

export const sendPageMention = async (payload: {
  recipientIds: string[];
  organizationId: string;
  preview: string;
  pageContext: PageContext;
  contextLink?: ContextLink;
}): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post('/inbox/mention', payload);
  return response.data;
};

export const getMentionableUsers = async (params: {
  organizationId: string;
  search?: string;
  limit?: number;
}): Promise<{ success: boolean; count: number; data: InboxUser[] }> => {
  const response = await apiClient.get('/inbox/mentionable-users', { params });
  return response.data;
};