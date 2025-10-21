# Lernplaner Authentication Integration - Session Summary

**Date:** 2025-10-20
**Session Duration:** ~2 hours
**Status:** ✅ Authentication Working | ❌ Terminplan Import Needs Debug

## 🎯 Session Goals

1. ✅ Remove demo user system
2. ✅ Integrate Keycloak authentication
3. ✅ Ensure data isolation per user
4. ❌ Fix terminplan import (Status 200 but calendar not populating)

## 🔧 Technical Changes Made

### 1. Added NextAuth SessionProvider
**File:** `src/pages/_app.tsx`
```typescript
import { SessionProvider } from 'next-auth/react';

<SessionProvider session={session} refetchInterval={0} refetchOnWindowFocus={false}>
  <LanguageProvider>
    <Component {...pageProps} />
  </LanguageProvider>
</SessionProvider>
```

### 2. Updated All Hooks to Use Authentication
**Files Modified:**
- `src/hooks/useUserStats.tsx`
- `src/hooks/useCalendarSessions.tsx`
- `src/hooks/useSubjects.tsx`

**Pattern Applied:**
```typescript
// BEFORE
import { getActiveUserId } from '@/utils/user';
const userId = getActiveUserId(); // Returns demo user

// AFTER
import { useSession } from 'next-auth/react';
const sessionData = useSession();
const session = sessionData?.data;
const userId = session?.sub; // Returns authenticated Keycloak user ID
```

### 3. Fixed Server-Side Rendering (SSR)
**Problem:** `useSession()` returned `undefined` during SSR
**Solution:** Safe access pattern
```typescript
const sessionData = useSession();
const session = sessionData?.data;
const status = sessionData?.status || 'loading';
```

### 4. Passed Session from Server to Client
**File:** `src/pages/index.tsx`
```typescript
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  return {
    props: {
      session: JSON.parse(JSON.stringify(session)), // Serialize for client
      userName: session.user?.name || null,
      userEmail: session.user?.email || null,
    },
  };
};
```

### 5. Updated API Endpoints for Authentication
**File:** `src/pages/api/cron/terminplan.ts`
```typescript
const session = await getServerSession(req, res, authOptions);
if (!session) {
  return res.status(401).json({ error: 'Unauthorized' });
}

const userId = session.sub;
// All database queries filtered by userId
```

### 6. User Initialization on First Login
**File:** `src/components/Layout.tsx`
```typescript
useEffect(() => {
  const initializeUser = async () => {
    if (status === 'authenticated' && session) {
      await apiFetch('/api/users/init', { method: 'POST' });
    }
  };
  initializeUser();
}, [status, session]);
```

### 7. Docker Configuration Updates
**Files:**
- `Dockerfile.prod` - Added NEXT_PUBLIC_NEXTAUTH_URL build arg
- `docker-compose.yml` - Pass build args and runtime env vars
- `.env.production` - Added NEXT_PUBLIC_NEXTAUTH_URL

## 📊 Results

### ✅ Working Features
- User authentication via Keycloak
- Session sharing between DIAS and Lernplaner
- User stats showing correct username ("Angemeldet als: User1")
- Subject creation/editing/deletion
- Calendar entries display
- Data isolation per user
- No 502 errors for `/api/auth/session`

### ❌ Known Issues
- **Terminplan Import:** "Importieren" button returns 200 OK but calendar doesn't populate with university dates

## 🐛 Issue Analysis: Terminplan Import

### What Works:
1. ✅ Button click sends POST request to `/api/cron/terminplan`
2. ✅ API returns Status 200 OK
3. ✅ User is authenticated
4. ✅ Database import logic executes successfully

### What Doesn't Work:
1. ❌ Calendar doesn't refresh after import
2. ❌ Imported events not visible on calendar

### Possible Root Causes:
1. **Calendar not re-fetching after import**
   - `refreshSessions()` might not be called after successful import
   - Check importTerminplan callback in useCalendarSessions.tsx:484

2. **Terminplan events filtered out**
   - `showTerminplanEvents` state might be false
   - Check if filter logic hides events with `isFixed=true`

3. **Wrong date range**
   - Calendar might be loading different month than imported events
   - Verify imported event dates match current calendar view

4. **terminplan.json missing or invalid**
   - File might not exist at expected path
   - Data format might be incompatible

## 🔍 Debug Strategy for Tomorrow

