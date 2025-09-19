# Database Integration - Lernplaner

This document describes the PostgreSQL database setup and integration for the Lernplaner gamified learning platform.

## Overview

The Lernplaner platform uses a dual database architecture:

1. **Main Application Database** (`lernplaner`) - Stores user data, subjects, learning sessions, and gamification data
2. **Authentication Database** (`keycloak`) - Reserved for future Keycloak integration

## Database Schema

### Core Tables

#### `users`
- Primary user data and gamification stats
- Tracks XP, level, learning streaks, and time statistics
- Includes daily/weekly learning time tracking

#### `subjects`
- Learning subjects with exam dates and targets
- Color-coded for UI display
- Configurable learning schedule (hours/week, days/week)

#### `learning_sessions`
- Individual study sessions with duration and completion status
- Tracks XP points earned per session
- Links to subjects and users

#### `achievements`
- Gamification achievements system
- Categories: streak, time, tasks, level
- Configurable threshold values

#### `user_achievements`
- Junction table for user-achievement relationships
- Tracks unlock timestamps and "new" status

#### `calendar_sessions`
- Scheduled learning sessions with time slots
- Supports different session types (study, exam, assignment)
- Integration with calendar views
- Metadata columns flag auto-generated entries and link them back to the originating subject exam (`is_auto_generated`, `source_subject_exam_id`, `scheduling_priority`)

#### `gamification_events`
- Activity tracking for XP gains, level-ups, achievements
- JSONB event data for flexible storage

## Environment Configuration

Required environment variables in `.env.local`:

```env
# Main Database
DATABASE_HOST="localhost"
DATABASE_PORT="5432"
DATABASE_NAME="lernplaner"
DATABASE_USER="postgres"
DATABASE_PASSWORD="postgres"

# Keycloak Database (Future)
KEYCLOAK_DATABASE_URL="postgresql://keycloak:keycloak@localhost:5433/keycloak"
```

## Database Setup

### Prerequisites

1. **Install PostgreSQL**:
   ```bash
   brew install postgresql@14
   brew services start postgresql@14
   ```

2. **Create Database User**:
   ```bash
   createuser -s postgres
   createdb lernplaner
   ```

### Migration Commands

```bash
# Run all migrations
npm run db:migrate

# Check migration status
npx tsx src/scripts/migrate.ts status

# Rollback last migration (removes record only)
npx tsx src/scripts/migrate.ts rollback

# Setup database (migrate + seed)
npm run db:setup
```

### Seeding Data

```bash
# Seed with sample data
npm run db:seed

# Clear all data
npx tsx src/scripts/seed.ts clear

# Reset database completely
npm run db:reset
```

## Database Connection

The application uses connection pooling via `src/lib/db.ts`:

```typescript
import { query, withTransaction, healthCheck } from '../lib/db';

// Basic query
const result = await query('SELECT * FROM users WHERE id = $1', [userId]);

// Transaction
await withTransaction(async (client) => {
  await client.query('UPDATE users SET xp = xp + $1 WHERE id = $2', [points, userId]);
  await client.query('INSERT INTO gamification_events ...');
});

// Health check
const health = await healthCheck();
```

## Performance Optimizations

### Indexes

The `002_add_indexes.sql` migration adds performance indexes for:

- User lookups by email and activity
- Subject queries by user and dates
- Session queries by date ranges and completion status
- Achievement tracking and gamification events

### Connection Pooling

- Maximum 10 concurrent connections
- 30-second idle timeout
- 5-second connection timeout
- Automatic pool cleanup on shutdown

## Sample Data

The seed script creates:

- **2 sample users** with different XP levels and streaks
- **4 subjects** (Math, English, History, Physics) with different configurations
- **30+ learning sessions** distributed over the last 30 days
- **25+ calendar sessions** scheduled for the next 14 days
- **11 achievements** across different categories
- **10+ user achievements** with various unlock dates
- **60+ gamification events** tracking user activity

## Database Scripts

### Migration Script (`src/scripts/migrate.ts`)
- Tracks applied migrations in `migrations` table
- Runs SQL files in order from `db/migrations/`
- Transaction-safe with rollback support

### Seed Script (`src/scripts/seed.ts`)
- Populates database with realistic development data
- Clears existing data before seeding
- Maintains referential integrity

### Test Script (`src/scripts/test-db.ts`)
- Verifies database connection and health
- Lists applied migrations and tables
- Useful for debugging connection issues

## Production Considerations

### Security
- Use strong passwords and restricted user permissions
- Enable SSL connections
- Regular security updates

### Backup
- Implement automated daily backups
- Test restore procedures regularly
- Consider point-in-time recovery

### Monitoring
- Monitor connection pool usage
- Track slow query performance
- Set up alerts for connection failures

### Scaling
- Consider read replicas for reporting
- Implement connection pooling at application level
- Monitor and optimize expensive queries

## Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check if PostgreSQL is running
   brew services list | grep postgresql
   
   # Start if stopped
   brew services start postgresql@14
   ```

2. **Role Does Not Exist**
   ```bash
   # Create the postgres user
   createuser -s postgres
   ```

3. **Database Does Not Exist**
   ```bash
   # Create the database
   createdb lernplaner
   ```

4. **Migration Failures**
   ```bash
   # Check current status
   npx tsx src/scripts/migrate.ts status
   
   # Reset and try again
   dropdb lernplaner && createdb lernplaner
   npm run db:setup
   ```

### Testing Connection

```bash
# Test database connectivity
export DATABASE_HOST="localhost" DATABASE_PORT="5432" DATABASE_NAME="lernplaner" DATABASE_USER="postgres" DATABASE_PASSWORD="postgres"
npx tsx src/scripts/test-db.ts
```

This should output connection status, PostgreSQL version, and list of tables.

## Future Enhancements

1. **Keycloak Integration** - Authentication and user management
2. **Data Analytics** - Learning progress and performance metrics  
3. **Backup Automation** - Scheduled backups and disaster recovery
4. **Performance Monitoring** - Query optimization and slow query analysis
5. **Multi-tenancy** - Support for multiple organizations/schools
