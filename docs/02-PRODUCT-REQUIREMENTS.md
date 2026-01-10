# HandheldLab - Product Requirements Document (PRD)

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Status:** Complete - LOCKED ✅

---

## 1. Vision & Mission (Reference from 01-PROJECT-OVERVIEW.md)

**Vision:**
"HandheldLab becomes the default place to check real handheld performance—so anyone can decide what to buy/play and how to run it, with confidence."

**Mission:**
"We crowdsource verifiable, real-world handheld performance reports (with settings + proof) to answer: 'Will it run well on my device—and what tradeoffs will I make?' Zero bullshit."

**Core Values:**
1. Community-first
2. Transparency
3. Device-agnostic
4. No paywalls on data
5. Evidence over opinions

---

## 2. Success Metrics

### 2.1 North Star Metric

**Coverage Quality Index (CQI)**
```
CQI = (Games with ≥3 verified reports on ≥2 top devices) / (Top 200 handheld-relevant games)
```

**Top 200 handheld-relevant games = lista kuratorowana (Steam Deck top sellers + community picks), zamrażana na 6 miesięcy.**

**Target (6 months):** 30-40% CQI

**Dlaczego to jest North Star:**
- Mierzy **realną wartość produktu** (czy user znajdzie odpowiedź na swoje pytanie)
- Wymusza balans między:
  - Breadth (coverage wielu gier)
  - Depth (≥3 reports = porównywalne dane)
  - Device diversity (≥2 devices = nie tylko Steam Deck)
- Jest pod Twoją kontrolą (seed data + community growth)
- Koreluje z retention (wysoki CQI = użytkownicy wracają)

**Przykład:**
- Top 200 gier handheldowych (frozen list)
- 70 gier ma ≥3 verified reports na ≥2 top devices
- CQI = 70/200 = **35%** ✅ TARGET HIT

---

### 2.2 Supporting Metrics (6 Month Targets)

#### Input Metrics (co napędza CQI):

**Total Verified Reports:** 3,000-6,000
- Jakość > ilość
- Ratio: ~70% verified (4,500 submissions → 3,000 verified)
- Coverage: prefer 10 games × 3 reports over 30 games × 1 report

**Active Contributors:** 200-500 users
- "Active" = ≥1 verified report w ostatnich 30 dniach
- Top 10% contributors generują ~50% raportów (Pareto)

**Admin Throughput:** <30 min/day moderation time
- Pending queue: max 50 reports backlog
- Approval rate: ~70% (30% rejected = quality bar działa)

---

#### Output Metrics (co pokazuje traction):

**Monthly Active Users (MAU):** 15,000-30,000
- "Active" = viewed ≥1 game page
- Organic traffic > paid (SEO działa)

**Avg Reports Viewed per Session:** 3-5
- User porównuje multiple configs przed decyzją
- <2 = not engaging enough
- >8 = analysis paralysis

**Conversion: View → Upvote:** 5-10%
- 1,000 views → 50-100 upvotes
- Pokazuje engagement beyond passive browsing

---

#### Quality Metrics (czy dane są wiarygodne):

**Verification Rate:** 65-75%
- Too high (>80%) = bar zbyt niski
- Too low (<60%) = zniechęca contributors

**Avg Upvotes per Verified Report:** 3-8
- <3 = nikt nie ocenia OR reports są meh
- >15 = tylko top reports widoczne (long tail problem)

**Device Coverage Balance:** 
- Steam Deck: 40-50% raportów
- Windows handhelds (Ally/Legion/etc): 40-50%
- Other: 10%

(Nie chcemy 90% Steam Deck, 10% reszta)

---

### 2.3 Kill Criteria (Decision Gates)

**Week 1 (Waitlist Validation):**
- ❌ <200 email signups → **PIVOT or KILL**
- ✅ 300-500 signups → proceed to build

**Month 3 (Post-Launch):**
- ❌ <300 verified reports → reassess (community not engaging)
- ❌ <5,000 MAU → distribution problem (SEO/marketing pivot needed)
- ❌ CQI <15% → not enough coverage (seed more OR narrow top games list)

**Month 6 (Go/No-Go for v2):**
- ❌ CQI <25% → MVP failed, don't invest in v2
- ❌ <100 active contributors → community didn't form
- ✅ CQI 30-40% + 200+ contributors + 15k+ MAU → **FULL SEND on v2**

---

## 3. MVP Feature Specification

### 3.1 Core Features (What IS in MVP)

#### Feature 1: Authentication System

**Description:**
Email/password authentication via Supabase Auth. No OAuth, no social login.

**Username jest publiczny, widoczny na reportach i nieedytowalny w MVP.**

**User Flow:**
1. User clicks "Sign Up" → modal opens
2. Enters: email, password (≥8 chars), username (3-20 chars, alphanumeric + hyphens/underscores)
3. Submits → receives confirmation email
4. Clicks link → redirected to app → logged in
5. Can log out, log back in with same credentials

**Validation Rules:**
- Email: valid format (Supabase validates)
- Password: minimum 8 characters
- Username: 
  - Length: 3-20 characters
  - Format: `^[a-zA-Z0-9_-]+$` (letters, numbers, hyphens, underscores only)
  - Unique (enforced by DB constraint)
  - Public and permanent (no editing in MVP)

**Acceptance Criteria:**
- [ ] User can sign up with email/password/username
- [ ] Email confirmation sent and works
- [ ] Profile auto-created in `profiles` table with username
- [ ] User can log in after confirmation
- [ ] User can log out
- [ ] Invalid inputs show inline error messages
- [ ] Logged-in state persists across page refreshes
- [ ] Username cannot be changed after creation (no edit UI)

**Components:**
- `LoginModal.tsx`
- `SignupModal.tsx`
- `AuthButton.tsx` (header dropdown)
- `AuthContext.tsx` (client-side state)

**API Routes:**
- `/auth/callback` (handles email confirmation redirect)

---

#### Feature 2: Performance Report Upload

**Description:**
Authenticated users can submit performance reports: screenshot + manual form data.

