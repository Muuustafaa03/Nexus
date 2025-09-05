import { apiRequest } from "./queryClient";

export interface PostWithAuthor {
  id: string;
  title: string;
  description?: string;
  body: string;
  tags: string[];
  category: string;
  sponsored: boolean;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  sharesCount: number;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange?: string;
  tags: string[];
  level: string;
  remote: boolean;
  postedAt: Date;
  blurb: string;
  applyUrl: string;
}

export interface MessageThread {
  id: string;
  userAId: string;
  userBId: string;
  createdAt: Date;
  updatedAt: Date;
  unreadForUserA: number;
  unreadForUserB: number;
  otherUser: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  lastMessage?: {
    id: string;
    body: string;
    createdAt: Date;
    senderId: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MENTION' | 'SYSTEM';
  data: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export const api = {
  // Posts
  getPosts: (sort: 'trending' | 'recent' = 'recent', cursor?: string) =>
    fetch(`/api/posts?sort=${sort}${cursor ? `&cursor=${cursor}` : ''}`).then(r => r.json()),

  createPost: (post: {
    title: string;
    description?: string;
    body: string;
    tags: string[];
    category: string;
    sponsored?: boolean;
    isDraft?: boolean;
  }) => apiRequest("POST", "/api/posts", post),

  likePost: (id: string) => apiRequest("POST", `/api/posts/${id}/like`),
  unlikePost: (id: string) => apiRequest("DELETE", `/api/posts/${id}/like`),
  savePost: (id: string) => apiRequest("POST", `/api/posts/${id}/save`),
  unsavePost: (id: string) => apiRequest("DELETE", `/api/posts/${id}/save`),
  
  commentOnPost: (id: string, body: string) =>
    apiRequest("POST", `/api/posts/${id}/comment`, { body }),

  // AI
  summarizeContent: (body: string) => apiRequest("POST", "/api/ai/summarize", { body }),
  rewriteContent: (body: string) => apiRequest("POST", "/api/ai/rewrite", { body }),
  generateTitles: (body: string) => apiRequest("POST", "/api/ai/title", { body }),

  // Jobs
  getJobs: (params?: {
    query?: string;
    tags?: string[];
    remote?: boolean;
    level?: string;
    cursor?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.tags?.length) searchParams.append('tags', params.tags.join(','));
    if (params?.remote !== undefined) searchParams.append('remote', String(params.remote));
    if (params?.level) searchParams.append('level', params.level);
    if (params?.cursor) searchParams.append('cursor', params.cursor);
    
    return fetch(`/api/jobs?${searchParams}`).then(r => r.json());
  },

  saveJob: (id: string) => apiRequest("POST", `/api/jobs/${id}/save`),

  // Social
  followUser: (id: string) => apiRequest("POST", `/api/users/${id}/follow`),
  unfollowUser: (id: string) => apiRequest("DELETE", `/api/users/${id}/follow`),
  getUserProfile: (username: string) => 
    fetch(`/api/users/${username}`).then(r => r.json()),

  // Inbox
  getNotifications: () => fetch("/api/inbox/notifications").then(r => r.json()),
  markNotificationAsRead: (id?: string) =>
    apiRequest("POST", "/api/inbox/notifications/mark-read", { id }),

  getMessageThreads: () => fetch("/api/inbox/threads").then(r => r.json()),
  createMessageThread: (otherUserId: string) =>
    apiRequest("POST", "/api/inbox/threads", { otherUserId }),
  getMessages: (threadId: string) =>
    fetch(`/api/inbox/threads/${threadId}/messages`).then(r => r.json()),
  sendMessage: (threadId: string, body: string) =>
    apiRequest("POST", `/api/inbox/threads/${threadId}/messages`, { body }),
};
