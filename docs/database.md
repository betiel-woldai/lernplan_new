# Database Integration - Lernplaner

This document describes the PostgreSQL database setup and integration for the Lernplaner gamified learning platform.

---

## Overview

The Lernplaner platform uses PostgreSQL 15 as its primary database, deployed via Docker as part of the DIAS ecosystem.

### Architecture

```
┌─────────────────────────────────────────┐
│         Keycloak SSO                     │
│      (Identity Provider)                 │
└──────────┬──────────────┬────────────────┘
           │              │
           ▼              ▼
   ┌──────────────┐   ┌────────────┐
   │ DIAS Frontend│   │ Lernplaner │
   │ (Port 3001)  │   │(Port 3002) │
   └──────┬───────┘   └─────┬──────┘
          │                 │
          ▼                 ▼
   ┌──────────────┐   ┌─────────────────┐
   │ user_postgres│   │lernplaner_postgres│
   │ (user_data)  │   │(lernplaner_data) │
   └──────────────┘   └─────────────────┘
```

**Deployment:**
- Both databases run in Docker containers
- Orchestrated by single `docker-compose.yml` in `../diasv31_frontend/my-app/`
- Internal Docker network communication
- Persistent data via Docker volumes

---

## Database Schema

### Core Tables

#### `users`
- **Purpose:** User profiles and gamification stats
- **Key Fields:**
  - `user_sub` (VARCHAR, PRIMARY KEY) - Keycloak user identifier
  - `email` (VARCHAR, UNIQUE) - User email address
  - `xp` (INTEGER) - Total experience points
  - `level` (INTEGER) - Current level
  - `streak` (INTEGER) - Current consecutive study days
  - `longest_streak` (INTEGER) - Personal record streak
  - `total_learning_time` (INTEGER) - Cumulative study minutes
  - `daily_learning_time` (INTEGER) - Today's study minutes
  - `weekly_learning_time` (INTEGER) - This week's study minutes
- **Indexes:** email, user_sub, xp, level

#### `subjects`
- **Purpose:** Learning subjects with exam dates and study targets
- **Key Fields:**
  - `id` (SERIAL, PRIMARY KEY)
  - `user_sub` (VARCHAR, FOREIGN KEY → users)
  - `name` (VARCHAR) - Subject name
  - `color` (VARCHAR) - Hex color code for UI
  - `exam_date` (DATE) - Target exam date (optional)
  - `start_date` (DATE) - Study start date
  - `hours_per_week` (INTEGER) - Planned weekly study hours
  - `days_per_week` (INTEGER) - Study days per week
  - `is_archived` (BOOLEAN) - Archive status
- **Indexes:** user_sub, exam_date, is_archived

#### `learning_sessions`
- **Purpose:** Individual study sessions with duration tracking
- **Key Fields:**
  - `id` (SERIAL, PRIMARY KEY)
  - `user_sub` (VARCHAR, FOREIGN KEY → users)
  - `subject_id` (INTEGER, FOREIGN KEY → subjects)
  - `duration` (INTEGER) - Session length in minutes
  - `xp_earned` (INTEGER) - XP points from this session
  - `completed` (BOOLEAN) - Completion status
  - `session_date` (TIMESTAMP) - When session occurred
  - `notes` (TEXT) - Optional session notes
- **XP Calculation:**
  - Base: 10 XP/minute
  - Bonus: +5 XP/minute if subject has exam date
  - Total: 10-15 XP per minute
- **Indexes:** user_sub, subject_id, session_date, completed

#### `calendar_sessions`
- **Purpose:** Scheduled learning sessions
- **Key Fields:**
  - `id` (SERIAL, PRIMARY KEY)
  - `user_sub` (VARCHAR, FOREIGN KEY → users)
  - `subject_id` (INTEGER, FOREIGN KEY → subjects, nullable)
  - `title` (VARCHAR) - Session title
  - `start_time` (TIMESTAMP) - Scheduled start
  - `end_time` (TIMESTAMP) - Scheduled end
  - `session_type` (VARCHAR) - Type: study, exam, assignment, break
  - `completed` (BOOLEAN) - Completion status
  - `description` (TEXT) - Optional description
  - `is_auto_generated` (BOOLEAN) - Auto-generated flag
  - `source_subject_exam_id` (INTEGER) - Source subject for auto-generation
- **Indexes:** user_sub, subject_id, start_time, session_type

#### `achievements`
- **Purpose:** Gamification achievement definitions
- **Key Fields:**
  - `id` (SERIAL, PRIMARY KEY)
  - `category` (VARCHAR) - Category: streak, time, tasks, level
  - `name` (VARCHAR) - Achievement name
  - `description` (TEXT) - Achievement description
  - `icon` (VARCHAR) - Icon/emoji representation
  - `threshold` (INTEGER) - Requirement to unlock
  - `badge_color` (VARCHAR) - Visual badge color
