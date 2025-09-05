import { PrismaClient } from '@prisma/client';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const prisma = new PrismaClient();
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  console.log("Starting database seeding...");

  // Create users
  const users = [
    {
      email: "portal@portal.com",
      username: "portal",
      password: await hashPassword("portal123"),
      bio: "Official Portal account - Welcome to the community!",
      avatarUrl: null,
    },
    {
      email: "alex@example.com",
      username: "alexchen",
      password: await hashPassword("password123"),
      bio: "Senior Full-Stack Developer passionate about React and Node.js. Building scalable applications.",
      avatarUrl: null,
    },
    {
      email: "sarah@example.com", 
      username: "sarahmarketing",
      password: await hashPassword("password123"),
      bio: "Digital marketing strategist helping brands grow through data-driven campaigns.",
      avatarUrl: null,
    },
    {
      email: "mike@example.com",
      username: "mikefinance", 
      password: await hashPassword("password123"),
      bio: "Financial analyst and crypto enthusiast. Sharing insights on market trends.",
      avatarUrl: null,
    },
    {
      email: "jennifer@example.com",
      username: "jenniferdev",
      password: await hashPassword("password123"), 
      bio: "Full-stack developer passionate about React and TypeScript. Building the future one component at a time.",
      avatarUrl: null,
    },
    {
      email: "david@example.com",
      username: "daviddesign",
      password: await hashPassword("password123"),
      bio: "UX/UI Designer creating beautiful and intuitive user experiences for web and mobile.",
      avatarUrl: null,
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData,
    });
    createdUsers.push(user);
  }

  console.log(`Created ${createdUsers.length} users`);

  // Portal Official follows all other users
  const portalOfficial = createdUsers[0];
  for (let i = 1; i < createdUsers.length; i++) {
    await prisma.follow.create({
      data: {
        followerId: portalOfficial.id,
        followingId: createdUsers[i].id,
      },
    });
    
    // Update follower counts
    await prisma.user.update({
      where: { id: portalOfficial.id },
      data: { followingCount: { increment: 1 } },
    });
    
    await prisma.user.update({
      where: { id: createdUsers[i].id },
      data: { followersCount: { increment: 1 } },
    });
  }

  // Create some mutual follows
  const followPairs = [
    [1, 2], // alex follows sarah
    [2, 1], // sarah follows alex
    [3, 4], // mike follows jennifer
    [4, 3], // jennifer follows mike
  ];

  for (const [followerIdx, followingIdx] of followPairs) {
    await prisma.follow.create({
      data: {
        followerId: createdUsers[followerIdx].id,
        followingId: createdUsers[followingIdx].id,
      },
    });
    
    await prisma.user.update({
      where: { id: createdUsers[followerIdx].id },
      data: { followingCount: { increment: 1 } },
    });
    
    await prisma.user.update({
      where: { id: createdUsers[followingIdx].id },
      data: { followersCount: { increment: 1 } },
    });
  }

  console.log("Set up user follows");

  // Create posts with varied timestamps over the last 30 days
  const categories = ['Tech', 'Marketing', 'Finance', 'Design', 'Operations'];
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

  const posts = [
    {
      authorId: createdUsers[1].id, // alexchen
      title: "The Future of Remote Development Tools",
      description: "Exploring how AI-powered IDEs are transforming the way we write code and collaborate in distributed teams...",
      body: "Remote development has evolved significantly over the past few years. With the integration of AI-powered tools, developers can now collaborate more effectively than ever before. This post explores the key trends and technologies shaping the future of remote development.\n\nFrom intelligent code completion to real-time collaboration features, modern IDEs are becoming increasingly sophisticated. The impact on productivity and code quality has been remarkable.",
      tags: ["AI", "Remote Work", "Development"],
      category: "Tech",
      sponsored: false,
      isDraft: false,
      createdAt: new Date(now.getTime() - Math.random() * (now.getTime() - thirtyDaysAgo.getTime())),
    },
    {
      authorId: createdUsers[2].id, // sarahmarketing  
      title: "Master Data-Driven Marketing in 2024",
      description: "Learn the strategies top companies use to convert data into actionable marketing insights. Join our free webinar next week!",
      body: "Data-driven marketing is no longer optional—it's essential for business success. In this comprehensive guide, we'll explore the key strategies that leading companies use to leverage data for marketing excellence.\n\nFrom customer segmentation to predictive analytics, discover how to transform raw data into powerful marketing insights that drive growth and engagement.",
      tags: ["Analytics", "Growth"], 
      category: "Marketing",
      sponsored: true,
      isDraft: false,
      createdAt: new Date(now.getTime() - Math.random() * (now.getTime() - thirtyDaysAgo.getTime())),
    },
    {
      authorId: createdUsers[3].id, // mikefinance
      title: "Understanding Crypto Market Volatility", 
      description: "A deep dive into the factors that drive cryptocurrency price movements and how institutional adoption is changing the game...",
      body: "Cryptocurrency markets are notoriously volatile, but understanding the underlying factors can help investors make more informed decisions. This analysis examines the key drivers of crypto price movements.\n\nFrom regulatory announcements to institutional adoption, we'll explore how various factors contribute to market volatility and what this means for the future of digital assets.",
      tags: ["Cryptocurrency", "Market Analysis"],
      category: "Finance", 
      sponsored: false,
      isDraft: false,
      createdAt: new Date(now.getTime() - Math.random() * (now.getTime() - thirtyDaysAgo.getTime())),
    },
    {
      authorId: createdUsers[4].id, // jenniferdev
      title: "Getting Started with TypeScript",
      description: "A comprehensive guide to adopting TypeScript in your existing JavaScript projects. Learn the benefits and best practices...",
      body: "TypeScript has become an essential tool for modern JavaScript development. This guide will walk you through the process of adopting TypeScript in your existing projects.\n\nWe'll cover the key benefits, common challenges, and best practices for a smooth transition. Whether you're working on a small project or a large-scale application, TypeScript can significantly improve your development experience.",
      tags: ["TypeScript", "JavaScript", "Tutorial"],
      category: "Tech",
      sponsored: false, 
      isDraft: false,
      createdAt: new Date(now.getTime() - Math.random() * (now.getTime() - thirtyDaysAgo.getTime())),
    },
    {
      authorId: createdUsers[4].id, // jenniferdev
      title: "Remote Work Best Practices",
      description: "After 3 years of remote work, here are the strategies that have helped me maintain productivity and work-life balance...",
      body: "Remote work has become the new normal for many developers and professionals. After three years of working remotely, I've learned valuable lessons about maintaining productivity and work-life balance.\n\nIn this post, I'll share the strategies and tools that have helped me thrive in a remote work environment, from setting up an effective workspace to managing communication with distributed teams.",
      tags: ["Remote Work", "Productivity", "Tips"],
      category: "Operations",
      sponsored: false,
      isDraft: false, 
      createdAt: new Date(now.getTime() - Math.random() * (now.getTime() - thirtyDaysAgo.getTime())),
    },
    {
      authorId: createdUsers[5].id, // daviddesign
      title: "Design Systems That Scale",
      description: "Building consistent and maintainable design systems for growing product teams...",
      body: "Design systems are crucial for maintaining consistency and efficiency in product development. This guide explores how to build design systems that can scale with your organization.\n\nFrom component libraries to design tokens, we'll cover the essential elements of a successful design system and how to implement them effectively across teams.",
      tags: ["Design Systems", "UI/UX", "Scalability"],
      category: "Design",
      sponsored: false,
      isDraft: false,
      createdAt: new Date(now.getTime() - Math.random() * (now.getTime() - thirtyDaysAgo.getTime())),
    },
  ];

  // Add more posts to reach ~30
  for (let i = 0; i < 24; i++) {
    const randomAuthor = createdUsers[Math.floor(Math.random() * (createdUsers.length - 1)) + 1]; // Exclude Portal Official
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    posts.push({
      authorId: randomAuthor.id,
      title: `Professional Insights #${i + 7}`,
      description: `Expert analysis and industry insights from ${randomAuthor.username}...`,
      body: `This is a sample post with professional content about ${randomCategory.toLowerCase()}. It contains valuable insights and practical advice for professionals in the field.\n\nThe content covers important topics, best practices, and emerging trends that are relevant to today's professional landscape.`,
      tags: [randomCategory, "Insights", "Professional"],
      category: randomCategory,
      sponsored: Math.random() > 0.8, // 20% chance of being sponsored
      isDraft: false,
      createdAt: new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime())),
    });
  }

  const createdPosts = [];
  for (const postData of posts) {
    const post = await prisma.post.create({
      data: postData,
    });
    createdPosts.push(post);
  }

  console.log(`Created ${createdPosts.length} posts`);

  // Create interactions (likes, comments, saves) with varied counts
  for (const post of createdPosts) {
    // Random likes (0-50)
    const likeCount = Math.floor(Math.random() * 50);
    const likerIds = new Set();
    
    for (let i = 0; i < likeCount; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      if (randomUser.id !== post.authorId && !likerIds.has(randomUser.id)) {
        likerIds.add(randomUser.id);
        try {
          await prisma.like.create({
            data: {
              userId: randomUser.id,
              postId: post.id,
            },
          });
        } catch (e) {
          // Ignore duplicate likes
        }
      }
    }

    // Update likes count
    await prisma.post.update({
      where: { id: post.id },
      data: { likesCount: likerIds.size },
    });

    // Random saves (0-20)
    const saveCount = Math.floor(Math.random() * 20);
    const saverIds = new Set();
    
    for (let i = 0; i < saveCount; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      if (!saverIds.has(randomUser.id)) {
        saverIds.add(randomUser.id);
        try {
          await prisma.save.create({
            data: {
              userId: randomUser.id,
              postId: post.id,
            },
          });
        } catch (e) {
          // Ignore duplicate saves
        }
      }
    }

    // Update saves count
    await prisma.post.update({
      where: { id: post.id },
      data: { savesCount: saverIds.size },
    });

    // Random comments (0-10)
    const commentCount = Math.floor(Math.random() * 10);
    let actualComments = 0;
    
    for (let i = 0; i < commentCount; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      if (randomUser.id !== post.authorId) {
        await prisma.comment.create({
          data: {
            postId: post.id,
            authorId: randomUser.id,
            body: `Great insights! This really helped me understand ${post.category.toLowerCase()} better.`,
          },
        });
        actualComments++;
      }
    }

    // Update comments count
    await prisma.post.update({
      where: { id: post.id },
      data: { commentsCount: actualComments },
    });
  }

  console.log("Created post interactions");

  // Create jobs
  const jobsData = [
    {
      title: "Senior React Developer",
      company: "TechFlow Inc.",
      location: "San Francisco, CA",
      salaryRange: "$120k - $180k",
      tags: ["React", "TypeScript", "Node.js"],
      level: "Senior",
      remote: true,
      blurb: "Join our innovative team building next-generation web applications. We're looking for a passionate developer with 5+ years of React experience to lead our frontend initiatives.",
      applyUrl: "https://example.com/apply/senior-react-dev"
    },
    {
      title: "Product Marketing Manager", 
      company: "Growth Labs",
      location: "New York, NY",
      salaryRange: "$90k - $130k", 
      tags: ["Marketing", "Analytics", "Growth"],
      level: "Mid Level",
      remote: false,
      blurb: "Drive go-to-market strategies for our SaaS platform. Lead product launches, analyze market trends, and work closely with product and sales teams.",
      applyUrl: "https://example.com/apply/product-marketing-manager"
    },
    {
      title: "UX Designer",
      company: "Design Studio Co.",
      location: "Austin, TX", 
      salaryRange: "$80k - $110k",
      tags: ["Figma", "Research", "Prototyping"],
      level: "Mid Level", 
      remote: false,
      blurb: "Create exceptional user experiences for our mobile and web applications. Conduct user research, design wireframes, and collaborate with development teams.",
      applyUrl: "https://example.com/apply/ux-designer"
    },
    {
      title: "DevOps Engineer",
      company: "CloudScale Systems",
      location: "Seattle, WA",
      salaryRange: "$110k - $160k",
      tags: ["AWS", "Kubernetes", "Docker"],
      level: "Senior",
      remote: true,
      blurb: "Build and maintain scalable cloud infrastructure. Work with cutting-edge technologies to support high-traffic applications.",
      applyUrl: "https://example.com/apply/devops-engineer"
    },
    {
      title: "Data Scientist",
      company: "Analytics Pro",
      location: "Boston, MA", 
      salaryRange: "$100k - $150k",
      tags: ["Python", "Machine Learning", "Statistics"],
      level: "Mid Level",
      remote: true,
      blurb: "Use data science to solve complex business problems. Build predictive models and generate actionable insights from large datasets.",
      applyUrl: "https://example.com/apply/data-scientist"
    }
  ];

  for (const jobData of jobsData) {
    await prisma.job.create({
      data: jobData,
    });
  }

  console.log(`Created ${jobsData.length} jobs`);

  // Create welcome message threads from Portal Official to all new users
  for (let i = 1; i < createdUsers.length; i++) {
    const thread = await prisma.messageThread.create({
      data: {
        userAId: portalOfficial.id,
        userBId: createdUsers[i].id,
      },
    });
    
    await prisma.message.create({
      data: {
        threadId: thread.id,
        senderId: portalOfficial.id,
        body: `Welcome to Portal! We're excited to have you join our community of professionals. Feel free to explore, share your insights, and connect with others in your field. If you have any questions, don't hesitate to reach out!`,
      },
    });

    // Mark as unread for the recipient
    await prisma.messageThread.update({
      where: { id: thread.id },
      data: { unreadForUserB: 1 },
    });
  }

  // Create some additional message threads
  const additionalThreads = [
    { userAIdx: 1, userBIdx: 2, message: "Thanks for sharing your insights on data-driven marketing!" },
    { userAIdx: 3, userBIdx: 4, message: "Great post about React development tools!" },
  ];

  for (const { userAIdx, userBIdx, message } of additionalThreads) {
    const thread = await prisma.messageThread.create({
      data: {
        userAId: createdUsers[userAIdx].id,
        userBId: createdUsers[userBIdx].id,
      },
    });
    
    await prisma.message.create({
      data: {
        threadId: thread.id,
        senderId: createdUsers[userAIdx].id,
        body: message,
      },
    });

    // Mark as unread for the recipient
    await prisma.messageThread.update({
      where: { id: thread.id },
      data: { unreadForUserB: 1 },
    });
  }

  console.log("Created message threads and welcome messages");

  // Create system notifications
  for (let i = 1; i < createdUsers.length; i++) {
    await prisma.notification.create({
      data: {
        userId: createdUsers[i].id,
        type: 'SYSTEM',
        data: {
          message: 'Welcome to Portal! Start by creating your first post or exploring the community.',
          type: 'welcome'
        },
      },
    });
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
