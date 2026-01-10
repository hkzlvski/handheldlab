# HandheldLab - User Flows Document

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Status:** Complete - LOCKED ✅

---

## Purpose

This document maps critical user decision flows to:
- Identify edge cases before implementation
- Clarify auth boundaries and state transitions
- Enumerate error states for proper handling
- Provide reference during development

**Scope:** 5 critical flows, ASCII diagrams, edge cases, error states  
**Non-Scope:** UI wireframes, pixel-perfect mockups, animation specs

---

## Table of Contents

1. [Flow 1: Sign Up → Verified Session](#flow-1-sign-up--verified-session)
2. [Flow 2: Submit Report → Pending → Admin Review](#flow-2-submit-report--pending--admin-review)
3. [Flow 3: Game Page → Compare → Decision](#flow-3-game-page--compare--decision)
4. [Flow 4: Admin Verification → Approve/Reject](#flow-4-admin-verification--approvereject)
5. [Flow 5: Profile → Submission Status Awareness](#flow-5-profile--submission-status-awareness)
6. [Global Non-Goals](#global-non-goals)

---

## Flow 1: Sign Up → Verified Session

### Diagram
```
Anonymous User
│
│ 1. Submit signup form
│    (email + password + username)
▼
Supabase Auth (signUp)
│
│ 2. Create auth.users row
▼
Database (auth schema)
│
│ 3. Trigger fires in SAME transaction:
│    handle_new_user()
│    → INSERT profiles (username from raw_user_meta_data)
▼
Auth record created (UNCONFIRMED)
│
│ 4. Send verification email
▼
User Email
│
│ 5. Click verification link
│    (/auth/callback?code=…)
▼
Next.js /auth/callback
│
│ 6. exchangeCodeForSession()
▼
Session Created (cookie set)
│
▼
Authenticated User
(can submit reports, upvote, etc.)

```

---

### Decision Points

| Decision | Condition | Outcome |
|----------|-----------|---------|
| **Email verified?** | YES | Session created, proceed to app |
| | NO | Blocked from login ("Email not confirmed") |
| **Username unique?** | YES | Account created |
| | NO | Signup fails, transaction rollback |
| **Password valid?** | YES (≥8 chars) | Proceed |
| | NO | Validation error |

---

### Edge Cases

**1. Duplicate Username:**
- User submits signup with existing username
- `profiles` INSERT fails (UNIQUE constraint)
- Trigger fails → signup fails (in practice this usually aborts the auth.users insert because it runs in the same DB transaction)
- User sees: "Username already taken, please choose another"
- User can retry with different username

**2. Verification Link Expired:**
- User clicks link after 24h (Supabase default expiry)
- User sees: "Verification link expired"
- User can request new verification email
- MVP: No UI for resend (user must sign up again OR contact support)

**3. User Refreshes Before Verification:**
- User navigates away after signup
- Returns to site before clicking email link
- State: Anonymous (no session)
- User can log in only after email verification

**4. Verification Link Clicked Twice:**
- First click: Creates session
- Second click: Code already used
- User sees error but already has session (acceptable)

**5. Username Validation Edge:**
- Username "Test-User_123" → valid
- Username "test user" → invalid (space not allowed)
- Username "ab" → invalid (too short, min 3)
- Validated client + server side

---

### Error States

| Error Code | Condition | User Message |
|------------|-----------|--------------|
| **400 BAD REQUEST** | Invalid email format | "Please enter a valid email address" |
| **400 BAD REQUEST** | Password too short | "Password must be at least 8 characters" |
| **400 BAD REQUEST** | Username invalid format | "Username can only contain letters, numbers, hyphens, and underscores" |
| **409 CONFLICT** | Username already exists | "Username already taken, please choose another" |
| **500 INTERNAL** | Trigger fails (unexpected) | "Signup failed. Please try again." |

---

### Success Outcome

- User has verified email
- User has active session (cookie)
- `profiles` row created with username
- User redirected to homepage (logged in state)
- User can now submit reports, upvote, view profile

---

## Flow 2: Submit Report → Pending → Admin Review

### Diagram
```
Authenticated User
     │
     │ 1. Navigate to /submit
     │    (middleware checks auth)
     ▼
Report Form
     │
     │ 2. Fill form:
     │    - Select game (dropdown or manual add)
     │    - Select device
     │    - Upload screenshot
     │    - Enter FPS metrics
     │    - Select TDP, resolution, preset
     │    - Optional: Proton, notes
     ▼
Client Validation
     │
     │ 3. Validate:
     │    - File type (jpeg/png)
     │    - File size (<5MB)
     │    - FPS logic (min ≤ avg ≤ max)
     ▼
Submit to Server
     │
     │ 4. POST /api/reports
     ▼
Server Validation
     │
     │ 5. Validate:
     │    - Content-Type (multipart/form-data)
     │    - Zod schema (all fields)
     │    - FPS range logic
     ▼
Upload Screenshot
     │
     │ 6. Upload to Supabase Storage
     │    Path: userId/timestamp-random.ext
     │    Storage policy enforces userId folder
     ▼
Server-Side Path Verification
     │
     │ 7. Verify:
     │    - Path starts with userId
     │    - File exists in storage
     ▼
Insert Database
     │
     │ 8. INSERT performance_reports
     │    - status = 'pending'
     │    - screenshot_storage_path = path
     │    - user_id = auth user
     ▼
Pending State
     │
     ▼
Admin Queue
(report awaits verification)
     │
     ▼
[See Flow 4: Admin Verification]
```

---

### Decision Points

| Decision | Condition | Outcome |
|----------|-----------|---------|
| **Auth valid?** | YES | Proceed to form |
| | NO | Redirect to homepage with error |
| **Client validation pass?** | YES | Enable submit button |
| | NO | Show inline errors |
| **Screenshot valid?** | YES (type, size) | Upload |
| | NO | Block submission |
| **FPS logic valid?** | min ≤ avg ≤ max | Proceed |
| | NO | Validation error |
| **Storage upload success?** | YES | Continue to DB |
| | NO | Retry or fail |
| **Game exists?** | YES | Link to existing |
| | NO | Create pending game first |

---

### Edge Cases

**1. Upload Succeeds, DB Insert Fails:**
- Screenshot uploaded to storage
- DB insert fails (network error, validation)
- Result: Orphaned file in storage
- MVP: Acceptable (cleanup job in v2)
- User sees: "Submission failed, please try again"

**2. Pending Game Exists:**
- User submits report for game not yet approved
- Check `games` table for pending game by name/slug
- If exists: Link report to pending game
- If not: Create new pending game
- Both game + report approved together by admin

**3. Duplicate Report (Same Game+Device+User):**
- User already has report for "Elden Ring + Steam Deck"
- System shows soft warning: "You already have X reports for this game/device"
- User can still submit (admin will review for duplicates)
- Admin may reject as duplicate

**4. Screenshot FPS >200:**
- User enters 240 FPS average
- Server flags as sanity check failure
- Report still submitted but highlighted in admin queue
- Admin reviews screenshot for validity

**5. User Abandons Form:**
- User uploads screenshot but doesn't submit
- Screenshot remains in storage (no DB reference)
- Orphaned file (acceptable for MVP)
- Cleanup job in v2

**6. Manual Game Entry:**
- User can't find game in dropdown
- Clicks "Add game manually"
- Enters game name (+ optional Steam App ID)
- Game created with status='pending'
- Linked to report (both pending)

---

### Error States

| Error Code | Condition | User Message |
|------------|-----------|--------------|
| **400 BAD REQUEST** | Invalid FPS logic (min > avg) | "FPS minimum cannot be greater than average" |
| **400 BAD REQUEST** | Missing required field | "Please fill in all required fields" |
| **400 BAD REQUEST** | Invalid storage path | "Screenshot upload failed - invalid path" |
| **401 UNAUTHORIZED** | Not authenticated | "Please log in to submit reports" |
| **403 FORBIDDEN** | Path doesn't match user | "Invalid screenshot path" |
| **404 NOT FOUND** | Screenshot not in storage | "Screenshot not found, please re-upload" |
| **413 PAYLOAD TOO LARGE** | File size >5MB | "Screenshot must be under 5MB" |
| **415 UNSUPPORTED MEDIA** | Wrong content type | "Please upload a JPEG or PNG image" |
| **500 INTERNAL** | DB insert fails | "Submission failed. Please try again." |

---

### Success Outcome

- Report created with status='pending'
- Screenshot stored in private bucket
- User sees: "Report submitted! Typically verified within 24 hours."
- User redirected to profile (can see pending report)
- Admin sees report in verification queue

---

## Flow 3: Game Page → Compare → Decision

### Diagram
```
Anonymous or Authenticated User
     │
     │ 1. Navigate to /games/[slug]
     │    (e.g., /games/elden-ring)
     ▼
Game Page (Server Component)
     │
     │ 2. Fetch:
     │    - Game metadata
     │    - Verified reports (paginated)
     │    - User vote state (if authenticated)
     ▼
Display Game Header
     │
     │ 3. Show:
     │    - Game name
     │    - Report count (if ≥10: "X verified reports")
     │    - [View on Steam →] link (if steam_app_id exists)
     ▼
Filter by Device
     │
     │ 4. User clicks device pill
     │    (e.g., "Steam Deck OLED")
     │    Updates URL: ?device=steam-deck-oled
     ▼
Sort Reports
     │
     │ 5. User selects sort:
     │    - Most Helpful (default)
     │    - Newest First
     │    - Highest FPS
     │    - Lowest TDP
     ▼
Reports Grid (Paginated)
     │
     │ 6. Display 12 reports per page
     │    Generate signed URLs for screenshots
     ▼
User Compares
     │
     │ 7. User views:
     │    - Screenshots (FPS overlays)
     │    - Metrics (FPS, TDP, resolution)
     │    - Settings (preset, Proton version)
     │    - Upvotes (social proof)
     ▼
User Interaction
     │
     ├─> Click screenshot → Full-size modal
     ├─> Click upvote → Toggle vote (auth required)
     └─> Click "Load More" → Next 12 reports
     │
     ▼
Decision Point
     │
     ├─> Buy game (external Steam link)
     ├─> Skip (not enough confidence)
     └─> Save for later (bookmark page)
```

---

### Decision Points

| Decision | Condition | Action |
|----------|-----------|--------|
| **Device filter applied?** | YES | Show only reports for selected device |
| | NO | Show all reports |
| **Sort by FPS?** | YES | Order by fps_average DESC |
| **Sort by TDP?** | YES | Order by tdp_watts ASC (lower = better battery) |
| **User authenticated?** | YES | Show upvote state (filled/outline heart) |
| | NO | Show upvote count only |
| **Click upvote (anon)?** | Show login modal |
| **Click upvote (auth)?** | Toggle vote (optimistic UI) |

---

### Edge Cases

**1. No Reports for Selected Device:**
- User filters by "ROG Ally X"
- No verified reports exist for that device
- Empty state: "No verified reports yet for ROG Ally X. Be the first! [Submit Report →]"
- User can remove filter or submit first report

**2. Only 1 Report Exists:**
- User sees single report
- Low confidence (can't compare)
- UI doesn't explicitly warn (implicit: low count)
- User can still make decision or wait for more reports

**3. Signed URL Expired:**
- User opens page after 1 hour (signed URL TTL)
- Screenshot images fail to load
- Server Component regenerates signed URLs on page refresh
- User refreshes → images load

**4. Report Count <10:**
- Game has 3 verified reports
- UI shows: "Few verified reports" (not "3 verified reports")
- Avoids false confidence from exact low numbers

**5. User's Own Pending Report:**
- Authenticated user has pending report for this game
- User sees: Verified reports + own pending (with ⏳ Pending badge)
- Only user can see their own pending

**6. User's Own Rejected Report:**
- User submitted report, admin rejected
- User sees: Verified reports + own rejected (with ❌ Rejected badge + reason tooltip)
- Only user can see their own rejected

---

### Error States

| Error Code | Condition | User Message |
|------------|-----------|--------------|
| **404 NOT FOUND** | Game slug doesn't exist | "Game not found" (404 page) |
| **500 INTERNAL** | Database query fails | "Failed to load reports. Please refresh." |

---

### Success Outcome

- User sees verified performance data
- User can compare multiple configurations
- User makes informed purchase decision
- User upvotes helpful reports (if authenticated)
- User navigates to Steam to buy (external link)

---

## Flow 4: Admin Verification → Approve/Reject

### Diagram
```
Admin User
     │
     │ 1. Navigate to /admin
     │    (middleware checks is_admin)
     ▼
Admin Verification Queue
     │
     │ 2. Fetch pending reports
     │    Ordered by: oldest first (FIFO)
     │    Or: flagged first (sanity checks)
     ▼
Reports Table
     │
     │ 3. Display:
     │    - Screenshot thumbnail
     │    - Game | Device
     │    - FPS metrics
     │    - Settings summary
     │    - Submitted by @username
     │    - [View] [Approve] [Reject]
     ▼
Click [View]
     │
     │ 4. Open review modal
     ▼
Review Modal
     │
     │ 5. Show:
     │    - Full-size screenshot
     │    - All report details
     │    - Sanity check flags:
     │      ⚠️ FPS >200
     │      ⚠️ TDP >30W
     │      ⚠️ Screenshot <50KB
     ▼
Admin Decision
     │
     ├─────────────┬─────────────┐
     │             │             │
  Approve      Reject        Close
     │             │             │
     ▼             ▼             ▼
```

**Approve Path:**
```
Click [Approve]
     │
     │ 6. Call admin_approve_report() SQL function
     ▼
Atomic Transaction
     │
     ├─> Update report:
     │   - verification_status = 'verified'
     │   - moderated_at = now()
     │   - moderated_by = admin_user_id
     │
     └─> If game.status = 'pending':
         - Update game.status = 'approved'
     │
     ▼
Report Verified
     │
     ▼
Remove from Queue
     │
     ▼
Success Message
"Report approved! Game auto-approved if pending."
```

**Reject Path:**
```
Click [Reject]
     │
     │ 7. Open rejection reason modal
     ▼
Rejection Reason Modal
     │
     │ 8. Admin selects:
     │    - Invalid screenshot (no FPS visible)
     │    - Unrealistic data
     │    - Duplicate report
     │    - Other (+ custom text)
     ▼
Submit Rejection
     │
     │ 9. Update report:
     │    - verification_status = 'rejected'
     │    - moderated_at = now()
     │    - moderated_by = admin_user_id
     │    - rejection_reason = formatted reason
     ▼
Report Rejected
     │
     ▼
Remove from Queue
     │
     ▼
Success Message
"Report rejected. Reason saved."
```

---

### Decision Points

| Decision | Criteria | Action |
|----------|----------|--------|
| **Screenshot matches data?** | FPS overlay visible + matches reported FPS | Approve |
| | FPS not visible or doesn't match | Reject: "Invalid screenshot" |
| **Data realistic?** | FPS + TDP + settings plausible | Approve |
| | FPS >200 with handheld | Flag for review, likely reject |
| **Duplicate?** | Similar report exists (same game+device+settings) | Reject: "Duplicate" |
| | Unique configuration | Approve |
| **Game pending?** | Report's game has status='pending' | Auto-approve game on first approved report |
| | Game already approved | No action on game |

---

### Edge Cases

**1. Game Pending → Auto-Approve:**
- User submitted report for "Vampire Survivors" (pending game)
- Admin approves first report for this game
- SQL function `admin_approve_report()` checks game status
- If game pending: Updates game.status = 'approved'
- Result: Game + report both approved in single transaction

**2. Reject Without Reason:**
- Admin clicks [Reject] but doesn't select reason
- Submit button disabled until reason selected
- DB constraint enforces: `rejection_reason IS NOT NULL` when rejected
- Admin must provide reason

**3. Multiple Admins Reviewing Same Report:**
- Admin A opens report for review
- Admin B approves same report before Admin A acts
- Admin A tries to approve: Report already verified (row not found in pending)
- Admin A sees: "Report already processed"
- Queue auto-refreshes

**4. Sanity Check Flags:**
- Report has FPS 240 (flagged automatically)
- Admin reviews screenshot: Actually valid (high-end game, unrealistic but possible)
- Admin can still approve (sanity check is advisory, not blocking)

**5. User Deletes Account During Review:**
- Admin reviewing report from user who just deleted account
- `user_id` FK set to NULL (ON DELETE SET NULL)
- Report still in queue, username shows as "[deleted]"
- Admin can still approve/reject

---

### Error States

| Error Code | Condition | Admin Message |
|------------|-----------|---------------|
| **401 UNAUTHORIZED** | Not logged in | "Please log in" |
| **403 FORBIDDEN** | Not admin (is_admin=false) | "Access denied" |
| **400 BAD REQUEST** | Missing rejection reason | "Please select a rejection reason" |
| **404 NOT FOUND** | Report already processed | "Report no longer pending" |
| **500 INTERNAL** | SQL function fails | "Operation failed. Please try again." |

---

### Success Outcome

**Approve:**
- Report visible on game page (verified)
- User notified (v2: email notification)
- Game approved if pending
- Report removed from queue

**Reject:**
- Report not visible to public
- User sees rejection reason on profile
- User can submit new report with corrections
- Report removed from queue

---

## Flow 5: Profile → Submission Status Awareness

### Diagram
```
Authenticated User
     │
     │ 1. Navigate to /profile
     │    (requires auth)
     ▼
Profile Page
     │
     │ 2. Fetch user's reports:
     │    - All statuses (verified, pending, rejected)
     │    - Grouped by status
     ▼
Display Profile
     │
     │ 3. Show:
     │    - Username
     │    - Avatar placeholder (initials/icon)
     │    - "Your Reports" section
     ▼
Reports Grouped by Status
     │
     ├─> Verified (X)
     │   └─> List of verified reports
     │       Click → Go to game page
     │
     ├─> Pending (X)
     │   └─> List with ⏳ badge
     │       Context: "Typically verified within 24h"
     │
     └─> Rejected (X)
         └─> List with ❌ badge + reason tooltip
             Context: "Review reason and resubmit if needed"
     │
     ▼
User Actions
     │
     ├─> View verified reports on game pages
     ├─> Check pending status (no escalation in MVP)
     └─> Read rejection reasons → Resubmit corrected report
```

---

### Decision Points

| Decision | Condition | Context |
|----------|-----------|---------|
| **Pending too long?** | >48h | User waits (no escalation in MVP) |
| **Rejected?** | See reason | User can resubmit with corrections |
| **Verified?** | Visible on game page | User can view upvotes, share link |

---

### Edge Cases

**1. No Reports Yet:**
- User just signed up, hasn't submitted
- Profile shows: "You haven't submitted any reports yet. [Submit Report →]"
- CTA encourages first submission

**2. All Reports Rejected:**
- User submitted 3 reports, all rejected
- Profile shows: 0 Verified, 0 Pending, 3 Rejected
- Each rejection shows reason
- User can learn from mistakes and resubmit

**3. Pending Report Stuck:**
- User submitted report 7 days ago, still pending
- MVP: User waits (no support contact in UI)
- v2: "Report pending >5 days? Contact support"

**4. User Deleted → Profile Cascade:**
- User deletes account (Supabase Auth)
- `profiles` row deleted (CASCADE from auth.users)
- `performance_reports` deleted (CASCADE from profiles)
- `performance_votes` deleted (CASCADE from profiles)
- Result: User's data fully removed

**5. Screenshot Remains After Rejection:**
- Report rejected, removed from DB
- Screenshot still in storage (orphaned)
- MVP: Acceptable (storage is cheap)
- v2: Cleanup job removes orphaned files

**6. User Has Pending Game:**
- User submitted game "Vampire Survivors" (pending)
- Submitted report for that game (pending)
- Profile shows: Both pending
- Admin approves report → game auto-approved
- Profile refreshes: Both verified

---

### Error States

| Error Code | Condition | User Message |
|------------|-----------|--------------|
| **401 UNAUTHORIZED** | Not logged in | Redirect to homepage with "Please log in" |
| **500 INTERNAL** | Failed to fetch reports | "Failed to load reports. Please refresh." |

---

### Success Outcome

- User aware of submission statuses
- User understands rejection reasons
- User can resubmit corrected reports
- User can view verified reports on game pages
- User has transparency into verification process

---

## Global Non-Goals (Explicit)

**These features are intentionally excluded from MVP:**

### ❌ No Comments System
- Users cannot comment on reports
- No discussion threads
- No replies
- **Why:** Turns product into social network, massive moderation overhead
- **Alternative:** Upvotes serve as "this is helpful" signal

### ❌ No Messaging
- No user-to-user DMs
- No admin-to-user messaging (except rejection reasons)
- **Why:** Adds complexity, moderation burden
- **Alternative:** Email notifications (v2)

### ❌ No Social Feed
- No "Recent Reports" feed
- No "Trending Games" section
- No user activity stream
- **Why:** Not core to value prop (data tool, not social network)

### ❌ No Realtime Updates
- No WebSockets
- No live queue updates for admin
- No live upvote counts
- **Why:** Adds infrastructure complexity
- **Alternative:** Manual refresh (acceptable for MVP)

### ❌ No Onboarding Wizard
- No multi-step "Welcome to HandheldLab" tour
- No forced tutorial
- **Why:** Adds friction, product should be self-explanatory
- **Alternative:** Contextual helper text on forms

### ❌ No Notifications (MVP)
- No email notifications ("Report verified")
- No on-site notifications (bell icon)
- **Why:** Requires infrastructure (templates, deliverability)
- **Alternative:** User checks profile manually
- **v2:** Simple email notifications

### ❌ No Advanced Search
- No full-text search across reports
- No filter by multiple devices at once
- No saved searches
- **Why:** Overengineering for small dataset
- **Alternative:** Device filter + sort (covers 80% use cases)

### ❌ No Gamification (MVP)
- No badges
- No leaderboards
- No reputation scores
- **Why:** Can encourage spam, need real user patterns first
- **v2:** Reputation system based on real data

---

## Flow Validation Checklist

Before implementation, verify:

**Auth Boundaries:**
- [ ] All protected routes check auth in middleware
- [ ] All API routes validate auth server-side
- [ ] Admin routes check is_admin (user session + service role pattern)

**State Transitions:**
- [ ] Pending → Verified (admin approval)
- [ ] Pending → Rejected (admin rejection)
- [ ] No direct Pending → Approved without admin action

**Error Handling:**
- [ ] All error states have user-friendly messages
- [ ] All errors logged with requestId for debugging
- [ ] Form validation errors show inline (field-level)

**Data Integrity:**
- [ ] DB constraints enforce business rules (unique votes, FPS logic)
- [ ] Triggers maintain counter integrity (upvotes)
- [ ] Cascading deletes clean up orphaned data

**Edge Cases:**
- [ ] Orphaned files acceptable for MVP
- [ ] Duplicate reports allowed (admin decides)
- [ ] Signed URL expiry handled gracefully (regenerate)

---

## End of Document

**Status:** 04-USER-FLOWS.md COMPLETE ✅

**Next Steps:**
- Proceed to `05-UI-UX-SPECIFICATION.md` for design tokens, component specs, accessibility
- Then `06-IMPLEMENTATION-PLAN.md` for phase-by-phase tasks