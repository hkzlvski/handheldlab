# HandheldLab - User Flows Document

**Version:** 1.1
**Last Updated:** January 10, 2026
**Status:** Complete - LOCKED ✅

---

## Purpose

This document maps critical user decision flows to:

* Identify edge cases before implementation
* Clarify auth boundaries and state transitions
* Enumerate error states for proper handling
* Provide reference during development

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
7. [Flow Validation Checklist](#flow-validation-checklist)

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

| Decision             | Condition      | Outcome                                    |
| -------------------- | -------------- | ------------------------------------------ |
| **Email verified?**  | YES            | Session created, proceed to app            |
|                      | NO             | Blocked from login ("Email not confirmed") |
| **Username unique?** | YES            | Account created                            |
|                      | NO             | Signup fails, transaction rollback         |
| **Password valid?**  | YES (≥8 chars) | Proceed                                    |
|                      | NO             | Validation error                           |

---

### Edge Cases

**1. Duplicate Username:**

* User submits signup with existing username
* `profiles` INSERT fails (UNIQUE constraint)
* Trigger fails → signup fails (auth.users insert aborted in same transaction)
* User sees: "Username already taken, please choose another"
* User can retry

**2. Verification Link Expired:**

* User clicks link after 24h (Supabase default expiry)
* User sees: "Verification link expired"
* User can request new verification email
* MVP: No UI for resend (user must sign up again OR contact support)

**3. User Refreshes Before Verification:**

* User navigates away after signup
* Returns to site before clicking email link
* State: Anonymous (no session)
* User can log in only after email verification

**4. Verification Link Clicked Twice:**

* First click: Creates session
* Second click: Code already used
* User sees error but already has session (acceptable)

**5. Username Validation Edge:**

* Username "Test-User_123" → valid
* Username "test user" → invalid (space not allowed)
* Username "ab" → invalid (too short, min 3)
* Validated client + server side

---

### Error States

| Error Code          | Condition                  | User Message                                                           |
| ------------------- | -------------------------- | ---------------------------------------------------------------------- |
| **400 BAD REQUEST** | Invalid email format       | "Please enter a valid email address"                                   |
| **400 BAD REQUEST** | Password too short         | "Password must be at least 8 characters"                               |
| **400 BAD REQUEST** | Username invalid format    | "Username can only contain letters, numbers, hyphens, and underscores" |
| **409 CONFLICT**    | Username already exists    | "Username already taken, please choose another"                        |
| **500 INTERNAL**    | Trigger fails (unexpected) | "Signup failed. Please try again."                                     |

---

### Success Outcome

* User has verified email
* User has active session (cookie)
* `profiles` row created with username
* User redirected to homepage (logged in state)
* User can now submit reports, upvote, view profile

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
     │    - verification_status = 'pending'
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

| Decision                    | Condition        | Outcome                         |
| --------------------------- | ---------------- | ------------------------------- |
| **Auth valid?**             | YES              | Proceed to form                 |
|                             | NO               | Redirect to homepage with error |
| **Client validation pass?** | YES              | Enable submit button            |
|                             | NO               | Show inline errors              |
| **Screenshot valid?**       | YES (type, size) | Upload                          |
|                             | NO               | Block submission                |
| **FPS logic valid?**        | min ≤ avg ≤ max  | Proceed                         |
|                             | NO               | Validation error                |
| **Storage upload success?** | YES              | Continue to DB                  |
|                             | NO               | Retry or fail                   |
| **Game exists?**            | YES              | Link to existing                |
|                             | NO               | Create pending game first       |

---

### Edge Cases

**1. Upload Succeeds, DB Insert Fails:**

* Screenshot uploaded to storage
* DB insert fails (network error, validation)
* Result: Orphaned file in storage
* MVP: Acceptable (cleanup job in v2)
* User sees: "Submission failed, please try again"

**2. Pending Game Exists:**

* User submits report for game not yet approved
* Check `games` table for pending game by name/slug
* If exists: Link report to pending game
* If not: Create new pending game
* Both game + report approved together by admin (first approved report can auto-approve game)

**3. Duplicate Report (Same Game+Device+User):**

* User already has report for "Elden Ring + Steam Deck"
* System shows soft warning: "You already have X reports for this game/device"
* User can still submit (admin will review for duplicates)
* Admin may reject as duplicate

**4. Screenshot FPS >200:**

* User enters 240 FPS average
* Server flags as sanity check issue
* Report still submitted but highlighted in admin queue
* Admin reviews screenshot for validity

**5. User Abandons Form:**

* User uploads screenshot but doesn't submit
* Screenshot remains in storage (no DB reference)
* Orphaned file (acceptable for MVP)
* Cleanup job in v2

**6. Manual Game Entry:**

* User can't find game in dropdown
* Clicks "Add game manually"
* Enters game name (+ optional Steam App ID)
* Game created with status='pending'
* Linked to report (both pending)

---

### Error States

| Error Code                | Condition                     | User Message                                 |
| ------------------------- | ----------------------------- | -------------------------------------------- |
| **400 BAD REQUEST**       | Invalid FPS logic (min > avg) | "FPS minimum cannot be greater than average" |
| **400 BAD REQUEST**       | Missing required field        | "Please fill in all required fields"         |
| **400 BAD REQUEST**       | Invalid storage path          | "Screenshot upload failed - invalid path"    |
| **401 UNAUTHORIZED**      | Not authenticated             | "Please log in to submit reports"            |
| **403 FORBIDDEN**         | Path doesn't match user       | "Invalid screenshot path"                    |
| **404 NOT FOUND**         | Screenshot not in storage     | "Screenshot not found, please re-upload"     |
| **413 PAYLOAD TOO LARGE** | File size >5MB                | "Screenshot must be under 5MB"               |
| **415 UNSUPPORTED MEDIA** | Wrong content type            | "Please upload a JPEG or PNG image"          |
| **500 INTERNAL**          | DB insert fails               | "Submission failed. Please try again."       |

---

### Success Outcome

* Report created with status='pending'
* Screenshot stored in private bucket
* User sees: "Report submitted! Typically verified within 24 hours."
* User redirected to profile (can see pending report)
* Admin sees report in verification queue

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
     │    - Author (username OR @[deleted] fallback)
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

| Decision                   | Condition                   | Action                                   |
| -------------------------- | --------------------------- | ---------------------------------------- |
| **Device filter applied?** | YES                         | Show only reports for selected device    |
|                            | NO                          | Show all reports                         |
| **Sort by FPS?**           | YES                         | Order by fps_average DESC                |
| **Sort by TDP?**           | YES                         | Order by tdp_watts ASC                   |
| **User authenticated?**    | YES                         | Show upvote state (filled/outline heart) |
|                            | NO                          | Show upvote count only                   |
| **Click upvote (anon)?**   | Show login modal            |                                          |
| **Click upvote (auth)?**   | Toggle vote (optimistic UI) |                                          |
| **Author missing?**        | user_id is NULL             | Render `@[deleted]`                      |

---

### Edge Cases

**1. No Reports for Selected Device:**

* User filters by "ROG Ally X"
* No verified reports exist for that device
* Empty state: "No verified reports yet for ROG Ally X. Be the first! [Submit Report →]"
* User can remove filter or submit first report

**2. Only 1 Report Exists:**

* User sees single report
* Low confidence (can't compare)
* UI doesn't explicitly warn (implicit: low count)

**3. Signed URL Expired:**

* User opens page after 1 hour (signed URL TTL)
* Screenshot images fail to load
* Refresh regenerates signed URLs → images load

**4. Report Count <10:**

* Game has 3 verified reports
* UI shows: "Few verified reports" (not "3 verified reports")
* Avoids false confidence from exact low numbers

**5. User's Own Pending Report:**

* Authenticated user has pending report for this game
* User sees: Verified reports + own pending (with ⏳ Pending badge)
* Only user can see their own pending

**6. User's Own Rejected Report:**

* User sees: Verified + own rejected (❌ Rejected + reason tooltip)
* Only user can see their own rejected

**7. Verified Report from Deleted User:**

* A report exists with `user_id = NULL` (account deleted)
* Public page still shows the report normally
* Author label renders: `@[deleted]`
* No profile link for deleted author

---

### Error States

| Error Code        | Condition               | User Message                              |
| ----------------- | ----------------------- | ----------------------------------------- |
| **404 NOT FOUND** | Game slug doesn't exist | "Game not found" (404 page)               |
| **500 INTERNAL**  | Database query fails    | "Failed to load reports. Please refresh." |

---

### Success Outcome

* User sees verified performance data
* User can compare multiple configurations
* User makes informed purchase decision
* User upvotes helpful reports (if authenticated)
* User navigates to Steam to buy (external link)

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
     │    - Submitted by @username OR [deleted]
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
     │    - Sanity check flags
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
     │ 8. Admin selects reason
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

| Decision                     | Criteria                                   | Action                                     |
| ---------------------------- | ------------------------------------------ | ------------------------------------------ |
| **Screenshot matches data?** | FPS overlay visible + matches reported FPS | Approve                                    |
|                              | FPS not visible or doesn't match           | Reject: "Invalid screenshot"               |
| **Data realistic?**          | FPS + TDP + settings plausible             | Approve                                    |
|                              | Clearly impossible                         | Reject                                     |
| **Duplicate?**               | Similar report exists                      | Reject: "Duplicate"                        |
|                              | Unique configuration                       | Approve                                    |
| **Game pending?**            | game.status='pending'                      | Auto-approve game on first approved report |

---

### Edge Cases

**1. Game Pending → Auto-Approve:**

* Admin approves first report for a pending game
* Game auto-approved in same transaction

**2. Reject Without Reason:**

* Admin can’t submit until reason provided
* DB constraint enforces `rejection_reason IS NOT NULL` when rejected

**3. Multiple Admins Reviewing Same Report:**

* Admin A opens modal
* Admin B processes first
* Admin A action returns "already processed"
* Queue refreshes

**4. Sanity Check Flags:**

* Flag is advisory, not blocking
* Admin can approve if screenshot proves validity

**5. User Deletes Account While Report Pending:**

* User deletes account
* `profiles` row removed
* `performance_reports.user_id` becomes NULL
* Report still in admin queue (still reviewable)
* Admin sees submitter as `[deleted]`
* Admin can still approve/reject

---

### Error States

| Error Code           | Condition                | Admin Message                         |
| -------------------- | ------------------------ | ------------------------------------- |
| **401 UNAUTHORIZED** | Not logged in            | "Please log in"                       |
| **403 FORBIDDEN**    | Not admin                | "Access denied"                       |
| **400 BAD REQUEST**  | Missing rejection reason | "Please select a rejection reason"    |
| **404 NOT FOUND**    | Report already processed | "Report no longer pending"            |
| **500 INTERNAL**     | SQL function fails       | "Operation failed. Please try again." |

---

### Success Outcome

**Approve:**

* Report visible on game page (verified)
* Game approved if pending
* Report removed from queue

**Reject:**

* Report not visible to public
* If user still exists: user sees rejection reason on profile
* If user deleted: rejection is stored but no user to notify
* Report removed from queue

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
     │    - user_id = auth.uid() ONLY
     │    - All statuses (verified, pending, rejected)
     ▼
Display Profile
     │
     │ 3. Show:
     │    - Username
     │    - Avatar placeholder
     │    - "Your Reports" section
     ▼
Reports Grouped by Status
     │
     ├─> Verified (X)
     ├─> Pending (X)
     └─> Rejected (X)
```

---

### Decision Points

| Decision              | Condition            | Context                           |
| --------------------- | -------------------- | --------------------------------- |
| **Pending too long?** | >48h                 | User waits (no escalation in MVP) |
| **Rejected?**         | See reason           | User can resubmit                 |
| **Verified?**         | Visible on game page | User can view/share               |

---

### Edge Cases

**1. No Reports Yet:**

* Profile: "You haven't submitted any reports yet. [Submit Report →]"

**2. All Reports Rejected:**

* Profile shows reasons, user learns and resubmits

**3. Pending Report Stuck:**

* MVP: wait only
* v2: support CTA

**4. User Deletes Account**

* User loses profile access entirely (auth deleted)
* **Reports do NOT get deleted** — they remain in DB with `user_id = NULL`
* Those reports will show as `@[deleted]` publicly after verification

**5. Screenshot Remains After Rejection:**

* If report rejected and remains stored, screenshot can remain orphaned
* MVP acceptable, v2 cleanup

---

### Error States

| Error Code           | Condition               | User Message                              |
| -------------------- | ----------------------- | ----------------------------------------- |
| **401 UNAUTHORIZED** | Not logged in           | Redirect to homepage with "Please log in" |
| **500 INTERNAL**     | Failed to fetch reports | "Failed to load reports. Please refresh." |

---

### Success Outcome

* User aware of submission statuses
* User understands rejection reasons
* User can resubmit corrected reports
* User has transparency into verification process

---

## Global Non-Goals (Explicit)

**These features are intentionally excluded from MVP:**

### ❌ No Comments System

* Users cannot comment on reports
* No discussion threads
* No replies
* **Why:** Turns product into social network, massive moderation overhead
* **Alternative:** Upvotes serve as "this is helpful" signal

### ❌ No Messaging

* No user-to-user DMs
* No admin-to-user messaging (except rejection reasons)
* **Why:** Adds complexity, moderation burden
* **Alternative:** Email notifications (v2)

### ❌ No Social Feed

* No "Recent Reports" feed
* No "Trending Games" section
* No user activity stream
* **Why:** Not core to value prop (data tool, not social network)

### ❌ No Realtime Updates

* No WebSockets
* No live queue updates for admin
* No live upvote counts
* **Why:** Adds infrastructure complexity
* **Alternative:** Manual refresh (acceptable for MVP)

### ❌ No Onboarding Wizard

* No forced tutorial
* **Alternative:** Contextual helper text on forms

### ❌ No Notifications (MVP)

* No email notifications ("Report verified")
* No on-site notifications
* **Alternative:** User checks profile manually

### ❌ No Advanced Search

* No full-text search across reports
* No saved searches
* **Alternative:** Device filter + sort

### ❌ No Gamification (MVP)

* No badges, no leaderboards
* **Why:** Encourages spam early

---

## Flow Validation Checklist

Before implementation, verify:

**Auth Boundaries:**

* [ ] All protected routes check auth in middleware
* [ ] All API routes validate auth server-side
* [ ] Admin routes check is_admin (user session + service role pattern)

**State Transitions:**

* [ ] Pending → Verified (admin approval)
* [ ] Pending → Rejected (admin rejection)
* [ ] No direct Pending → Verified without admin action

**Error Handling:**

* [ ] All error states have user-friendly messages
* [ ] All errors logged with requestId for debugging
* [ ] Form validation errors show inline (field-level)

**Data Integrity:**

* [ ] DB constraints enforce business rules (unique votes, FPS logic)
* [ ] Triggers maintain counter integrity (upvotes)
* [ ] Deleting a user sets `performance_reports.user_id = NULL` (reports preserved)

**Edge Cases:**

* [ ] Orphaned files acceptable for MVP
* [ ] Duplicate reports allowed (admin decides)
* [ ] Signed URL expiry handled gracefully (regenerate)
* [ ] UI renders deleted authors as `@[deleted]` consistently

---

## End of Document

**Status:** 04-USER-FLOWS.md COMPLETE ✅

**Next Steps:**

* Proceed to `05-UI-UX-SPECIFICATION.md` for design tokens, component specs, accessibility
* Then `06-IMPLEMENTATION-PLAN.md` for phase-by-phase tasks
