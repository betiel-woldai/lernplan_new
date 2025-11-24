# Changelog

All notable changes to the Lernplaner project.

## [1.0.0] - 2025-10-27

### Added - Feedback System Integration (Session 3)
**Implemented comprehensive feedback system for learning reflection.**

- Added "DIAS unterstützt mich meinen Lernfortschritt zu reflektieren" feedback question
- Triggers after successful subject creation and session save
- Once-per-day cooldown to prevent feedback fatigue
- Optional anonymous feedback with comment field
- Admin dashboard at `/admin/feedback-dashboard-lernplaner`
- Real-time summary statistics
- Filtering by trigger action, comment presence, date range
- Pagination support (50 items per page)

**New Files:**
- `/db/migrations/009_create_feedback_table.sql`
- `/src/components/LernplanFeedbackModal.tsx`
- `/src/hooks/useFeedbackCooldown.tsx`
- `/src/pages/api/feedback/submit.ts`
- `/src/pages/api/feedback/check-submission.ts`
- `/src/pages/api/admin/lernplan-auth.ts`
- `/src/pages/api/admin/lernplan-feedback.ts`
- `/src/pages/admin/feedback-dashboard-lernplaner.tsx`

**Modified Files:**
- `/src/components/SubjectsList.tsx`
- `/src/components/CompactTimer.tsx`

### Fixed - Bug Fixes (Session 1 & 2)
**Fixed thirteen critical bugs and improvements reported by users:**

1. **Streak Display UI Update (Bug #1)**
   - Added automatic streak calculation when sessions are saved
   - Created `streakCalculator.ts` utility
   - Streak updates immediately after session completion

2. **Start Button Information Tooltip (Bug #2)**
   - Added info icon with German tooltip
   - Hover and click interactions

3. **Session Completion Modal Improvements (Bug #3)**
   - Fixed white text visibility issue
   - Set explicit dark text colors

4. **Subject Color Contrast (Bug #4)**
   - Replaced light yellow with amber-400
   - Improved text readability

5. **Quick Start Section Layout (Bug #5)**
   - Made Start button full-width
   - Reorganized timer elements

6. **Calendar Modal Subject Buttons (Bug #6)**
   - Changed from dark to light gray colors
   - Better visual hierarchy

7. **Exam Badge Contrast (Bug #7)**
   - Changed from yellow to red badges
   - More prominent exam indicators

8. **Session Save Modal (Bug #8)**
   - Modal appears above timer
   - z-index: 10000 for proper layering

9. **Session Completion Sound (Bug #9)**
   - Removed alert sound
   - Silent session completion

10. **Modal Background Blur (Bug #10)**
    - Added backdrop-blur-sm
    - Better focus on modal content

11. **Session Completion Message (Bug #11)**
    - Changed to "Änderungen gespeichert!"
    - More accurate confirmation

12. **Calendar Save Notification (Bug #12)**
    - Centered success message
    - Green background confirmation

13. **Subject Completion Toggle (Bug #13)**
    - Toggle shows in completion modal
    - Mark subjects as done

### Technical Implementation
- Database: `lernplan_feedback` table
- Cooldown: 24-hour limit per user
- Authentication: Cookie-based admin session
- Integration: React Portal for modal rendering

---

## Earlier Versions

For earlier version history, see git commit history.
