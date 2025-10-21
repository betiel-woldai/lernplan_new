# Lernplaner Authentication Integration - TODO

## ✅ Completed Tasks (2025-10-21)

### 3. Fixed Terminplan Import for Multi-User Support

**Problem:** Terminplan import only worked for the first user. Subsequent users couldn't import terminplan events.

**Root Causes Identified:**
1. Database constraint prevented multiple users from having same terminplan events
2. SQL ON CONFLICT clause didn't match updated constraint
3. UUID generation created identical IDs across all users
4. Race conditions on user initialization
5. Email conflicts when users were deleted and re-registered in Keycloak
6. Database trigger blocked deletion of old users with terminplan data
7. Frontend fetched user stats before user initialization completed

**Fixes Applied:**

#### Fix #1: Multi-User Terminplan Constraint
- **File:** `/db/migrations/006_calendar_fixed_appointments.sql`
- **Changed:** `UNIQUE (fixed_source, fixed_source_key)` → `UNIQUE (user_id, fixed_source, fixed_source_key)`
- **Impact:** Each user can now have their own copy of terminplan events

#### Fix #2: SQL ON CONFLICT Update
- **File:** `/src/pages/api/cron/terminplan.ts` (line 255)
- **Changed:** `ON CONFLICT (fixed_source, fixed_source_key)` → `ON CONFLICT (user_id, fixed_source, fixed_source_key)`
- **Impact:** Upsert logic now correctly identifies duplicate events per user

#### Fix #3: User-Specific UUID Generation
- **File:** `/src/pages/api/cron/terminplan.ts` (line 230)
- **Changed:** `stableUUID('terminplan:...')` → `stableUUID('${userId}:terminplan:...')`
- **Impact:** Each user gets unique calendar session IDs

#### Fix #4: User Init Race Condition
- **File:** `/src/pages/api/users/init.ts` (lines 75-80)
- **Added:** `ON CONFLICT (id) DO UPDATE` to handle parallel requests
- **Impact:** Multiple simultaneous init requests no longer cause duplicate key errors

#### Fix #5: Email Conflict on Re-registration
- **File:** `/src/pages/api/users/init.ts` (lines 56-74)
- **Added:** Delete old user when email exists with different Keycloak ID
- **Impact:** Users can be deleted from Keycloak and re-registered with same email

#### Fix #6: Bypass Trigger for User Deletion
- **File:** `/src/pages/api/users/init.ts` (lines 65-71)
- **Added:** Transaction with `SET LOCAL app.bypass_fixed_guard = 'on'`
- **Impact:** Old users with terminplan sessions can be deleted during re-registration

#### Fix #7: User Stats Race Condition
- **File:** `/src/pages/api/users/[id].ts` (lines 75-97)
- **Changed:** Return default stats instead of 404 when user not found
- **Impact:** No more errors when stats are fetched before initialization completes

**New API Endpoint:**
- **File:** `/src/pages/api/terminplan/status.ts` (new)
- **Purpose:** Check if terminplan has been imported for current user
- **Returns:** `{ isImported: boolean, count: number }`

**Updated Hooks:**
- **File:** `/src/hooks/useCalendarSessions.tsx`
- **Added:** `isTerminplanImported` state (checks database, not just loaded sessions)
- **Added:** `useEffect` to check terminplan status on mount
- **Updated:** `importTerminplan` to set `isTerminplanImported = true` after successful import

**Updated Components:**
- **File:** `/src/components/Calendar/Calendar.tsx` (lines 445-461)
- **Added:** Better error handling and logging for import button
- **Added:** Explicit refresh of currently viewed month after import

**Testing Results:**
- ✅ User1 can import terminplan → 78 events
- ✅ User2 can import terminplan → 78 events (independent)
- ✅ Delete/re-register scenario works (old data deleted, fresh start)
- ✅ No race condition errors on first login
- ✅ "Importieren" button disappears after import
- ✅ Calendar displays terminplan events correctly
- ✅ Data completely isolated per user

## ✅ Completed Tasks (2025-10-20)

### 1. Fixed Authentication System
- ✅ Added SessionProvider to _app.tsx
- ✅ Updated all hooks to use authenticated session instead of demo user:
  - `useUserStats.tsx` - now uses `useSession()`
  - `useCalendarSessions.tsx` - now uses `useSession()`
  - `useSubjects.tsx` - now uses `useSession()`
- ✅ Fixed SSR compatibility (safe access pattern for useSession)
- ✅ Passed session from server-side props to SessionProvider
- ✅ Disabled client-side session refetching (no more 502 errors)
- ✅ Updated /api/users/init to use Keycloak ID as primary key
- ✅ Added automatic user initialization in Layout.tsx
- ✅ Updated /api/cron/terminplan to require authentication
- ✅ Added user_id filtering to all terminplan database queries

### 2. Verified Working Features
- ✅ User authentication via Keycloak
- ✅ User stats showing correct username ("Angemeldet als: User1")
- ✅ "Add new subject" functionality working
- ✅ Calendar entries displayed
- ✅ No 502 errors for /api/auth/session
- ✅ Data isolation per user (each user has their own data)

## ❌ Known Issues

No known critical issues at this time.

## 📋 Next Steps

### Phase 1: Additional Testing & Verification ✅ COMPLETED
- ✅ Test with multiple users to verify data isolation
- ✅ Test subject creation/editing/deletion
- ✅ Test calendar session management
- ✅ Test user stats and XP system
- ✅ Verify terminplan events appear on calendar after import
- ✅ Test delete/re-register scenario