**User Flow:**
1. User clicks "Submit Report" (header or homepage CTA)
2. Redirects to `/submit` (requires auth)
3. Step 1: Select game (dropdown with search OR "add manually")
4. Step 2: Select device (dropdown, hardcoded list)
5. Step 3: Upload screenshot (drag-drop or file picker, max 5MB, .png/.jpg only)
   - **Helper text:** "Screenshot must clearly show FPS overlay (e.g. MangoHud, MSI Afterburner). Reports without visible FPS will be rejected."
6. Step 4: Fill performance metrics:
   - FPS Average (required, 1-999)
   - FPS Min (optional)
   - FPS Max (optional)
7. Step 5: Fill device settings:
   - TDP Watts (dropdown: 5, 8, 10, 12, 15, 18, 20, 25, 30)
   - Resolution (dropdown: Native, 1080p, 900p, 800p, 720p, 540p)
   - Graphics Preset (dropdown: Low, Medium, High, Ultra, Custom)
8. Step 6: Optional fields:
   - Proton version (text input)
   - Notes (textarea, max 500 chars with counter)
9. Submit → report status = "pending"
10. Success screen: "Report submitted, pending verification (~24h)"

**Validation Rules:**
- Screenshot: 
  - Required
  - File types: image/jpeg, image/png
  - Max size: 5MB
  - Upload to: `userId/timestamp-random.ext` in private bucket
- FPS Average: required, integer, 1-999
  - **FPS >200 triggers automatic sanity flag (review priority in admin panel)**
- FPS Min/Max: optional, but if provided: `Min ≤ Avg ≤ Max`
- TDP: must select from dropdown (no custom values)
- Resolution: must select from dropdown
- Graphics Preset: must select from dropdown
- Notes: max 500 characters

**Duplicate Warning:**
- After selecting game + device, check existing verified reports count
- If ≥5 exist, show soft warning: "This game already has X verified reports for [device]. Submit anyway if you have different settings."
- Don't block, just inform

**Upload Error Handling:**
- Show progress bar during upload
- If upload fails: "Upload failed. Retry?" button
- Form data preserved (don't lose user's input)

**Acceptance Criteria:**
- [ ] Auth required (redirects to login if not authenticated)
- [ ] Game dropdown shows seeded games + search works
- [ ] "Add game manually" opens modal, creates pending game
- [ ] Device dropdown shows 12 hardcoded devices
- [ ] Screenshot upload to Supabase Storage (private bucket, user folder)
- [ ] Helper text about FPS overlay requirement visible
- [ ] All validation rules enforced (client + server)
- [ ] FPS >200 auto-flags report as sanity check failure
- [ ] Inline error messages for invalid inputs
- [ ] Duplicate warning shown when ≥5 reports exist
- [ ] Submit creates row in `performance_reports` with status='pending'
- [ ] Success screen confirms submission
- [ ] Upload retry works if first attempt fails

**Components:**
- `/submit/page.tsx` (main form)
- `AddGameModal.tsx` (manual game entry)
- `UploadProgress.tsx` (progress bar)

**API Routes:**
- `POST /api/reports` (create report)
- `POST /api/games` (create pending game)

**Storage:**
- `uploadScreenshot()` in `storage.client.ts`

---

#### Feature 3: Game Detail Page

**Description:**
Public page showing all verified reports for a specific game, filterable and sortable.

**User Flow:**
1. User navigates to `/games/[slug]` (e.g., `/games/elden-ring`)
2. Sees game header:
   - Placeholder cover (gradient + title)
   - Game name
   - Report count (if ≥10: "X verified reports", if <10: "Few verified reports")
   - [View on Steam →] link (if steam_app_id exists)
3. Filters (horizontal pills, scrollable on mobile):
   - [All] [Steam Deck] [ROG Ally] [Legion Go] [+9 more]
   - Click → filters reports, updates URL (?device=steam-deck-oled)
4. Sort dropdown:
   - Most Helpful (default)
   - Newest First
   - Highest FPS
   - Lowest TDP
5. Reports grid:
   - 3 columns desktop, 2 tablet, 1 mobile
   - Each report card shows (see Feature 4)
6. "Load More" button (pagination, 12 reports per page)
7. Empty state: "No verified reports yet for [device]. Be the first! [Submit Report →]"

**URL State:**
- `?device=slug` - filter by device
- `?sort=upvotes|newest|fps|tdp` - sort order

**Visibility Rules:**
- Anonymous users: see only `status='verified'` reports
- Logged-in users: see verified + own pending/rejected (marked clearly)

**Acceptance Criteria:**
- [ ] Dynamic route `/games/[slug]` works
- [ ] 404 if game doesn't exist
- [ ] Game header shows placeholder cover + metadata
- [ ] **Report count <10 never shows exact number (avoids false confidence)**
- [ ] Device filter pills functional, updates URL
- [ ] Sort dropdown functional, updates URL
- [ ] Reports fetch with filters/sort applied
- [ ] Pagination works (12 per page, "Load More")
- [ ] Empty state shown when no reports match filters
- [ ] Responsive grid (3/2/1 columns)
- [ ] Anonymous users don't see pending reports

**Components:**
- `/games/[slug]/page.tsx`
- `GameCoverPlaceholder.tsx`
- `ReportsGrid.tsx`
- `DeviceFilterPills.tsx`
- `SortDropdown.tsx`

**API/Queries:**
- `getGameBySlug(slug)` - server component
- `getReportsForGame(gameId, filters, sort, offset)` - server component

---

#### Feature 4: Report Card Component

**Description:**
Individual report display showing screenshot, metrics, settings, upvotes.

**Layout:**
```
┌─────────────────────────────────────┐
│ [Screenshot - 16:9 aspect]          │
│                        ✅ Verified  │
├─────────────────────────────────────┤
│ Steam Deck OLED                     │
│ 52 FPS avg (45-60) • 40+ Comfort    │ ← FPS Class badge
│ Medium • 15W TDP • 800p             │
│ Proton 8.0-5                        │ ← only if exists
│ ❤️ 47 • @deckmaster • 3 days ago   │
└─────────────────────────────────────┘
```

