# Portal - Professional Social Network

## Overview
Portal is a professional social networking application built with modern web technologies. It provides a platform for professionals to share content, discover job opportunities, engage in conversations, and build their professional network. The application features a clean, mobile-first design with comprehensive social features including posts, comments, likes, direct messaging, job listings, and user profiles.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript and Vite for fast development and building. The application uses a component-based architecture with the following key decisions:

- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessibility and consistency
- **Styling**: Tailwind CSS with a blue accent color scheme and neutral base colors
- **State Management**: TanStack Query for server state management and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod schema validation
- **Authentication**: Protected route pattern with localStorage token storage

### Backend Architecture
The backend follows a traditional Express.js server architecture with the following components:

- **Server Framework**: Express.js with TypeScript for type safety
- **Authentication**: Passport.js with local strategy using bcrypt for password hashing
- **Session Management**: Express sessions with memory store for development
- **API Design**: RESTful endpoints organized by resource type
- **AI Integration**: Optional OpenAI integration with fallback to deterministic responses

### Data Storage Solutions
The application uses SQLite as the primary database with Drizzle ORM for type-safe database operations:

- **Database**: SQLite for simplicity and portability
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for schema management
- **Data Models**: Comprehensive schema covering users, posts, social interactions, messaging, jobs, and notifications

### Authentication and Authorization
Simple session-based authentication system designed for demo purposes:

- **Registration**: Email, username, and password with basic validation
- **Login**: Username/password authentication with bcrypt verification
- **Session Management**: Server-side sessions with client-side token storage
- **Route Protection**: Client-side route guards that redirect unauthenticated users

### Core Features
- **Social Feed**: Trending and recent post sorting with engagement metrics
- **Content Creation**: Rich post composer with AI assistance for writing
- **Job Platform**: Job listings with filtering and application tracking
- **Messaging System**: Direct messaging between users with unread indicators
- **Notification System**: Real-time notifications for social interactions
- **User Profiles**: Comprehensive profiles with follower/following relationships

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connection (configured for PostgreSQL but using SQLite)
- **drizzle-orm**: Type-safe ORM for database operations
- **passport & passport-local**: Authentication middleware
- **bcrypt**: Password hashing (via Node.js crypto module)
- **express-session**: Session management

### Frontend Dependencies
- **React & React DOM**: Core UI library
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **wouter**: Lightweight routing
- **date-fns**: Date formatting and manipulation

### UI Components
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **TypeScript**: Type safety across the application
- **Vite**: Fast development server and build tool
- **Zod**: Schema validation for forms and API data
- **shadcn/ui**: Pre-built component library built on Radix UI

### Optional Integrations
- **OpenAI API**: AI-powered content assistance (with fallback responses when API key not available)