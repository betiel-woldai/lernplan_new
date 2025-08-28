# 🎯 Lernplaner GitHub Issues - Frontend-First Development Strategy

## Issue #1: 🎨 Dashboard UI Components with Mock Data
**Labels:** `frontend`, `ui`, `priority-high`, `good-first-issue`

### Description
Create the main dashboard layout with statistics cards using mock data for immediate visual feedback. This provides the foundation for the entire application UI.

### Acceptance Criteria
- [ ] Create responsive dashboard layout using shadcn-ui components
- [ ] Implement 4 statistics cards: Daily Learning Time, Completed Tasks, Learning Streak, Level Progress
- [ ] Use Tailwind CSS with glassmorphism design
- [ ] Add mock data for realistic preview
- [ ] Implement responsive design for mobile/tablet/desktop
- [ ] Add Framer Motion animations for card interactions

### Technical Requirements
- Use Next.js 14 Pages Router
- Implement with TypeScript (selective usage)
- Use Tailwind CSS + CSS Modules for styling
- Use React Icons for iconography

### Definition of Done
- Dashboard renders correctly on all screen sizes
- All statistics cards display mock data
- Hover animations work smoothly
- Component is documented in Storybook

---

## Issue #2: 🎮 Gamification UI System (XP, Levels, Badges)
**Labels:** `frontend`, `gamification`, `priority-high`, `enhancement`

### Description
Build the visual gamification system including XP bars, level displays, achievement badges, and streak counters. This should work with mock data initially for immediate visual impact.

### Acceptance Criteria
- [ ] Create XP progress bar component with animations
- [ ] Design level display with current level and progress to next level
- [ ] Implement badge/achievement showcase grid
- [ ] Create streak counter with flame/fire animations
- [ ] Add congratulatory animations for level-ups
- [ ] Design XP gain notifications/toasts

### Technical Requirements
- Use CSS animations and transitions for smooth effects
- Create reusable components for different XP displays
- Implement confetti effect for level-ups using canvas-confetti
- Use React Icons for achievements

### Mock Data Structure
```typescript
const mockUserStats = {
  currentXP: 1250,
  currentLevel: 8,
  nextLevelXP: 1600,
  streak: 12,
  achievements: ["First Steps", "Week Warrior", "Study Master"]
}
```

### Definition of Done
- All gamification elements render with animations
- Level-up animation triggers correctly
- Achievement badges display with hover effects
- Streak counter shows current streak with visual feedback

---

## Issue #3: 📚 Subject Management Interface
**Labels:** `frontend`, `crud`, `priority-high`, `form`

### Description
Create a comprehensive subject management interface allowing users to add, edit, and delete subjects with color coding and exam date settings.

### Acceptance Criteria
- [ ] Build subject creation form with validation
- [ ] Implement subject cards with color preview
- [ ] Add inline editing for subject details
- [ ] Create color picker component
- [ ] Implement subject deletion with confirmation
- [ ] Add search/filter functionality for subjects

### Form Fields
- Subject name (required)
- Color selection (predefined palette)
- Start date
- Exam date
- Hours per week
- Days per week
- Intensity weeks before exam

### Technical Requirements
- Use React Hook Form for form management
- Implement client-side validation
- Create custom color picker with predefined colors
- Use HTML5 date inputs with custom styling

### Definition of Done
- Forms validate correctly and show error messages
- Subject cards display all information clearly
- Color picker works smoothly
- All CRUD operations work with local state

---

## Issue #4: 📅 Interactive Calendar Component
**Labels:** `frontend`, `calendar`, `priority-medium`, `complex`

### Description
Implement the main calendar view with monthly/weekly layouts, color-coded subject sessions, and interactive scheduling capabilities.

### Acceptance Criteria
- [ ] Integrate FullCalendar or React Big Calendar
- [ ] Display subject sessions with color coding
- [ ] Implement month/week/day view toggle
- [ ] Add session click handlers for details/editing
- [ ] Create session creation via calendar clicks
- [ ] Implement drag-and-drop rescheduling

### Visual Requirements
- Color-code sessions based on subject colors
- Show session duration and subject name
- Add visual indicators for completed sessions
- Implement hover tooltips with session details

