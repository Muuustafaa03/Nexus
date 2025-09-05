import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { api, type Notification, type MessageThread } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export default function InboxTabs() {
  const [activeTab, setActiveTab] = useState<'notifications' | 'messages'>('notifications');
  const { toast } = useToast();

  const { data: notifications = [], refetch: refetchNotifications } = useQuery<Notification[]>({
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

  const markAsReadMutation = useMutation({
    mutationFn: (id?: string) => api.markNotificationAsRead(id),
    onSuccess: () => {
      toast({
        title: "Marked as read",
        description: "Notifications updated",
      });
      refetchNotifications();
    },
  });

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const unreadMessages = allThreads.reduce((sum, thread) => {
    // Calculate unread count for current user
    return sum + (thread.unreadForUserA || thread.unreadForUserB || 0);
  }, 0);

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return (
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        );
      case 'FOLLOW':
        return (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'COMMENT':
        return (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'SYSTEM':
        return (
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
            <span>📢</span>
          </div>
        );
    }
  };

  const renderNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'LIKE':
        return (
          <p className="text-sm text-foreground">
            <span className="font-medium" data-testid="notification-username">
              {notification.data.username}
            </span>{' '}
            liked your post{' '}
            <span className="font-medium" data-testid="notification-post-title">
              "{notification.data.postTitle}"
            </span>
          </p>
        );
      case 'FOLLOW':
        return (
          <p className="text-sm text-foreground">
            <span className="font-medium">{notification.data.username}</span> started following you
          </p>
        );
      case 'COMMENT':
        return (
          <p className="text-sm text-foreground">
            <span className="font-medium">{notification.data.username}</span> commented on your post{' '}
            <span className="font-medium">"{notification.data.postTitle}"</span>
          </p>
        );
      case 'SYSTEM':
        return (
          <p className="text-sm text-foreground">
            {notification.data.message || 'System notification'}
          </p>
        );
      default:
        return <p className="text-sm text-foreground">New notification</p>;
    }
  };

  return (
    <div className="space-y-6" data-testid="inbox-tabs">
      {/* Inbox Header */}
      <Card className="border border-border">
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-border">
            <h1 className="text-xl font-semibold text-foreground" data-testid="text-inbox-title">Inbox</h1>
          </div>
          
          {/* Tabs */}
          <div className="flex">
            <Button
              variant={activeTab === 'notifications' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('notifications')}
              className="flex-1 rounded-none px-6 py-3 text-sm font-medium justify-center"
              data-testid="tab-notifications"
            >
              Notifications
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive" className="ml-2" data-testid="badge-notifications-count">
                  {unreadNotifications.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === 'messages' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('messages')}
              className="flex-1 rounded-none px-6 py-3 text-sm font-medium justify-center"
              data-testid="tab-messages"
            >
              Messages
              {unreadMessages > 0 && (
                <Badge variant="destructive" className="ml-2" data-testid="badge-messages-count">
                  {unreadMessages}
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      <Card className="border border-border">
        <CardContent className="p-6">
          {activeTab === 'notifications' ? (
            <div data-testid="notifications-content">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-foreground">Recent Activity</h2>
                {unreadNotifications.length > 0 && (
                  <Button 
                    variant="link" 
                    size="sm"
                    onClick={() => markAsReadMutation.mutate()}
                    data-testid="button-mark-all-read"
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              
              {notifications.length === 0 ? (
                <div className="text-center py-8" data-testid="empty-notifications">
                  <p className="text-muted-foreground">No notifications yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    You'll see likes, comments, and follows here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                        !notification.isRead ? 'bg-accent/50' : 'hover:bg-accent/30'
                      }`}
                      data-testid={`notification-${notification.id}`}
                    >
                      {renderNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        {renderNotificationText(notification)}
                        <p className="text-xs text-muted-foreground mt-1" data-testid="notification-time">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div data-testid="messages-content">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-foreground">Conversations</h2>
              </div>
              
              {allThreads.length === 0 ? (
                <div className="text-center py-8" data-testid="empty-messages">
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start a conversation with other professionals
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allThreads.map((thread) => {
                    const hasUnread = (thread.unreadForUserA || thread.unreadForUserB || 0) > 0;
                    return (
                      <div
                        key={thread.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/70 cursor-pointer transition-colors ${
                          hasUnread ? 'bg-accent/50' : ''
                        }`}
                        data-testid={`message-thread-${thread.id}`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={thread.otherUser.avatarUrl} alt={thread.otherUser.username} />
                          <AvatarFallback>
                            {thread.otherUser.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <p className="font-medium text-foreground" data-testid="thread-username">
                                @{thread.otherUser.username}
                              </p>
                              {thread.otherUser.isVerified && (
                                <svg 
                                  className="w-4 h-4 text-blue-500" 
                                  fill="currentColor" 
                                  viewBox="0 0 24 24"
                                  data-testid="verified-badge"
                                >
                                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground" data-testid="thread-time">
                              {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
                            </span>
                          </div>
                          {thread.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate" data-testid="thread-last-message">
                              {thread.lastMessage.body}
                            </p>
                          )}
                        </div>
                        {hasUnread && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