### Step 1: Verify Data Source
```bash
# Check if terminplan.json exists
ls -la /home/ankit/data/rashmi/dias/lernplan_new/db/terminplan.json

# Check file content
cat /home/ankit/data/rashmi/dias/lernplan_new/db/terminplan.json | head -20
```

### Step 2: Check Import Response
1. Open Browser DevTools → Network tab
2. Click "Importieren" button
3. Find POST request to `/api/cron/terminplan`
4. Check response body:
   ```json
   {
     "checksum": "...",
     "applied": {
       "added": 80,    // Should be > 0
       "updated": 0,
       "removed": 0
     }
   }
   ```

### Step 3: Verify Database Insert
```sql
SELECT COUNT(*)
FROM calendar_sessions
WHERE is_fixed = true
  AND fixed_source = 'terminplan'
  AND user_id = '539d9804-8afd-402b-8eab-748d42b87e2f';
```

### Step 4: Add Debug Logging
**File:** `src/hooks/useCalendarSessions.tsx` (line 479)
```typescript
const importTerminplan = useCallback(async () => {
  try {
    console.log('🔍 Starting terminplan import...');
    const res = await apiFetch('/api/cron/terminplan', { method: 'POST' });
    const data = await res.json();
    console.log('🔍 Import response:', data);

    if (!res.ok) throw new Error(data?.error || 'Terminplan import failed');

    console.log('🔍 Refreshing sessions...');
    await refreshSessions();
    console.log('🔍 Sessions refreshed!');

    return data?.applied || null;
  } catch (e) {
    console.error('❌ Terminplan import failed', e);
    return null;
  }
}, [refreshSessions]);
```

## 📝 Environment Variables

### Required for Production:
```env
NODE_ENV=production
NEXTAUTH_URL=https://dias.hs-ansbach.de/dias_test/lernplaner
NEXT_PUBLIC_NEXTAUTH_URL=https://dias.hs-ansbach.de/dias_test/lernplaner
NEXTAUTH_SECRET=gsMz0B06D3NVswb4yLBaN/TL8ktzwVo5a14iC658sSA=
KEYCLOAK_CLIENT_ID=dias
KEYCLOAK_CLIENT_SECRET=Z90CyHgD7iBMTn54lBtfAjgMwtstjEPw
KEYCLOAK_ISSUER=https://dias.hs-ansbach.de/keycloak/realms/dias
DATABASE_HOST=dias_lernplaner_postgres
DATABASE_NAME=lernplaner_data
DATABASE_USER=lernplaner_user
DATABASE_PASSWORD=lernplaner_password
```

## 🚀 Container Management

### Restart Container:
```bash
cd /home/ankit/data/rashmi/dias/diasv31_frontend/my-app
docker compose restart lernplaner_frontend
```

### Rebuild Container:
```bash
cd /home/ankit/data/rashmi/dias/diasv31_frontend/my-app
docker compose build lernplaner_frontend
docker compose up -d lernplaner_frontend
```

### Check Logs:
```bash
docker logs dias_lernplaner_frontend --tail 100 --follow
```

### Check Container Status:
```bash
docker ps --filter "name=dias"
```

## 📚 Key Learnings

1. **NextAuth SessionProvider requires server-side session**
   - Pass session from getServerSideProps to pageProps
   - Disable client-side refetching when using server-side session

2. **NEXT_PUBLIC_ variables must be set at build time**
   - Use ARG in Dockerfile
   - Pass as build args in docker-compose.yml
   - Set at runtime won't work for client bundle

3. **SSR safety pattern for hooks**
   ```typescript
   const sessionData = useSession();
   const session = sessionData?.data;
   const status = sessionData?.status || 'loading';
   ```

4. **Keycloak user ID as primary key**
   - Use `session.sub` from Keycloak
   - Ensures consistent user identification
   - No need for separate user ID generation

## 🎓 Helpful Resources

- **NextAuth Docs:** https://next-auth.js.org/
- **Next.js basePath:** https://nextjs.org/docs/api-reference/next.config.js/basepath
- **Docker Compose:** https://docs.docker.com/compose/

---

**Next Session Goal:** Fix terminplan import to populate calendar with ~80 university dates

**Files to Focus On:**
1. `/src/hooks/useCalendarSessions.tsx` - importTerminplan callback
2. `/src/pages/api/cron/terminplan.ts` - import logic
3. `/db/terminplan.json` - source data
4. `/src/components/Calendar/Calendar.tsx` - calendar rendering and filters
