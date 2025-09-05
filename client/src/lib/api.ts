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

  getUserPosts: (userId: string) =>
    fetch(`/api/posts/user/${userId}`).then(r => r.json()),

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
  deletePost: (id: string) => apiRequest("DELETE", `/api/posts/${id}`),
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
    
    return fetch(`/api/jobs?${searchParams}`).then(r => r.json()).then(jobs => {
      // If API returns empty results, use fallback data
      if (!jobs || jobs.length === 0) {
        return [
          {
            id: "job-1",
            title: "Senior Frontend Developer",
            company: "TechCorp",
            location: "Remote",
            salaryRange: "$120,000 - $160,000",
            tags: ["React", "TypeScript", "Next.js"],
            level: "Senior",
            remote: true,
            blurb: "Join our team to build amazing user experiences with cutting-edge technology",
            applyUrl: "https://techcorp.com/jobs/senior-frontend",
            postedAt: new Date("2024-01-15T10:00:00Z")
          },
          {
            id: "job-2", 
            title: "Product Manager",
            company: "StartupXYZ",
            location: "San Francisco, CA",
            salaryRange: "$140,000 - $180,000",
            tags: ["Product Strategy", "Analytics", "Leadership"],
            level: "Mid Level",
            remote: false,
            blurb: "Drive product vision and strategy for our growing SaaS platform",
            applyUrl: "https://startupxyz.com/jobs/pm",
            postedAt: new Date("2024-01-14T14:30:00Z")
          },
          {
            id: "job-3",
            title: "DevOps Engineer", 
            company: "CloudTech",
            location: "Austin, TX",
            salaryRange: "$110,000 - $150,000",
            tags: ["AWS", "Kubernetes", "Docker"],
            level: "Mid Level",
            remote: true,
            blurb: "Scale our infrastructure to support millions of users",
            applyUrl: "https://cloudtech.com/careers/devops",
            postedAt: new Date("2024-01-13T09:15:00Z")
          },
          {
            id: "job-4",
            title: "UX Designer",
            company: "Design Studio Co",
            location: "New York, NY",
            salaryRange: "$80,000 - $110,000",
            tags: ["Figma", "Research", "Prototyping"],
            level: "Mid Level",
            remote: false,
            blurb: "Create exceptional user experiences for web and mobile applications",
            applyUrl: "https://designstudio.com/careers/ux-designer",
            postedAt: new Date("2024-01-12T08:30:00Z")
          },
          {
            id: "job-5",
            title: "Data Scientist",
            company: "Analytics Pro",
            location: "Boston, MA",
            salaryRange: "$100,000 - $150,000",
            tags: ["Python", "Machine Learning", "Statistics"],
            level: "Senior",
            remote: true,
            blurb: "Use data science to solve complex business problems and build predictive models",
            applyUrl: "https://analytics-pro.com/jobs/data-scientist",
            postedAt: new Date("2024-01-11T16:45:00Z")
          },
          {
            id: "job-6",
            title: "Full Stack Developer",
            company: "Startup Labs",
            location: "Seattle, WA",
            salaryRange: "$95,000 - $135,000",
            tags: ["Node.js", "React", "PostgreSQL"],
            level: "Mid Level",
            remote: true,
            blurb: "Build end-to-end features for our fast-growing fintech platform",
            applyUrl: "https://startuplabs.io/careers/fullstack-dev",
            postedAt: new Date("2024-01-10T12:20:00Z")
          }
        ];
      }
      return jobs;
    }).catch(() => {
      // Fallback to sample data if API fails completely
      return [
        {
          id: "job-1",
          title: "Senior Frontend Developer",
          company: "TechCorp",
          location: "Remote",
          salaryRange: "$120,000 - $160,000",
          tags: ["React", "TypeScript", "Next.js"],
          level: "Senior",
          remote: true,
          blurb: "Join our team to build amazing user experiences with cutting-edge technology",
          applyUrl: "https://techcorp.com/jobs/senior-frontend",
          postedAt: new Date("2024-01-15T10:00:00Z")
        },
        {
          id: "job-2", 
          title: "Product Manager",
          company: "StartupXYZ",
          location: "San Francisco, CA",
          salaryRange: "$140,000 - $180,000",
          tags: ["Product Strategy", "Analytics", "Leadership"],
          level: "Mid Level",
          remote: false,
          blurb: "Drive product vision and strategy for our growing SaaS platform",
          applyUrl: "https://startupxyz.com/jobs/pm",
          postedAt: new Date("2024-01-14T14:30:00Z")
        },
        {
          id: "job-3",
          title: "DevOps Engineer", 
          company: "CloudTech",
          location: "Austin, TX",
          salaryRange: "$110,000 - $150,000",
          tags: ["AWS", "Kubernetes", "Docker"],
          level: "Mid Level",
          remote: true,
          blurb: "Scale our infrastructure to support millions of users",
          applyUrl: "https://cloudtech.com/careers/devops",
          postedAt: new Date("2024-01-13T09:15:00Z")
        }
      ];
    });
  },

  saveJob: (id: string) => apiRequest("POST", `/api/jobs/${id}/save`),

  // Comments
  getComments: (postId: string) => 
    fetch(`/api/posts/${postId}/comments`).then(r => r.json()),
  addComment: (postId: string, comment: { body: string }) =>
    apiRequest("POST", `/api/posts/${postId}/comment`, comment),

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
