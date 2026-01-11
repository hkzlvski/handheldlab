# HandheldLab - Implementation Plan

**Version:** 1.1  
**Last Updated:** January 10, 2026  
**Status:** Complete - LOCKED ✅

---

## Purpose

This document provides a phase-by-phase breakdown of MVP development with:

* Clear task definitions and dependencies
* Time estimates per task (solo developer)
* Testing strategy per phase
* Deployment milestones

**Target:** Ship MVP in 4 weeks (120-140 hours total)

**Architectural Alignment:** Must match `03-TECHNICAL-ARCHITECTURE.md`, `04-USER-FLOWS.md`, `05-UI-UX-SPECIFICATION.md`  
**Important Product Rule (locked):** Reports survive account deletion; reports become anonymous (`user_id` → NULL, author displays `@[deleted]`).

---

## Table of Contents

1. [Overview & Timeline](#1-overview--timeline)
2. [Phase 0: Project Setup (Week 0)](#phase-0-project-setup-week-0)
3. [Phase A: Foundation (Week 1)](#phase-a-foundation-week-1)
4. [Phase B: Core Features (Week 2)](#phase-b-core-features-week-2)
5. [Phase C: Admin & Polish (Week 3)](#phase-c-admin--polish-week-3)
6. [Phase D: Testing & Launch (Week 4)](#phase-d-testing--launch-week-4)
7. [Testing Strategy](#7-testing-strategy)
8. [Deployment Checklist](#8-deployment-checklist)
9. [Post-Launch Plan](#9-post-launch-plan)

---

## 1. Overview & Timeline

### 1.1 Timeline Summary

```

Week 0 (Setup):        6-8 hours   [Project scaffolding, tools]
Week 1 (Foundation):   30-35 hours [DB, Auth, Layout, Components]
Week 2 (Core):         35-40 hours [Submit, Game Pages, Upvotes]
Week 3 (Admin):        25-30 hours [Admin Queue, Verification, Polish]
Week 4 (Launch):       20-25 hours [Testing, Bug Fixes, Deploy]

Total:                 120-140 hours (4 weeks @ 30-35h/week)

````

### 1.2 Effort Distribution

| Phase   | Focus            | Hours | % of Total |
| ------- | ---------------- | ----- | ---------- |
| Phase 0 | Setup            | 6-8   | 5%         |
| Phase A | Foundation       | 30-35 | 25%        |
| Phase B | Core Features    | 35-40 | 30%        |
| Phase C | Admin & Polish   | 25-30 | 22%        |
| Phase D | Testing & Launch | 20-25 | 18%        |

### 1.3 Critical Path

**Blockers (must complete before continuing):**

1. Database schema + RLS ➔ All features
2. Auth system ➔ Submit, Upvote, Profile, Admin
3. Storage setup ➔ Submit flow
4. Submit flow ➔ Game pages (need reports to display)
5. Game pages ➔ Admin verification (need UI to review)

**Parallel Work (can happen simultaneously):**

* UI components + Layout (while building features)
* Design tokens + Tailwind config (while building pages)
* Documentation (ongoing)

---

## Phase 0: Project Setup (Week 0)

**Duration:** 6-8 hours  
**Goal:** Bootstrap project, configure tools, verify infrastructure

### Tasks

#### 0.1 Initialize Next.js Project (1h)

**Actions:**

```bash
npx create-next-app@latest handheldlab --typescript --tailwind --app --src-dir
cd handheldlab
npm install
````

**Checklist:**

* [ ] TypeScript enabled
* [ ] App Router structure
* [ ] Tailwind CSS configured
* [ ] ESLint + Prettier installed
* [ ] Git initialized + first commit

---

#### 0.2 Configure Supabase Project (1.5h)

**Actions:**

1. Create Supabase project (free tier)
2. Note credentials:

   * Project URL
   * Anon key
   * Service role key
3. Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Install Supabase client:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Checklist:**

* [ ] Supabase project created
* [ ] Environment variables set
* [ ] `.env.local` in `.gitignore`
* [ ] Supabase client libraries installed

---

#### 0.3 Install Core Dependencies (0.5h)

**Actions:**

```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select
npm install lucide-react
npm install react-hook-form zod
npm install date-fns
npm install clsx tailwind-merge
npm install -D @types/node
```

**Checklist:**

* [ ] Radix UI components installed
* [ ] Form libraries installed
* [ ] Utility libraries installed
* [ ] TypeScript types installed

---

#### 0.4 Configure Tailwind (1h)

**Actions:**

1. Update `tailwind.config.js` with design tokens from 05-UI-UX-SPEC
2. Create `src/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

3. Add global styles in `app/globals.css`

**Checklist:**

* [ ] Design tokens in Tailwind config
* [ ] `cn()` utility function created
* [ ] Global styles configured
* [ ] Custom colors (FPS classes) added

---

#### 0.5 Set Up Supabase Client Helpers (1.5h)

**Actions:**

1. Create `src/lib/supabase/client.ts` (browser client)
2. Create `src/lib/supabase/server.ts` (server client)
3. Create `src/lib/supabase/middleware.ts` (auth middleware)

**Reference:** See 03-TECHNICAL-ARCHITECTURE.md Section 4.2

**Checklist:**

* [ ] Browser client created
* [ ] Server client created
* [ ] Middleware configured
* [ ] Test auth flow works

---

#### 0.6 Set Up Vercel Project (0.5h)

**Actions:**

1. Create GitHub repository
2. Push initial commit
3. Import to Vercel
4. Add environment variables in Vercel dashboard
5. Verify preview deployment works

**Checklist:**

* [ ] GitHub repo created
* [ ] Vercel project linked
* [ ] Environment variables added
* [ ] Preview deployment successful

---

#### 0.7 Create Project Folder Structure (1h)

**Actions:** Create organized folder structure:

```
handheldlab/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── games/
│   │   └── [slug]/
│   ├── submit/
│   ├── profile/
│   ├── admin/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/           # Radix wrappers
│   ├── layout/       # Header, Footer
│   └── features/     # ReportCard, UpvoteButton
├── lib/
│   ├── supabase/
│   ├── validations/
│   ├── api/
│   ├── storage/
│   └── utils.ts
└── public/
```

**Checklist:**

* [ ] Folder structure created
* [ ] README.md updated
* [ ] .gitignore configured
* [ ] Project ready for Phase A

---

**Phase 0 Complete:** ✅
**Deliverable:** Working Next.js + Supabase skeleton, deployed to Vercel preview

---

## Phase A: Foundation (Week 1)

**Duration:** 30-35 hours
**Goal:** Database, auth, layout, core components ready

### A.1 Database Schema Implementation (7-9h)

> **NOTE (locked):** Reports are preserved after account deletion (anonymous author). This is implemented at schema/FK level.

#### A.1.1 Create Tables (3h)

**Actions:**

1. Open Supabase SQL Editor
2. Run table creation scripts from 03-TECHNICAL-ARCHITECTURE.md Section 2.1:

   * `profiles`
   * `devices`
   * `games`
   * `performance_reports`
   * `performance_votes`
3. Verify schema in Supabase Table Editor

**Testing:**

* [ ] All tables created
* [ ] Constraints enforced (try inserting invalid data)
* [ ] Foreign keys working

---

#### A.1.2 Apply “Anon Reports” FK Adjustments (1h) **(CRITICAL)**

**Goal:** If a user deletes their account, reports remain and become anonymous.

**Actions:**

1. Alter FK behavior:

   * `performance_reports.user_id` becomes nullable
   * FK becomes `ON DELETE SET NULL` (NOT CASCADE)
2. Ensure votes still cascade:

   * `performance_votes.user_id` stays `ON DELETE CASCADE` (votes are user-owned)
3. Ensure UI attribution remains possible via fallback:

   * when `user_id IS NULL` show `@[deleted]`

**Testing:**

* [ ] Delete a user in Supabase Auth → `profiles` removed
* [ ] Reports remain; `performance_reports.user_id` becomes NULL
* [ ] Votes by that user removed; `upvotes` counter decremented correctly
* [ ] Game page still renders those reports with author `@[deleted]`

---

#### A.1.3 Set Up RLS Policies (2h)

**Actions:**

1. Enable RLS on all tables
2. Create policies from 03-TECHNICAL-ARCHITECTURE.md Section 2.3:

   * `profiles` (UPDATE own only)
   * `devices` (SELECT active only)
   * `games` (SELECT approved + own pending)
   * `performance_reports` (SELECT verified + own)
   * `performance_votes` (SELECT/INSERT/DELETE own)
3. Create `public_profiles` view
4. Create `is_user_admin()` RPC function

**Testing:**

* [ ] Anonymous user can SELECT approved games only
* [ ] Authenticated user can SELECT own pending games
* [ ] Authenticated user cannot SELECT others' pending reports
* [ ] Anonymous user cannot INSERT anything

---

#### A.1.4 Create Triggers & Functions (2h)

**Actions:**

1. Create triggers from 03-TECHNICAL-ARCHITECTURE.md Section 2.4:

   * `handle_new_user()` + trigger
   * `increment_report_upvotes()` + trigger
   * `decrement_report_upvotes()` + trigger
   * `handle_updated_at()` + triggers (profiles, games, reports)
   * `admin_approve_report()` function
2. Test each trigger

**Testing:**

* [ ] Signup creates profile automatically
* [ ] Upvote increments counter
* [ ] Remove upvote decrements counter
* [ ] `updated_at` changes on UPDATE
* [ ] Admin approve updates report + game atomically

---

#### A.1.5 Seed Data (1-2h)

**Actions:**

1. Create seed script `scripts/seed.sql`:

   * 12 devices (Steam Deck OLED, ROG Ally, Legion Go, etc.)
   * 50 popular games (Elden Ring, Cyberpunk, Hades, etc.)
   * All games `status='approved'`
   * All devices `is_active=true`
2. Run seed script in Supabase SQL Editor

**Testing:**

* [ ] 12 devices visible on frontend
* [ ] 50 games visible on frontend
* [ ] Slugs are URL-safe (lowercase, hyphens)

---

**A.1 Complete:** Database schema + RLS + seed data ready

---

### A.2 Authentication System (8-10h)

#### A.2.1 Signup Flow (3h)

**Actions:**

1. Create `app/(auth)/signup/page.tsx`:

   * Form: email, password, username
   * Client validation (react-hook-form + Zod)
   * Call `supabase.auth.signUp()` with metadata
2. Create signup validation schema in `lib/validations/auth.ts`
3. Handle errors (duplicate username, weak password)
4. Show success message ("Check your email")

**Testing:**

* [ ] Signup with valid data creates auth.users + profiles
* [ ] Duplicate username shows error
* [ ] Weak password rejected
* [ ] Email verification sent

---

#### A.2.2 Email Verification Callback (1h)

**Actions:**

1. Create `app/auth/callback/route.ts`:

   * Exchange code for session
   * Redirect to homepage
2. Configure Supabase redirect URL in dashboard

**Testing:**

* [ ] Click email link creates session
* [ ] Redirect to homepage works
* [ ] User can access protected routes

---

#### A.2.3 Login Flow (2h)

**Actions:**

1. Create `app/(auth)/login/page.tsx`:

   * Form: email, password
   * Call `supabase.auth.signInWithPassword()`
   * Handle errors (wrong password, email not verified)
   * Redirect to homepage on success

**Testing:**

* [ ] Login with correct credentials works
* [ ] Wrong password shows error
* [ ] Unverified email blocked

---

#### A.2.4 Logout Flow (1h)

**Actions:**

1. Add logout button to Header user menu
2. Call `supabase.auth.signOut()`
3. Redirect to homepage

**Testing:**

* [ ] Logout clears session
* [ ] User redirected to homepage
* [ ] Protected routes inaccessible

---

#### A.2.5 AuthContext Provider (2h)

**Actions:**

1. Create `contexts/AuthContext.tsx` from 03-TECHNICAL-ARCHITECTURE.md Section 4.5
2. Wrap app in `AuthProvider` in `app/layout.tsx`
3. Export `useAuth()` hook

**Testing:**

* [ ] `useAuth()` returns current user
* [ ] `isAdmin` flag works
* [ ] Auth state updates on login/logout

---

#### A.2.6 Middleware Protection (1h)

**Actions:**

1. Create `middleware.ts` from 03-TECHNICAL-ARCHITECTURE.md Section 4.2
2. Protect routes: `/submit`, `/profile`, `/admin`
3. Admin check for `/admin`

**Testing:**

* [ ] Anonymous user redirected from `/submit`
* [ ] Non-admin gets 404 on `/admin`
* [ ] Authenticated user can access `/submit`

---

**A.2 Complete:** Auth system fully functional

---

### A.3 Layout & Core Components (8-10h)

#### A.3.1 Header Component (2h)

**Actions:**

1. Create `components/layout/Header.tsx`:

   * Logo (link to homepage)
   * Nav: Browse, Submit
   * User menu (if authenticated) with Radix DropdownMenu
   * Login button (if anonymous)
2. Sticky positioning
3. Responsive (hamburger menu on mobile)

**Testing:**

* [ ] Logo links to homepage
* [ ] Nav links work
* [ ] User menu shows profile, logout
* [ ] Login button opens modal

---

#### A.3.2 Footer Component (1h)

**Actions:**

1. Create `components/layout/Footer.tsx`:

   * Copyright notice
   * Links: About, Contact, Privacy
   * Placeholder links (MVP)

**Testing:**

* [ ] Footer renders on all pages
* [ ] Links styled correctly

---

#### A.3.3 Login/Signup Modals (3h)

**Actions:**

1. Create `components/features/LoginModal.tsx` (Radix Dialog)
2. Create `components/features/SignupModal.tsx`
3. Trigger from Header "Sign In" button
4. Close on successful auth

**Testing:**

* [ ] Modals open/close correctly
* [ ] Forms submit and handle errors
* [ ] Success closes modal + updates Header

---

#### A.3.4 Button Components (1h)

**Actions:**

1. Create `components/ui/Button.tsx`:

   * Variants: primary, secondary, danger, ghost
   * Sizes: sm, md, lg
   * States: hover, active, disabled, loading

**Reference:** 05-UI-UX-SPECIFICATION.md Section 2.5

**Testing:**

* [ ] All variants render correctly
* [ ] Hover/active states work
* [ ] Disabled state prevents clicks
* [ ] Loading state shows spinner

---

#### A.3.5 Form Input Components (2h)

**Actions:**

1. Create `components/ui/Input.tsx`:

   * Text input with error state
   * Label component
2. Create `components/ui/Select.tsx` (Radix wrapper):

   * Dropdown select with search (optional)

**Reference:** 05-UI-UX-SPECIFICATION.md Section 2.6

**Testing:**

* [ ] Inputs show error states
* [ ] Labels associated with inputs (a11y)
* [ ] Select opens/closes correctly

---

#### A.3.6 Homepage Placeholder (1h)

**Actions:**

1. Create `app/page.tsx`:

   * Hero section: "Find the perfect settings for your handheld"
   * Grid of 12 popular games (from seed data)
   * Each game links to `/games/[slug]` (placeholder page)

**Testing:**

* [ ] Homepage renders
* [ ] Games grid displays
* [ ] Links navigate correctly

---

**A.3 Complete:** Layout + core UI components ready

## A.4 Storage Setup (4h)

**Goal:** Secure, private storage for report screenshots using Supabase Storage with signed URL access.

---

### A.4.1 Create proofs Bucket (0.5h)

**Actions:**

1. Open Supabase Dashboard → Storage
2. Create bucket: **`proofs`**
3. Set bucket visibility to **private**
4. Configure policies from `03-TECHNICAL-ARCHITECTURE.md` Section 5.2

> **LOCKED RULE:**  
> All report screenshots are stored exclusively in the private `proofs` bucket and are accessed **only via signed URLs**.  
> Screenshots are never public.

**Testing:**

* [ ] Bucket `proofs` exists
* [ ] Bucket is private
* [ ] Storage policies enforce `userId/*` path prefix
* [ ] Anonymous users cannot read files
* [ ] Files are not publicly accessible via URL

---

### A.4.2 Upload Helper Function (1.5h)

**Actions:**

1. Create `lib/storage/upload.ts` (reference: 03-TECHNICAL-ARCHITECTURE.md Section 5.3)
2. Validate uploaded file:
   * Allowed types: `image/jpeg`, `image/png`, `image/webp`
   * Max size: **5MB**
3. Generate unique, non-guessable storage path
4. Upload file to `proofs` bucket
5. Persist resulting storage path in database column:

performance_reports.screenshot_storage_path

mathematica
Skopiuj kod

**Path Format (LOCKED):**

{userId}/{timestamp}-{random}.{ext}

markdown
Skopiuj kod

**Testing:**

* [ ] Valid image uploads successfully
* [ ] Invalid MIME type rejected
* [ ] File larger than 5MB rejected
* [ ] Path matches `userId/timestamp-random.ext`
* [ ] Path stored correctly in `screenshot_storage_path`
* [ ] Upload fails if user tries to spoof another user's path

---

### A.4.3 Signed URL Helper (1h)

**Actions:**

1. Create `lib/storage/signed-urls.ts` (reference: 03-TECHNICAL-ARCHITECTURE.md Section 5.5)
2. Generate signed URLs for files stored in `proofs`
3. Signed URL expiration: **1 hour**
4. Implement best-effort in-memory cache to reduce duplicate Supabase calls

**Notes:**

* Signed URLs are generated server-side only
* Client never receives raw storage paths

**Testing:**

* [ ] Signed URL generated for valid path
* [ ] Signed URL expires after ~1 hour
* [ ] Invalid or missing path fails safely
* [ ] Repeated requests reuse cached signed URLs where possible

---

### A.4.4 Next.js Image Configuration (1h)

**Actions:**

1. Update `next.config.js` to allow Supabase signed URLs:

```js
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.supabase.co',
      pathname: '/storage/v1/object/sign/**',
    },
  ],
}
Render screenshots using next/image

Use unoptimized fallback if required (signed URLs)

Testing:

 <Image /> renders signed URLs correctly

 Images lazy-load correctly

 No broken images after refresh

 Images do not require public bucket access

A.4 Complete ✅

Deliverable:
Private, secure screenshot storage using the proofs bucket with validated uploads, signed URL access, and full integration with submit and game pages.

### A.5 Error Handling & Validation (3h)

#### A.5.1 Error Handler (1.5h)

**Actions:**

1. Create `lib/api/error-handler.ts` from 03-TECHNICAL-ARCHITECTURE.md Section 3.3
2. Handle Zod errors, Supabase errors, generic errors
3. Return consistent error format with requestId

**Testing:**

* [ ] Zod validation errors formatted correctly
* [ ] Supabase errors mapped to user-friendly messages
* [ ] requestId logged for debugging

---

#### A.5.2 Validation Schemas (1.5h)

**Actions:**

1. Create `lib/validations/report.ts`:

   * `createReportSchema` (Zod)
   * `createGameSchema`
   * `rejectReportSchema`
2. Test FPS logic refinement

**Reference:** 03-TECHNICAL-ARCHITECTURE.md Section 3.2

**Testing:**

* [ ] Invalid FPS range rejected
* [ ] Notes length enforced (≤500 chars)
* [ ] Required fields validated

---

**A.5 Complete:** Error handling + validation ready

---

**Phase A Complete:** ✅
**Deliverable:** Auth works, layout renders, database seeded, storage configured

---

## Phase B: Core Features (Week 2)

**Duration:** 35-40 hours
**Goal:** Submit report flow + game pages + upvote system

### B.1 Submit Report Flow (12-15h)

#### B.1.1 Submit Page UI (4h)

**Actions:**

1. Create `app/submit/page.tsx`:

   * Protected route (requires auth)
   * Multi-step form or single long form (recommend single)
2. Form fields:

   * Game select (dropdown of approved games)
   * "Can't find game?" → Manual entry modal
   * Device select (dropdown)
   * Screenshot upload (drag-drop or file input)
   * FPS metrics (average, min, max)
   * TDP slider (5-30W)
   * Resolution select
   * Graphics preset select
   * Proton version (optional text)
   * Additional notes (optional textarea)
3. Client-side validation (react-hook-form + Zod)
4. Show preview of screenshot

**Testing:**

* [ ] Form renders correctly
* [ ] All fields validate client-side
* [ ] Screenshot preview works
* [ ] Submit button disabled until valid

---

#### B.1.2 Manual Game Entry Modal (2h)

**Actions:**

1. Create `components/features/AddGameModal.tsx`:

   * Input: Game name
   * Input: Steam App ID (optional)
   * Submit creates pending game
2. Integrate with submit form (populate game select after creation)

**Testing:**

* [ ] Modal opens from submit form
* [ ] Game created with status='pending'
* [ ] Game appears in select dropdown

---

#### B.1.3 Submit API Route (4h)

**Actions:**

1. Create `app/api/reports/route.ts`:

   * Validate auth
   * Validate Content-Type (multipart/form-data)
   * Parse FormData
   * Validate with Zod schema
   * Upload screenshot to storage
   * Verify path ownership + file existence (CRITICAL)
   * Insert report into DB (`verification_status='pending'`)
   * Return success response

**Reference:** 03-TECHNICAL-ARCHITECTURE.md Sections 3.1, 5.4

**Testing:**

* [ ] Valid submission creates report
* [ ] Invalid FPS logic rejected
* [ ] File >5MB rejected
* [ ] Path verification prevents spoofing
* [ ] Report appears in user's profile

---

#### B.1.4 Success/Error States (2h)

**Actions:**

1. Show success message after submission:

   * "Report submitted! Typically verified within 24 hours."
   * Link to profile to see pending report
2. Handle errors gracefully:

   * File upload failed → retry
   * Network error → retry
   * Validation error → show inline

**Testing:**

* [ ] Success message shows
* [ ] User redirected to profile
* [ ] Errors display clearly

---

**B.1 Complete:** Submit flow functional end-to-end

---

### B.2 Game Pages (10-12h)

#### B.2.1 Game Page Layout (3h)

**Actions:**

1. Create `app/games/[slug]/page.tsx`:

   * Server Component (SSR for SEO)
   * Fetch game metadata
   * Display game header:

     * Game name
     * Report count (if ≥10)
     * [View on Steam →] link (if steam_app_id exists)
2. Device filter pills (all devices + selected)
3. Sort dropdown (Most Helpful, Newest, Highest FPS, Lowest TDP)

**Reference:** 04-USER-FLOWS.md Flow 3

**Testing:**

* [ ] Game page renders for valid slug
* [ ] 404 for invalid slug
* [ ] Game metadata displays

---

#### B.2.2 Reports Grid with Filters (4h)

**Actions:**

1. Fetch reports (Server Component):

   * Paginated (12 per page)
   * Filter by device (URL param: `?device=slug`)
   * Sort by selected option (URL param: `?sort=upvotes`)
   * Generate signed URLs for screenshots (server-side)
2. Display reports in grid (ReportCard components)
3. "Load More" button (pagination)

**Critical Requirement (Anon Reports - locked):**

* Reports must not disappear if author is deleted.
* If `user_id` is NULL, render author as `@[deleted]`.
* Ensure your data fetching does not hard-require `user_id` for join (treat author as optional / left-join behavior).

**Testing:**

* [ ] Reports display in grid
* [ ] Device filter works
* [ ] Sort options work
* [ ] Pagination works
* [ ] Empty state shows if no reports
* [ ] Reports with deleted author still render with `@[deleted]`

---

#### B.2.3 ReportCard Component (3h)

**Actions:**

1. Create `components/features/ReportCard.tsx`:

   * Screenshot with FPS badge overlay
   * Device name + status badge (if user's own pending/rejected)
   * Username (fallback `@[deleted]` when author missing)
   * Metrics grid (FPS, TDP, resolution, preset)
   * Upvote button + count
   * "View Details →" link (opens modal)

**Reference:** 05-UI-UX-SPECIFICATION.md Section 2.1

**Testing:**

* [ ] Card renders correctly
* [ ] Screenshot loads (signed URL)
* [ ] Username fallback works when author missing
* [ ] FPS badge color-coded
* [ ] Upvote button shows state

---

#### B.2.4 Screenshot Modal (2h)

**Actions:**

1. Create `components/features/ScreenshotModal.tsx`:

   * Radix Dialog
   * Full-size screenshot
   * All report details
   * Close on click outside or Escape

**Testing:**

* [ ] Modal opens on card click
* [ ] Screenshot displays full-size
* [ ] Modal closes correctly

---

**B.2 Complete:** Game pages display reports with filters/sort

---

### B.3 Upvote System (6-8h)

#### B.3.1 UpvoteButton Component (2h)

**Actions:**

1. Create `components/features/UpvoteButton.tsx`:

   * Heart icon (filled if upvoted, outline if not)
   * Upvote count
   * Click toggles vote (POST or DELETE API)
   * Optimistic UI update
   * If anonymous: open login modal

**Reference:** 05-UI-UX-SPECIFICATION.md Section 2.2

**Testing:**

* [ ] Button renders correctly
* [ ] Click toggles state
* [ ] Count updates
* [ ] Anonymous user sees login modal

---

#### B.3.2 Vote API Routes (3h)

**Actions:**

1. Create `app/api/reports/[id]/vote/route.ts`:

   * POST: Create vote (idempotent)
   * DELETE: Remove vote (idempotent)
   * Validate auth
   * Validate Origin header (CSRF protection)
   * Return new upvote count

**Reference:** 03-TECHNICAL-ARCHITECTURE.md Sections 3.1, 4.4

**Testing:**

* [ ] POST creates vote
* [ ] POST idempotent (duplicate = 200, not 409)
* [ ] DELETE removes vote
* [ ] DELETE idempotent (not found = 200, not 404)
* [ ] Trigger increments/decrements counter

---

#### B.3.3 Fetch User Vote State (2h)

**Actions:**

1. Create helper: `getUserVotesForReports(userId, reportIds)`

   * Query: `SELECT * FROM performance_votes WHERE user_id = ? AND report_id IN (...)`
   * Return map: `{ reportId: voted }`
2. Use in Server Component to populate upvote button state

**Testing:**

* [ ] Vote state loads correctly
* [ ] Upvote buttons show correct state (filled/outline)
* [ ] Query efficient (single query for all reports on page)

---

#### B.3.4 Optimistic UI (1h)

**Actions:**

1. In UpvoteButton, update state immediately on click
2. Revert if API call fails
3. Show loading state during API call

**Testing:**

* [ ] UI updates instantly on click
* [ ] Reverts on error
* [ ] No flickering

---

**B.3 Complete:** Upvote system functional

---

### B.4 Profile Page (5-6h)

#### B.4.1 Profile Page Layout (2h)

**Actions:**

1. Create `app/profile/page.tsx`:

   * Protected route (requires auth)
   * Display username
   * Avatar placeholder (initials or icon)
   * "Your Reports" section

**Testing:**

* [ ] Profile page renders
* [ ] Username displays
* [ ] Auth required

---

#### B.4.2 Reports by Status (3h)

**Actions:**

1. Fetch user's reports:

   * All verification statuses (verified, pending, rejected)
   * Group by status
2. Display in tabs or sections:

   * Verified (X)
   * Pending (X) with ⏳ badge
   * Rejected (X) with ❌ badge + reason tooltip
3. Click report → Navigate to game page

**Reference:** 04-USER-FLOWS.md Flow 5

**Testing:**

* [ ] All statuses display
* [ ] Pending reports show badge
* [ ] Rejected reports show reason
* [ ] Empty state if no reports

---

**B.4 Complete:** Profile page functional

---

### B.5 Polish & Responsive (2-3h)

#### B.5.1 Mobile Responsiveness (1.5h)

**Actions:**

1. Test all pages on mobile viewport
2. Fix layout issues:

   * Header: Hamburger menu
   * Game page: Single column grid
   * Submit form: Full-width inputs
3. Test touch targets (≥44px)

**Testing:**

* [ ] All pages work on 375px viewport
* [ ] Touch targets large enough
* [ ] No horizontal scroll

---

#### B.5.2 Loading States (1h)

**Actions:**

1. Add skeleton loaders for:

   * Game page reports grid
   * Profile page reports
2. Add loading spinners for:

   * Form submissions
   * Button actions

**Testing:**

* [ ] Loading states show during fetch
* [ ] No flash of empty content

---

**B.5 Complete:** UI polished and responsive

---

**Phase B Complete:** ✅
**Deliverable:** Users can submit reports, view game pages, upvote, see profile

---

## Phase C: Admin & Polish (Week 3)

**Duration:** 25-30 hours
**Goal:** Admin verification queue + final polish

### C.1 Admin Verification Queue (12-15h)

#### C.1.1 Admin Queue Page (4h)

**Actions:**

1. Create `app/admin/page.tsx`:

   * Protected route (requires is_admin)
   * Fetch pending reports (oldest first)
   * Display in table:

     * Screenshot thumbnail
     * Game | Device
     * FPS metrics
     * Submitted by @username (fallback `@[deleted]` if author missing)
     * [View] [Approve] [Reject] buttons
2. Empty state if no pending reports

**Reference:** 04-USER-FLOWS.md Flow 4

**Testing:**

* [ ] Admin can access queue
* [ ] Non-admin gets 404
* [ ] Pending reports display
* [ ] Reports with deleted author still render with `@[deleted]`

---

#### C.1.2 Review Modal (3h)

**Actions:**

1. Create `components/features/ReviewModal.tsx`:

   * Full-size screenshot
   * All report details
   * Sanity check flags (if any):

     * ⚠️ FPS >200
     * ⚠️ TDP >30W
     * ⚠️ Screenshot <50KB
   * [Approve] [Reject] [Close] buttons

**Testing:**

* [ ] Modal opens on [View]
* [ ] All details visible
* [ ] Flags show if applicable

---

#### C.1.3 Approve API Route (2h)

**Actions:**

1. Create `app/api/admin/reports/[id]/approve/route.ts`:

   * Validate auth
   * Check is_admin (via user session RPC)
   * Call SQL function `admin_approve_report(reportId, adminId)`
   * Return updated report + gameApproved flag

**Reference:** 03-TECHNICAL-ARCHITECTURE.md Section 2.4, 3.1

**Testing:**

* [ ] Admin can approve report
* [ ] Non-admin gets 403
* [ ] Game auto-approved if pending
* [ ] Report appears on game page

---

#### C.1.4 Reject API Route (2h)

**Actions:**

1. Create `app/api/admin/reports/[id]/reject/route.ts`:

   * Validate auth
   * Check is_admin
   * Validate rejection reason (Zod)
   * Update report (`verification_status='rejected'`, reason, moderated_at/by)
   * Return updated report

**Testing:**

* [ ] Admin can reject report
* [ ] Reason required
* [ ] Report appears in user's profile as rejected

---

#### C.1.5 Rejection Reason Modal (2h)

**Actions:**

1. Create `components/features/RejectModal.tsx`:

   * Radio buttons:

     * Invalid screenshot
     * Unrealistic data
     * Duplicate report
     * Other (+ custom text input)
   * [Submit] [Cancel] buttons

**Testing:**

* [ ] Modal opens on [Reject]
* [ ] Reason required before submit
* [ ] Custom reason enabled if "Other"

---

**C.1 Complete:** Admin can verify/reject reports

---

### C.2 Final Polish (8-10h)

#### C.2.1 SEO Optimization (2h)

**Actions:**

1. Add metadata to pages:

```typescript
export const metadata = {
  title: 'Elden Ring Performance - HandheldLab',
  description: 'Find the best settings for Elden Ring on handheld gaming PCs',
}
```

2. Add Open Graph tags
3. Create `robots.txt`, `sitemap.xml`

**Testing:**

* [ ] Page titles unique
* [ ] Descriptions present
* [ ] OG tags render in previews

---

#### C.2.2 Accessibility Audit (3h)

**Actions:**

1. Run Lighthouse accessibility audit (target: >90)
2. Fix issues:

   * Missing alt text
   * Color contrast
   * Keyboard navigation
   * Focus states
3. Test with keyboard only (no mouse)

**Reference:** 05-UI-UX-SPECIFICATION.md Section 5.5

**Testing:**

* [ ] Lighthouse score >90
* [ ] All images have alt text
* [ ] All interactive elements keyboard accessible
* [ ] Focus states visible

---

#### C.2.3 Error Pages (1h)

**Actions:**

1. Create `app/not-found.tsx` (404 page)
2. Create `app/error.tsx` (500 page)
3. Style with HandheldLab branding

**Testing:**

* [ ] 404 shows for invalid routes
* [ ] 500 shows on server errors
* [ ] Links to homepage work

---

#### C.2.4 Performance Optimization (2h)

**Actions:**

1. Run Lighthouse performance audit
2. Optimize images:

   * Add `loading="lazy"` to below-fold images
   * Use `sizes` attribute correctly
3. Check bundle size (`npm run build`)
4. Remove unused dependencies

**Testing:**

* [ ] Lighthouse performance >80
* [ ] First Contentful Paint <2s
* [ ] Bundle size <200KB initial

---

#### C.2.5 Final Bug Fixes (2h)

**Actions:**

1. Test all flows end-to-end
2. Fix bugs found during testing
3. Cross-browser testing (Chrome, Firefox, Safari)

**Testing:**

* [ ] Signup → Submit → Admin → Approve works
* [ ] Upvote toggle works
* [ ] Filters/sort work
* [ ] Mobile works on iOS/Android

---

**C.2 Complete:** App polished and ready for launch

---

**Phase C Complete:** ✅
**Deliverable:** Admin verification works, app polished, accessible, performant

---

## Phase D: Testing & Launch (Week 4)

**Duration:** 20-25 hours
**Goal:** Comprehensive testing, bug fixes, deploy to production

### D.1 Comprehensive Testing (10-12h)

#### D.1.1 Manual Testing (All Flows) (4h)

**Test Cases:**

**Signup Flow:**

* [ ] Signup with valid data → email sent
* [ ] Signup with duplicate username → error
* [ ] Verify email → session created
* [ ] Login after verification → success

**Submit Flow:**

* [ ] Submit report with all fields → pending (verification_status='pending')
* [ ] Submit with missing fields → error
* [ ] Submit with file >5MB → error
* [ ] Submit with invalid FPS logic → error
* [ ] Manual game entry → pending game created

**Game Page:**

* [ ] View approved games → reports display
* [ ] Filter by device → reports filtered
* [ ] Sort by upvotes → order correct
* [ ] Sort by newest → order correct
* [ ] Empty state if no reports → message shown

**Upvote:**

* [ ] Anonymous click → login modal
* [ ] Authenticated click → vote created
* [ ] Click again → vote removed
* [ ] Counter updates correctly

**Profile:**

* [ ] View own reports → all statuses shown
* [ ] Pending reports → badge shown
* [ ] Rejected reports → reason shown

**Admin:**

* [ ] Admin access queue → reports shown
* [ ] Non-admin access → 404
* [ ] Approve report → verified
* [ ] Reject report → rejected + reason

**Anon Reports (LOCKED MUST-HAVE):**

* [ ] Delete a user account → reports remain visible publicly, author shows `@[deleted]`
* [ ] Votes by deleted user removed; counters remain consistent (no negative)

---

#### D.1.2 Cross-Browser Testing (2h)

**Test on:**

* [ ] Chrome (Windows/Mac)
* [ ] Firefox (Windows/Mac)
* [ ] Safari (Mac/iOS)
* [ ] Edge (Windows)

**Check:**

* [ ] Layout renders correctly
* [ ] Forms submit correctly
* [ ] Images load correctly
* [ ] Modals work correctly

---

#### D.1.3 Mobile Testing (2h)

**Test on:**

* [ ] iPhone (Safari)
* [ ] Android (Chrome)

**Check:**

* [ ] Responsive layout works
* [ ] Touch targets large enough
* [ ] Forms usable
* [ ] Upload works on mobile

---

#### D.1.4 Performance Testing (2h)

**Actions:**

1. Run Lighthouse on key pages:

   * Homepage
   * Game page
   * Submit page
2. Target scores:

   * Performance: >80
   * Accessibility: >90
   * Best Practices: >90
   * SEO: >90

**Testing:**

* [ ] All scores meet targets
* [ ] Fix any critical issues

---

#### D.1.5 Security Testing (2h)

**Test:**

* [ ] RLS policies enforced (try accessing others' data)
* [ ] Admin routes protected (try as non-admin)
* [ ] CSRF protection works (Origin validation)
* [ ] File upload validated (try uploading .exe)
* [ ] SQL injection prevented (Supabase handles)

**Actions:**

* Try accessing `/api/admin/reports/[id]/approve` as non-admin
* Try uploading non-image file
* Try spoofing screenshot path in submit

**Anon Reports Security Additions (LOCKED):**

* [ ] Verify deleted user cannot be enumerated from reports (no profile links, no private data)
* [ ] Ensure `reports_select_verified` still works with `user_id NULL` (reports remain visible)

---

**D.1 Complete:** App thoroughly tested

---

### D.2 Bug Fixes & Refinements (6-8h)

#### D.2.1 Fix Bugs from Testing (4h)

**Actions:**

1. Create bug list from testing
2. Prioritize by severity:

   * Critical: Blocks core flow
   * High: Affects UX significantly
   * Medium: Minor issues
   * Low: Nice-to-have fixes
3. Fix critical + high priority bugs

**Testing:**

* [ ] All critical bugs fixed
* [ ] All high priority bugs fixed

---

#### D.2.2 Final UX Refinements (2h)

**Actions:**

1. Improve loading states
2. Add helpful empty states
3. Improve error messages
4. Add tooltips where helpful

**Testing:**

* [ ] Empty states clear
* [ ] Error messages actionable
* [ ] Loading states smooth

---

**D.2 Complete:** Bugs fixed, UX refined

---

### D.3 Production Deployment (4-6h)

#### D.3.1 Pre-Deployment Checklist (1h)

**Checklist:**

* [ ] All environment variables in Vercel
* [ ] Database seeded in production
* [ ] Storage bucket created in production
* [ ] RLS policies enabled in production
* [ ] Email templates configured (Supabase Auth)
* [ ] Analytics installed (Plausible/PostHog/GA4)
* [ ] Error monitoring installed (Sentry - optional)
* [ ] Production schema includes `performance_reports.user_id` nullable + FK `ON DELETE SET NULL` (Anon Reports locked rule)

---

#### D.3.2 Deploy to Production (1h)

**Actions:**

1. Merge to `main` branch
2. Vercel auto-deploys
3. Verify deployment successful
4. Test production URL

**Testing:**

* [ ] Production URL loads
* [ ] Database connected
* [ ] Storage works
* [ ] Auth works

---

#### D.3.3 Post-Deployment Testing (2h)

**Actions:**

1. Run smoke tests on production:

   * Signup flow
   * Submit flow
   * Game page
   * Admin flow
2. Check error monitoring (Sentry)
3. Check analytics tracking

**Testing:**

* [ ] All critical flows work
* [ ] No errors in Sentry
* [ ] Analytics tracking events

---

#### D.3.4 DNS & Domain Setup (1h - optional)

**Actions:**

1. Purchase domain (if not done)
2. Configure DNS in Vercel
3. Enable HTTPS (automatic)
4. Update `NEXT_PUBLIC_APP_URL` env var

**Testing:**

* [ ] Custom domain works
* [ ] HTTPS enabled
* [ ] Redirects from www work

---

**D.3 Complete:** App live in production

---

### D.4 Launch Preparation (2h)

#### D.4.1 Prepare Launch Materials (1h)

**Actions:**

1. Write launch announcement
2. Prepare social media posts
3. Create demo accounts (with sample reports)

---

#### D.4.2 Soft Launch (1h)

**Actions:**

1. Share with 5-10 trusted users
2. Monitor for issues
3. Collect early feedback
4. Fix any critical bugs

**Testing:**

* [ ] Users can sign up
* [ ] Users can submit reports
* [ ] No critical errors

---

**D.4 Complete:** Ready for public launch

---

**Phase D Complete:** ✅
**Deliverable:** App live, tested, ready for users

---

## 7. Testing Strategy

### 7.1 Testing Levels

**Manual Testing (Primary for MVP):**

* All user flows tested manually
* Cross-browser testing
* Mobile testing
* Accessibility testing (keyboard, screen reader)

**Automated Testing (v2):**

* Unit tests (components, utilities)
* Integration tests (API routes)
* E2E tests (Playwright)

**Why Manual First:**

* Faster to ship MVP
* Automated tests add overhead
* Real user testing more valuable early

---

### 7.2 Testing Checklist per Phase

**Phase A (Foundation):**

* [ ] Database schema correct (inspect in Supabase)
* [ ] RLS policies enforce rules (try bypass attempts)
* [ ] Triggers fire correctly (test each)
* [ ] Auth flows work (signup → login → logout)
* [ ] Layout renders on all screen sizes
* [ ] Anon Reports: delete user → reports remain, author becomes `@[deleted]`, votes removed, counters consistent

**Phase B (Core Features):**

* [ ] Submit flow end-to-end (upload → DB → profile)
* [ ] Game pages display reports correctly
* [ ] Filters/sort work as expected
* [ ] Upvote toggle works
* [ ] Profile shows all statuses
* [ ] Anon Reports: game page renders reports with deleted author

**Phase C (Admin & Polish):**

* [ ] Admin can verify/reject reports
* [ ] Non-admin cannot access admin
* [ ] Accessibility score >90
* [ ] Performance score >80
* [ ] SEO metadata present
* [ ] Anon Reports: admin queue renders deleted author safely

**Phase D (Testing & Launch):**

* [ ] All flows tested on production
* [ ] Cross-browser tested
* [ ] Mobile tested
* [ ] Security tested
* [ ] No critical bugs
* [ ] Anon Reports: deletion scenario verified end-to-end

---

### 7.3 Bug Tracking

**Use GitHub Issues:**

* Label by severity: `critical`, `high`, `medium`, `low`
* Label by type: `bug`, `enhancement`, `question`
* Milestone: `MVP Launch`

**Triage:**

* Critical: Fix immediately
* High: Fix before launch
* Medium: Fix if time allows
* Low: Post-launch

---

## 8. Deployment Checklist

### 8.1 Pre-Deployment

**Database:**

* [ ] Production Supabase project created
* [ ] Database schema deployed (run SQL scripts)
* [ ] RLS policies enabled
* [ ] Triggers created
* [ ] Seed data loaded (12 devices, 50 games)
* [ ] Reports are preserved on account deletion (FK `ON DELETE SET NULL`, `performance_reports.user_id` nullable)

**Storage:**

* [ ] `proofs` bucket created (private)
* [ ] Storage policies configured

**Auth:**

* [ ] Email templates configured (Supabase dashboard)
* [ ] Redirect URLs configured (production domain)
* [ ] Email provider configured (SMTP or Supabase default)

**Environment Variables:**

* [ ] `NEXT_PUBLIC_SUPABASE_URL` (production)
* [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (production)
* [ ] `SUPABASE_SERVICE_ROLE_KEY` (production)
* [ ] `NEXT_PUBLIC_APP_URL` (production domain)

**Analytics:**

* [ ] Analytics installed (Plausible/PostHog/GA4)
* [ ] Tracking events verified

**Monitoring (Optional):**

* [ ] Sentry configured
* [ ] Error tracking verified

---

### 8.2 Deployment

**Vercel:**

* [ ] GitHub repo connected
* [ ] Environment variables added
* [ ] Production deployment triggered
* [ ] Deployment successful
* [ ] Production URL accessible

**DNS:**

* [ ] Custom domain configured (optional)
* [ ] HTTPS enabled
* [ ] www redirect configured

---

### 8.3 Post-Deployment

**Smoke Tests:**

* [ ] Homepage loads
* [ ] Signup works
* [ ] Login works
* [ ] Submit report works
* [ ] Game page works
* [ ] Upvote works
* [ ] Admin works
* [ ] Anon Reports: delete a user → reports remain public, author `@[deleted]`, votes removed, counters consistent

**Monitoring:**

* [ ] Check Sentry for errors (if installed)
* [ ] Check analytics for events
* [ ] Check Supabase logs

**Soft Launch:**

* [ ] Share with 5-10 users
* [ ] Monitor for issues
* [ ] Collect feedback
* [ ] Fix critical bugs

---

## 9. Post-Launch Plan

### 9.1 Week 1 Post-Launch

**Monitor:**

* Error rates (Sentry)
* Sign-up conversion
* Report submission rate
* Admin verification backlog

**Collect Feedback:**

* User interviews (5-10 users)
* Bug reports (GitHub Issues)
* Feature requests (GitHub Discussions)

**Quick Wins:**

* Fix any critical bugs
* Improve error messages based on feedback
* Add missing empty states

---

### 9.2 Week 2-4 Post-Launch

**Iterate Based on Data:**

* Add most-requested features (v2 roadmap)
* Improve performance bottlenecks
* Optimize SEO based on search console

**Validate Metrics:**

* Track CQI metrics (see 02-PRODUCT-REQUIREMENTS.md)
* Are users finding value?
* Are reports being upvoted?
* Are users returning?

---

### 9.3 v2 Roadmap (Post-MVP)

**High Priority (Weeks 5-8):**

1. Email notifications (report verified/rejected)
2. Search functionality (game search)
3. More sort options (TDP efficiency, resolution)
4. Thumbnail generation (reduce screenshot sizes)
5. Rate limiting (prevent spam)

**Medium Priority (Weeks 9-12):**

1. User reputation system (quality contributors)
2. Advanced filters (multiple devices, FPS range)
3. Comparison view (side-by-side reports)
4. Steam API integration (auto-populate game data)
5. Dark mode

**Low Priority (Beyond Week 12):**

1. Comments on reports
2. Social sharing (share reports)
3. Mobile app (PWA or native)
4. API for third parties
5. Premium features (ad-free, early access)

---

## End of Document

**Status:** 06-IMPLEMENTATION-PLAN.md COMPLETE ✅ (LOCKED)

**Next Steps:**

1. Copy all 6 documents (01-06) to project wiki/docs folder
2. Begin Phase 0 (Project Setup)
3. Track progress in GitHub Projects or Notion
4. Reference docs frequently during implementation

**Total Estimated Time:** 120-140 hours (4 weeks @ 30-35h/week)
