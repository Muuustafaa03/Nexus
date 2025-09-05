import { z } from "zod";

// Insert schemas for validation
export const insertUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string().min(1, "Username is required").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const insertPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  body: z.string().min(1, "Content is required"),
  tags: z.union([z.array(z.string()), z.string()]).default([]).transform((val) => {
    if (typeof val === 'string') {
      return val.trim() ? val.split(',').map(t => t.trim()).filter(Boolean) : [];
    }
    return val;
  }),
  category: z.string().optional(),
  sponsored: z.boolean().default(false),
  isDraft: z.boolean().default(false),
}).refine((data) => {
  // Only require title, body, and category for published posts (not drafts)
  if (!data.isDraft) {
    return data.title.trim().length > 0 && data.body.trim().length > 0 && data.category && data.category.length > 0;
  }
  return true;
}, {
  message: "Title, content, and category are required for published posts",
  path: ["category"]
});

export const insertJobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().min(1, "Location is required"),
  salaryRange: z.string().optional(),
  tags: z.array(z.string()).default([]),
  level: z.string().min(1, "Level is required"),
  remote: z.boolean().default(false),
  blurb: z.string().min(1, "Description is required"),
  applyUrl: z.string().url("Invalid URL"),
});

export const insertCommentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty"),
});

export const insertMessageSchema = z.object({
  body: z.string().min(1, "Message cannot be empty"),
});

// Types from Prisma Client
export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  bio: string | null;
  avatarUrl: string | null;
  followersCount: number;
  followingCount: number;
  createdAt: Date;
}

export interface Post {
  id: string;
  authorId: string;
  title: string;
  description: string | null;
  body: string;
  tags: any; // JSON field
  category: string;
  sponsored: boolean;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  sharesCount: number;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

export interface Save {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: Date;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface MessageThread {
  id: string;
  userAId: string;
  userBId: string;
  createdAt: Date;
  updatedAt: Date;
  unreadForUserA: number;
  unreadForUserB: number;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MENTION' | 'SYSTEM';
  data: any; // JSON field
  isRead: boolean;
  createdAt: Date;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string | null;
  tags: any; // JSON field
  level: string;
  remote: boolean;
  postedAt: Date;
  blurb: string;
  applyUrl: string;
}

export interface PortalSystem {
  id: string;
  key: string;
  value: any; // JSON field
}

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;