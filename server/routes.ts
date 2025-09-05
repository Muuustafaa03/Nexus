import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { summarizeContent, rewriteContent, generateTitleSuggestions } from "./ai";
import { insertPostSchema, insertCommentSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Posts and feed endpoints
  app.get("/api/posts", async (req, res) => {
    try {
      const { sort = 'recent', cursor, limit = '20' } = req.query;
      const posts = await storage.getPostsWithAuthor(
        sort as 'trending' | 'recent', 
        cursor as string, 
        parseInt(limit as string)
      );
      res.json(posts);
    } catch (error) {
      console.error("Get posts error:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const author = await storage.getUser(post.authorId);
      const comments = await storage.getComments(post.id);
      
      res.json({ ...post, author, comments });
    } catch (error) {
      console.error("Get post error:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const postData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(req.user!.id, postData);
      
      // Check if this is the user's first published post
      if (!postData.isDraft) {
        const userPosts = await storage.getPostsByUser(req.user!.id, undefined, 1);
        if (userPosts.length === 1) { // This is their first post
          // Check if we've already sent the first-post like
          const alreadySent = await storage.getSystemValue(`first-like-sent:${req.user!.id}`);
          if (!alreadySent) {
            // Get Portal Official user
            const portalOfficial = await storage.getUserByUsername('portal');
            if (portalOfficial) {
              // Auto-like the post
              await storage.likePost(portalOfficial.id, post.id);
              
              // Create notification
              await storage.createNotification(req.user!.id, 'LIKE', {
                username: 'Portal Official',
                postTitle: post.title,
                postId: post.id
              });
              
              // Mark as sent
              await storage.setSystemValue(`first-like-sent:${req.user!.id}`, true);
            }
          }
        }
      }
      
      res.status(201).json(post);
    } catch (error) {
      console.error("Create post error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.post("/api/posts/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      await storage.likePost(req.user!.id, req.params.id);
      
      // Create notification for post author (if not self-like)
      if (post.authorId !== req.user!.id) {
        await storage.createNotification(post.authorId, 'LIKE', {
          username: req.user!.username,
          postTitle: post.title,
          postId: post.id
        });
      }
      
      res.json({ message: "Post liked" });
    } catch (error) {
      console.error("Like post error:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete("/api/posts/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      await storage.unlikePost(req.user!.id, req.params.id);
      res.json({ message: "Post unliked" });
    } catch (error) {
      console.error("Unlike post error:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  app.post("/api/posts/:id/save", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      await storage.savePost(req.user!.id, req.params.id);
      res.json({ message: "Post saved" });
    } catch (error) {
      console.error("Save post error:", error);
      res.status(500).json({ message: "Failed to save post" });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const postId = req.params.id;
      const userId = req.user.id;
      
      // Check if the post exists and user owns it
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.authorId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }
      
      // Delete the post
      await storage.deletePost(postId);
      res.json({ message: "Post deleted" });
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  app.delete("/api/posts/:id/save", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      await storage.unsavePost(req.user!.id, req.params.id);
      res.json({ message: "Post unsaved" });
    } catch (error) {
      console.error("Unsave post error:", error);
      res.status(500).json({ message: "Failed to unsave post" });
    }
  });

  app.post("/api/posts/:id/comment", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const commentData = insertCommentSchema.parse(req.body);
      const post = await storage.getPost(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const comment = await storage.addComment(req.params.id, req.user!.id, commentData);
      
      // Create notification for post author (if not self-comment)
      if (post.authorId !== req.user!.id) {
        await storage.createNotification(post.authorId, 'COMMENT', {
          username: req.user!.username,
          postTitle: post.title,
          postId: post.id,
          commentBody: commentData.body
        });
      }
      
      res.status(201).json(comment);
    } catch (error) {
      console.error("Add comment error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  // AI assistance endpoints
  app.post("/api/ai/summarize", async (req, res) => {
    try {
      const { body } = req.body;
      if (!body) {
        return res.status(400).json({ message: "Body content is required" });
      }
      
      const summary = await summarizeContent(body);
      res.json({ summary });
    } catch (error) {
      console.error("AI summarize error:", error);
      res.status(500).json({ message: "Failed to generate summary" });
    }
  });

  app.post("/api/ai/rewrite", async (req, res) => {
    try {
      const { body } = req.body;
      if (!body) {
        return res.status(400).json({ message: "Body content is required" });
      }
      
      const rewritten = await rewriteContent(body);
      res.json({ rewritten });
    } catch (error) {
      console.error("AI rewrite error:", error);
      res.status(500).json({ message: "Failed to rewrite content" });
    }
  });

  app.post("/api/ai/title", async (req, res) => {
    try {
      const { body } = req.body;
      if (!body) {
        return res.status(400).json({ message: "Body content is required" });
      }
      
      const titles = await generateTitleSuggestions(body);
      res.json({ titles });
    } catch (error) {
      console.error("AI title generation error:", error);
      res.status(500).json({ message: "Failed to generate titles" });
    }
  });

  // Jobs endpoints
  app.get("/api/jobs", async (req, res) => {
    try {
      const { query, tags, remote, level, cursor, limit = '20' } = req.query;
      const jobs = await storage.getJobs(
        query as string,
        tags ? (tags as string).split(',') : undefined,
        remote ? remote === 'true' : undefined,
        level as string,
        cursor as string,
        parseInt(limit as string)
      );
      res.json(jobs);
    } catch (error) {
      console.error("Get jobs error:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    // For demo purposes, allow job creation
    try {
      const storageAny = storage as any;
      const prisma = storageAny.prisma;
      
      if (!prisma) {
        return res.status(500).json({ message: "Database not available" });
      }
      
      const job = await prisma.job.create({
        data: {
          title: req.body.title,
          company: req.body.company,
          location: req.body.location,
          salaryRange: req.body.salaryRange,
          tags: req.body.tags || [],
          level: req.body.level,
          remote: req.body.remote || false,
          blurb: req.body.blurb,
          applyUrl: req.body.applyUrl
        }
      });
      res.status(201).json(job);
    } catch (error) {
      console.error("Create job error:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.post("/api/jobs/:id/save", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      await storage.saveJob(req.user!.id, req.params.id);
      res.json({ message: "Job saved" });
    } catch (error) {
      console.error("Save job error:", error);
      res.status(500).json({ message: "Failed to save job" });
    }
  });

  // Social endpoints
  app.post("/api/users/:id/follow", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      if (targetUser.id === req.user!.id) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }

      await storage.followUser(req.user!.id, req.params.id);
      
      // Create notification
      await storage.createNotification(req.params.id, 'FOLLOW', {
        username: req.user!.username,
        userId: req.user!.id
      });
      
      res.json({ message: "User followed" });
    } catch (error) {
      console.error("Follow user error:", error);
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete("/api/users/:id/follow", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      await storage.unfollowUser(req.user!.id, req.params.id);
      res.json({ message: "User unfollowed" });
    } catch (error) {
      console.error("Unfollow user error:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  app.get("/api/users/:username", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const posts = await storage.getPostsByUser(user.id);
      const isFollowing = req.isAuthenticated() ? 
        await storage.isFollowing(req.user!.id, user.id) : false;
      
      res.json({ 
        ...user, 
        posts, 
        isFollowing 
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Inbox endpoints
  app.get("/api/inbox/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const notifications = await storage.getNotifications(req.user!.id);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/inbox/notifications/mark-read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { id } = req.body;
      if (id) {
        await storage.markNotificationAsRead(id);
      } else {
        await storage.markAllNotificationsAsRead(req.user!.id);
      }
      res.json({ message: "Notifications marked as read" });
    } catch (error) {
      console.error("Mark notifications read error:", error);
      res.status(500).json({ message: "Failed to mark notifications as read" });
    }
  });

  app.get("/api/inbox/threads", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const threads = await storage.getMessageThreads(req.user!.id);
      res.json(threads);
    } catch (error) {
      console.error("Get message threads error:", error);
      res.status(500).json({ message: "Failed to fetch message threads" });
    }
  });

  app.post("/api/inbox/threads", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { otherUserId } = req.body;
      if (!otherUserId) {
        return res.status(400).json({ message: "Other user ID is required" });
      }

      const otherUser = await storage.getUser(otherUserId);
      if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const thread = await storage.getOrCreateMessageThread(req.user!.id, otherUserId);
      res.json(thread);
    } catch (error) {
      console.error("Create message thread error:", error);
      res.status(500).json({ message: "Failed to create message thread" });
    }
  });

  app.get("/api/inbox/threads/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const messages = await storage.getMessages(req.params.id, req.user!.id);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/inbox/threads/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.sendMessage(req.params.id, req.user!.id, messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Send message error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
