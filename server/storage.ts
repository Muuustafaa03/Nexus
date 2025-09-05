import { PrismaClient } from '@prisma/client';
import session from "express-session";
import createMemoryStore from "memorystore";
import type { 
  User, Post, Job, Comment, MessageThread, Message, Notification, Follow, Like, Save,
  InsertUser, InsertPost, InsertJob, InsertComment, InsertMessage
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

// Prisma client setup
export const prisma = new PrismaClient();

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Posts
  getPosts(sort: 'trending' | 'recent', cursor?: string, limit?: number): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  getPostsWithAuthor(sort: 'trending' | 'recent', cursor?: string, limit?: number): Promise<Array<Post & { author: User }>>;
  getPostsByUser(userId: string, cursor?: string, limit?: number): Promise<Post[]>;
  createPost(authorId: string, post: InsertPost): Promise<Post>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined>;

  // Interactions
  likePost(userId: string, postId: string): Promise<void>;
  unlikePost(userId: string, postId: string): Promise<void>;
  savePost(userId: string, postId: string): Promise<void>;
  unsavePost(userId: string, postId: string): Promise<void>;
  addComment(postId: string, authorId: string, comment: InsertComment): Promise<Comment>;
  getComments(postId: string): Promise<Array<Comment & { author: User }>>;

  // Social
  followUser(followerId: string, followingId: string): Promise<void>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;

  // Jobs
  getJobs(query?: string, tags?: string[], remote?: boolean, level?: string, cursor?: string, limit?: number): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  saveJob(userId: string, jobId: string): Promise<void>;

  // Messages
  getMessageThreads(userId: string): Promise<Array<MessageThread & { otherUser: User, lastMessage?: Message }>>;
  createMessageThread(userAId: string, userBId: string): Promise<MessageThread>;
  getOrCreateMessageThread(userAId: string, userBId: string): Promise<MessageThread>;
  getMessages(threadId: string, userId: string): Promise<Message[]>;
  sendMessage(threadId: string, senderId: string, message: InsertMessage): Promise<Message>;

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(userId: string, type: string, data: Record<string, any>): Promise<void>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  // System
  getSystemValue(key: string): Promise<any>;
  setSystemValue(key: string, value: any): Promise<void>;

  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { username }
    });
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    return await prisma.user.create({
      data: user
    });
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: updates
      });
      return user;
    } catch (error) {
      return undefined;
    }
  }

  async getPosts(sort: 'trending' | 'recent', cursor?: string, limit: number = 20): Promise<Post[]> {
    const whereClause = cursor ? {
      AND: [
        { isDraft: false },
        { createdAt: { lt: new Date(cursor) } }
      ]
    } : { isDraft: false };

    if (sort === 'trending') {
      // For trending, we'll use a simplified approach and sort by engagement metrics
      return await prisma.post.findMany({
        where: whereClause,
        orderBy: [
          { likesCount: 'desc' },
          { commentsCount: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit
      });
    } else {
      return await prisma.post.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit
      });
    }
  }

  async getPost(id: string): Promise<Post | undefined> {
    const post = await prisma.post.findUnique({
      where: { id }
    });
    return post || undefined;
  }

  async getPostsWithAuthor(sort: 'trending' | 'recent', cursor?: string, limit: number = 20): Promise<Array<Post & { author: User }>> {
    const whereClause = cursor ? {
      AND: [
        { isDraft: false },
        { createdAt: { lt: new Date(cursor) } }
      ]
    } : { isDraft: false };

    if (sort === 'trending') {
      const posts = await prisma.post.findMany({
        where: whereClause,
        include: { author: true },
        orderBy: [
          { likesCount: 'desc' },
          { commentsCount: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit
      });
      return posts;
    } else {
      const posts = await prisma.post.findMany({
        where: whereClause,
        include: { author: true },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      return posts;
    }
  }

  async getPostsByUser(userId: string, cursor?: string, limit: number = 20): Promise<Post[]> {
    const whereClause = cursor ? {
      AND: [
        { authorId: userId },
        { isDraft: false },
        { createdAt: { lt: new Date(cursor) } }
      ]
    } : { 
      authorId: userId,
      isDraft: false 
    };

    return await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async createPost(authorId: string, post: InsertPost): Promise<Post> {
    return await prisma.post.create({
      data: {
        ...post,
        authorId,
        tags: post.tags || []
      }
    });
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    try {
      const post = await prisma.post.update({
        where: { id },
        data: updates
      });
      return post;
    } catch (error) {
      return undefined;
    }
  }

  async likePost(userId: string, postId: string): Promise<void> {
    try {
      await prisma.like.create({
        data: { userId, postId }
      });
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } }
      });
    } catch (error) {
      // Ignore duplicate likes (unique constraint violation)
    }
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    try {
      await prisma.like.delete({
        where: {
          userId_postId: { userId, postId }
        }
      });
      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } }
      });
    } catch (error) {
      // Ignore if like doesn't exist
    }
  }

  async savePost(userId: string, postId: string): Promise<void> {
    try {
      await prisma.save.create({
        data: { userId, postId }
      });
      await prisma.post.update({
        where: { id: postId },
        data: { savesCount: { increment: 1 } }
      });
    } catch (error) {
      // Ignore duplicate saves
    }
  }

  async unsavePost(userId: string, postId: string): Promise<void> {
    try {
      await prisma.save.delete({
        where: {
          userId_postId: { userId, postId }
        }
      });
      await prisma.post.update({
        where: { id: postId },
        data: { savesCount: { decrement: 1 } }
      });
    } catch (error) {
      // Ignore if save doesn't exist
    }
  }

  async addComment(postId: string, authorId: string, comment: InsertComment): Promise<Comment> {
    const newComment = await prisma.comment.create({
      data: {
        ...comment,
        postId,
        authorId
      }
    });
    
    await prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } }
    });

    return newComment;
  }

  async getComments(postId: string): Promise<Array<Comment & { author: User }>> {
    return await prisma.comment.findMany({
      where: { postId },
      include: { author: true },
      orderBy: { createdAt: 'asc' }
    });
  }

  async followUser(followerId: string, followingId: string): Promise<void> {
    try {
      await prisma.follow.create({
        data: { followerId, followingId }
      });
      
      await prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { increment: 1 } }
      });
      
      await prisma.user.update({
        where: { id: followingId },
        data: { followersCount: { increment: 1 } }
      });
    } catch (error) {
      // Ignore duplicate follows
    }
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    try {
      await prisma.follow.delete({
        where: {
          followerId_followingId: { followerId, followingId }
        }
      });
      
      await prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { decrement: 1 } }
      });
      
      await prisma.user.update({
        where: { id: followingId },
        data: { followersCount: { decrement: 1 } }
      });
    } catch (error) {
      // Ignore if follow doesn't exist
    }
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId }
      }
    });
    return !!follow;
  }

  async getJobs(query?: string, tags?: string[], remote?: boolean, level?: string, cursor?: string, limit: number = 20): Promise<Job[]> {
    const whereClause: any = {};

    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { company: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (remote !== undefined) {
      whereClause.remote = remote;
    }

    if (level) {
      whereClause.level = level;
    }

    if (cursor) {
      whereClause.postedAt = { lt: new Date(cursor) };
    }

    return await prisma.job.findMany({
      where: whereClause,
      orderBy: { postedAt: 'desc' },
      take: limit
    });
  }

  async getJob(id: string): Promise<Job | undefined> {
    const job = await prisma.job.findUnique({
      where: { id }
    });
    return job || undefined;
  }

  async saveJob(userId: string, jobId: string): Promise<void> {
    // Implementation could create a saved jobs table
    // For now, we'll just create a notification or system entry
  }

  async getMessageThreads(userId: string): Promise<Array<MessageThread & { otherUser: User, lastMessage?: Message }>> {
    const threads = await prisma.messageThread.findMany({
      where: {
        OR: [
          { userAId: userId },
          { userBId: userId }
        ]
      },
      include: {
        userA: true,
        userB: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return threads.map(thread => {
      const otherUser = thread.userAId === userId ? thread.userB : thread.userA;
      return {
        ...thread,
        otherUser,
        lastMessage: thread.messages[0] || undefined
      };
    });
  }

  async createMessageThread(userAId: string, userBId: string): Promise<MessageThread> {
    return await prisma.messageThread.create({
      data: { userAId, userBId }
    });
  }

  async getOrCreateMessageThread(userAId: string, userBId: string): Promise<MessageThread> {
    // Try to find existing thread (either direction)
    let thread = await prisma.messageThread.findFirst({
      where: {
        OR: [
          { userAId, userBId },
          { userAId: userBId, userBId: userAId }
        ]
      }
    });

    if (!thread) {
      thread = await this.createMessageThread(userAId, userBId);
    }

    return thread;
  }

  async getMessages(threadId: string, userId: string): Promise<Message[]> {
    // Mark messages as read for this user
    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId }
    });

    if (thread) {
      if (thread.userAId === userId) {
        await prisma.messageThread.update({
          where: { id: threadId },
          data: { unreadForUserA: 0 }
        });
      } else {
        await prisma.messageThread.update({
          where: { id: threadId },
          data: { unreadForUserB: 0 }
        });
      }
    }

    return await prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async sendMessage(threadId: string, senderId: string, message: InsertMessage): Promise<Message> {
    const newMessage = await prisma.message.create({
      data: {
        ...message,
        threadId,
        senderId
      }
    });

    // Update thread timestamp and unread counts
    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId }
    });

    if (thread) {
      const updates: any = { updatedAt: new Date() };
      
      if (thread.userAId === senderId) {
        updates.unreadForUserB = { increment: 1 };
      } else {
        updates.unreadForUserA = { increment: 1 };
      }
      
      await prisma.messageThread.update({
        where: { id: threadId },
        data: updates
      });
    }

    return newMessage;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createNotification(userId: string, type: string, data: Record<string, any>): Promise<void> {
    await prisma.notification.create({
      data: {
        userId,
        type: type as any,
        data: data || {}
      }
    });
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true }
    });
  }

  async getSystemValue(key: string): Promise<any> {
    const result = await prisma.portalSystem.findUnique({
      where: { key }
    });
    return result?.value;
  }

  async setSystemValue(key: string, value: any): Promise<void> {
    await prisma.portalSystem.upsert({
      where: { key },
      update: { value: value || {} },
      create: { key, value: value || {} }
    });
  }
}

export const storage = new DatabaseStorage();