- **Categories:**
  - `streak`: Consecutive day milestones (3, 7, 30, 100 days)
  - `time`: Total study time (10h, 50h, 100h, 500h)
  - `tasks`: Session count (10, 50, 100, 500 sessions)
  - `level`: Level milestones (10, 25, 50, 100)

#### `user_achievements`
- **Purpose:** Junction table for unlocked achievements
- **Key Fields:**
  - `id` (SERIAL, PRIMARY KEY)
  - `user_sub` (VARCHAR, FOREIGN KEY → users)
  - `achievement_id` (INTEGER, FOREIGN KEY → achievements)
  - `unlocked_at` (TIMESTAMP) - When achievement was earned
  - `is_new` (BOOLEAN) - New badge indicator
- **Indexes:** user_sub, achievement_id, unlocked_at

#### `gamification_events`
- **Purpose:** Activity tracking and event log
- **Key Fields:**
  - `id` (SERIAL, PRIMARY KEY)
  - `user_sub` (VARCHAR, FOREIGN KEY → users)
  - `event_type` (VARCHAR) - Type: xp_gain, level_up, achievement_unlock, streak_update
  - `event_data` (JSONB) - Flexible event metadata
  - `created_at` (TIMESTAMP) - Event timestamp
- **Indexes:** user_sub, event_type, created_at

#### `lernplan_feedback`
- **Purpose:** User feedback on learning sessions
- **Key Fields:**
  - `id` (SERIAL, PRIMARY KEY)
  - `user_sub` (VARCHAR, FOREIGN KEY → users)
  - `session_id` (INTEGER, FOREIGN KEY → learning_sessions)
  - `rating` (INTEGER) - 1-5 star rating
  - `comment` (TEXT) - Optional feedback text
  - `created_at` (TIMESTAMP) - Feedback timestamp
- **Indexes:** user_sub, session_id, rating

---

## Environment Configuration

### Docker Environment (.env in diasv31_frontend/my-app/)

The main `.env` file in the DIAS Frontend directory contains database credentials:

```env
# Lernplaner PostgreSQL Database
LERNPLANER_DB_PASSWORD=lernplaner_password

# Used by docker-compose.yml to create:
# - Container: lernplaner_postgres
# - Database: lernplaner_data
# - User: lernplaner_user
```

### Lernplaner Application (.env in lernplaner/)

The Lernplaner app's `.env` file references the Docker database:

```env
# Database Connection
DATABASE_HOST=lernplaner_postgres  # Docker service name
DATABASE_NAME=lernplaner_data
DATABASE_USER=lernplaner_user
DATABASE_PASSWORD=lernplaner_password  # Must match LERNPLANER_DB_PASSWORD above

# Keycloak OAuth2 (SSO with DIAS)
KEYCLOAK_CLIENT_ID=lernplaner-client
KEYCLOAK_CLIENT_SECRET=your_client_secret_here
KEYCLOAK_ISSUER=http://localhost:8180/keycloak/realms/dias

# NextAuth.js
NEXTAUTH_URL=http://localhost:3002/api/auth
NEXTAUTH_SECRET=your_nextauth_secret_here
```

**Important:**
- `DATABASE_HOST` uses Docker service name (`lernplaner_postgres`), not `localhost`
- Database name is `lernplaner_data` (not `lernplaner`)
- Password must match between both `.env` files

---

## Docker Setup

### Prerequisites

- Docker & Docker Compose installed
- Both `diasv31_frontend` and `lernplaner` repositories cloned

### Starting Database

The database is started automatically with the full DIAS stack:

```bash
# Navigate to DIAS Frontend docker-compose location
cd diasv31_frontend/my-app

# Create Docker network (if not exists)
docker network create app_network

# Start all services including Lernplaner database
docker-compose up -d

# Check database status
docker-compose ps lernplaner_postgres
```

### Database Access

```bash
# Access PostgreSQL shell
docker-compose exec lernplaner_postgres psql -U lernplaner_user -d lernplaner_data

# Inside psql:
\dt                    # List all tables
\d users               # Describe users table
SELECT * FROM users;   # Query users
\q                     # Exit
```

### Database Operations

```bash
# View logs
docker-compose logs -f lernplaner_postgres

# Restart database
docker-compose restart lernplaner_postgres

# Stop database
docker-compose stop lernplaner_postgres

# Remove database and volumes (WARNING: Data loss!)
docker-compose down -v
```

---

## Database Migrations

