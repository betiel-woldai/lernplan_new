# Lernplaner - Quick Start Guide

---

## What is Lernplaner?

Lernplaner is a **gamified learning management system** that is part of the DIAS ecosystem. It helps you achieve your learning goals through:

- **XP & Leveling:** Earn 10-15 XP per learning minute and progress through 100 levels
- **Learning Streaks:** Build daily learning habits and keep your streak alive 🔥
- **Smart Scheduling:** Automatic session generation based on exam dates
- **Gamification:** Achievements, badges, and level-up celebrations with confetti 🎉

---

## Prerequisites

### Option 1: With DIAS Frontend (Recommended)

Lernplaner runs together with DIAS Frontend. Follow the instructions in the **DIAS Frontend repository**:

```bash
# See: diasv31_frontend/my-app/docs/quick-start.md
```

**Advantages:**
- Single Sign-On (log in once for both apps)
- Easier Keycloak configuration
- Unified deployment

### Option 2: Standalone

If you want to use only Lernplaner:

- **Docker** (Version 20.10+) and **Docker Compose** (Version 2.0+)
- **Keycloak instance** (for authentication)
- **4 GB RAM** minimum
- **Free ports:** 3002, 5432

---

## Installation with DIAS (Recommended)

### Step 1: Clone Repositories

```bash
mkdir -p ~/dias-project
cd ~/dias-project

git clone https://github.com/dias-digitial-assistant/diasv31_frontend.git
git clone https://github.com/dias-digitial-assistant/lernplaner.git
```

### Step 2: Configure Environment Variables

```bash
cd lernplaner

# Copy template
cp .env.example .env

# Edit
nano .env
```

**Minimal .env configuration:**

```env
# === Database ===
DATABASE_HOST=lernplaner_postgres
DATABASE_NAME=lernplaner_data
DATABASE_USER=lernplaner_user
DATABASE_PASSWORD=lernplaner_password

# === Keycloak OAuth2 ===
KEYCLOAK_CLIENT_ID=lernplaner-client
KEYCLOAK_CLIENT_SECRET=your_lernplaner_client_secret
KEYCLOAK_ISSUER=http://localhost:8180/keycloak/realms/dias

# === NextAuth.js ===
NEXTAUTH_URL=http://localhost:3002/api/auth
NEXTAUTH_SECRET=your_nextauth_secret

# === Optional: Feedback Admin ===
FEEDBACK_ADMIN_USERNAME=admin
FEEDBACK_ADMIN_PASSKEY=your_admin_password
```

### Step 3: Start Docker

```bash
cd ../diasv31_frontend/my-app

# Create Docker network (if not already done)
docker network create app_network

# Start all services
docker-compose up -d --build

# Watch Lernplaner logs
docker-compose logs -f lernplaner_frontend
```

### Step 4: Configure Keycloak

**Important:** Lernplaner requires a Keycloak client!

See: **[../diasv31_frontend/my-app/docs/keycloak-setup.md](../../diasv31_frontend/my-app/docs/keycloak-setup.md)**

**Quick version:**
1. Keycloak Admin Console: `http://localhost:8180/keycloak/admin`
2. Create realm `dias` (if not already exists)
3. Create client `lernplaner-client`
4. Enter client secret in .env
5. Redirect URI: `http://localhost:3002/api/auth/callback/keycloak`

### Step 5: Open Lernplaner

```bash
open http://localhost:3002
```

**Expected:**
- Lernplaner homepage with "Sign In" button
- After login: Dashboard with XP, Level, and Streak

---

## Standalone Installation (without DIAS)

If you want to run Lernplaner independently from DIAS:

### Step 1: Clone Repository

```bash
git clone https://github.com/dias-digitial-assistant/lernplaner.git
cd lernplaner
```

### Step 2: Configure .env

```bash
cp .env.example .env
nano .env
```

```env
# Local PostgreSQL database
DATABASE_HOST=localhost
DATABASE_NAME=lernplaner_data
DATABASE_USER=lernplaner_user
DATABASE_PASSWORD=your_secure_password

# Keycloak (requires own instance!)
KEYCLOAK_CLIENT_ID=lernplaner-client
KEYCLOAK_CLIENT_SECRET=your_client_secret
KEYCLOAK_ISSUER=http://localhost:8180/keycloak/realms/dias

# NextAuth
NEXTAUTH_URL=http://localhost:3000/api/auth
NEXTAUTH_SECRET=<generate_with_openssl_rand_base64_32>
```

### Step 3: Set Up PostgreSQL Database