### Technical Requirements
- Build custom calendar component with CSS Grid/Flexbox
- Make calendar responsive for mobile devices
- Integrate with subject color system via CSS custom properties
- Implement proper TypeScript types for calendar events

### Definition of Done
- Calendar displays mock sessions correctly
- All views (month/week/day) work smoothly
- Sessions are properly color-coded
- Calendar is fully responsive

---

## Issue #5: 🔧 Database Setup & Prisma Schema Implementation
**Labels:** `backend`, `database`, `priority-high`, `setup`

### Description
Set up PostgreSQL database with Prisma ORM and implement the complete schema for users, subjects, sessions, and achievements.

### Acceptance Criteria
- [ ] Set up PostgreSQL dual database configuration (User Data + Keycloak)
- [ ] Create SQL migration scripts for database schema
- [ ] Set up pg (node-postgres) connection pooling
- [ ] Create seed script with sample data
- [ ] Add database connection utilities
- [ ] Implement proper indexes for performance

### Database Tables Required
```sql
-- User Data Database
- users (id, keycloak_id, level, xp, streak, created_at, updated_at)
- subjects (id, user_id, name, color, start_date, exam_date, hours_per_week, etc.)
- sessions (id, subject_id, user_id, date, duration, completed, points)
- schedules (id, subject_id, day_of_week, start_time, end_time)
- achievements (id, user_id, name, description, unlocked_at)
```

### Technical Requirements
- Use PostgreSQL with pg (node-postgres) driver
- Set up dual database configuration (User Data + Keycloak)
- Set up proper foreign key relationships
- Add database indexes for performance
- Create comprehensive seed data

### Definition of Done
- Database schema matches requirements exactly
- All relationships work correctly
- Seed script populates realistic data
- Database queries perform efficiently

---

## Issue #6: 🔐 Authentication System with NextAuth.js
**Labels:** `backend`, `auth`, `priority-high`, `security`

### Description
Implement complete authentication system with user registration, login, and session management using NextAuth.js.

### Acceptance Criteria
- [ ] Set up Keycloak server with Docker
- [ ] Configure NextAuth.js with Keycloak provider
- [ ] Create login/register pages with Keycloak integration
- [ ] Set up user synchronization between Keycloak and User Data DB
- [ ] Add session management and middleware
- [ ] Create protected route wrapper

### Security Requirements
- Configure Keycloak realm and client settings
- Implement proper JWT token handling
- Add CSRF protection via NextAuth.js
- Validate all user inputs server-side
- Set up secure cookies and session management

### UI Requirements
- Create beautiful login/register forms
- Add form validation with error messages
- Implement loading states
- Add success/error notifications

### Definition of Done
- Users can register and login successfully
- Sessions persist correctly
- Protected routes redirect unauthenticated users
- All forms validate properly

---

## Issue #7: 🔌 Subject API Endpoints & Integration
**Labels:** `backend`, `api`, `frontend`, `integration`, `priority-medium`

### Description
Create tRPC/REST API endpoints for subject CRUD operations and integrate with the frontend subject management interface.

### Acceptance Criteria
- [ ] Create tRPC procedures for subjects (create, read, update, delete)
- [ ] Implement proper data validation with Zod
- [ ] Add error handling and status codes
- [ ] Integrate API with frontend forms
- [ ] Add optimistic updates for better UX
- [ ] Implement proper loading states

### API Endpoints Required
```typescript
// Standard Next.js API routes
- GET /api/subjects - Get user subjects
- POST /api/subjects - Create new subject  
- PUT /api/subjects/[id] - Update subject
- DELETE /api/subjects/[id] - Delete subject
- GET /api/subjects/[id]/stats - Get subject statistics
```

### Technical Requirements
- Use standard Next.js API routes
- Implement server-side validation
- Add proper error handling with try-catch
- Use Axios for HTTP requests with error interceptors

### Definition of Done
- All CRUD operations work correctly
- Frontend updates in real-time
- Error handling provides clear feedback
- API responses are properly typed

---

## Issue #8: 📊 Session Tracking System
**Labels:** `backend`, `frontend`, `gamification`, `priority-medium`

