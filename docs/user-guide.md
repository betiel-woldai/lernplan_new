# Lernplaner - User Guide

---

## Table of Contents

1. [Introduction](#introduction)
2. [Dashboard](#dashboard)
3. [Managing Subjects](#managing-subjects)
4. [Learning Sessions](#learning-sessions)
5. [Calendar & Planning](#calendar--planning)
6. [XP & Leveling](#xp--leveling)
7. [Streaks](#streaks)
8. [Achievements & Badges](#achievements--badges)
9. [Statistics & Analytics](#statistics--analytics)
10. [Feedback System](#feedback-system)
11. [Tips & Best Practices](#tips--best-practices)

---

## Introduction

### What is Lernplaner?

Lernplaner is a **gamified learning management system** that motivates you to study regularly and effectively. Through an XP and level system, daily streaks, and achievements, learning becomes a playful experience.

### Core Features

- **🎮 Gamification:** XP, Levels, Achievements, Streaks
- **📅 Smart Scheduling:** Automatic session planning
- **⏱️ Timer:** Integrated learning timer in header
- **📊 Analytics:** Detailed statistics about your learning behavior
- **🎯 Goal Tracking:** Exam dates and learning objectives

### First Login

1. **Open Lernplaner:** `http://localhost:3002` (development) or `https://your-domain.com/lernplaner` (production)
2. **Click "Sign In":** Redirect to Keycloak
3. **Log in with university account:** Email & password
4. **Dashboard appears:** You start at Level 1 with 0 XP

---

## Dashboard

### Overview

The Dashboard is your **central hub** in Lernplaner. Here you see:

```
┌─────────────────────────────────────────────────────────────┐
│ 🎓 Dashboard                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Level 12: Studienkönig                      XP: 5,420     │
│  ████████████████░░░░░░░░░░░░░░  5,420/6,000 XP           │
│                                                             │
│  🔥 Current Streak: 12 Days                                 │
│  🏆 Longest Streak: 28 Days                                 │
│  📊 Achievements: 8/15                                      │
│                                                             │
│  📈 Last 7 Days                                             │
│  ┌───────────────────────────────────────────┐             │
│  │ Mo Tu We Th Fr Sa Su                      │             │
│  │ 45 60 30 45 90 0  120   = 390 Min         │             │
│  └───────────────────────────────────────────┘             │
│                                                             │
│  🎯 Today studied: 45 Minutes                               │
│  📚 Subjects: 5 active                                      │
│  📅 Next exam: Mathematics 1 (in 12 days)                  │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard Elements Explained

#### 1. Level & XP Display

**Level title:** Dynamic based on your level
- Level 1-5: Lernling (Novice)
- Level 6-10: Wissensjäger (Knowledge Hunter)
- Level 11-20: Studienkönig (Study King)
- Level 21-50: Weiser (Sage)
- Level 51-99: Wissensguru (Knowledge Guru)
- Level 100: Lernlegende (Learning Legend)

**XP progress bar:**
- Green filled: XP already earned in current level
- Gray: Missing XP until next level
- Example: 5,420/6,000 XP → 580 XP more needed for Level 13

#### 2. Streak Display

**Current Streak:** Number of consecutive days with at least one learning session

**Longest Streak:** Your personal record

**Visualization:**
```
🔥 3 days    (small, orange)
🔥 7 days    (medium, red)
🔥 30 days   (large, fire red)
🔥 100 days  (huge, gold)
```

#### 3. Achievements Overview

**Progress:** E.g., "8/15" → 8 of 15 achievements unlocked

**Categories:**
- Streak achievements (3, 7, 30, 100 days)
- Time achievements (10h, 50h, 100h, 500h)
- Task achievements (10, 50, 100, 500 sessions)
- Level achievements (Level 10, 25, 50, 100)

#### 4. Weekly Statistics

**Bar chart:** Study time of last 7 days

**Interpretation:**
- High bars (dark green): Productive days
- Low bars (light green): Little studying
- No bars (gray): No studying → Streak at risk!

#### 5. Quick Access

**Today studied:** Sum of all today's sessions

**Active subjects:** Number of subjects with current semester/exam date

**Next exam:** Countdown to next exam date

---

## Managing Subjects

### Create New Subject

1. **Navigation:** Sidebar → **"Subjects"**
2. Click **"New Subject"** button
3. **Fill out form:**

```
┌─────────────────────────────────────────┐
│ Create New Subject                      │
├─────────────────────────────────────────┤
│ Subject name: [Mathematics 1       ]    │
│                                         │
│ Color: [🔵 Blue ▼]                      │
│                                         │
│ Exam date: [2024-02-15           ]     │
│                                         │
│ Weekly hours: [4                  ]     │
│                                         │
│ Description (optional):                 │
│ [Linear Algebra, Analysis I        ]    │
│                                         │
│ [ Cancel ]  [ Save ]                    │
└─────────────────────────────────────────┘
```

#### Field Explanations

**Subject name (required):**
- Unique name
- Examples: "Mathematics 1", "Programming in Java", "Business Administration Basics"

**Color (required):**
- Visual distinction in calendar
- Available colors: Blue, Green, Red, Yellow, Purple, Orange, Pink
- **Tip:** Similar subjects similar colors (e.g., all math courses blue)

**Exam date (optional, but recommended!):**
- **Important:** With exam date you get **15 XP/min** instead of 10 XP/min (+50% XP!)
- Format: YYYY-MM-DD or date picker
- Example: "2024-02-15" for February 15, 2024

**Weekly hours (optional):**
- Planned study time per week
- Used for automatic session generation
- Example: "4" for 4 hours per week

**Description (optional):**
- Notes, topics, goals
- Only visible to you

### Edit Subject

1. **Subjects list:** Sidebar → **"Subjects"**
2. **Select subject:** Click on subject card
3. Click **"Edit"** button
4. **Make changes** → **"Save"**

**What can be changed:**
- ✅ Subject name
- ✅ Color
- ✅ Exam date (add/change/remove)
- ✅ Weekly hours
- ✅ Description

**What remains:**
- All past learning sessions
- XP already earned
- Statistics

### Archive Subject

**When to archive?**
- Exam is over
- Subject no longer studied
- Semester ended

**How to archive:**
1. Open subject → **"Archive"** button
2. Confirmation: "Yes, archive"

**Effect:**
- Subject no longer appears in active subjects list
- Archived subjects: Filterable via **"Show archive"**
- Statistics and XP remain
- Subject can be reactivated

### Delete Subject

**Warning:** Deletion is irreversible!

**Effect:**
- Subject completely removed
- **ALL learning sessions** for this subject deleted
- **XP ARE LOST** (deducted from total score)
- **Level may decrease!**

**Recommendation:** Better archive than delete!

---

## Learning Sessions

### Session Types

#### 1. Manual Session

**For:** Recording completed sessions

1. **Navigation:** **"Sessions"** → **"New Session"**
2. **Form:**
   - **Subject:** Dropdown selection
   - **Date:** Today or past
   - **Start time:** e.g., "2:00 PM"
   - **Duration:** e.g., "45 minutes"
   - **Notes (optional):** e.g., "Worked through Chapter 3"
3. **"Save"** → XP immediately credited

#### 2. Timer Session

**For:** Live tracking during studying

**Header timer:**
1. **Timer icon** in header (⏱️)
2. **Select subject:** Dropdown
3. Click **"Start"** → Timer runs
4. **Pause:** Pause timer (time preserved)
5. **"Finish"** → Session saved, XP credited

**Calendar timer:**
1. **Select planned session** in calendar
2. Click **"Start"** button
3. Timer runs automatically for planned duration
4. **"Finish"** → Session completed

#### 3. Planned Session

**For:** Pre-planning study times

1. **Open calendar** → **"New Session"**
2. **Set time & duration**
3. **"Save"** → Appears in calendar (no XP yet!)

**Execute later:**
- At scheduled time: Start session
- Or: Mark session as "completed"

### Understanding XP Credit

**Formula:**
```
XP = Minutes × Base rate + Bonus

Base rate: 10 XP/min
Bonus: +5 XP/min (if subject has exam date)
```

**Example calculations:**

| Duration | Exam Date | Calculation | XP Earned |
|----------|-----------|-------------|-----------|
| 30 min | No | 30 × 10 | 300 XP |
| 30 min | Yes | 30 × 15 | 450 XP |
| 60 min | No | 60 × 10 | 600 XP |
| 60 min | Yes | 60 × 15 | 900 XP |
| 120 min | Yes | 120 × 15 | 1,800 XP |

**Optimization:**
- **Set exam dates:** +50% XP!
- **Longer sessions:** More XP at once
- **Study regularly:** Streak bonuses (indirectly through achievements)

### Edit Sessions

**Why edit?**
- Correct typos
- Adjust duration (entered too short/long)
- Change subject retroactively

**How to edit:**
1. **Sessions list:** **"Sessions"** → Select session
2. **"Edit"** button
3. **Make changes:**
   - Change duration → XP recalculated
   - Change subject → XP bonus may change
   - Change date → Streak calculation may change
4. **"Save"** → Changes take effect immediately

**Important:**
- XP automatically recalculated
- Level may change (up or down)
- Streak may change (if date changed)

### Delete Sessions

**Effect:**
- Session removed
- XP deducted from total score
- Level may decrease
- Streak may break (if session was only entry that day)

**Procedure:**
1. Select session → **"Delete"** button
2. Confirmation: "Really delete?"
3. **Yes** → Session deleted, XP deducted

---

## Calendar & Planning

### Calendar Views

#### Month View

**Overview:** See entire month

**Usage:**
- Keep exam dates in view
- Identify free days
- Check session distribution

**Elements:**
- 🟢 Green dots: Completed sessions
- 🔵 Blue dots: Planned sessions
- 🔴 Red marker: Exam date

#### Week View

**Overview:** 7 days with time slots

**Usage:**
- Create weekly plan
- Recognize time conflicts
- Optimize daily structure

**Time slots:**
- 8:00 AM - 11:00 PM (customizable)
- Sessions displayed as blocks
- Color = subject color

#### Day View

**Overview:** Detailed daily plan

**Usage:**
- Today's schedule
- Next session in view
- Precise time planning

**Details:**
- Start time & end time of each session
- Subject name & color
- Status (planned/running/completed)

### Plan Sessions

#### Manual Planning

1. **Open calendar** (any view)
2. **Click time slot** (or **"New Session"** button)
3. **Form:**
   - Subject: e.g., "Mathematics 1"
   - Date: e.g., "2024-01-25"
   - Start time: e.g., "2:00 PM"
   - Duration: e.g., "60 minutes"
   - Repeat (optional): daily/weekly
4. **"Save"** → Session appears in calendar

#### Repeating Sessions

**Example:** Every Monday 2:00 PM-4:00 PM Mathematics

1. Create session (as above)
2. **Activate "Repeat":**
   - Daily
   - Weekly (e.g., every Monday)
   - Monthly
3. **Set end date:** e.g., "2024-02-28" (last occurrence)
4. **"Save"** → All appointments automatically created

**Use cases:**
- Fixed study times (e.g., Mon/Wed/Fri 10:00 AM)
- Weekly lecture follow-up
- Exam preparation (daily last 2 weeks)

### Automatic Session Generation

**Function:** Automatically distribute sessions until exam date

**Prerequisites:**
- Subject with exam date
- Weekly hours specified

**Procedure:**

1. **Open subject** (with exam date!)
2. Click **"Generate sessions"** button
3. **Parameters:**
   ```
   ┌──────────────────────────────────────────┐
   │ Automatic Session Generation             │
   ├──────────────────────────────────────────┤
   │ Subject: Mathematics 1                   │
   │ Exam: 02/15/2024 (in 21 days)           │
   │                                          │
   │ Weekly hours: [4] hours                  │
   │                                          │
   │ Time slots:                              │
   │   Mo [✓] Tu [✓] We [✓] Th [✓] Fr [✓]    │
   │   Sa [ ] Su [ ]                          │
   │                                          │
   │   From: [2:00 PM] To: [6:00 PM]          │
   │                                          │
   │ Session length: [60] minutes             │
   │                                          │
   │ Preview: 12 sessions will be created     │
   │                                          │
   │ [ Cancel ]  [ Generate ]                 │
   └──────────────────────────────────────────┘
   ```
4. Click **"Generate"** → Sessions automatically distributed!

**Algorithm:**
- Distributes weekly hours evenly across selected days
- Considers time slots (e.g., only 2:00 PM-6:00 PM)
- Stops at exam date
- Skips already occupied times (if other sessions exist)

**Example:**
- Weekly hours: 4h
- Days: Mon, Wed, Fri
- Time slots: 2:00 PM-6:00 PM
- Session length: 60 min
- Result: Mon 2:00 PM-3:00 PM, Wed 2:00 PM-3:00 PM, Fri 2:00 PM-4:00 PM (= 4h/week)

### Drag & Drop

**Move sessions:**
1. Click & hold session in calendar
2. Drag to new position
3. Release → Session moved

**Restrictions:**
- Only planned sessions (not completed!)
- Only within calendar
- Overlaps prevented

---

## XP & Leveling

### Level Progression

**Level table:**

| Level | XP Required | Cumulative XP | Title |
|-------|-------------|---------------|-------|
| 1 | 100 | 0-100 | Lernling |
| 2 | 400 | 100-500 | Lernling |
| 3 | 500 | 500-1,000 | Lernling |
| 4 | 500 | 1,000-1,500 | Lernling |
| 5 | 500 | 1,500-2,000 | Lernling |
| 10 | 500 | 4,500-5,000 | Wissensjäger |
| 20 | 500 | 9,500-10,000 | Studienkönig |
| 50 | 500 | 24,500-25,000 | Weiser |
| 100 | 500 | 49,500-50,000 | Lernlegende |

**Formula (from Level 3):**
```
XP for next level = 500 XP
Cumulative = (Level - 1) × 500 + 100
```

### Level-Up Event

**What happens on level-up:**

1. **Confetti animation** 🎉
   - Colorful confetti falls from top of screen
   - Duration: 3 seconds

2. **Notification:**
   ```
   ┌────────────────────────────────┐
   │  🎉 Level-Up!                  │
   │                                │
   │  Level 12 reached!             │
   │  You are now: Studienkönig     │
   │                                │
   │  +1 achievement unlocked       │
   └────────────────────────────────┘
   ```

3. **XP reset:**
   - Excess XP carried to next level
   - Example: Level-up at 5,120 XP (threshold: 5,000) → 120 XP for Level 11

4. **Title change:**
   - Dashboard shows new title
   - Profile updated

5. **Achievement (optional):**
   - Level achievements: Level 10, 25, 50, 100
   - Automatically unlocked

### XP Sources

**Primary: Learning sessions**
- 10-15 XP per minute (depending on exam date)
- 90% of all XP comes from sessions

**Secondary: Achievements** (future)
- Bonus XP for certain achievements
- E.g., +500 XP for 30-day streak

**Not possible:**
- Buying XP (no pay-to-win!)
- Cheating/manipulating (sessions validated)

---

## Streaks

### Streak Mechanics

**Definition:**
> A streak counts the number of consecutive days on which at least one learning session was completed.

**Rules:**

1. **+1 day:** At least 1 session per day (any duration)
2. **Streak continues:** Study every day
3. **Streak breaks:** No studying on one day → back to 0

**Timezone:**
- Berlin Time (UTC+1 / UTC+2 daylight saving)
- Day change: 00:00 (midnight)

**Example:**

```
Day 1 (Mon): 30 min studied → Streak: 1
Day 2 (Tue): 45 min studied → Streak: 2
Day 3 (Wed): 10 min studied → Streak: 3 (short sessions count too!)
Day 4 (Thu): NOT studied → Streak: 0 (broken!)
Day 5 (Fri): 60 min studied → Streak: 1 (restart)
```

### Streak Visualization

**Dashboard:**
```
🔥 Current Streak: 12 Days
🏆 Longest Streak: 28 Days
```

**Streak fire:**
- 1-2 days: 🔥 (small, orange)
- 3-6 days: 🔥🔥 (medium, red)
- 7-29 days: 🔥🔥🔥 (large, dark red)
- 30+ days: 🔥🔥🔥🔥 (huge, gold)

**Calendar:**
- Days with sessions: green marked
- Today: blue border
- Tomorrow: "Streak at risk!" (if no session today yet)

### Streak Achievements

**Milestones:**

| Streak Length | Achievement | Description |
|---------------|-------------|-------------|
| 3 days | 🔥 Fire Starter | Three days in a row |
| 7 days | 🔥🔥 Week King | A whole week maintained |
| 30 days | 🔥🔥🔥 Learning Machine | A month without interruption |
| 100 days | 🔥🔥🔥🔥 Unstoppable | Triple-digit streak! |

**Bonus:** (future)
- +500 XP at 30-day streak
- +2,000 XP at 100-day streak

### Streak Strategies

**Building:**
1. **Start realistic:** 10 min daily is enough!
2. **Fixed time:** Every day same time (e.g., 8:00 PM)
3. **Reminders:** Activate browser notifications
4. **Don't give up:** Even on stressful days plan 10 min

**Rescue:**
- **Streak at risk:** Dashboard shows warning from 10:00 PM
- **Emergency session:** Short 10-min session before midnight
- **Plan vacation:** Plan sessions beforehand or consciously take break

**Mentality:**
- **Quality > Quantity:** Better 20 min focused than 2h distracted
- **Consistency:** Streak shows discipline, not XP maximization
- **No stress:** Streak is motivation, not compulsion

---

## Achievements & Badges

### Categories

#### 🔥 Streak Achievements

| Name | Condition | Badge |
|------|-----------|-------|
| Fire Starter | 3 day streak | 🔥 |
| Week King | 7 day streak | 🔥🔥 |
| Learning Machine | 30 day streak | 🔥🔥🔥 |
| Unstoppable | 100 day streak | 🔥🔥🔥🔥 |

#### ⏱️ Time Achievements

| Name | Condition | Badge |
|------|-----------|-------|
| First Steps | 10 hours total | ⏱️ |
| Diligent | 50 hours total | ⏱️⏱️ |
| Expert | 100 hours total | ⏱️⏱️⏱️ |
| Master | 500 hours total | ⏱️⏱️⏱️⏱️ |

#### 📝 Task Achievements

| Name | Condition | Badge |
|------|-----------|-------|
| Beginner | 10 sessions | 📝 |
| Habit Builder | 50 sessions | 📝📝 |
| Pro | 100 sessions | 📝📝📝 |
| Veteran | 500 sessions | 📝📝📝📝 |

#### ⭐ Level Achievements

| Name | Condition | Badge |
|------|-----------|-------|
| Knowledge Hunter | Level 10 | ⭐ |
| Study King | Level 25 | ⭐⭐ |
| Sage | Level 50 | ⭐⭐⭐ |
| Learning Legend | Level 100 | ⭐⭐⭐⭐ |

### Achievements Page

**Navigation:** Sidebar → **"Achievements"**

**View:**
```
┌────────────────────────────────────────────────┐
│ 🏆 Achievements                          8/15   │
├────────────────────────────────────────────────┤
│                                                │
│  [✓] 🔥 Fire Starter      (3 day streak)       │
│  [✓] 🔥🔥 Week King       (7 day streak)       │
│  [ ] 🔥🔥🔥 Learning Machine (30 day streak)    │
│  [ ] 🔥🔥🔥🔥 Unstoppable   (100 day streak)    │
│                                                │
│  [✓] ⏱️ First Steps      (10h studied)         │
│  [✓] ⏱️⏱️ Diligent        (50h studied)         │
│  [ ] ⏱️⏱️⏱️ Expert         (100h studied)        │
│  [ ] ⏱️⏱️⏱️⏱️ Master        (500h studied)        │
│                                                │
│  [✓] 📝 Beginner         (10 sessions)         │
│  [✓] 📝📝 Habit Builder  (50 sessions)         │
│  [ ] 📝📝📝 Pro           (100 sessions)        │
│  [ ] 📝📝📝📝 Veteran      (500 sessions)        │
│                                                │
│  [✓] ⭐ Knowledge Hunter (Level 10)            │
│  [ ] ⭐⭐ Study King      (Level 25)            │
│  [ ] ⭐⭐⭐ Sage           (Level 50)            │
│  [ ] ⭐⭐⭐⭐ Learning Legend (Level 100)         │
└────────────────────────────────────────────────┘
```

**Elements:**
- **[✓] Green:** Achievement unlocked
- **[ ] Gray:** Not yet reached
- **Progress bar:** On some achievements (e.g., "50h: 32/50h")

### Achievement Notifications

**When unlocked:**
```
┌────────────────────────────────────┐
│  🎉 Achievement unlocked!          │
│                                    │
│  🔥🔥 Week King                     │
│  7 days studied in a row!          │
│                                    │
│  +200 XP Bonus                     │
└────────────────────────────────────┘
```

---

## Statistics & Analytics

### Dashboard Statistics

**Overview:** Quick access to most important metrics

**Available statistics:**
- XP progress (today, week, month, total)
- Study time (today, week, month, total)
- Streak (current, longest)
- Sessions (today, week, month, total)
- Achievements (unlocked/total)

### Statistics Page

**Navigation:** Sidebar → **"Statistics"**

#### 📊 XP Progress

**Line chart:** XP over time

**Views:**
- **Last 7 days:** Daily XP gains
- **Last 30 days:** Weekly XP gains
- **Last 12 months:** Monthly XP gains

**Interpretation:**
- **Upward trend:** Continuous improvement
- **Plateaus:** Stagnation (set exam dates for boost!)
- **Peaks:** Intensive study phases (often before exams)

#### 📈 Subject Performance

**Bar chart:** Study time per subject

**Views:**
- **Last 30 days**
- **Current semester**
- **Total**

**Interpretation:**
- **Dominant subjects:** Much time invested
- **Neglected subjects:** Red marked (< 2h/week)
- **Balanced distribution:** All subjects similar (ideal)

#### 🔥 Streak Monitoring

**Calendar heatmap:** Every day color-coded

**Color legend:**
- **Dark green:** > 120 min studied
- **Green:** 60-120 min
- **Light green:** 30-60 min
- **Very light green:** 1-30 min
- **Gray:** 0 min (streak break!)

**Use case:**
- Recognize patterns (e.g., "Always Saturday no session")
- Identify weak weekdays
- Visualize exam phases

#### 📅 Time-of-Day Analysis

**Heatmap:** Most productive times of day

**Axes:**
- X-axis: Weekday (Mon-Sun)
- Y-axis: Time (8:00 AM-11:00 PM)
- Color: Number of sessions / study time

**Interpretation:**
- **Hotspots (dark):** Optimal study times (e.g., Mon-Fri 2:00 PM-4:00 PM)
- **Empty areas (light):** Unused times (potential!)

**Benefit:**
- Find your most productive times
- Plan sessions accordingly
- Avoid unproductive times (e.g., after 10:00 PM)

---

## Feedback System

### Daily Feedback

**Purpose:** Reflection on study productivity

**Process:**

1. **After each session:** Optionally give feedback
2. **Scale: 1-5 stars**
   - ⭐ = Very unproductive, distracted
   - ⭐⭐ = Rather unproductive
   - ⭐⭐⭐ = Neutral
   - ⭐⭐⭐⭐ = Productive
   - ⭐⭐⭐⭐⭐ = Very productive, focused
3. **Comment (optional):** E.g., "Too loud in library"

**Example:**
```
┌──────────────────────────────────────────┐
│ How productive was this session?         │
├──────────────────────────────────────────┤
│  ⭐ ⭐ ⭐ ⭐ ⭐                              │
│  [ ] [ ] [ ] [ ] [✓]                     │
│                                          │
│  Comment (optional):                     │
│  [Very focused, good flow feeling]       │
│                                          │
│  [ Skip ]  [ Save ]                      │
└──────────────────────────────────────────┘
```

### Feedback Statistics

**Navigation:** Statistics → **"Feedback Overview"**

**Views:**

#### Average Productivity

**Per subject:**
```
Mathematics 1:     ⭐⭐⭐⭐⭐ (4.8/5)
Programming:       ⭐⭐⭐⭐   (4.2/5)
Business Admin:    ⭐⭐⭐     (3.1/5)  ← Room for improvement!
```

#### Time-of-Day Productivity

**Heatmap:** When are you most productive?

**Example insight:**
- Morning (8:00 AM-12:00 PM): ⭐⭐⭐⭐⭐ (4.6/5)
- Afternoon (2:00 PM-6:00 PM): ⭐⭐⭐⭐ (4.0/5)
- Evening (8:00 PM-11:00 PM): ⭐⭐⭐ (2.8/5) → Better avoid!

#### Weekday Productivity

**Bar chart:**
```
Mon: ⭐⭐⭐⭐   (4.1/5)
Tue: ⭐⭐⭐⭐⭐ (4.7/5)  ← Most productive day!
Wed: ⭐⭐⭐⭐   (3.9/5)
Thu: ⭐⭐⭐     (3.2/5)  ← Midweek slump?
Fri: ⭐⭐⭐⭐   (4.0/5)
Sat: ⭐⭐⭐     (2.9/5)
Sun: ⭐⭐       (2.1/5)  ← Rest instead of study
```

### Benefit of Feedback

**For you:**
- Recognize unproductive patterns
- Optimize study times
- Identify difficult subjects
- Improve your study environment

**For developers:** (anonymous)
- System improvements
- Feature priorities
- Usability optimizations

---

## Tips & Best Practices

### Productivity Strategies

#### 1. Pomodoro Technique

**Process:**
1. 25 min focused study (Pomodoro)
2. 5 min break
3. After 4 Pomodoros: 15-30 min long break

**In Lernplaner:**
- Set timer to 25 min
- After 4 sessions: Plan long break
- Give feedback for each Pomodoro

#### 2. Time-Blocking

**Process:**
1. Plan week in advance
2. Fixed time blocks for each subject
3. No overlaps
4. Buffer for unexpected

**In Lernplaner:**
- Use week view
- Create repeating sessions
- Use automatic generation

#### 3. Exam Preparation

**3 weeks before exam:**
1. Create subject with exam date (15 XP/min!)
2. Increase weekly hours (e.g., 10h)
3. Automatically generate sessions
4. Daily at least 1 session (streak!)

**1 week before exam:**
- Intensive mode: 2-3 sessions daily
- Use feedback (most productive times)
- Short sessions (60 min) instead of marathon (4h+)

### Motivation Tips

#### XP Optimization

**Strategy 1: Set exam dates**
- Effect: +50% XP (+5 XP/min)
- Example: 60 min = 900 XP instead of 600 XP
- Also set fictitious dates (e.g., "Self-test at end of month")

**Strategy 2: Longer sessions**
- Effect: More XP per session
- But: Quality > Quantity (Pomodoro breaks!)
- Optimal: 60-90 min per session

**Strategy 3: Daily routine**
- Effect: Streak achievements (+ bonus XP in future)
- Example: 30 min daily = 3,000 XP/week + Streak

#### Maintaining Streaks

**Tip 1: Minimal study goal**
- 10 min daily enough for streak!
- Doable even on stressful days
- Increase quality later

**Tip 2: Fixed time**
- Every day same time
- Habit forms after 21 days
- Set reminder (phone alarm)

**Tip 3: Emergency plan**
- From 10:00 PM: "Streak at risk!" warning
- Short 10-min session before midnight
- Quizzes/flashcards count too

### Organization Tips

#### Subject Management

**Color coding:**
- Similar subjects, similar colors
- Example: All math courses blue, all CS courses green
- Calendar becomes clearer

**Archiving:**
- After exam: Archive subject
- Statistics remain
- Active subjects list stays clear

#### Calendar Tricks

**Template weeks:**
1. Plan ideal week
2. Save as repeating sessions
3. Move individual appointments as needed

**Plan buffers:**
- Don't pack every time slot
- Leave 1-2h per day free
- For spontaneous sessions or rest

### Using Statistics

**Weekly reviews:**
1. Every Sunday: Look at statistics
2. Ask questions:
   - Which subject was neglected?
   - When was I most productive?
   - How was my streak?
3. Plan next week accordingly

**Monthly retrospectives:**
1. Check XP progress: Upward trend?
2. Subject performance: Balanced?
3. Feedback statistics: Where unproductive?
4. Set goals: Next level, streak, subject focus

---

## Frequently Asked Questions

### General

**Q: Is Lernplaner free?**
A: Yes, completely free and open source!

**Q: Does Lernplaner work offline?**
A: No, currently only online. Offline mode planned (roadmap).

**Q: Can I use Lernplaner on mobile?**
A: Yes, via browser (responsive design). Native app planned.

### XP & Levels

**Q: How much XP do I need for Level 100?**
A: 49,500 XP cumulative (approx. 3,300 hours with 15 XP/min or 4,950h with 10 XP/min)

**Q: Can I lose XP?**
A: Yes, if you delete sessions or subjects with sessions.

**Q: Why do I sometimes get 10 XP/min and sometimes 15 XP/min?**
A: 15 XP/min only if the subject has an exam date!

### Streaks

**Q: Do multiple sessions on one day count multiple times?**
A: No, streak only counts days (not sessions). 1 or 10 sessions = +1 day streak.

**Q: What happens if I'm on vacation?**
A: Streak breaks (currently). Planned for future: "Streak Freeze" (skip 1 day once per month).

**Q: Can I add sessions retroactively to save my streak?**
A: Yes, you can create sessions in the past. But please stay honest! 😊

### Achievements

**Q: When are new achievements added?**
A: Regularly! See roadmap or follow GitHub updates.

**Q: Do I get bonus XP for achievements?**
A: Not currently, but planned (e.g., +500 XP for 30-day streak).

### Technical

**Q: Where is my data stored?**
A: In a PostgreSQL database on the server (GDPR compliant).

**Q: Can I export my data?**
A: Not currently, but planned (CSV export in roadmap).

**Q: Is my data shared with others?**
A: No! Your data is private. Optional: Anonymized statistics for research (opt-in).

---

**Have more questions?**
- **GitHub Issues:** https://github.com/dias-digital-assistant/lernplan_new/issues
- **Email:** dias@hs-ansbach.de
- **Documentation:** [README.md](../README.md)

---

**Good luck with Lernplaner!** 🎓📚🚀

---

**🇩🇪 German version:** [de/user-guide-de.md](de/user-guide-de.md)