**FPS Class Badge:**
- 60+ FPS → "60+ Smooth" (green)
- 40-59 FPS → "40+ Comfort" (blue)
- 30-39 FPS → "30+ Playable" (neutral gray)
- <30 FPS → NO BADGE (don't shame)
- **Reports with <30 FPS show no FPS class badge by design (neutral, non-judgmental).**

**Interactions:**
- Click screenshot → opens full-size modal (signed URL)
- Click heart → upvote/remove upvote (requires auth)
  - Optimistic UI update
  - Disabled if already upvoted (filled heart)

**Status Badges:**
- ✅ Verified (green)
- ⏳ Pending verification (yellow) - only visible to report author
- ❌ Rejected (red) + reason tooltip - only visible to report author

**Acceptance Criteria:**
- [ ] Screenshot displays (signed URL from private bucket)
- [ ] FPS Class badge shows correct label/color based on avg FPS
- [ ] FPS Class badge hidden if <30 FPS (by design, not a bug)
- [ ] Settings row concise: "Preset • TDP • Resolution"
- [ ] Proton version shown only if exists
- [ ] Upvote count + username + relative timestamp
- [ ] Click screenshot opens full-size modal with close button
- [ ] Upvote button functional (auth required)
- [ ] Upvote state persists (check if user already upvoted)
- [ ] Status badge shown based on verification_status
- [ ] Pending/rejected only visible to report author
- [ ] Responsive layout (mobile: stack vertically)

**Components:**
- `ReportCard.tsx`
- `ScreenshotModal.tsx`
- `UpvoteButton.tsx` (client component)
- `FPSClassBadge.tsx`

**API Routes:**
- `POST /api/reports/[id]/vote` (create vote)
- `DELETE /api/reports/[id]/vote` (remove vote)

**Utils:**
- `getFPSClass(fps)` → returns {label, color, show}
- `createSignedUrl(path)` → returns temp URL for screenshot

---

#### Feature 5: Admin Verification Queue

**Description:**
Protected admin panel to review pending reports and approve/reject them.

**Access Control:**
- Route: `/admin`
- Requires: `is_admin = true` in profiles
- Redirect to 404 if not admin
- **All admin API routes also enforce `is_admin = true` server-side (RLS + manual check)**

**User Flow:**
1. Admin navigates to `/admin`
2. Sees pending reports table:
   - Screenshot thumbnail
   - Game | Device
   - FPS metrics
   - Settings summary
   - Submitted by @username • timestamp
   - [View] [Approve] [Reject] buttons
3. Click [View] → modal opens:
   - Full-size screenshot
   - All report details
   - Sanity check flags (if any):
     - ⚠️ FPS >200 (suspicious)
     - ⚠️ TDP >30W (not handheld-typical)
     - ⚠️ Screenshot <50KB (likely fake/cropped)
   - [Approve] [Reject] buttons
4. Click [Approve]:
   - Report status → 'verified'
   - `verified_at` = now
   - `verified_by` = admin user_id
   - If game was pending → also approve game
   - Modal closes, report removed from queue
5. Click [Reject]:
   - Rejection reason modal opens:
     - Dropdown: "Invalid screenshot (no FPS visible)", "Unrealistic data", "Duplicate report", "Other"
     - Text field (if "Other" selected)
   - Confirm → report status → 'rejected'
   - `rejection_reason` saved
   - Modal closes, report removed from queue

**Sorting:**
- Default: oldest first (FIFO queue)
- Option: flagged first (sanity check failures)

**Acceptance Criteria:**
- [ ] Route protected (is_admin check, 404 if false)
- [ ] **All admin API routes enforce is_admin server-side (not just UI)**
- [ ] Pending reports list loads (status='pending')
- [ ] Table shows: thumbnail, game, device, FPS, settings, user, time
- [ ] Sanity check flags displayed if applicable
- [ ] [View] opens modal with full screenshot + details
- [ ] [Approve] updates status, timestamps, removes from queue
- [ ] [Approve] also approves pending game if applicable
- [ ] [Reject] opens reason modal
- [ ] Rejection reason saved with report
- [ ] Rejected reports not shown to public
- [ ] Queue auto-refreshes after approve/reject
- [ ] Keyboard shortcuts work (optional but nice): A=approve, R=reject, →=next

**Components:**
- `/admin/page.tsx`
- `PendingReportsTable.tsx`
- `ReportReviewModal.tsx`
- `RejectReasonModal.tsx`

**API Routes:**
- `POST /api/admin/reports/[id]/approve` (server-side is_admin check)
- `POST /api/admin/reports/[id]/reject` (server-side is_admin check)

---

#### Feature 6: Upvote System

**Description:**
Users can upvote helpful reports. One upvote per user per report.

**Mechanics:**
- Click heart icon → POST vote
- Click again → DELETE vote (toggle)
- Requires authentication
- Optimistic UI: update count immediately, rollback if API fails

**Database:**
- `performance_votes` table prevents double-voting (unique constraint on report_id + user_id)
- `performance_reports.upvotes` counter (incremented/decremented)

**Display:**
- Heart icon: outline (not voted) vs filled (voted)
- Count next to icon

**Acceptance Criteria:**
- [ ] Upvote button requires auth (show login modal if clicked while logged out)
- [ ] Click creates vote → increments count
- [ ] Click again removes vote → decrements count
- [ ] Optimistic UI update (instant feedback)
- [ ] Rollback if API call fails
- [ ] User can't double-vote (DB constraint enforced)
- [ ] Vote state persists across page refreshes
- [ ] Heart icon visual state reflects current vote status

**Components:**
- `UpvoteButton.tsx` (client component in ReportCard)

**API Routes:**
- `POST /api/reports/[id]/vote`
- `DELETE /api/reports/[id]/vote`

---

#### Feature 7: User Profile

**Description:**
Simple profile page showing user's submissions (all statuses).

**URL:** `/profile`

**Content:**
- Username
- Avatar placeholder (no upload in MVP, just initials or icon)
- "Your Reports" section:
  - List of all user's reports (verified, pending, rejected)
  - Status badge clearly visible
  - For rejected: show rejection reason
- Group by status:
  - Verified (X)
  - Pending (X)
  - Rejected (X)

**Acceptance Criteria:**
- [ ] Route requires auth
- [ ] Shows current user's username
- [ ] Lists all user's reports (fetch where user_id = current user)
- [ ] Status badges visible (verified/pending/rejected)
- [ ] Rejected reports show rejection reason
- [ ] Reports grouped by status for clarity
- [ ] Click report → goes to game page (scrolls to that report)

**Components:**
- `/profile/page.tsx`
- `UserReportsList.tsx`

---

#### Feature 8: Homepage

**Description:**
Landing page with hero, search placeholder, popular games grid.

**Sections:**

**1. Hero:**
```
┌─────────────────────────────────────────┐
│ Find real handheld performance          │
│ before you buy                           │
│                                          │
│ [Search games...]                        │
│ (non-functional placeholder in MVP)     │
│                                          │
│ [Submit Performance Report →]            │
└─────────────────────────────────────────┘
```

**2. How It Works (3 columns):**
```
┌───────────┬───────────┬───────────┐
│ 🔍        │ ✅        │ 💡        │
│ Search    │ See       │ Decide    │
│ your game │ verified  │ with      │
│           │ reports   │ confidence│
└───────────┴───────────┴───────────┘
```

**3. Popular Games Grid:**
- 8-12 game tiles (2x4 or 3x4 grid)
- Each tile: Placeholder cover + game name
- Click → goes to `/games/[slug]`
- Responsive: 4 cols desktop, 2 cols tablet, 1 col mobile

**Acceptance Criteria:**
- [ ] Hero section with tagline
- [ ] Search input (placeholder, non-functional in MVP)
- [ ] "Submit Report" CTA button (goes to /submit)
- [ ] "How It Works" 3-column section
- [ ] Popular games grid (8-12 games from seed data)
- [ ] Click game → navigates to game page
- [ ] Responsive layout
- [ ] Mobile: hero stacks vertically, grid 1-column

**Components:**
- `/page.tsx` (root homepage)
- `Hero.tsx`
- `HowItWorks.tsx`
- `PopularGamesGrid.tsx`

---

#### Feature 9: Layout (Header + Footer)

**Description:**
Persistent navigation across all pages.

**Header:**
- Logo (left) → links to homepage
- Search bar (center, placeholder in MVP) → non-functional
- Auth button (right) → Login/Signup OR user dropdown (profile, admin if applicable, logout)

**Footer:**
- Brand + tagline
- Links: Browse Games, Submit Report
- Legal: Privacy Policy (placeholder page), Terms (placeholder page)
- Copyright

**Acceptance Criteria:**
- [ ] Header sticky (stays at top on scroll)
- [ ] Logo links to homepage
- [ ] Auth button shows login/signup when logged out
- [ ] Auth button shows user dropdown when logged in
- [ ] Dropdown includes: Profile, Admin (if is_admin), Logout
- [ ] Footer on all pages
- [ ] Mobile: header responsive (hamburger menu not needed if search is placeholder)

**Components:**
- `Header.tsx`
- `Footer.tsx`
- Layout wraps all pages in `app/layout.tsx`

---

### 3.2 Explicitly Out of Scope (What IS NOT in MVP)

**Dlaczego ta sekcja jest krytyczna:**
- Chroni przed scope creep
- Jasno komunikuje co przychodzi w v2
- Pozwala powiedzieć "nie" bez guilt

---

#### ❌ OCR / Auto-Extract FPS from Screenshot

**What it would be:**
- Tesseract.js lub AI vision model
- Auto-read FPS z Mangohud/MSI Afterburner overlay
- Pre-fill form fields

**Why NOT in MVP:**
- Adds complexity (OCR libraries, training data, error handling)
- Not core to value prop (manual entry works fine)
- Can validate manually during admin review anyway
- v2 feature: reduces contributor friction

**Alternative in MVP:**
- Manual form entry
- Helper text: "Screenshot must show FPS overlay"
- Admin verifies screenshot matches reported FPS

---

#### ❌ Comments / Discussion on Reports

**What it would be:**
- Users can comment on reports: "Confirmed, works for me"
- Threaded replies
- Upvote comments
- Moderation of comments

**Why NOT in MVP:**
- Turns product into social network (against "IS NOT" principle)
- Massive moderation overhead (spam, toxicity)
- Dilutes focus from core value: verified data
- Upvotes already serve as "this is helpful" signal

**Alternative in MVP:**
- Upvote system (binary: helpful or not)
- Report notes field (500 chars, user's own context)

**v2 consideration:**
- Maybe allow comments, but only on reports with >10 upvotes
- Or: "Questions about this config?" → Discord link

---

#### ❌ User Reputation Score / Leaderboards / Badges

**What it would be:**
- Points for verified reports
- "Trusted Contributor" badge after X reports
- Leaderboard: top contributors this month
- Profile shows reputation score

**Why NOT in MVP:**
- Gamification can encourage spam (quantity over quality)
- Need time to see what "good contributor" looks like
- Admin verification already ensures quality
- Premature optimization (no users yet to rank)

**Alternative in MVP:**
- Username visible on reports (basic attribution)
- Upvotes serve as implicit reputation
- Profile shows count of verified reports

**v2 feature:**
- After 3 months, analyze data:
  - Which users have highest avg upvotes per report?
  - Which users have lowest rejection rate?
- Then design reputation system based on real patterns

---

#### ❌ Advanced Filters (Sidebar, Sliders, Multi-Select)

**What it would be:**
- Desktop sidebar with:
  - FPS range slider (30-120)
  - TDP range slider (5W-30W)
  - Multi-device selection (checkboxes)
  - Graphics preset checkboxes
- Complex query builder

**Why NOT in MVP:**
- Overengineering for small dataset (hundreds of reports, not thousands)
- Current filters (device pills + sort dropdown) cover 80% use cases
- Adds UI complexity, more code to maintain
- Can't test usefulness without real users

**Alternative in MVP:**
- Device filter (horizontal pills, single selection)
- Sort dropdown (4 options)
- Simple, fast, works

**v2 feature:**
- After analyzing user behavior:
  - Do users need to filter by multiple devices at once?
  - Is TDP range actually useful or do people just sort by "lowest TDP"?
- Add advanced filters based on real demand

---

#### ❌ Steam API Integration (Auto-Fetch Game Metadata)

**What it would be:**
- When game added, fetch from Steam API:
  - Cover image
  - Release date
  - Genre
  - Steam Deck Verified status
- Auto-populate `steam_app_id`

**Why NOT in MVP:**
- Rate limits + lack of stable SLA + edge cases (DLC, delisted games, regional differences)
- Not essential to core value (placeholder covers work fine)
- Adds failure points (Steam API down = can't add games)

**Alternative in MVP:**
- Placeholder covers (gradient + game title) 
- Manual `steam_app_id` entry (optional field)
- "View on Steam" link if app_id exists

**v2 feature:**
- Background job to enrich existing games
- User-friendly but not blocking

---

#### ❌ Downvotes

**What it would be:**
- Users can downvote unhelpful reports
- Net score = upvotes - downvotes
- Sort by net score

**Why NOT in MVP:**
- Encourages negativity / brigading
- Admin verification already filters bad reports
- Upvotes-only is simpler, more positive
- Can't remove bad reports (they're rejected by admin)

**Alternative in MVP:**
- Upvotes only (positive signal)
- Admin rejection (removes truly bad reports)
- Reports with 0 upvotes sink naturally in "most helpful" sort

**v2 consideration:**
- Maybe add "flag as outdated" (for old Proton versions)
- Not downvote, but "this config no longer works"

---

#### ❌ User Avatars / Profile Customization

**What it would be:**
- Upload avatar image
- Bio/description
- Social links (Twitter, YouTube)
- Custom profile banner

**Why NOT in MVP:**
- Not core to performance database
- Image storage/moderation overhead
- Pushes product toward "gamer profiles" instead of "data tool"

**Alternative in MVP:**
- Placeholder avatar (initials or icon)
- Username only
- Profile shows report history (functional, not cosmetic)

**v2 feature:**
- If contributors ask for it
- Or: allow link to external profile (Steam, Reddit)

---

#### ❌ Export Settings as Config File

**What it would be:**
- "Download settings" button on report
- Generates config file for:
  - SteamOS (Proton settings)
  - Windows (game settings INI)
  - Mangohud config
- One-click apply

**Why NOT in MVP:**
- Complex (every game has different config format)
- Many games don't support config import
- Nice-to-have, not essential to decision-making
- Low ROI for effort required

**Alternative in MVP:**
- Report shows settings in readable format
- User copies manually (acceptable friction)

**v2 feature:**
- Start with most-requested games (Elden Ring, Cyberpunk)
- Community can contribute config templates

---

#### ❌ AI Optimization Suggestions

**What it would be:**
- Upload screenshot → AI vision model analyzes
- Suggests: "Lower shadows to Medium for +10 FPS"
- Paid feature ($4.99/mo for unlimited AI suggestions)

**Why NOT in MVP:**
- Expensive (API costs)
- Unreliable (AI hallucinates settings)
- Not core value prop (crowdsourced data is the moat)
- Requires v2 infrastructure (payment processing)

**Alternative in MVP:**
- Community upvotes best configs (human curation)
- Notes field allows users to explain why config works

**v3 consideration:**
- Once you have 10k+ reports, train model on real data
- Then AI suggestions might be valuable

---

#### ❌ Mobile App (Native iOS/Android)

**What it would be:**
- Native apps for iOS/Android
- Push notifications for verified reports
- Offline mode

**Why NOT in MVP:**
- Web-first is sufficient (responsive design)
- No need for push notifications (email works)
- Massive additional development effort (2x platforms)

**Alternative in MVP:**
- Mobile-optimized web app (PWA-ready if needed)
- Works on all devices via browser

**v2+ consideration:**
- Only if web app proves strong retention
- Or: build with React Native (share code with web)

---

#### ❌ Game Search (Functional)

**What it would be:**
- Search bar actually works
- Autocomplete as you type
- Fuzzy matching (typo tolerance)
- Recent searches

**Why NOT in MVP:**
- Adds complexity (search index, debouncing, edge cases)
- Popular games grid covers most use cases
- Direct URLs (`/games/elden-ring`) work for SEO traffic
- Can navigate via homepage grid initially

**Alternative in MVP:**
- Search bar placeholder (visual design element)
- Homepage grid with 8-12 popular games
- Users can bookmark frequently-checked games

**v2 feature (Week 5-6):**
- Add functional search once you have 50+ games with reports
- Straightforward feature to add after MVP proven

---

#### ❌ Report Editing / Delete (After Submission)

**What it would be:**
- User can edit submitted report (change FPS, settings, screenshot)
- User can delete own report
- Edit history / versioning

**Why NOT in MVP:**
- Complicates audit trail (what was on screenshot vs what is now)
- Requires versioning, edit logs, admin re-verification
- Edge cases: what if report already has upvotes?
- Not essential (users can submit new report with updated settings)

**Alternative in MVP:**
- Submit new report if settings changed
- Rejected/pending reports can be resubmitted (as new report)
- No editing after submission = simpler data model

**v2 consideration:**
- Allow edit only for pending reports (before verification)
- Or: "mark as outdated" instead of edit/delete

---

#### ❌ Notifications (Email / On-Site)

**What it would be:**
- Email when report verified/rejected
- On-site notifications (bell icon)
- Digest emails ("Your reports got 10 upvotes this week")
- Notification preferences

**Why NOT in MVP:**
- Requires event system, email templates, deliverability setup
- Easy scope creep (digests, alerts, per-notification preferences)
- Not essential (users check profile manually or come back via SEO)
- Email infrastructure adds complexity (SendGrid, SES, templates)

**Alternative in MVP:**
- No notifications
- User checks `/profile` to see report statuses
- Success screen after submission says "typically verified within 24h"

**v2 feature:**
- Simple email: "Your report for [Game] was verified"
- Optional: weekly digest for contributors

---

### 3.3 Feature Priority Matrix

**Framework:** Impact vs Effort
```
    HIGH   │                      │
   IMPACT  │   QUICK WINS         │    BIG BETS
           │ (Do First)           │ (Do Second)
           │                      │
───────────┼──────────────────────┼─────────────────
           │                      │
    LOW    │   FILL-INS           │   MONEY PITS
   IMPACT  │ (Do Last / Never)    │ (Avoid in MVP)
           │                      │
           │ Low Effort           │   High Effort
```

---

#### ⚡ QUICK WINS (High Impact, Low Effort) - Do First

**Core MVP Features:**
1. **Authentication** - 4h
   - Blocks everything else
   - Supabase makes it easy

2. **Report Upload Form** - 6h
   - Core value creation
   - Standard form + file upload

3. **Game Detail Page + Report Cards** - 8h
   - Core value consumption
   - Straightforward React components

4. **Upvote System** - 3h
   - Social proof (high impact)
   - One API route + toggle button

5. **Homepage** - 4h
   - First impression
   - Hero + grid = simple

6. **SEO Metadata** - 2h
   - Organic traffic (huge ROI)
   - Dynamic meta tags per page

**Total: ~27h** (Week 1-2 of implementation)

---

#### 🎯 BIG BETS (High Impact, High Effort) - Do Second

**Quality & Admin:**
7. **Admin Verification Queue** - 6h
   - Quality gate (essential)
   - More complex: modals, state management, sanity checks

8. **Layout (Header/Footer)** - 4h
   - Navigation baseline
   - Auth integration + responsive

9. **User Profile** - 3h
   - Contributor retention
   - Query all user reports + grouping

10. **Error States & Empty States** - 3h
    - UX polish (prevents confusion)
    - Requires thinking through every edge case

**Total: ~16h** (Week 3 implementation)

---

#### 🔧 FILL-INS (Low Impact, Low Effort) - Do Last / If Time

**Nice-to-haves:**
- Password reset flow - 2h
  - Supabase provides, just wire up UI
  - Low urgency (users can signup again)

- Placeholder Privacy/Terms pages - 1h
  - Legal placeholders
  - Copy from template

- Loading skeletons - 2h
  - Perceived performance
  - Not critical

**Do only if time permits in Week 4**

---

#### 🚫 MONEY PITS (Low Impact / Unknown Impact, High Effort) - Avoid

**Explicitly deferred to v2+:**
- OCR (10h+ dev + testing)
- Comments system (15h+ dev + moderation)
- Advanced filters (8h+ dev + UX complexity)
- Steam API integration (6h+ dev + API quirks)
- Reputation system (10h+ dev + game design)
- AI suggestions (20h+ dev + API costs)
- Mobile apps (100h+ per platform)
- Notifications (8h+ dev + email infrastructure)
- Report editing/delete (6h+ dev + versioning)

**None of these are essential to test core hypothesis:**
> "Do people want verified, device-specific performance data before buying games?"

---

**Estimates do not include RLS policy configuration, security edge cases, or storage integration complexity; assume +30% buffer on all time estimates.**

---

### 3.4 MVP Launch Checklist (What "Done" Looks Like)

**Functional Requirements:**
- [ ] User can sign up, log in, log out
- [ ] User can submit performance report (screenshot + form)
- [ ] Admin can approve/reject reports
- [ ] Public can view verified reports on game pages
- [ ] Public can filter by device, sort by helpful/newest/FPS/TDP
- [ ] Users can upvote reports
- [ ] Users can see their own submission history

**Data Requirements:**
- [ ] 12 devices seeded
- [ ] 50 games seeded (top handheld titles)
- [ ] **Minimum for private beta:** 100-150 verified reports
- [ ] **Target for good launch:** 300-500 verified reports
- [ ] **CQI calculated on Top 50 games in beta** (expand to Top 200 post-launch)

**Quality Requirements:**
- [ ] Mobile responsive (all pages)
- [ ] No console errors in browser
- [ ] Forms validate properly (client + server)
- [ ] Images load (signed URLs work)
- [ ] Auth persists across refreshes
- [ ] Admin panel only accessible to is_admin=true

**Non-Functional:**
- [ ] **Lighthouse score >80 on public pages** (homepage + game detail page)
  - Admin panel and submit form can score lower in MVP
- [ ] Works in Chrome, Safari, Firefox (desktop + mobile)
- [ ] Database backups enabled
- [ ] Environment variables documented
- [ ] README with setup instructions

**When all checked → Private Beta ready**

---

## 4. Product Roadmap

### 4.1 MVP (Month 1-2) - LOCKED

**Status:** Fully specified in sections 3.1-3.3

**Timeline:** 4 weeks implementation + 2 weeks private beta

**Core Features:**
- Authentication (email/password)
- Performance report upload (screenshot + manual form)
- Game detail pages with verified reports
- Device filtering + sorting
- Upvote system
- Admin verification queue
- User profile (submission history)
- Homepage (hero + popular games)

**Launch Criteria:**
- 100-150 verified reports minimum
- 300-500 verified reports target
- CQI 15-25% on Top 50 games
- 12 devices, 50 games seeded
- Private beta: 50-100 invited users

**Success Metrics (Month 2):**
- 300+ verified reports
- 5,000+ MAU
- CQI >15%
- <30 min/day admin time

---

### 4.2 v2 Features (Month 3-6)

**Goal:** Reduce friction, increase engagement, expand coverage

**Timeline:** 3-4 months post-MVP launch

**v2 Success Outcomes (Meta Goals):**
- **CQI +10pp** (e.g., from 20% → 30%) by end of Month 6
- **Reports per covered game (depth):** Median ≥3 for Top 50 games

**Decision Gate:** Only proceed to v2 if MVP hits kill criteria thresholds:
- ✅ ≥300 verified reports
- ✅ ≥5,000 MAU
- ✅ CQI ≥15%

---

#### v2.1 Search & Discovery (Week 5-6, ~12h)

**What:**
- Functional search bar (autocomplete)
- Search by game name (fuzzy matching)
- Recent searches (localStorage)
- Keyboard shortcuts (/ to focus search)

**Why:**
- Users currently navigate via homepage grid only
- 50+ games make grid navigation clunky
- SEO traffic lands on specific pages, but users can't explore

**Success Metric:**
- 30% of sessions use search
- Avg 2+ games viewed per session (up from 1-1.5)

**Priority:** HIGH (foundational for growth beyond 50 games)

---

#### v2.2 Reputation System (Week 7-9, ~18h)

**What:**
- Contributor score based on:
  - # of verified reports
  - Avg upvotes per report
  - Approval rate (verified / total submitted)
- "Trusted Contributor" badge (e.g., 10+ verified reports, 80%+ approval rate)
- Profile shows reputation score + badge
- Leaderboard: top contributors this month

**Why:**
- Incentivizes quality submissions (before we reduce friction with OCR)
- Gives recognition to power users (Persona B motivation)
- Helps users identify reliable sources
- Creates retention loop (gamification)
- **Must come BEFORE OCR** to establish what "good report" looks like

**Success Metric:**
- 20% of contributors earn "Trusted" badge
- Trusted contributors account for 60% of reports (Pareto)
- Avg reports per trusted user: 15+ (vs 2-3 for casual)
- Verified rate improves (higher quality submissions)

**Priority:** HIGH (enables quality at scale)

---

#### v2.3 OCR (Auto-Extract FPS) (Week 10-12, ~16h)

**What:**
- Tesseract.js OR AI vision model
- Auto-read FPS from screenshot overlay
- Pre-fill FPS fields in submission form
- User can override if OCR wrong

**Why:**
- Reduces contributor friction (3-click submit vs 10-field form)
- Increases report quantity (easier = more submissions)
- Enables mobile submissions (easier to upload screenshot from phone)
- **Comes AFTER reputation so we know quality patterns to preserve**

**Implementation:**
- Start with Tesseract.js (free, runs client-side)
- If accuracy <80%, upgrade to vision model

**Success Metric:**
- 50% of submissions use OCR (others prefer manual)
- OCR accuracy >85% (verified via admin review)
- Time to submit reduces from ~5min to ~2min
- Verification rate stays ≥65% (quality maintained)

**Priority:** MEDIUM (nice-to-have, not critical)

---

#### v2.4 Advanced Filters (Week 13-14, ~10h)

**What:**
- Desktop sidebar with:
  - FPS range slider (30-120+)
  - TDP range slider (5W-30W)
  - Multi-device selection (checkboxes)
  - Graphics preset filters
- Mobile: bottom sheet modal

**Why:**
- Power users want granular control
- "Show me 60+ FPS configs under 15W TDP" use case
- Enables comparative research (not just single device)

**Data-Driven Decision:**
- Only implement if analytics show:
  - Users frequently change device filter (indicates cross-device comparison)
  - High bounce rate on game pages (can't find what they need)

**Success Metric:**
- 10-15% of users engage with advanced filters
- Avg session duration increases 20% (deeper exploration)

**Priority:** LOW (wait for user demand signals)

---

#### v2.5 Steam API Integration (Week 15-16, ~12h)

**What:**
- Background job: enrich existing games
- Fetch from Steam API:
  - Cover image (replace placeholder)
  - Release date
  - Genre tags
  - Steam Deck Verified status
- Display on game page header

**Why:**
- Better aesthetics (real covers vs gradients)
- Additional context for buyers ("This is a shooter, verified by Valve")
- SEO (richer content = better ranking)

**Implementation:**
- Batch process (not real-time during game submission)
- Runs nightly for new games
- Graceful fallback if API fails (keep placeholder)

**Success Metric:**
- 80% of games have real cover images
- No user-facing errors from API failures
- Minimal impact on page load time

**Priority:** LOW (cosmetic improvement)

---

#### v2.6 Functional Improvements (Ongoing)

**Small quality-of-life features (1-3h each):**

- Password reset flow (Supabase built-in, just wire UI)
- Email notifications:
  - "Your report was verified" (simple transactional email)
  - Optional: weekly digest for contributors
- Report flagging:
  - "Mark as outdated" button (for old Proton versions)
  - Admin review flagged reports
- Profile enhancements:
  - Total upvotes received
  - "Member since" date
  - Favorite device (auto-detect from submissions)
- Export settings:
  - Copy-paste friendly format
  - Start with 1-2 popular games (Elden Ring, Cyberpunk)

**Priority:** Fill-ins (do when time permits)

---

### 4.3 v3 Vision (Month 6+)

**Goal:** Expand beyond MVP scope, explore monetization, scale community

**Timeline:** 6-12 months post-launch

**Prerequisites:**
- ✅ CQI 30-40% achieved
- ✅ 200+ active contributors
- ✅ 20k+ MAU sustained for 2+ months

---

#### v3.1 Premium Tier ($4.99/mo)

**What:**
- **Free tier (always free):**
  - Unlimited viewing
  - **Unlimited report submissions**
  - Standard verification queue (~24h)
  - Basic filters
  
- **Pro tier ($4.99/mo):**
  - **Priority verification (<12h vs ~24h)**
  - Advanced filters + saved filter presets
  - Export settings (downloadable configs)
  - No ads (if we introduce them on free tier)
  - Early access to new features (AI suggestions, etc.)

**Why:**
- Monetize power users who value speed + tools
- **Does NOT limit supply** (free users can submit unlimited)
- Sustainable revenue vs pure ad model
- Fund infrastructure as DB grows

**Key Decision:**
- **Monetize speed/convenience, NOT data contribution**
- This preserves community growth and CQI trajectory

**Pricing Research:**
- Survey top 50 contributors: "Would you pay $5/mo for priority review + advanced tools?"
- A/B test: show upgrade modal after 5+ submissions

**Success Metric:**
- 5-10% of contributors convert to Pro
- $500-1500 MRR (100-300 Pro subscribers)
- Churn <5%/month
- **Free-tier submissions stay ≥80% of total** (supply not choked)

---

#### v3.2 AI-Assisted Optimization (Pro Feature)

**What:**
- **AI-assisted optimization (vision model)**
- User uploads screenshot → AI analyzes settings
- Suggests optimizations: "Lower shadows to Medium for +8-12 FPS"
- Shows trade-off: "Estimated battery: +30 minutes"
- **CRITICAL:** Always shows confidence + links to similar reports as source
  - "Based on 37 similar configs showing 10-15 FPS gain"

**Why:**
- Differentiated premium feature
- Reduces trial-and-error for casual users
- Leverages 10k+ reports as training context
- **Data-backed suggestions maintain trust** (not "magic AI")

**Safeguards:**
- Confidence score visible (Low/Medium/High)
- Links to actual reports that informed suggestion
- "This is based on community data, not guaranteed" disclaimer
- Manual review of suggestions for popular games

**Implementation:**
- Requires v2 data (thousands of reports to inform suggestions)
- API costs: ~$0.01 per analysis (acceptable at $5/mo tier)

**Success Metric:**
- 40% of Pro users try AI suggestions
- User satisfaction >4/5 stars
- API costs <20% of Pro revenue
- **Trust maintained:** <5% of suggestions flagged as "unhelpful"

**Priority:** MEDIUM (v3 differentiator, but requires data density first)

---

#### v3.3 Mobile Apps (Native iOS/Android)

**What:**
- React Native app (shared codebase with web)
- Push notifications: "Your report was verified"
- Offline mode: view previously loaded reports
- Camera integration: snap screenshot directly in-app

**Why:**
- Handheld gamers are mobile-first
- Push notifications increase retention
- App Store presence = discovery channel

**Decision Gate:**
- Only build if web retention is strong (40%+ 7-day retention)
- Budget: $10-15k (contractor) OR 2-3 months solo dev

**Success Metric:**
- 20% of MAU use mobile app
- Mobile users have 2x retention vs web-only

---

#### v3.4 Community Features (Controlled)

**What:**
- Comments on reports (restricted to Pro OR high-reputation users)
- Q&A section per game: "How do I enable FSR?" → community answers
- User-to-user DMs (only for verified contributors)

**Why:**
- Deepen engagement
- Leverage community expertise
- Network effects (users help each other)

**Safeguards:**
- Heavy moderation (auto-flag certain keywords)
- Restrict to trusted users only (prevents spam)
- Can disable feature if becomes toxic

**Success Metric:**
- <5% of content requires moderation action
- Comments have 3+ upvotes avg (quality signal)
- No increase in support requests (community self-serves)

---

#### v3.5 Partnerships & Integrations

**Potential Opportunities:**

**A) Hardware Partnerships:**
- ASUS (ROG Ally), Lenovo (Legion Go), Valve (Steam Deck)
- Branded sections: "Optimized for ROG Ally"
- Co-marketing: "As seen on HandheldLab" badges
- Revenue: sponsorship ($5-10k/year per brand)

**B) Game Publishers:**
- Partner with indie devs: "Optimize your game for handhelds"
- Provide aggregated performance data
- Revenue: consulting ($500-2k per game analysis)

**C) Content Creators:**
- API access for YouTubers/streamers
- Embed performance data in videos
- Affiliate program: earn commission on sign-ups