```bash
# Create database
createdb lernplaner_data

# Or via psql:
psql -U postgres
CREATE DATABASE lernplaner_data;
CREATE USER lernplaner_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE lernplaner_data TO lernplaner_user;
\q
```

### Step 4: Run Migrations

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Optional: Load test data
npm run db:seed
```

### Step 5: Start Development Server

```bash
npm run dev

# → http://localhost:3000
```

---

## First Steps

### 1. Understand the Dashboard

After logging in, you'll see the **Dashboard**:

```
┌─────────────────────────────────────────────┐
│  Level 5: Lernling                  XP: 420 │
│  ████████░░░░░░░░░░░░░░░░  420/1000 XP     │
│                                             │
│  🔥 Streak: 3 Days                          │
│  🏆 Achievements: 2/15                      │
│  📊 Last 7 Days: 180 Min                    │
└─────────────────────────────────────────────┘
```

**Dashboard elements:**
- **Level & XP:** Current progress and level title
- **XP progress bar:** How much XP until next level
- **Streak:** How many consecutive days you've studied
- **Achievements:** Unlocked gamification badges
- **Weekly stats:** Study time of last 7 days

### 2. Create First Subject

Click **"Subjects"** in navigation:

1. Click **"New Subject"** button
2. **Enter subject name:** e.g., "Mathematics 1"
3. **Choose color:** e.g., Blue (for visual distinction)
4. **Set exam date (optional):** e.g., "2024-02-15"
   - **Important:** With exam date, you get +5 XP bonus per minute! (15 XP/min instead of 10 XP/min)
5. **Weekly hours (optional):** e.g., "4 hours"
6. **"Save"**

### 3. Start First Learning Session

**Manual session:**

1. Navigate to **"Calendar"** → **"New Session"**
2. **Select subject:** "Mathematics 1"
3. **Enter duration:** e.g., "30 minutes"
4. **"Start session"**
5. Timer runs → After completion: XP automatically credited!

**Header timer:**

1. Click **timer icon** in header
2. **Select subject**
3. Click **"Start"**
4. **Pause/Stop** as needed
5. **"Finish"** → XP credited

### 4. Understand XP and Levels

**XP calculation:**

```
XP earned = Minutes × Base rate + Bonus

Base rate: 10 XP/min
Bonus: +5 XP/min (if subject has exam date)

Examples:
  30 min without exam date: 30 × 10 = 300 XP
  30 min with exam date: 30 × 15 = 450 XP
  60 min with exam date: 60 × 15 = 900 XP
