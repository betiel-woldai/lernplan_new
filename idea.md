## Entwicklungsanleitung: Interaktive Lernplattform "Lernplaner"

Develop an interactive learning management platform accessible via web and mobile interfaces. Users must register, verify accounts, and access their personalized learning dashboard with gamification elements.

### Core Features

**Dashboard Overview Page**
- **Statistics Cards**: 
  - Daily Learning Time Tracker
  - Completed Tasks Counter
  - Learning Streak Monitor
  - Level Progress with XP System
- **Calendar Integration**: Monthly view with subject-specific color coding
- **Daily Learning Plan**: Time-blocked schedule with subject details and progress tracking

**Subject Management System**
- Create and manage multiple subjects (Fächer)
- Assign color codes for visual organization
- Set learning goals and time allocations
- Track completion status per session

**Progress Tracking Module**
- Real-time progress updates across all components
- Level-based gamification (Level 1-99)
- Achievement system with streak counting
- Visual progress bars and percentage displays

### Technology Stack

**Frontend**
- **Framework**: Next.js 14 using App Router
- **Libraries**: React, NextAuth for authentication, shadcn-ui, Tailwind CSS, Lucide Icons, Framer Motion
- **State Management**: Zustand for global state synchronization
- **Calendar**: React Big Calendar or custom implementation


**Backend**
- **Framework**: Node.js with Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Real-time Updates**: Server-Sent Events or WebSockets for live progress sync
- **Caching**: Redis for session management and streak tracking

### Data Synchronization
- **Unified Data Model**: When subjects are created, they automatically populate in:
  - Dashboard statistics
  - Calendar events
  - Progress tracking
  - Daily learning plans
- **API Endpoints**: RESTful APIs for CRUD operations on subjects, sessions, and user progress
- **Real-time Sync**: Instant updates across all components when learning sessions are completed