### Migration System

Lernplaner uses SQL migration files in `db/migrations/`:

- `001_initial_schema.sql` - Core tables and relationships
- `002_add_indexes.sql` - Performance indexes
- `003_achievements_system.sql` - Achievement tables
- `004_calendar_sessions.sql` - Calendar integration
- `005_gamification_events.sql` - Event tracking
- `006_feedback_system.sql` - User feedback
- `007_add_user_achievements_columns.sql` - Achievement enhancements
- `008_add_subjects_archived.sql` - Subject archiving
- `009_add_calendar_metadata.sql` - Calendar metadata

### Running Migrations

**Via Docker:**
```bash
# Migrations run automatically when container starts

# Or run manually:
docker-compose exec lernplaner_frontend npm run db:migrate
```

**Local Development:**
```bash
cd lernplaner

# Run all pending migrations
npm run db:migrate

# Check migration status
npx tsx src/scripts/migrate.ts status

# Rollback last migration
npx tsx src/scripts/migrate.ts rollback
```

### Seeding Data

```bash
# Seed database with sample data
npm run db:seed

# Setup (migrate + seed)
npm run db:setup

# Reset database completely
npm run db:reset

# Clear all data (keeps schema)
npx tsx src/scripts/seed.ts clear
```

---

## Performance Optimizations

### Indexes

The `002_add_indexes.sql` migration adds **40+ performance indexes**:

**User Lookups:**
- `idx_users_email` - Email-based queries
- `idx_users_xp`, `idx_users_level` - Leaderboard queries
- `idx_users_streak` - Streak tracking

**Subject Queries:**
- `idx_subjects_user_sub` - User's subjects
- `idx_subjects_exam_date` - Upcoming exams
- `idx_subjects_archived` - Active subjects filter

**Session Queries:**
- `idx_learning_sessions_user_sub` - User's sessions
- `idx_learning_sessions_subject_id` - Subject history
- `idx_learning_sessions_date` - Time-based queries
- `idx_learning_sessions_completed` - Completion status

**Gamification:**
- `idx_user_achievements_user_sub` - User's achievements
- `idx_gamification_events_user_sub` - Event history
- `idx_gamification_events_type` - Event type filtering

### Connection Pooling

Database connection managed in `src/lib/db.ts`:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  max: 10,                    // Maximum connections
  idleTimeoutMillis: 30000,   // 30s idle timeout
  connectionTimeoutMillis: 5000, // 5s connection timeout
});
```

**Features:**
- Maximum 10 concurrent connections
- Automatic connection recycling
- Health check endpoint
- Transaction support with `withTransaction()`

---

## Database Scripts

### Migration Script (`src/scripts/migrate.ts`)
- Tracks applied migrations in `migrations` table
- Runs SQL files in order from `db/migrations/`
- Transaction-safe with rollback support
- Handles both `.sql` and `.js` migration files

### Seed Script (`src/scripts/seed.ts`)
- Populates database with realistic development data
- Clears existing data before seeding
- Maintains referential integrity
- Creates sample users, subjects, sessions, achievements

### Test Script (`src/scripts/test-db.ts`)
- Verifies database connection and health
- Lists applied migrations and tables
- Useful for debugging connection issues
- Shows PostgreSQL version info

---

## Sample Data

The seed script (`npm run db:seed`) creates:

- **2 sample users** with different XP levels and streaks
- **4 subjects** (Mathematics, Physics, Chemistry, History) with various configurations
- **30+ learning sessions** distributed over the last 30 days
- **25+ calendar sessions** scheduled for the next 14 days
- **11 achievements** across different categories (streak, time, tasks, level)
- **10+ user achievements** with various unlock dates
- **60+ gamification events** tracking user activity history

---

## Production Considerations

### Security

- ✅ **Strong Passwords:** Use 32+ character random passwords
- ✅ **SSL Connections:** Enable SSL for production databases
- ✅ **Restricted Access:** Firewall rules, no public exposure
- ✅ **Regular Updates:** Keep PostgreSQL updated
- ✅ **Backup Encryption:** Encrypt database backups

### Backup Strategy

```bash
# Manual backup
docker-compose exec lernplaner_postgres pg_dump -U lernplaner_user lernplaner_data > backup.sql

# Restore from backup
cat backup.sql | docker-compose exec -T lernplaner_postgres psql -U lernplaner_user -d lernplaner_data