```

**Level system:**

- **Level 1:** 0-100 XP (Lernling)
- **Level 2:** 100-500 XP (Lernling)
- **Level 3:** 500-1000 XP (Lernling)
- **Level 4+:** +500 XP per level
- **Level 100:** 49,500 XP (Lernlegende 🏆)

**Level titles:**
- Level 1-5: **Lernling** (Novice)
- Level 6-10: **Wissensjäger** (Knowledge Hunter)
- Level 11-20: **Studienkönig** (Study King)
- Level 21-50: **Weiser** (Sage)
- Level 51-99: **Wissensguru** (Knowledge Guru)
- Level 100: **Lernlegende** (Learning Legend) 🎉

### 5. Build Streaks

**What is a streak?**
A streak counts the number of consecutive days you've completed at least one learning session.

**Streak mechanics:**
- ✅ **+1 day:** At least 1 session per day
- 🔥 **Streak continues:** Study every day
- ❌ **Streak breaks:** No studying on one day → Streak back to 0

**Tips:**
- Set a daily learning goal (e.g., 30 min)
- Use reminders (browser notifications)
- Even short sessions count (10 min is enough!)

### 6. Unlock Achievements

Navigate to **"Achievements"**:

**Categories:**
- **🔥 Streak Achievements:** 3 days, 7 days, 30 days, 100 days
- **⏱️ Time Achievements:** 10h, 50h, 100h, 500h total studied
- **📝 Task Achievements:** 10, 50, 100 sessions completed
- **⭐ Level Achievements:** Level 10, 25, 50, 100 reached

**Example achievements:**
```
🔥 Fire Starter (3 day streak)
⏱️ First Steps (10h study time)
📝 Habit Builder (10 sessions)
⭐ Knowledge Hunter (Level 10)
```

### 7. Use Calendar

**Calendar views:**
- **Month:** Overview of all planned sessions
- **Week:** Weekly plan with time slots
- **Day:** Detailed daily view

**Plan sessions:**
1. **Open calendar** → **"New Session"**
2. **Select date & time**
3. **Choose subject**
4. **Set duration**
5. **"Save"**

**Automatic session generation:**
1. **Create subject with exam date**
2. Click **"Generate sessions"** button
3. **Specify weekly hours:** e.g., "5 hours"
4. **Choose time slots:** e.g., Mon-Fri, 2:00 PM-6:00 PM
5. **"Generate"** → Sessions automatically distributed until exam date!

---

## Frequently Asked Questions

### How do I maximize my XP?

1. **Set exam dates:** +5 XP bonus per minute (50% more!)
2. **Longer sessions:** More minutes = more XP
3. **Study daily:** Build streak (additional achievements)
4. **Multiple subjects:** Various subjects with exam dates

### What happens on level-up?

On every level-up:
- 🎉 **Confetti animation**
- 🏆 **New level title** (e.g., "Knowledge Hunter")
- 📊 **Progress display** updates
- ✅ **Level achievements** unlocked (e.g., Level 10, 25)

### Can I add sessions retroactively?

Yes! Navigate to **"Sessions"** → **"New Session"**:
- **Select date in the past**
- **Enter duration**
- **Choose subject**
- **"Save"** → XP credited retroactively

### What's the difference between Sessions and Calendar?

- **Sessions:** Completed learning sessions (past) → count for XP
- **Calendar:** Planned sessions (future) → no XP yet

### How does the feedback system work?

After each session:
- **5-point scale:** How productive was the session?
- **Optional:** Add comment
- **Statistics:** Average productivity per subject

---

## Tips & Tricks

### Productivity Tips

1. **Use Pomodoro technique:** 25 min study, 5 min break
2. **Set exam dates:** Motivation + 50% more XP
3. **Daily routine:** Build streak for consistent progress
4. **Realistic goals:** Better 30 min daily than 3h once per week

### Optimize Gamification

1. **Achievements as goals:** Focus on next achievements (e.g., 7-day streak)
2. **Level titles as motivation:** "Knowledge Guru" sounds better than "Level 51"
3. **Use XP boost:** Set exam dates for 15 XP/min
4. **Compare with friends:** Share your level progress (optional)

### Organization

1. **Color coding:** Each subject different color in calendar
2. **Plan weekly hours:** Automatic session generation saves time
3. **Use feedback:** Reflect on which subjects are difficult
4. **Watch statistics:** Dashboard shows weak days/times

---

## Troubleshooting

### Session was not saved

**Solution:**
```bash
# Check logs
docker-compose logs -f lernplaner_frontend

# Test database connection
docker-compose exec lernplaner_postgres psql -U lernplaner_user -d lernplaner_data -c "SELECT COUNT(*) FROM learning_sessions;"
```

### XP not credited

**Possible causes:**
1. **Session not finished:** Click "Finish" button
2. **Database error:** See logs
3. **Subject not selected:** Sessions require a subject

**Solution:**
```sql
-- Manual XP credit (via psql)
UPDATE users SET xp = xp + 300 WHERE email = 'your@email.com';
```

### Streak is incorrect

**Streak logic:**
- Counts only days with completed sessions
- Timezone: Berlin (UTC+1/UTC+2)
- Day change: 00:00 (midnight)

**Solution:**
```bash
# Check gamification events
docker-compose exec lernplaner_postgres psql -U lernplaner_user -d lernplaner_data

SELECT * FROM gamification_events WHERE user_id = 'your_user_id' ORDER BY created_at DESC LIMIT 10;
```

---

## Further Documentation

### For Users
- **User Guide:** [user-guide.md](user-guide.md)
- **DIAS Integration:** [../diasv31_frontend/my-app/README.md](../../diasv31_frontend/my-app/README.md)

### For Developers
- **API Documentation:** [../README.md#API-Documentation](../README.md#-api-documentation)
- **Database Schema:** [../README.md#Database-Schema](../README.md#-database-schema)
- **Gamification System:** [../README.md#Gamification-System](../README.md#-gamification-system)

### Technical Details
- **Docker Setup:** [../README.md#Docker-Setup](../README.md#-docker-setup-recommended)
- **Keycloak Integration:** [../../diasv31_frontend/my-app/docs/keycloak-setup.md](../../diasv31_frontend/my-app/docs/keycloak-setup.md)

---

## Support

- **GitHub Issues:** https://github.com/dias-digitial-assistant/lernplaner/issues
- **Email:** dias@hs-ansbach.de
- **Documentation:** [README.md](../README.md)

---

**Good luck with learning!** 🎓🚀

---

**🇩🇪 German version:** [de/quick-start-de.md](de/quick-start-de.md)