**D) Affiliate Revenue:**
- Steam game links → affiliate commission (if Valve allows)
- Hardware links → Amazon Associates (ROG Ally, accessories)
- Estimated: $500-1500/mo passive income

---

### 4.4 Roadmap Summary Table

| Phase | Timeline | Key Features | Success Criteria | Estimated Effort |
|-------|----------|--------------|------------------|------------------|
| **MVP** | Month 1-2 | Auth, Upload, Display, Admin, Upvote | 300+ reports, 5k MAU, CQI 15% | 43h dev + 2w beta |
| **v2.1** | Month 3 | Search, Discovery | 30% use search | 12h |
| **v2.2** | Month 3-4 | **Reputation System** | 20% earn Trusted badge | 18h |
| **v2.3** | Month 4-5 | **OCR Auto-Extract** | 50% use OCR, 85% accuracy | 16h |
| **v2.4** | Month 5 | Advanced Filters | 10-15% engagement | 10h (conditional) |
| **v2.5** | Month 5-6 | Steam API Integration | 80% have covers | 12h |
| **v2 Meta** | Month 6 | — | **CQI +10pp, Median 3+ reports/game** | — |
| **v3.1** | Month 6+ | Premium Tier | 5-10% convert, $500+ MRR | 20h + payment setup |
| **v3.2** | Month 7+ | AI Optimization | 40% Pro users try | 24h + API costs |
| **v3.3** | Month 9+ | Mobile Apps | 20% use mobile | 200h OR $10-15k |
| **v3.4** | Month 12+ | Community Features | <5% moderation rate | 30h + ongoing moderation |
| **v3.5** | Ongoing | Partnerships | $5-10k/year revenue | Variable |

---

### 4.5 Decision Framework (When to Build What)

**Before building ANY v2/v3 feature, ask:**

1. **Does MVP data support this?**
   - Analytics show users need it?
   - Survey/feedback explicitly requests it?

2. **Does it serve North Star (CQI)?**
   - Increases coverage (more reports)?
   - Improves quality (better decisions)?
   - If no → deprioritize

3. **Can we test cheaply first?**
   - Manual process before automation?
   - Landing page before full build?
   - Survey before development?

4. **What's the ROI?**
   - Dev time vs expected impact
   - Revenue potential vs costs
   - User retention improvement

**Default answer: NO (until proven otherwise)**

---

## End of Document

**Status:** 02-PRODUCT-REQUIREMENTS.md COMPLETE ✅

**Next Steps:**
- Proceed to `03-TECHNICAL-ARCHITECTURE.md` for database schema, API design, and infrastructure
- Then `06-IMPLEMENTATION-PLAN.md` for phase-by-phase task breakdown