# Automated daily backups (cron job)
0 2 * * * cd /path/to/diasv31_frontend/my-app && docker-compose exec -T lernplaner_postgres pg_dump -U lernplaner_user lernplaner_data | gzip > /backups/lernplaner_$(date +\%Y\%m\%d).sql.gz
```

### Monitoring

- **Connection Pool:** Monitor active/idle connections
- **Slow Queries:** Log queries > 1 second
- **Disk Space:** Alert on low disk space
- **Replication Lag:** If using read replicas

### Scaling

- **Read Replicas:** For analytics and reporting
- **Connection Pooling:** PgBouncer for connection management
- **Query Optimization:** Analyze slow queries with `EXPLAIN`
- **Partitioning:** For large tables (sessions, events)

---

## Troubleshooting

### Common Issues

#### 1. Connection Refused

**Symptom:** `ECONNREFUSED` error

**Solution:**
```bash
# Check if database container is running
docker-compose ps lernplaner_postgres

# Check logs
docker-compose logs lernplaner_postgres

# Restart container
docker-compose restart lernplaner_postgres
```

#### 2. Authentication Failed

**Symptom:** `password authentication failed`

**Solution:**
```bash
# Verify credentials in both .env files match
grep DATABASE_PASSWORD lernplaner/.env
grep LERNPLANER_DB_PASSWORD diasv31_frontend/my-app/.env

# Recreate database with correct password
docker-compose down lernplaner_postgres
docker-compose up -d lernplaner_postgres
```

#### 3. Database Does Not Exist

**Symptom:** `database "lernplaner_data" does not exist`

**Solution:**
```bash
# Check docker-compose.yml has correct POSTGRES_DB
# Recreate container
docker-compose down lernplaner_postgres
docker-compose up -d lernplaner_postgres

# Verify database was created
docker-compose exec lernplaner_postgres psql -U lernplaner_user -l
```

#### 4. Migration Failures

**Symptom:** Migrations fail or get stuck

**Solution:**
```bash
# Check migration status
docker-compose exec lernplaner_frontend npm run db:migrate status

# Reset database (WARNING: Data loss!)
docker-compose exec lernplaner_postgres psql -U lernplaner_user -d lernplaner_data -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run migrations
docker-compose exec lernplaner_frontend npm run db:migrate
```

#### 5. Hostname Resolution

**Symptom:** `getaddrinfo ENOTFOUND lernplaner_postgres`

**Solution:**
```bash
# Verify Docker network exists
docker network ls | grep app_network

# Recreate network if missing
docker network create app_network

# Restart services
docker-compose down
docker-compose up -d
```

### Testing Connection

```bash
# From host machine
docker-compose exec lernplaner_postgres psql -U lernplaner_user -d lernplaner_data -c "SELECT 1;"

# From Lernplaner container
docker-compose exec lernplaner_frontend npx tsx src/scripts/test-db.ts
```

Expected output:
```
✅ Database connection successful
📊 PostgreSQL version: 15.x
📋 Tables found: 8
   - users
   - subjects
   - learning_sessions
   - calendar_sessions
   - achievements
   - user_achievements
   - gamification_events
   - lernplan_feedback
```

---

## Database Connection API

### Query Execution

```typescript
import { query, withTransaction, healthCheck } from '../lib/db';

// Basic query
const result = await query(
  'SELECT * FROM users WHERE email = $1',
  ['user@example.com']
);

// Parameterized insert
const newSubject = await query(
  'INSERT INTO subjects (user_sub, name, color) VALUES ($1, $2, $3) RETURNING *',
  [userSub, 'Mathematics', '#3B82F6']
);
```

### Transaction Support

```typescript
// Transaction with automatic rollback on error
await withTransaction(async (client) => {
  // Award XP
  await client.query(
    'UPDATE users SET xp = xp + $1 WHERE user_sub = $2',
    [points, userId]
  );

  // Log event
  await client.query(
    'INSERT INTO gamification_events (user_sub, event_type, event_data) VALUES ($1, $2, $3)',
    [userId, 'xp_gain', JSON.stringify({ xp: points })]
  );

  // If any query fails, entire transaction rolls back
});
```

### Health Check

```typescript
// Check database connectivity
const health = await healthCheck();

if (health.status === 'healthy') {
  console.log('Database OK');
} else {
  console.error('Database connection failed:', health.error);
}
```

---

## Future Enhancements

1. **Read Replicas** - Separate analytics database for heavy queries
2. **Partitioning** - Time-based partitioning for sessions and events tables
3. **Full-Text Search** - PostgreSQL FTS for subject/session search
4. **Materialized Views** - Pre-computed statistics for dashboard
5. **Data Archiving** - Automatic archiving of old sessions
6. **Multi-Tenancy** - Support for multiple organizations/schools
7. **CDC (Change Data Capture)** - Real-time data sync for analytics

---

**🇩🇪 German version:** [de/database-de.md](de/database-de.md)