### Description
Build the session tracking system that handles learning session creation, completion tracking, XP calculation, and streak management.

### Acceptance Criteria
- [ ] Create session CRUD API endpoints
- [ ] Implement XP calculation algorithm
- [ ] Build session tracking UI components
- [ ] Add streak calculation logic
- [ ] Create session completion flow
- [ ] Implement achievement unlock system

### XP Calculation Logic
```typescript
const calculateXP = (minutes: number, onTime: boolean, streak: number) => {
  const baseXP = minutes * 2;
  const streakBonus = streak * 5;
  const punctualityBonus = onTime ? 20 : 0;
  return baseXP + streakBonus + punctualityBonus;
};
```

### UI Components
- Session start/stop timer
- Session completion modal
- XP gain animation
- Streak update notifications

### Definition of Done
- Sessions can be started, paused, and completed
- XP calculations work correctly
- Streaks update automatically
- UI provides clear feedback on progress

---

## Issue #9: 📈 Progress Analytics Dashboard
**Labels:** `frontend`, `analytics`, `charts`, `priority-medium`

### Description
Create comprehensive progress analytics with charts showing learning patterns, subject distribution, and goal tracking using Recharts.

### Acceptance Criteria
- [ ] Implement weekly/monthly progress charts
- [ ] Create subject time distribution pie chart
- [ ] Add streak visualization over time
- [ ] Build goal progress tracking
- [ ] Create exportable reports
- [ ] Add filtering by date ranges

### Chart Types Required
- Line chart: Learning hours over time
- Bar chart: Hours per subject
- Pie chart: Subject time distribution
- Progress bars: Goal completion

### Technical Requirements
- Use Chart.js with react-chartjs-2
- Make charts responsive with Chart.js responsive options
- Add proper legends and tooltips
- Implement data filtering with Chart.js plugins

### Definition of Done
- All charts display data correctly
- Charts are responsive on all devices
- Data filtering works smoothly
- Charts update in real-time

---

## Issue #10: 🔔 Real-time Updates & Push Notifications
**Labels:** `backend`, `frontend`, `real-time`, `priority-low`, `enhancement`

### Description
Implement real-time updates using Server-Sent Events and web push notifications for session reminders and achievement unlocks.

### Acceptance Criteria
- [ ] Set up email notifications with Nodemailer
- [ ] Implement file upload handling with Formidable
- [ ] Create internationalization with next-i18next
- [ ] Add multi-language support for UI
- [ ] Build notification preferences UI
- [ ] Test email delivery and file uploads

### Features to Implement
- Email notifications for session reminders
- File upload for subject materials
- Multi-language support (German/English)
- Achievement unlock notifications via email
- Weekly progress summary emails

### Technical Requirements
- Configure Nodemailer with SMTP settings
- Set up Formidable for multipart form handling
- Configure next-i18next for German/English support
- Add file storage and validation
- Implement email templates

### Definition of Done
- Real-time updates work across all components
- Push notifications deliver reliably
- Users can control notification preferences
- System works offline with service worker

---

## 🚀 Development Priority Order

### Phase 1 (Immediate Visual Impact)
1. Issue #1: Dashboard UI Components
2. Issue #2: Gamification UI System
3. Issue #3: Subject Management Interface

### Phase 2 (Backend Foundation)
4. Issue #5: Database Setup & Prisma Schema
5. Issue #6: Authentication System
6. Issue #7: Subject API Endpoints & Integration

### Phase 3 (Core Functionality)
7. Issue #4: Interactive Calendar Component  
8. Issue #8: Session Tracking System
9. Issue #9: Progress Analytics Dashboard

### Phase 4 (Advanced Features)
10. Issue #10: Real-time Updates & Push Notifications

## 🎯 Success Metrics

- **User Engagement**: Time spent on platform, session completion rates
- **Feature Adoption**: Subject creation rate, calendar usage
- **Performance**: Page load times, API response times
- **Quality**: Bug reports, user feedback scores

---

*This issue list prioritizes frontend-first development to provide immediate visual feedback and iterative improvements throughout the development process.*