### Phase 2: Optional Enhancements
- [ ] Add loading state to "Importieren" button during import
- [ ] Add success toast notification after successful import
- [ ] Add option to re-import/update terminplan events
- [ ] Add admin page to manage terminplan.json updates

### Phase 3: Documentation & Cleanup
- [ ] Update README.md with multi-user terminplan support details
- [ ] Document the database constraint changes
- [ ] Add migration notes for existing deployments
- [ ] Document environment variables needed

## 🔧 Files Modified (2025-10-21)

### Database Migrations
1. `/db/migrations/006_calendar_fixed_appointments.sql` - Updated unique constraint to include user_id

### API Endpoints
2. `/src/pages/api/cron/terminplan.ts` - Updated ON CONFLICT clause and UUID generation
3. `/src/pages/api/users/init.ts` - Added re-registration support and trigger bypass
4. `/src/pages/api/users/[id].ts` - Return default stats instead of 404
5. `/src/pages/api/terminplan/status.ts` - **NEW** - Check terminplan import status

### Hooks
6. `/src/hooks/useCalendarSessions.tsx` - Added isTerminplanImported state and status check

### Components
7. `/src/components/Calendar/Calendar.tsx` - Improved import button error handling

## 🔧 Files Modified (2025-10-20)

### Core Authentication
1. `/src/pages/_app.tsx` - Added SessionProvider
2. `/src/pages/index.tsx` - Pass session in getServerSideProps
3. `/src/pages/api/auth/[...nextauth].ts` - Cleaned up console logs

### Hooks Updated
4. `/src/hooks/useUserStats.tsx` - Use useSession() instead of getActiveUserId()
5. `/src/hooks/useCalendarSessions.tsx` - Use useSession() instead of getActiveUserId()
6. `/src/hooks/useSubjects.tsx` - Use useSession() instead of getActiveUserId()

### API Endpoints
7. `/src/pages/api/users/init.ts` - Handle Keycloak ID migration
8. `/src/pages/api/cron/terminplan.ts` - Add authentication and user filtering
9. `/src/components/Layout.tsx` - Auto-initialize users on load

### Infrastructure
10. `/Dockerfile.prod` - Added NEXT_PUBLIC_NEXTAUTH_URL build arg
11. `/diasv31_frontend/my-app/docker-compose.yml` - Pass build args and runtime env vars
12. `/.env.production` - Added NEXT_PUBLIC_NEXTAUTH_URL

## 🐛 Debug Commands

### Check if terminplan data exists:
```bash
ls -la /home/ankit/data/rashmi/dias/lernplan_new/db/terminplan.json
```

### Check container logs:
```bash
docker logs dias_lernplaner_frontend --tail 50
```

### Restart container:
```bash
cd /home/ankit/data/rashmi/dias/diasv31_frontend/my-app
docker compose restart lernplaner_frontend
```

### Rebuild container:
```bash
cd /home/ankit/data/rashmi/dias/diasv31_frontend/my-app
docker compose build lernplaner_frontend
docker compose up -d lernplaner_frontend
```

### Check database for imported terminplan sessions:
```sql
SELECT id, title, is_fixed, fixed_source, start_time
FROM calendar_sessions
WHERE user_id = '539d9804-8afd-402b-8eab-748d42b87e2f'
  AND is_fixed = true
  AND fixed_source = 'terminplan'
LIMIT 10;
```

## 📝 Important Notes

### Authentication Flow
1. User logs into DIAS via Keycloak
2. User navigates to lernplaner (shares Keycloak session)
3. getServerSideProps fetches session on server
4. Session passed to SessionProvider via pageProps
5. All hooks use useSession() to get authenticated user ID
6. API endpoints validate session with getServerSession()

### Cookie Configuration
- Path: `/dias_test/lernplaner` (isolated from DIAS)
- SameSite: `none` (cross-origin allowed)
- Secure: `true` (HTTPS only)
- Session duration: 1 hour

### Database Schema
- Users identified by Keycloak user ID (session.sub)
- All data tables filtered by user_id
- Terminplan events have `isFixed=true` and `fixedSource='terminplan'`

## 🚀 Quick Start for Tomorrow

1. **Check terminplan import issue:**
   ```bash
   # Check if terminplan.json exists
   ls -la /home/ankit/data/rashmi/dias/lernplan_new/db/terminplan.json

   # Check database for terminplan events
   docker exec dias_lernplaner_postgres psql -U lernplaner_user -d lernplaner_data \
     -c "SELECT COUNT(*) FROM calendar_sessions WHERE is_fixed = true AND fixed_source = 'terminplan';"
   ```

2. **Test import manually:**
   - Visit https://dias.hs-ansbach.de/dias_test/lernplaner
   - Open browser DevTools → Network tab
   - Click "Importieren" button
   - Check response for `/api/cron/terminplan`
   - Look for `applied: { added: X, updated: Y, removed: Z }`

3. **Verify calendar refresh:**
   - Add console.log to importTerminplan callback in useCalendarSessions.tsx
   - Check if refreshSessions() is called after successful import

## 📞 Contact/Support

- DIAS Production: https://dias.hs-ansbach.de/dias_test
- Lernplaner: https://dias.hs-ansbach.de/dias_test/lernplaner
- Container name: `dias_lernplaner_frontend`
- Database: `dias_lernplaner_postgres` (port 5432)

---

**Last Updated:** 2025-10-21 11:45
**Status:** All core features working ✅ | Multi-user terminplan import working ✅ | Ready for production testing ✅
