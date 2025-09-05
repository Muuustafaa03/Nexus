import { useQuery } from "@tanstack/react-query";
import { api, type Notification, type MessageThread } from "@/lib/api";
import { usePortalMessageStatus } from "@/hooks/use-portal-message-status";

export function useUnreadCount() {
  const { isRead: isPortalMessageRead } = usePortalMessageStatus();
  
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/inbox/notifications'],
    queryFn: () => api.getNotifications(),
  });

  const { data: messageThreads = [] } = useQuery<MessageThread[]>({
    queryKey: ['/api/inbox/threads'],
    queryFn: () => api.getMessageThreads(),
  });

  // Add hardcoded Portal Official conversation for demo
  const portalOfficialThread = {
    id: 'portal-official-thread',
    otherUser: {
      id: 'portal-official',
      username: 'portal',
      email: 'portal@portal.com',
      bio: 'Official Portal account - Welcome to the community!',
      avatarUrl: null,
      isVerified: true,
    },
    lastMessage: {
      id: 'portal-msg-1',
      body: 'Welcome to Portal! We\'re excited to have you join our professional community.',
      createdAt: new Date(Date.now() - 60000 * 30), // 30 minutes ago
      senderId: 'portal-official',
      threadId: 'portal-official-thread'
    },
    unreadForUserA: 1,
    unreadForUserB: 0,
    userAId: 'current-user',
    userBId: 'portal-official',
    createdAt: new Date(Date.now() - 60000 * 30),
    updatedAt: new Date(Date.now() - 60000 * 30)
  };

  // Combine hardcoded thread with real threads
  const allThreads = [portalOfficialThread, ...messageThreads];

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const unreadMessages = allThreads.reduce((sum, thread) => {
    // Calculate unread count for current user only
    // For demo purposes, check if Portal Official thread has been read
    if (thread.id === 'portal-official-thread') {
      return sum + (isPortalMessageRead ? 0 : 1);
    }
    return sum + (thread.unreadForUserA || thread.unreadForUserB || 0);
  }, 0);

  // Total unread count includes both notifications and messages
  const totalUnreadCount = unreadNotifications.length + unreadMessages;

  return {
    unreadNotifications: unreadNotifications.length,
    unreadMessages,
    totalUnreadCount,
  };
}