import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

const portalOfficialId = "portal-official";

async function seedDatabase() {
  console.log("Starting database seeding...");

  // Create Portal Official account if it doesn't exist
  const existingOfficial = await storage.getUser(portalOfficialId);
  if (!existingOfficial) {
    console.log("Creating Portal Official account...");
    const hashedPassword = await hashPassword("portal123");
    
    await storage.createUser({
      email: "official@portal.com",
      username: "Portal",
      password: hashedPassword,
      bio: "Official Portal account - your professional networking companion 🚀",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Portal&backgroundColor=3b82f6"
    });
    console.log("✓ Portal Official account created");
  }

  // Create sample users
  const users = [
    {
      email: "sarah.johnson@example.com",
      username: "sarah_johnson",
      password: await hashPassword("password123"),
      bio: "Senior Software Engineer passionate about React and TypeScript. Building amazing user experiences one component at a time.",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=f3f4f6"
    },
    {
      email: "michael.chen@example.com", 
      username: "michael_chen",
      password: await hashPassword("password123"),
      bio: "Product Manager & Tech Enthusiast. Love turning ideas into products that users adore. Always learning something new!",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael&backgroundColor=ddd6fe"
    },
    {
      email: "alex.smith@example.com",
      username: "alex_smith", 
      password: await hashPassword("password123"),
      bio: "Full-stack developer specializing in modern web technologies. Open source contributor and coffee enthusiast ☕",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex&backgroundColor=fef3c7"
    },
    {
      email: "jessica.wang@example.com",
      username: "jessica_wang",
      password: await hashPassword("password123"), 
      bio: "UX Designer creating intuitive digital experiences. Advocate for user-centered design and accessibility.",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=jessica&backgroundColor=fce7f3"
    },
    {
      email: "david.rodriguez@example.com",
      username: "david_rodriguez",
      password: await hashPassword("password123"),
      bio: "DevOps Engineer automating the world one script at a time. Kubernetes, Docker, and cloud infrastructure expert.",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=david&backgroundColor=dcfce7"
    }
  ];

  console.log("Creating sample users...");
  const createdUsers = [];
  for (const userData of users) {
    const existingUser = await storage.getUserByUsername(userData.username);
    if (!existingUser) {
      const user = await storage.createUser(userData);
      createdUsers.push(user);
      console.log(`✓ Created user: ${userData.username}`);
    } else {
      createdUsers.push(existingUser);
    }
  }

  // Create sample posts
  console.log("Creating sample posts...");
  const posts = [
    {
      authorIndex: 0,
      title: "Building Scalable React Applications in 2024",
      description: "Key patterns and best practices I've learned from building enterprise-grade React apps",
      body: `After working on several large-scale React applications, I've identified some crucial patterns that make the difference between a maintainable codebase and a nightmare. These patterns have saved our team countless hours and prevented major technical debt accumulation. Through trial and error across multiple enterprise projects, we've learned that architectural decisions made early have profound impacts on long-term maintainability. The key is finding the right balance between simplicity and scalability. I've seen too many projects start simple and end up as unmaintainable messes because they didn't plan for growth. Here's what we've learned works consistently across different team sizes and project complexities.

## 1. Component Composition over Inheritance
Instead of creating giant components, break them down into smaller, composable pieces. This makes testing easier and improves reusability.

## 2. Custom Hooks for Logic Separation
Extract business logic into custom hooks. This keeps your components clean and makes the logic testable in isolation.

## 3. Proper State Management
Don't reach for Redux immediately. Start with useState and useContext, then scale up as needed.

## 4. Performance Considerations
Use React.memo wisely, implement proper memoization with useMemo and useCallback, and consider code splitting for better bundle sizes.

What patterns have you found most effective in your React projects?`,
      tags: ["React", "JavaScript", "Frontend", "Best Practices"],
      category: "Technology"
    },
    {
      authorIndex: 1,
      title: "The Art of Product Discovery: Finding What Users Actually Want",
      description: "How to conduct effective user research and turn insights into actionable product decisions",
      body: `Product discovery is often the most overlooked phase of product development, yet it's the most critical for success.

## Why Most Products Fail
72% of new products fail because they solve problems nobody has. The issue isn't execution—it's building the wrong thing.

## The Discovery Framework I Use
1. **Problem Interviews**: Talk to users about their current pain points
2. **Solution Validation**: Test concepts before building
3. **Usability Testing**: Validate the experience early and often
4. **Data Analysis**: Let user behavior guide decisions

## Key Insights from Recent Projects
- Users don't always know what they want, but they know what frustrates them
- The first solution is rarely the best solution
- Small improvements to existing workflows often beat revolutionary new features

## Questions That Changed Everything
Instead of asking "Would you use this?" ask "How do you currently solve this problem?"

The goal isn't to build what users ask for—it's to solve the problems they actually have.`,
      tags: ["Product Management", "User Research", "Strategy"],
      category: "Business"
    },
    {
      authorIndex: 2,
      title: "My Journey from Junior to Senior Developer: Lessons Learned",
      description: "Reflecting on 5 years of growth, mistakes, and breakthrough moments in software development",
      body: `Five years ago, I was a junior developer who thought knowing the syntax was enough. Here's what I wish I knew then.

## Technical Skills vs. Problem-Solving
Early on, I focused on learning every framework and tool. Now I realize the most valuable skill is breaking down complex problems into manageable pieces.

## Code Quality Matters More Than Speed
I used to pride myself on shipping features quickly. But technical debt always catches up. Writing clean, maintainable code is an investment in your future self.

## Communication is a Superpower
The best developers I know aren't necessarily the most technically gifted—they're the ones who can explain complex concepts clearly and collaborate effectively.

## Learning Never Stops
The moment you think you've "made it" is the moment you start falling behind. Stay curious, experiment with new technologies, and don't be afraid to admit when you don't know something.

## Failure is Your Friend
Every bug, every failed project, every frustrated stakeholder taught me something valuable. Embrace the mistakes—they're the best teachers you'll ever have.

## What's Next?
Currently diving deep into system design and mentoring junior developers. The cycle continues!

What's the most valuable lesson you've learned in your development journey?`,
      tags: ["Career Development", "Software Engineering", "Personal Growth"],
      category: "Career"
    },
    {
      authorIndex: 3,
      title: "Designing for Accessibility: Beyond Compliance",
      description: "Creating truly inclusive digital experiences that work for everyone",
      body: `Accessibility isn't just about compliance—it's about creating better experiences for all users.

## The Business Case for Accessibility
- 15% of the global population has a disability
- Accessible design often improves usability for everyone
- It's the right thing to do

## Beyond the Checklist
While WCAG guidelines are important, true accessibility thinking goes deeper:

### Cognitive Load
- Simplify complex workflows
- Provide clear feedback and error messages
- Use familiar patterns and conventions

### Motor Accessibility
- Ensure touch targets are large enough (44px minimum)
- Don't rely on hover states for critical functionality
- Provide keyboard alternatives for all interactions

### Visual Design
- Use sufficient color contrast (4.5:1 for normal text)
- Don't rely on color alone to convey information
- Design for different zoom levels

## Testing with Real Users
The best way to validate accessibility is testing with users who have disabilities. Their insights often reveal issues that automated tools miss.

## Tools I Recommend
- axe DevTools for automated testing
- NVDA/JAWS for screen reader testing
- Stark for design contrast checking

Remember: Accessibility is not a feature to add later—it should be considered from the very beginning of the design process.`,
      tags: ["UX Design", "Accessibility", "Inclusive Design"],
      category: "Design"
    },
    {
      authorIndex: 4,
      title: "Kubernetes in Production: Hard-Won Lessons",
      description: "What I learned from running Kubernetes clusters in production for 3 years",
      body: `Three years ago, our team decided to migrate to Kubernetes. Here's what we learned the hard way.

## The Good
- Horizontal scaling became trivial
- Zero-downtime deployments are now the norm
- Resource utilization improved by 40%
- Development and production parity increased significantly

## The Challenges
- Complexity increased dramatically
- Debugging became more difficult
- Initial setup took 6 months longer than expected
- Monitoring and observability required complete overhaul

## Key Lessons

### Start Simple
Don't try to implement every Kubernetes feature from day one. Start with basic deployments and services, then gradually add complexity.

### Invest in Observability Early
You can't debug what you can't see. Implement comprehensive logging, metrics, and tracing before you need them.

### Automate Everything
Manual processes don't scale with Kubernetes. Invest in GitOps, automated testing, and infrastructure as code.

### Plan for Failure
Kubernetes makes failure more common but less catastrophic. Design your applications to handle restarts, network partitions, and resource constraints gracefully.

## Tools That Saved Us
- Helm for package management
- Prometheus + Grafana for monitoring
- ArgoCD for GitOps
- Istio for service mesh (added later)

## Would I Do It Again?
Absolutely, but with better planning and realistic timelines. Kubernetes isn't magic—it's a powerful tool that requires significant investment to use effectively.

What's your experience with Kubernetes? What would you do differently?`,
      tags: ["DevOps", "Kubernetes", "Infrastructure", "Production"],
      category: "Technology"
    }
  ];

  for (let i = 0; i < posts.length; i++) {
    const postData = posts[i];
    const author = createdUsers[postData.authorIndex];
    
    if (author) {
      await storage.createPost(author.id, {
        title: postData.title,
        description: postData.description,
        body: postData.body,
        tags: postData.tags,
        category: postData.category,
        sponsored: false,
        isDraft: false
      });
      console.log(`✓ Created post: ${postData.title}`);
    }
  }

  // Create sample jobs
  console.log("Creating sample jobs...");
  const jobs = [
    {
      title: "Senior React Developer",
      company: "TechStart Inc.",
      location: "San Francisco, CA",
      salaryRange: "$120,000 - $160,000",
      tags: ["React", "TypeScript", "Next.js", "GraphQL"],
      level: "Senior",
      remote: true,
      blurb: "Join our growing team to build the next generation of developer tools. We're looking for an experienced React developer who is passionate about creating exceptional user experiences.",
      applyUrl: "https://techstart.com/careers/senior-react-dev"
    },
    {
      title: "Product Manager - Growth",
      company: "ScaleUp Co.",
      location: "New York, NY", 
      salaryRange: "$100,000 - $140,000",
      tags: ["Product Strategy", "Growth", "Analytics", "A/B Testing"],
      level: "Mid-Level",
      remote: false,
      blurb: "Drive product growth through data-driven decision making. You'll work closely with engineering and design teams to optimize user acquisition and retention.",
      applyUrl: "https://scaleup.com/jobs/product-manager-growth"
    },
    {
      title: "DevOps Engineer",
      company: "CloudNative Solutions",
      location: "Austin, TX",
      salaryRange: "$110,000 - $150,000",
      tags: ["Kubernetes", "AWS", "Terraform", "Docker"],
      level: "Senior",
      remote: true,
      blurb: "Help us build and maintain scalable cloud infrastructure. Looking for someone with deep expertise in Kubernetes and modern DevOps practices.",
      applyUrl: "https://cloudnative.com/careers/devops-engineer"
    },
    {
      title: "UX Designer",
      company: "Design Forward",
      location: "Seattle, WA",
      salaryRange: "$85,000 - $115,000", 
      tags: ["Figma", "User Research", "Prototyping", "Design Systems"],
      level: "Mid-Level",
      remote: true,
      blurb: "Create beautiful and intuitive user experiences for our B2B SaaS platform. You'll conduct user research and translate insights into compelling designs.",
      applyUrl: "https://designforward.com/jobs/ux-designer"
    },
    {
      title: "Full Stack Engineer",
      company: "Startup Labs",
      location: "Remote",
      salaryRange: "$90,000 - $130,000",
      tags: ["Node.js", "React", "PostgreSQL", "GraphQL"],
      level: "Mid-Level", 
      remote: true,
      blurb: "Build end-to-end features for our fast-growing platform. You'll work across the entire stack and have significant impact on product direction.",
      applyUrl: "https://startuplabs.com/careers/fullstack-engineer"
    },
    {
      title: "Data Scientist",
      company: "AI Innovations",
      location: "Boston, MA",
      salaryRange: "$120,000 - $170,000",
      tags: ["Python", "Machine Learning", "TensorFlow", "SQL"],
      level: "Senior",
      remote: false,
      blurb: "Apply machine learning to solve complex business problems. You'll work with large datasets and deploy models that directly impact our product recommendations.",
      applyUrl: "https://aiinnovations.com/jobs/data-scientist"
    }
  ];

  // Create jobs using Prisma directly since createJob doesn't exist in storage
  console.log("Creating sample jobs...");
  const { prisma } = storage as any; // Access prisma instance
  
  for (const jobData of jobs) {
    await prisma.job.create({
      data: {
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        salaryRange: jobData.salaryRange,
        tags: jobData.tags,
        level: jobData.level,
        remote: jobData.remote,
        blurb: jobData.blurb,
        applyUrl: jobData.applyUrl
      }
    });
    console.log(`✓ Created job: ${jobData.title} at ${jobData.company}`);
  }

  // Create some sample follows between users
  console.log("Creating sample follows...");
  if (createdUsers.length >= 3) {
    // Have first user follow second and third
    await storage.followUser(createdUsers[0].id, createdUsers[1].id);
    await storage.followUser(createdUsers[0].id, createdUsers[2].id);
    
    // Have second user follow first and third
    await storage.followUser(createdUsers[1].id, createdUsers[0].id);
    await storage.followUser(createdUsers[1].id, createdUsers[2].id);
    
    console.log("✓ Created sample follows");
  }

  // Set system values
  await storage.setSystemValue("seeded", true);
  await storage.setSystemValue("version", "1.0.0");
  
  console.log("Database seeding completed successfully!");
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };