# Usage Guide - Lernplaner Features

## Overview

The Lernplaner application includes a comprehensive gamification system and subject management interface that helps users organize their learning with motivation and structure.

**Current Version**: 1.3.0  
**Latest Features**: Gamification System (Issue #2) + Subject Management Interface (Issue #3) + Interactive Calendar Component (Issue #4) + Session Tracking System (Issue #8)

## Gamification Features

### 🎮 XP (Experience Points) System

Users earn XP by completing learning activities:
- **Daily Practice**: +15 XP
- **Lesson Completion**: +25 XP  
- **Task Completion**: +50 XP
- **Project Milestones**: +100-200 XP

**XP Progress Bar**: Visual progress indicator showing current XP and progress towards next level.

### 🏆 Level System

- **Current Level**: Displayed prominently with animated badge
- **Level Calculation**: Based on quadratic formula `Math.floor(Math.sqrt(totalXP / 100)) + 1`
- **Level-up Celebrations**: Automatic confetti animation and modal when reaching new level
- **Visual Feedback**: Golden gradient badges with hover animations

### 🎯 Achievement System

**Achievement Categories**:
- **Tasks**: Completion-based achievements (🏆)
- **Streak**: Consistency achievements (⚡) 
- **Time**: Learning time achievements (🎓)
- **Level**: Progression achievements (🌟)

**Visual Features**:
- Interactive badge system with tooltips
- Progress rings for incomplete achievements
- New achievement indicators with pulsing animations
- Achievement unlock celebrations

### 🔥 Streak System

**Streak Tracking**:
- Daily learning streak counter
- Visual intensity levels based on streak length:
  - 0 days: Gray (none)
  - 1-2 days: Orange (weak) 
  - 3-6 days: Orange flames (medium)
  - 7-13 days: Red fire (strong)
  - 14-29 days: Deep red (intense)
  - 30+ days: Purple legendary flames

**Milestone Rewards**:
- 7 days: "Week Warrior" achievement
- 14 days: Streak celebration
- 30 days: "Monthly Master" achievement
- 50+ days: Elite status

### 🎉 Celebration System

**XP Gain Notifications**:
- Floating toast messages with "+XP" display
- Achievement unlock notifications
- Streak milestone celebrations

**Level-up Celebrations**:
- Full-screen confetti animation using canvas-confetti
- Congratulatory modal with new level display
- Auto-close after 4 seconds or manual close

## Interactive Demo Features

The dashboard includes demo buttons for testing:

### Learning Actions
- **"Lernsession starten"**: Simulates random XP gain (15-100 XP)
- **"Aufgabe abhaken"**: Awards 50 XP for task completion
- **"Streak erhöhen"**: Increments daily streak counter

### Demo Actions  
- **"Achievement freischalten"**: Unlocks demo achievement
- **"Großer XP Boost"**: Awards 200 XP (may trigger level-up)
- **"Reset Demo"**: Resets all gamification progress

## Component Architecture

### Core Components

1. **`XPBar`**: Animated progress bar with level display
2. **`LevelBadge`**: Circular level indicator with animations
3. **`AchievementBadge`**: Interactive achievement display with tooltips
4. **`StreakDisplay`**: Flame-animated streak counter
5. **`XPToast`**: Floating notification system
6. **`LevelUpModal`**: Full-screen celebration modal

### Hooks

**`useGamification`**: Central state management hook providing:
- XP management (`addXP`, `currentXP`, `currentLevel`)
- Achievement system (`unlockAchievement`, `achievements`)
- Streak tracking (`updateStreak`, `streak`)
- Event system (`getRecentEvents`)
- Demo utilities (`simulateLearningActivity`, `resetGamification`)

## Testing Your Implementation

### Manual Testing Steps

1. **Open Dashboard**: Navigate to http://localhost:3000
2. **Test XP Gain**: Click "Lernsession starten" to earn XP
3. **Verify Animations**: Watch for XP bar updates and toast notifications
4. **Test Level-up**: Click "Großer XP Boost" multiple times to trigger level-up
5. **Check Confetti**: Verify confetti animation appears on level-up
6. **Test Achievements**: Click "Achievement freischalten" to unlock new badge
7. **Test Streaks**: Click "Streak erhöhen" to increment streak counter
8. **Mobile Testing**: Verify responsive design on mobile devices

### Expected Behaviors

- ✅ XP toasts appear on XP gain
- ✅ XP bars animate smoothly
- ✅ Level badge updates on level-up  
- ✅ Confetti triggers on level-up
- ✅ Achievement badges display with hover effects
- ✅ Streak flames intensify with higher streaks
- ✅ All animations complete smoothly
- ✅ Responsive design works on all screen sizes

## Technical Implementation

### Dependencies Used

- **canvas-confetti**: Level-up celebration effects
- **react-icons/fa6**: Fire and flame icons for streaks
- **tailwindcss**: Styling and animations
- **TypeScript**: Type safety throughout

### Custom Animations

Tailwind animations added:
- `animate-spin-slow`: Slow rotation for legendary streaks
- `animate-float`: Floating effect for special elements
- `animate-glow`: Pulsing glow effects

### Performance Considerations

- Animations use CSS transforms for smooth 60fps performance
- Toast notifications are queued to prevent overlap
- Event system prevents memory leaks with proper cleanup
- Images and heavy effects are optimized for mobile

## Troubleshooting

### Common Issues

**XP not updating**: Check console for JavaScript errors, verify hook integration

**Animations not smooth**: Ensure hardware acceleration enabled in browser

**Confetti not appearing**: Verify canvas-confetti dependency is installed

**Mobile layout issues**: Test responsive breakpoints, check Tailwind classes

### Development Notes

- Run `npm run build` to check for TypeScript errors
- Use browser dev tools to monitor animation performance
- Test on multiple devices and browsers
- Check console for any React warnings

## Future Enhancements

Potential improvements for future versions:
- Sound effects for achievements and level-ups
- Animated particle systems for special events
- User customizable celebration preferences
- Achievement sharing to social media
- Leaderboards and competitive features

---

## 📚 Subject Management Interface (Issue #3)

### Overview
The Subject Management Interface allows you to create, organize, and track your study subjects with personalized settings, color coding, and progress tracking.

### 🎯 Key Features

#### **Subject Creation**
- **Add Subject Button**: Prominently placed for easy access
- **Comprehensive Form**: All required fields with validation
- **Color Customization**: Full color picker with preset options optimized for light mode
- **Date Management**: Start date and exam date with validation
- **Study Planning**: Hours per week, days per week, and intensity weeks

#### **Subject Cards**
- **Color-coded Design**: Left border and progress bars match subject color
- **Progress Tracking**: Visual progress bars showing completed vs target hours
- **Study Metrics**: Hours per week, days per week, intensity weeks display
- **Exam Countdown**: Shows time remaining until exam date
- **Hover Actions**: Edit and delete buttons appear on card hover

#### **Form Validation**
- **Required Fields**: Subject name, color, dates, and numeric values
- **Date Validation**: Exam date must be after start date
- **Numeric Constraints**: Hours per week (1-40), days per week (1-7), intensity weeks (1-20)
- **Real-time Feedback**: Error messages display immediately

#### **Search & Filter**
- **Search by Name**: Filter subjects by typing subject names
- **Search by Color**: Filter subjects by color hex codes
- **Real-time Results**: Immediate filtering as you type
- **Empty State**: Helpful messages when no results found

### 🚀 How to Use

#### **Creating a New Subject**
1. Navigate to **Subjects** page via top navigation
2. Click **"Add Subject"** button 
3. Fill out the form:
   - **Subject Name**: e.g., "Mathematics", "Physics"
   - **Color**: Choose from presets or use custom color picker
   - **Start Date**: When you begin studying this subject
   - **Exam Date**: Your target exam date
   - **Hours per Week**: Planned study hours (1-40)
   - **Days per Week**: Study days (1-7)
   - **Intensity Weeks**: Weeks before exam for intensive study (1-20)
4. Click **"Create Subject"** to save

#### **Editing Subjects**
1. Hover over any subject card
2. Click the **Edit** button (pencil icon)
3. Modify any fields in the modal form
4. Click **"Update Subject"** to save changes

#### **Deleting Subjects**
1. Hover over the subject card you want to remove
2. Click the **Delete** button (trash icon)
3. Confirm deletion in the popup
4. Subject will be permanently removed

#### **Searching Subjects**
1. Use the search box at the top of the subjects page
2. Type subject name (e.g., "Math") or color code (e.g., "#3B82F6")
3. Results filter in real-time
4. Clear search to show all subjects

### 💾 Data Storage
- **Local Storage**: Subjects are saved in browser local storage
- **Demo Reset**: Use "Reset Demo" button to restore mock data
- **Persistence**: Data persists between browser sessions

### 📱 Responsive Design
- **Desktop**: Multi-column grid layout with full functionality
- **Tablet**: Responsive grid adjusts to screen size
- **Mobile**: Single column layout optimized for touch

### 🎨 Color System
The color picker includes light mode optimized colors:
- **White/Light**: #FFFFFF, #F8FAFC, #F1F5F9, #E2E8F0
- **Blue Theme**: #3B82F6, #60A5FA, #93C5FD, #DBEAFE, #EFF6FF
- **Vibrant Options**: Red, green, yellow, purple, orange, cyan, lime, pink
- **Custom Colors**: Full hex color picker for unlimited options

### 🧪 Testing Your Setup

**Manual Testing Steps**:
1. **Navigate to Subjects**: Click "Subjects" in top navigation
2. **View Mock Data**: See 3 pre-loaded subjects (Mathematics, Physics, Chemistry)
3. **Test Creation**: Add a new subject with custom color
4. **Test Search**: Search by name "Math" or color "#3B82F6"
5. **Test Editing**: Modify an existing subject
6. **Test Responsive**: Resize browser window
7. **Test Deletion**: Remove a subject (use Reset Demo to restore)

### 🔧 Technical Implementation

#### **Dependencies Added**
- **react-hook-form**: Form state management and validation
- **zod**: Schema validation
- **@hookform/resolvers**: Zod integration with React Hook Form  
- **react-colorful**: Color picker component

#### **Components Created**
- **SubjectForm**: Complete form with validation
- **SubjectCard**: Individual subject display with actions
- **SubjectModal**: Modal wrapper for create/edit operations
- **SubjectsList**: Main subjects page with grid and search
- **ColorPicker**: Custom color selection component

#### **State Management**
- **useSubjects Hook**: Complete CRUD operations with local storage
- **Form Validation**: Zod schema with comprehensive validation rules
- **Search Functionality**: Real-time filtering by name and color

### 🎯 Next Steps
After mastering subject management, you can:
1. Create learning sessions for your subjects
2. Track progress through the gamification system
3. Use the dashboard to monitor overall learning metrics
4. Set up calendar integration for scheduling

---

## 📅 Interactive Calendar Component (Issue #4)

### Overview
The Interactive Calendar Component provides a comprehensive scheduling and session management system with multiple view modes and responsive design.

### 🗓️ Key Features

#### **Calendar Views**
- **Month View**: Full monthly calendar with CSS Grid layout
- **Week View**: Weekly schedule view (placeholder implemented)
- **Day View**: Daily agenda view (placeholder implemented)
- **View Toggle**: Easy switching between Month/Week/Day views

#### **Interactive Features**
- **Date Selection**: Click any date to select and highlight it
- **Session Display**: Color-coded sessions appear on calendar dates
- **Navigation**: Previous/Next month arrows and "Heute" (Today) button
- **Session Creation**: "Session" button enables when date is selected

#### **Session Management**
- **Color Coding**: Sessions inherit subject colors (Blue=Math, Green=Physics, Orange=Chemistry)
- **Session Details**: Click sessions to view title, time, subject, description
- **Visual Status**: Completed sessions shown with reduced opacity
- **Session Types**: Support for study, exam, assignment, and break sessions

### 🚀 How to Use

#### **Navigating the Calendar**
1. Navigate to **Calendar** page via top navigation
2. Use **arrow buttons** to navigate between months
3. Click **"Heute"** to jump to current date
4. Select **view mode** using Month/Week/Day toggle buttons

#### **Working with Sessions**
1. **View Sessions**: Sessions appear as colored blocks on calendar dates
2. **Select Date**: Click any date to select it (highlights in blue)
3. **Session Details**: Click on any session to view full details below calendar
4. **Create Session**: Select a date and click the blue "Session" button (placeholder)

#### **Understanding Session Colors**
- **Blue Sessions** (#3B82F6): Mathematics subjects
- **Green Sessions** (#10B981): Physics subjects  
- **Orange Sessions** (#F59E0B): Chemistry subjects
- **Dimmed Appearance**: Completed sessions (reduced opacity)

### 📱 Responsive Design
- **Desktop**: Full calendar grid with complete navigation
- **Tablet**: Responsive grid adapts to available screen space
- **Mobile**: Compact layout with icon-only navigation buttons
- **Touch-Friendly**: Optimized for mobile touch interactions

### 🎨 Technical Implementation

#### **Components Created**
- **Calendar.tsx**: Main calendar container with state management
- **CalendarGrid.tsx**: CSS Grid-based monthly calendar display
- **CalendarViewToggle.tsx**: View mode switching component
- **calendar.tsx**: Full calendar page with session details

#### **Data Management**
- **TypeScript Types**: Comprehensive calendar and session interfaces
- **Mock Data**: Sample sessions for demonstration
- **Date Utilities**: Helper functions for date manipulation and formatting
- **State Management**: React hooks for view state and date selection

#### **CSS Grid Layout**
```css
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0;
}
```

#### **Color Integration**
Sessions automatically inherit subject colors using CSS custom properties and inline styles for dynamic color application.

### 🧪 Testing Your Setup

**Manual Testing Steps**:
1. **Navigate to Calendar**: Click "Calendar" in top navigation
2. **Test Month View**: Default view shows current month with proper grid layout
3. **Test Date Selection**: Click any date to see selection highlight and info banner
4. **Test Session Display**: Mock sessions should appear with proper colors
5. **Test Navigation**: Use arrows to navigate months, "Heute" to return to today
6. **Test View Toggle**: Month/Week/Day buttons should be clickable (Week/Day show placeholders)
7. **Test Responsive**: Resize browser window to test mobile/tablet layouts
8. **Test Session Details**: Click any session to see details panel below calendar

### 🎯 Expected Behaviors

- ✅ Calendar displays current month by default
- ✅ Date selection highlights selected date in blue
- ✅ Sessions appear with correct subject colors
- ✅ Navigation arrows change months smoothly
- ✅ "Heute" button returns to current date
- ✅ View toggle shows active state (Month highlighted)
- ✅ Responsive design works across all screen sizes
- ✅ Session click shows details panel
- ✅ German localization throughout interface

### 🔧 Future Enhancements
- Complete Week and Day view implementations
- Session creation and editing modals
- Drag-and-drop session rescheduling
- Calendar integration with actual subject data
- Export calendar events to external calendars
- Recurring session support

---

## 📊 Session Tracking System (Issue #8)

### Overview
The Session Tracking System provides comprehensive learning session management with real-time tracking, statistics, and seamless gamification integration.

### 🚀 Key Features

#### **Session Management**
- **Start Session Modal**: Select subject, duration (Pomodoro 25min default), and optional notes
- **Session Timer**: Real-time progress circle with pause/resume functionality (TODO: Active timer implementation)
- **Session History**: Complete history with search, filtering, and statistics
- **Quick Start**: Start sessions directly from subject cards with hover actions

#### **Statistics Dashboard**
- **Total Time**: Accumulated learning time across all sessions
- **Total XP**: Experience points earned from completed sessions
- **Session Count**: Number of completed learning sessions
- **Average Duration**: Average session length for productivity insights

#### **API Integration**
- **Learning Sessions API**: Full CRUD operations (`/api/sessions/` and `/api/sessions/[id]`)
- **PostgreSQL Integration**: Persistent session data with proper relationships
- **Gamification Integration**: Automatic XP calculation and user stats updates
- **Real-time Stats**: Live updates of progress and achievements

### 🎯 How to Use

#### **Starting a Learning Session**
1. Navigate to **Subjects** page
2. Click **"Start Session"** button (green play button)
3. Select your subject from the list
4. Choose duration (15min to 2 hours, default 25min Pomodoro)
5. Add optional session notes (500 character limit)
6. Click **"Start Session"** to begin

#### **Starting from Subject Cards**
1. Hover over any subject card
2. Click the **Play button** that appears
3. Session modal opens with subject pre-selected
4. Set duration and notes, then start

#### **Viewing Session History**
1. Click **"Session History"** button (gray history button)
2. View statistics cards: Total Time, XP, Sessions, Average
3. Use **search bar** to find specific sessions
4. Apply **date filters**: All Time, Today, This Week, This Month
5. **Load More** button for pagination through session history

#### **Session Statistics**
- **Search Sessions**: Filter by subject name or session notes
- **Date Filtering**: Focus on recent activity or historical data
- **Statistics Cards**: Real-time updates showing learning progress
- **Color Coding**: Sessions inherit subject colors for visual organization

### 💾 Data Management

#### **API Endpoints**
- **GET /api/sessions**: Fetch sessions with filtering and pagination
- **POST /api/sessions**: Create new learning session with XP calculation
- **GET /api/sessions/[id]**: Fetch individual session details
- **PUT /api/sessions/[id]**: Update session (duration, completion, notes)
- **DELETE /api/sessions/[id]**: Remove session (adjusts stats automatically)

#### **Database Schema**
Sessions stored in `learning_sessions` table with:
- Subject relationship and user association
- Duration, completion status, and XP points
- Session notes and creation timestamps
- Automatic gamification event logging

#### **XP Calculation**
- **Base Points**: 10 XP per 15 minutes of session time
- **Completion Bonus**: 20% extra XP for completed sessions
- **User Stats Update**: Automatic daily/weekly time and XP totals
- **Achievement Integration**: Session milestones trigger achievements

### 📱 Responsive Design
- **Desktop**: Full-featured interface with all controls
- **Tablet**: Responsive statistics cards in 2x2 grid layout
- **Mobile**: Compact mobile-first design with touch-optimized buttons
- **Cross-Platform**: Consistent experience across all devices

### 🧪 Testing Your Setup

**Manual Testing Steps**:
1. **Navigate to Subjects**: Open subjects page via navigation
2. **Test Start Session**: Click green "Start Session" button
3. **Verify Modal**: Check subject selection, duration options, notes field
4. **Test Session History**: Click "Session History" to view statistics
5. **Check Responsive**: Test on mobile, tablet, and desktop sizes
6. **Verify API**: Check browser network tab for successful API calls

### 🎨 Technical Implementation

#### **Components Created**
- **SessionTimer**: Real-time session tracking with progress circle
- **StartSessionModal**: Subject selection with Pomodoro duration options
- **SessionHistory**: Statistics dashboard with search and filtering
- **Subject Integration**: Play buttons added to subject cards

#### **Hooks and State Management**
- **useLearningSessions**: Complete CRUD operations for session data
- **useActiveSession**: Real-time session timer (TODO: Timer logic implementation)
- **Validation**: Zod schemas for session creation and updates
- **Error Handling**: Comprehensive API error management

#### **Database Integration**
- **PostgreSQL Schema**: Proper foreign keys and constraints
- **Transaction Safety**: Atomic updates for stats and XP
- **Data Mapping**: Snake_case DB to camelCase API conversion
- **Query Optimization**: Efficient queries with proper indexing

### ⚡ Session Timer (Future Enhancement)
The active session timer functionality is prepared but requires implementation of:
- Real-time countdown with setInterval
- Session state management (idle, active, paused, completed)
- localStorage persistence for session recovery
- Automatic completion when target duration reached

### 🎯 Expected Behaviors

- ✅ Session buttons integrate seamlessly with existing UI
- ✅ Start Session modal shows subject selection and duration options
- ✅ Session History displays statistics with search and filtering
- ✅ API endpoints handle CRUD operations correctly
- ✅ XP integration works automatically with gamification system
- ✅ Responsive design adapts to all screen sizes
- ✅ Database persistence maintains session history

### 🔧 Future Enhancements
- Complete active session timer implementation
- Session templates and presets
- Advanced session analytics and insights
- Session sharing and collaboration features
- Integration with calendar for scheduled sessions
- Session quality scoring and feedback system

---

*Last updated: Implementation of Issue #8 - Session Tracking System (Version 1.3.0)*