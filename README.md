# 🎓 Lernplaner - Gamified Learning Management Platform

> An interactive, gamified learning management platform that transforms studying into an engaging, trackable experience with XP systems, streaks, and intelligent scheduling.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Features

### 📊 Gamified Dashboard
- **XP & Leveling System**: Progress through levels 1-99 with experience points
- **Learning Streaks**: Track daily consistency with streak counters
- **Real-time Statistics**: Monitor daily learning time, completed tasks, and progress
- **Achievement System**: Unlock badges for milestones and marathon sessions

### 📚 Subject Management
- **Multi-Subject Support**: Create and manage multiple learning subjects
- **Smart Scheduling**: Automated time allocation based on exam dates
- **Intensity Scaling**: Automatic study intensification before exams
- **Color Coding**: Visual organization with subject-specific colors

### 📅 Intelligent Calendar
- **Monthly/Weekly Views**: Comprehensive calendar with learning sessions
- **Auto-Population**: Subjects automatically populate calendar events
- **Time-Blocked Sessions**: Structured learning blocks with progress tracking
- **Catch-Up Mode**: Intelligent rescheduling for missed sessions

### 📈 Progress Analytics
- **Visual Charts**: Track planned vs. completed hours
- **Subject Distribution**: Analyze time allocation across subjects
- **Performance Trends**: Weekly and monthly progress analytics
- **Goal Tracking**: Monitor learning objectives and milestones

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 14 (Pages Router)
- **UI Library**: React 18 + TypeScript (selective usage)
- **Styling**: Tailwind CSS + CSS Modules
- **State Management**: React Context (QuizAppContext, ChatContext)
- **HTTP Client**: Axios
- **Calendar**: Custom implementation
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: React Icons

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL (dual setup - Keycloak DB + User Data DB)
- **Database Connection**: pg (node-postgres)
- **Authentication**: NextAuth.js + Keycloak
- **File Upload**: Formidable + Nodemailer
- **Internationalization**: next-i18next + i18next

### Infrastructure
- **Container**: Docker + Docker Compose
- **Deployment**: Containerized deployment

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL** database
- **Git** for version control

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/lernplaner.git
cd lernplaner
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install

# Install Docker and Docker Compose if not already installed
# Follow official Docker installation guide for your OS
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lernplaner
DB_USER=postgres
DB_PASSWORD=your-password

# Keycloak Configuration
KEYCLOAK_DB_HOST=localhost
KEYCLOAK_DB_PORT=5433
KEYCLOAK_DB_NAME=keycloak
KEYCLOAK_DB_USER=keycloak
KEYCLOAK_DB_PASSWORD=keycloak-password

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
KEYCLOAK_CLIENT_ID="lernplaner-client"
KEYCLOAK_CLIENT_SECRET="your-keycloak-client-secret"
KEYCLOAK_ISSUER="http://localhost:8080/realms/lernplaner"

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
```

### 4. Database Setup
```bash
# Start services with Docker Compose
docker-compose up -d

# Wait for services to be ready, then run database migrations
npm run db:migrate

# (Optional) Seed the database
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
lernplaner/
├── pages/                 # Next.js Pages Router
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth configuration
│   │   ├── subjects/     # Subject management APIs
│   │   ├── sessions/     # Learning session APIs
│   │   └── upload/       # File upload handlers
│   ├── auth/             # Authentication pages
│   │   ├── signin.tsx
│   │   └── signup.tsx
│   ├── dashboard/        # Dashboard pages
│   │   ├── index.tsx     # Main dashboard
│   │   ├── subjects.tsx  # Subject management
│   │   ├── progress.tsx  # Progress analytics
│   │   └── calendar.tsx  # Calendar view
│   ├── _app.tsx          # App wrapper with contexts
│   ├── _document.tsx     # HTML document structure
│   └── index.tsx         # Landing page
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── dashboard/       # Dashboard-specific components
│   ├── forms/           # Form components
│   └── charts/          # Chart components
├── lib/                 # Utility functions
│   ├── db.ts           # Database connection (pg)
│   ├── auth.ts         # NextAuth configuration
│   ├── email.ts        # Email utilities (Nodemailer)
│   └── utils.ts        # General utilities
├── contexts/            # React contexts
│   ├── QuizAppContext.tsx
│   └── ChatContext.tsx
├── styles/              # CSS styles
│   ├── globals.css     # Global Tailwind styles
│   └── modules/        # CSS modules
├── sql/                 # Database scripts
│   ├── migrations/     # SQL migration files
│   └── seeds/          # Database seeding
├── public/              # Static assets
│   ├── locales/        # i18n translation files
│   └── images/         # Application images
├── docker/              # Docker configuration
│   ├── Dockerfile
│   └── docker-compose.yml
├── types/               # TypeScript type definitions
└── docs/                # Documentation
    └── usage.md         # Usage documentation
```

## 🎮 Gamification System

### XP Calculation
```typescript
export const calculateXP = (minutes: number, onTime: boolean, streak: number): number => {
  const baseXP = minutes * 2;
  const streakBonus = streak * 5;
  const punctualityBonus = onTime ? 20 : 0;
  return baseXP + streakBonus + punctualityBonus;
};

export const getLevel = (totalXP: number): number => {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
};
```

### Level Progression
- **Level 1-99**: Mathematical progression based on total XP
- **Streak Bonuses**: Additional XP for consecutive learning days
- **Achievement Unlocks**: Special badges and rewards at milestones

## 🔄 Development Workflow

### Frontend-First Approach
1. **UI Components**: Build and test components in isolation
2. **Mock Data**: Develop with realistic mock data
3. **API Integration**: Connect to backend endpoints
4. **Real-time Features**: Implement live updates and notifications

### Branch Strategy
- `main`: Production-ready code
- `develop`: Development integration branch
- `feature/*`: Individual feature branches
- `hotfix/*`: Critical bug fixes

### Testing
```bash
# Run tests
npm run test

# Type checking
npm run type-check

# Linting
npm run lint

# Database operations
npm run db:migrate
npm run db:seed
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Or build custom Docker image
docker build -t lernplaner .
docker run -p 3000:3000 --env-file .env.production lernplaner
```

### Environment Variables for Production
Ensure all environment variables are configured in your deployment environment:
- Database connection details (User Data DB + Keycloak DB)
- Keycloak authentication configuration
- SMTP email settings
- NextAuth secrets

## 📚 API Documentation

### Core Endpoints
- `GET /api/subjects` - Fetch user subjects
- `POST /api/subjects` - Create new subject
- `GET /api/sessions` - Get learning sessions
- `POST /api/sessions` - Log learning session
- `GET /api/stats` - User statistics and progress
- `POST /api/upload` - File upload handling

### API Architecture
The application uses standard Next.js API routes with PostgreSQL database connections via the `pg` package.

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure responsive design for all components

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Prisma** for excellent database tooling
- **shadcn-ui** for beautiful UI components
- **Vercel** for hosting and deployment platform

## 📞 Support

If you encounter any issues or have questions:

1. Check the [documentation](docs/usage.md)
2. Search existing [GitHub issues](https://github.com/yourusername/lernplaner/issues)
3. Create a new issue with detailed description

---

**Built with ❤️ for learners everywhere**