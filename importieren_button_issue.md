## Importieren Button issue - Goal: no Button should be visible at all

here the Button is visible for one second (see description to that below ## Issue of Button visible for one second)

  The "Importieren" button in the calendar header (next to "HS-Termine" checkbox) triggers a
  one-time import of university dates from terminplan.json into the calendar database. It only
  appears when dates haven't been imported yet.
  ─────────────────────────────────────────────────

  What the "Importieren" Button Does:

  Location: src/components/Calendar/Calendar.tsx:442-450

  Purpose: One-click import of university dates into calendar

  Button behavior:
  {!isTerminplanImported && (  // Only shows if NOT yet imported
    <button onClick={() => importTerminplan()}>
      Importieren  // "Import"
    </button>
  )}

  When clicked:
  1. Calls importTerminplan() function
  2. Fetches /api/cron/terminplan (POST)
  3. Reads db/terminplan.json
  4. Creates "Termine & Fristen" subject
  5. Inserts all dates as fixed calendar_sessions
  6. Button disappears after first import

  ---
  Why Remove It:

  User requirement: Dates should NOT be automatically implemented into calendar

  Problem: This button adds external university dates directly into the user's calendar system

  Solution: Remove the button completely (lines 441-450)

  Result:
  - Users can still see university dates via PDF link
  - No automatic date insertion into calendar
  - Calendar remains clean of external dates


## Issue of Button visible for one second:


The completion toggle button briefly appears on terminplan events due to a race condition during
   data fetching. The button's visibility depends on three optional properties (isFixed, isAllDay,
   subjectName) that may be undefined or false during initial render, causing the button to flash
  before the correct values arrive.


  📋 The "Checkmark Button" Visibility Issue Explained

  Where the Button Lives in the Code:

  File: src/components/Calendar/CalendarGrid.tsx:584-618

  The completion toggle button (checkmark/clock icon) has this visibility condition:

  {!session.isAllDay && !(session as any).isFixed && session.subjectName !== 'Termine & Fristen'
  && (
    <button onClick={(e) => handleSessionToggleComplete(session, e)}>
      {/* Button content */}
    </button>
  )}

  The Problem: Race Condition & Optional Properties

  Root Cause: The button shows briefly because of how the data flows from database → API →
  frontend:

  1. Database Schema (Conditional Columns)

  src/pages/api/calendar/index.ts:57-74

  const hasFixed = await hasFixedAppointmentColumns();  // Checks if columns exist

  const calendarMetadataSelect = hasMetadata
    ? `
      ${hasFixed ? 'cs.is_fixed' : 'false'} as "isFixed",      // ← Returns 'false' if column 
  doesn't exist!
      ${hasFixed ? 'cs.fixed_source' : "NULL"} as "fixedSource",
    `
    : `
      false as "isFixed",    // ← Fallback: always false!
      NULL as "fixedSource",
    `;

  Line 89:
  COALESCE(cs.is_all_day, false) as "isAllDay",  // ← Returns false if NULL or column missing!

  2. Type Definition (Optional Properties)

  src/types/calendar.ts:24-28

  export interface CalendarSession {
    // ... other fields ...
    isFixed?: boolean;      // ← OPTIONAL - can be undefined!
    fixedSource?: 'terminplan' | 'other';
    isAllDay?: boolean;     // ← OPTIONAL - can be undefined!
    popupMessage?: string;
  }

  Why the Button Appears Briefly:

  The Visibility Logic Breakdown:

  // Button appears when ALL three conditions are true:
  !session.isAllDay           // ← Initially: undefined or false = true! ✓
  && !(session as any).isFixed  // ← Initially: undefined or false = true! ✓
  && session.subjectName !== 'Termine & Fristen'  // ← Initially: might be undefined = true! ✓

  The Timeline of Events:

  0ms: Component renders
       ├─ Data not loaded yet
       ├─ isAllDay = undefined (evaluates to false)
       ├─ isFixed = undefined (evaluates to false)
       ├─ subjectName = undefined (not equal to 'Termine & Fristen')
       └─ Button condition = true → ✓ BUTTON SHOWS

  ~100-300ms: API response arrives
       ├─ Data parsed from database
       ├─ isAllDay = true (if column exists and properly set)
       ├─ isFixed = true (if column exists and properly set)
       ├─ subjectName = 'Termine & Fristen'
       └─ Button condition = false → ✗ BUTTON HIDES

  Result: Brief flash of the button before it disappears!

  Additional Issue: Schema Migration Dependency

  From src/pages/api/calendar/index.ts:65-66:

  If the database migration hasn't added the is_fixed and fixed_source columns:
  - hasFixed returns false
  - The query returns false as "isFixed" (hardcoded!)
  - Terminplan events will always show the button until migration runs

  Why This is a Problem:

  1. User Experience: Users see a clickable button that shouldn't exist
  2. Confusion: The button suggests terminplan events can be marked complete
  3. Data Integrity: If clicked, it might try to mark a fixed event as completed
  4. Visual Inconsistency: Button flashes create a janky UI experience

  The Three-Layer Protection:

  The code has three checks to prevent the button from showing:

  Line 584 checks:
  1. !session.isAllDay              // ← "Is this NOT an all-day event?"
  2. !(session as any).isFixed      // ← "Is this NOT a fixed/read-only event?"
  3. session.subjectName !== 'Termine & Fristen'  // ← "Is this NOT the admin subject?"

  But all three can fail during initial render!

  Where the Protection Workswell:

  Lines 131-134 (Toggle handler):
  // Do not allow toggling for fixed, all-day, or administrative subject sessions
  if ((session as any).isFixed || session.isAllDay || session.subjectName === 'Termine & Fristen')
   {
    return;  // ← This prevents actual execution
  }

  Lines 103-105 (Status calculation):
  // Fixed/all-day/admin entries are informational; treat as ausstehend
  if ((session as any).isFixed || session.isAllDay || session.subjectName === 'Termine & Fristen')
   {
    return 'ausstehend';
  }

  So even if the button shows and is clicked, these handlers will prevent it from doing anything
  harmful!

  ---
  Summary:

  The button shows briefly because:
  1. Optional TypeScript properties default to undefined
  2. undefined evaluates to false in boolean conditions
  3. During initial render before data loads, all three checks fail
  4. Once data arrives with proper values, button correctly hides
  5. If database schema lacks is_fixed column, the button ALWAYS shows until migration runs

  The issue is visible in code at:
  - CalendarGrid.tsx:584 - Button visibility condition
  - calendar/index.ts:65-74 - Conditional column selection
  - calendar/index.ts:89 - COALESCE fallback
  - calendar.ts:24-28 - Optional property definitions