# HandheldLab - Technical Architecture Document

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Status:** Complete - LOCKED ✅

---

## Table of Contents

1. [Tech Stack Overview](#1-tech-stack-overview)
2. [Database Schema](#2-database-schema)
3. [API Design](#3-api-design)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [File Storage](#5-file-storage)
6. [Security Considerations](#6-security-considerations)
7. [Performance & Scalability (MVP Guardrails)](#7-performance--scalability-mvp-guardrails)

---

## 1. Tech Stack Overview

### 1.1 Core Stack

#### Frontend: Next.js 14 (App Router)

**Why:**
- **SSR for SEO:** Game pages crawlable by Google (critical for organic traffic)
- **Server Components:** Reduce client bundle, faster initial load
- **File-based routing:** Simple, predictable URL structure
- **Vercel deployment:** Zero-config production deploy
- **TypeScript native:** Type safety across stack

**Alternatives considered:**
- ❌ SvelteKit: Smaller ecosystem, fewer Supabase examples
- ❌ Remix: Requires BaaS adapter complexity
- ❌ Create React App: No SSR, SEO dead

---

#### Database: Supabase (PostgreSQL)

**Why:**
- **PostgreSQL:** Industry standard, proven at scale
- **Built-in Auth:** Email/password works out of box
- **Row Level Security (RLS):** Database-level authorization (prevents accidental privilege escalation)
- **Realtime (optional v2):** WebSocket support if needed
- **Storage integrated:** Same platform for DB + files
- **Free tier:** Generous (500MB DB, 1GB storage, 2GB bandwidth)
- **Backups:** Automatic daily backups

**Alternatives considered:**
- ❌ Firebase: NoSQL = harder to query (need joins for reports by game+device)
- ❌ PlanetScale: MySQL, no built-in storage/auth
- ❌ Self-hosted PostgreSQL: More control but ops overhead (backups, scaling, monitoring)

---

#### Storage: Supabase Storage

**Why:**
- **Private buckets:** Screenshots not public by default
- **Signed URLs:** Temporary access (1h expiry), secure
- **User folder isolation:** Each user uploads to own folder
- **Image optimization (future):** Can add Sharp transformations
- **Same platform as DB:** Fewer moving parts

**Signed URL Caching (MVP Guardrail):**
- Signed URL TTL: 1 hour
- UI caches signed URLs in memory per report for session duration
- Reduces regeneration overhead on game page grids

**Alternatives considered:**
- ❌ Cloudinary: Expensive for high-volume images ($89/mo for 25k transformations)
- ❌ AWS S3: Requires separate setup, IAM complexity
- ❌ Vercel Blob: Locked to Vercel, expensive ($0.15/GB)

---

#### Authentication: Supabase Auth

**Why:**
- **Email/password:** Standard, no OAuth complexity
- **Email verification:** Built-in
- **Session management:** JWT tokens, handled automatically
- **Password reset:** Built-in flow
- **@supabase/ssr pattern:** Works with Next.js App Router

**Alternatives considered:**
- ❌ NextAuth.js: More flexible but requires DB adapter setup
- ❌ Auth0: Overkill for MVP, expensive ($25/mo for 1000 MAU)
- ❌ Clerk: Great UX but $25/mo minimum

---

#### Styling: Tailwind CSS

**Why:**
- **Utility-first:** Fast iteration, no CSS file management
- **Mobile-first:** Responsive by default
- **No runtime:** CSS generated at build time (fast)
- **Design system:** Consistent spacing/colors via config

**Alternatives considered:**
- ❌ Styled Components: Runtime cost, harder to optimize
- ❌ CSS Modules: More boilerplate
- ❌ Plain CSS: Scaling issues (naming, specificity)

---

#### UI Components: Radix UI + Headless

**Why:**
- **Accessible:** ARIA compliant out of box
- **Unstyled:** Full control over design
- **Composable:** Build complex components (modals, dropdowns)
- **Small bundle:** Tree-shakeable

**Components used:**
- `@radix-ui/react-dialog` - Modals (login, signup, screenshot view)
- `@radix-ui/react-dropdown-menu` - User dropdown in header
- `@radix-ui/react-select` - Form selects (device, TDP, etc.)

**Alternatives considered:**
- ❌ shadcn/ui: Faster scaffolding, but we keep stricter design control by composing Radix directly
- ❌ Material UI: Heavy bundle, design lock-in
- ❌ Chakra UI: Runtime styling cost

---

#### Deployment: Vercel

**Why:**
- **Zero config:** Push to GitHub = auto-deploy
- **Preview deployments:** Test PRs before merge
- **Free tier:** Sufficient for MVP (100GB bandwidth)
- **Next.js optimized:** Made by same team

**Runtime Note:**
- **API Routes (Route Handlers):** Default to Node.js runtime
- **Some routes run on Node.js runtime** (required for Sharp image processing)
- Edge Functions optional (not needed for MVP)

**Alternatives considered:**
- ❌ Netlify: Similar but worse Next.js support
- ❌ Railway: Good but requires more config
- ❌ Self-hosted VPS: Ops overhead

---

#### Image Processing: Sharp (server-side)

**Why:**
- **Fast:** Native C++ bindings
- **Optimize uploads:** Resize, compress before storage
- **Thumbnails (v2):** Generate smaller versions for grid view
- **No external service:** Runs in API routes

**Runtime Constraint:**
- **Runs in Node.js runtime route handler, not Edge**
- **Used on upload path only** (thumbnails optional later)

**Usage:**
- Validate image dimensions
- Compress to JPEG 85% quality
- Strip metadata (privacy)

**Alternatives considered:**
- ❌ Browser-side compression: Unreliable (user can bypass)
- ❌ Cloudinary: External dependency, costs

---

### 1.2 Supporting Libraries

**Forms & Validation:**
- `react-hook-form` - Form state management (upload form)
- `zod` - Schema validation (type-safe, composable)

**Date/Time:**
- `date-fns` - Lightweight date utilities (relative timestamps)

**Icons:**
- `lucide-react` - Icon library (heart, search, user, etc.)

**Utilities:**
- `clsx` + `tailwind-merge` - ClassName management (cn() helper)

**Analytics & Monitoring:**
- **Analytics:** Plausible / PostHog / Google Analytics 4 (decision deferred to implementation)
  - Track: MAU, session duration, search usage, device filter engagement
  - Required for Success Metrics validation
- **Error Monitoring:** Sentry (optional, consider if error rates spike)
  - Track: upload failures, signed URL errors, API route failures

---

### 1.3 Development Tools

**TypeScript:** Type safety across frontend/backend
**ESLint + Prettier:** Code quality + formatting
**Git + GitHub:** Version control + CI/CD (via Vercel)

---

### 1.4 Stack Diagram (Visual)
```
┌─────────────────────────────────────────┐
│  User (Browser)                         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Next.js 14 App Router (Vercel)         │
│  ├── Server Components (SSR)            │
│  ├── Client Components (islands)        │
│  ├── API Routes (Node.js runtime)       │
│  └── Middleware (auth check)            │
└──────┬──────────────────────┬───────────┘
       │                      │
       ▼                      ▼
┌──────────────┐    ┌──────────────────┐
│  Supabase    │    │  Supabase        │
│  PostgreSQL  │    │  Storage         │
│  ├── Tables  │    │  └── Private     │
│  ├── RLS     │    │      Bucket      │
│  └── Auth    │    │      (screenshots)│
└──────────────┘    └──────────────────┘
```

---

### 1.5 Critical Dependencies

**Core dependencies** (example versions, check for latest at implementation):
```
next (^14.x)
react (^18.x)
@supabase/supabase-js (^2.x)
@supabase/ssr (^0.1.x)
tailwindcss (^3.x)
@radix-ui/react-dialog
@radix-ui/react-dropdown-menu
@radix-ui/react-select
lucide-react
react-hook-form
zod
date-fns
sharp
clsx
tailwind-merge
typescript (^5.x)
```

**Note:** Exact versions specified in `package.json` at implementation time. This list ensures architectural compatibility.

---

### 1.6 Environment Variables
```bash
# Supabase (from dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... # server-side only, NEVER expose to client

# App
NEXT_PUBLIC_APP_URL=https://handheldlab.com # for email links
```

**Security Notes:**
- `NEXT_PUBLIC_*` = exposed to browser (safe for anon key)
- `SUPABASE_SERVICE_ROLE_KEY` = bypasses RLS entirely
  - **Service role only in server routes for admin actions that still verify `is_admin` explicitly**
  - **Prefer: use user session + RLS whenever possible** (service role is last resort)
  - Example valid use: admin bulk operations, scheduled jobs
  - Example WRONG use: regular API routes (use user session instead)

---

## 2. Database Schema

### 2.1 Tables (Complete Schema)

#### Table: `profiles`

**Purpose:** User account metadata (extends Supabase Auth)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$')
);

-- Indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;
```

**Columns:**
- `id` (UUID, PK): References `auth.users.id` (Supabase Auth table)
- `username` (TEXT, UNIQUE, NOT NULL): Public display name, 3-20 chars, alphanumeric + hyphens/underscores
- `avatar_url` (TEXT, NULLABLE): Future feature, placeholder in MVP
- `is_admin` (BOOLEAN, NOT NULL, DEFAULT false): Admin flag for verification queue access
- `created_at` (TIMESTAMPTZ, NOT NULL): Account creation timestamp
- `updated_at` (TIMESTAMPTZ, NOT NULL): Last profile update

**Constraints:**
- `username_length`: 3-20 characters
- `username_format`: Only letters, numbers, hyphens, underscores
- FK to `auth.users`: Cascade delete (if user deleted in Auth, profile deleted)

**Indexes:**
- `idx_profiles_username`: Fast username lookups (login, profile pages)
- `idx_profiles_is_admin`: Partial index for admin checks (small subset)

---

#### Table: `devices`

**Purpose:** Curated list of handheld gaming devices
```sql
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  manufacturer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'handheld_pc',
  cpu TEXT,
  gpu TEXT,
  ram_gb INTEGER,
  native_resolution TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT category_valid CHECK (category IN ('handheld_pc', 'console', 'other'))
);

-- Indexes
CREATE INDEX idx_devices_slug ON devices(slug);
CREATE INDEX idx_devices_is_active ON devices(is_active) WHERE is_active = true;
CREATE INDEX idx_devices_sort_order ON devices(sort_order);
```

**Note:** Slugs generated server-side, lowercase enforced by constraint.

---

#### Table: `games`

**Purpose:** Game catalog (hybrid: curated seed + user-submitted pending)
```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  steam_app_id INTEGER UNIQUE,
  cover_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT status_valid CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Indexes
CREATE INDEX idx_games_slug ON games(slug);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_steam_app_id ON games(steam_app_id) WHERE steam_app_id IS NOT NULL;
CREATE INDEX idx_games_submitted_by ON games(submitted_by);
```

**Note:** Slugs generated server-side from game name, case-insensitive uniqueness enforced.

---

#### Table: `performance_reports`

**Purpose:** Core data - user-submitted performance configurations
```sql
CREATE TABLE performance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  screenshot_storage_path TEXT NOT NULL,
  
  fps_average INTEGER NOT NULL,
  fps_min INTEGER,
  fps_max INTEGER,
  
  tdp_watts INTEGER NOT NULL,
  resolution TEXT NOT NULL,
  graphics_preset TEXT NOT NULL,
  
  proton_version TEXT,
  additional_notes TEXT,
  
  verification_status TEXT NOT NULL DEFAULT 'pending',
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  
  upvotes INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT fps_average_range CHECK (fps_average >= 1 AND fps_average <= 999),
  CONSTRAINT fps_min_range CHECK (fps_min IS NULL OR (fps_min >= 1 AND fps_min <= 999)),
  CONSTRAINT fps_max_range CHECK (fps_max IS NULL OR (fps_max >= 1 AND fps_max <= 999)),
  CONSTRAINT fps_logical CHECK (
    (fps_min IS NULL AND fps_max IS NULL) OR
    (fps_min IS NULL AND fps_max >= fps_average) OR
    (fps_max IS NULL AND fps_min <= fps_average) OR
    (fps_min <= fps_average AND fps_average <= fps_max)
  ),
  CONSTRAINT tdp_range CHECK (tdp_watts >= 5 AND tdp_watts <= 30),
  CONSTRAINT resolution_valid CHECK (resolution IN ('native', '1080p', '900p', '800p', '720p', '540p')),
  CONSTRAINT graphics_preset_valid CHECK (graphics_preset IN ('low', 'medium', 'high', 'ultra', 'custom')),
  CONSTRAINT status_valid CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  CONSTRAINT notes_length CHECK (additional_notes IS NULL OR char_length(additional_notes) <= 500),
  CONSTRAINT moderated_fields CHECK (
    (verification_status IN ('verified', 'rejected') AND moderated_at IS NOT NULL AND moderated_by IS NOT NULL) OR
    (verification_status = 'pending' AND moderated_at IS NULL AND moderated_by IS NULL)
  ),
  CONSTRAINT rejected_has_reason CHECK (
    (verification_status = 'rejected' AND rejection_reason IS NOT NULL) OR
    (verification_status != 'rejected')
  ),
  CONSTRAINT upvotes_non_negative CHECK (upvotes >= 0)
);

-- Primary Indexes
CREATE INDEX idx_reports_game_device ON performance_reports(game_id, device_id);
CREATE INDEX idx_reports_user ON performance_reports(user_id);
CREATE INDEX idx_reports_status ON performance_reports(verification_status);

-- Composite Indexes for Game Page Sorting (Critical for UX)
CREATE INDEX idx_reports_game_upvotes ON performance_reports(game_id, upvotes DESC) 
  WHERE verification_status = 'verified';
CREATE INDEX idx_reports_game_device_upvotes ON performance_reports(game_id, device_id, upvotes DESC) 
  WHERE verification_status = 'verified';
CREATE INDEX idx_reports_game_created ON performance_reports(game_id, created_at DESC) 
  WHERE verification_status = 'verified';
CREATE INDEX idx_reports_game_device_created ON performance_reports(game_id, device_id, created_at DESC) 
  WHERE verification_status = 'verified';
CREATE INDEX idx_reports_game_fps ON performance_reports(game_id, fps_average DESC) 
  WHERE verification_status = 'verified';
CREATE INDEX idx_reports_game_device_fps ON performance_reports(game_id, device_id, fps_average DESC) 
  WHERE verification_status = 'verified';
CREATE INDEX idx_reports_game_tdp ON performance_reports(game_id, tdp_watts ASC) 
  WHERE verification_status = 'verified';
CREATE INDEX idx_reports_game_device_tdp ON performance_reports(game_id, device_id, tdp_watts ASC) 
  WHERE verification_status = 'verified';
```

**Note:**
- `screenshot_storage_path` stores path only - signed URLs generated on-demand in API/server components, NOT stored in DB
- `upvotes` counter maintained by trigger (see 2.4)
- `view_count` incremented atomically: `UPDATE ... SET view_count = view_count + 1`

---

#### Table: `performance_votes`

**Purpose:** Upvote tracking (one vote per user per report)
```sql
CREATE TABLE performance_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES performance_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(report_id, user_id)
);

-- Indexes
CREATE INDEX idx_votes_report ON performance_votes(report_id);
CREATE INDEX idx_votes_user ON performance_votes(user_id);
```

**Note:** Upvote counter in `performance_reports.upvotes` maintained by trigger (see 2.4).

---

### 2.2 Relationships & ER Diagram
```
┌─────────────────┐
│   auth.users    │ (Supabase managed)
└────────┬────────┘
         │
         │ 1:1 (CASCADE)
         ▼
┌─────────────────┐
│    profiles     │
│─────────────────│
│ id (PK, FK)     │◄─────────────────────┐
│ username        │                      │
│ is_admin        │                      │ M:1
└────────┬────────┘                      │
         │                               │
         │ M:1 (CASCADE)          ┌──────┴────────┐
         │                        │ performance_  │
         ▼                        │   reports     │
┌─────────────────┐               │───────────────│
│     games       │               │ id (PK)       │
│─────────────────│               │ game_id (FK)  │───┐
│ id (PK)         │◄──────────────│ device_id (FK)│   │
│ name            │    M:1        │ user_id (FK)  │   │
│ slug            │    (CASCADE)  │ screenshot_*  │   │
│ status          │               │ fps_*         │   │
└─────────────────┘               │ tdp_watts     │   │
                                  │ ...           │   │
                                  │ upvotes       │   │ 1:M
┌─────────────────┐               └───────┬───────┘   │ (CASCADE)
│    devices      │                       │           │
│─────────────────│                       │           │
│ id (PK)         │                       │ M:1       ▼
│ name            │───────────────────────┘    ┌──────────────┐
│ slug            │    M:1                     │ performance_ │
│ manufacturer    │    (RESTRICT)              │   votes      │
└─────────────────┘                            │──────────────│
                                               │ id (PK)      │
                                               │ report_id(FK)│
                                               │ user_id (FK) │
                                               └──────────────┘
```

**Foreign Key Behaviors:**
- `profiles.id → auth.users.id`: CASCADE (user deleted = profile deleted)
- `performance_reports.user_id → profiles.id`: CASCADE (user deleted = reports deleted)
- `performance_reports.game_id → games.id`: CASCADE (game deleted = reports deleted)
- `performance_reports.device_id → devices.id`: RESTRICT (can't delete device with reports)
- `performance_votes.report_id → performance_reports.id`: CASCADE (report deleted = votes deleted)
- `performance_votes.user_id → profiles.id`: CASCADE (user deleted = votes deleted)

---

### 2.3 Row Level Security (RLS) Policies

#### 2.3.1 RLS Overview

**Philosophy:**
- **Defense in depth:** RLS enforces authorization at database level
- **Cannot be bypassed** by buggy API code (unless using service role key)
- **Policies match user roles:** Anonymous, Authenticated, Admin
- **Explicit over implicit:** Policies clearly state what's allowed
- **Privacy-first:** Limit data exposure to minimum necessary

**Important:**
- Service role key bypasses ALL RLS (use sparingly, only in admin routes with explicit `is_admin` checks)
- User session automatically available in policies via `auth.uid()`
- **SELECT policies are additive (OR-ed)** - authenticated users get both public and authenticated policies

---

#### Table: `profiles`
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Blocked for public (prevents user enumeration)
-- Public access via public_profiles view instead

-- UPDATE: Users can only update their own profile
CREATE POLICY "profiles_update_own" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

**Public Profiles View (Privacy-Safe):**
```sql
CREATE VIEW public_profiles AS
SELECT 
  id,
  username
FROM profiles;

GRANT SELECT ON public_profiles TO anon, authenticated;
```

**Rationale:**
- Direct table access blocked for anonymous users
- View exposes only necessary fields for report attribution
- UPDATE own: Users can modify profile, but NOT is_admin

---

#### Table: `devices`
```sql
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "devices_select_active" 
ON devices FOR SELECT 
TO public 
USING (is_active = true);
```

---

#### Table: `games`
```sql
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- SELECT: Public sees only approved games
CREATE POLICY "games_select_approved" 
ON games FOR SELECT 
TO public 
USING (status = 'approved');

-- SELECT: Authenticated users ALSO see their own pending/rejected
CREATE POLICY "games_select_own" 
ON games FOR SELECT 
TO authenticated 
USING (submitted_by = auth.uid() AND status IN ('pending', 'rejected'));

-- INSERT: Authenticated users can submit games
CREATE POLICY "games_insert_authenticated" 
ON games FOR INSERT 
TO authenticated 
WITH CHECK (
  submitted_by = auth.uid() AND 
  status = 'pending'
);
```

**Note:** SELECT policies are additive (OR). Authenticated users get both approved games + own submissions.

---

#### Table: `performance_reports`
```sql
ALTER TABLE performance_reports ENABLE ROW LEVEL SECURITY;

-- SELECT: Public sees only verified reports
CREATE POLICY "reports_select_verified" 
ON performance_reports FOR SELECT 
TO public 
USING (verification_status = 'verified');

-- SELECT: Authenticated users ALSO see their own (any status)
CREATE POLICY "reports_select_own" 
ON performance_reports FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- INSERT: Authenticated users can submit reports
CREATE POLICY "reports_insert_authenticated" 
ON performance_reports FOR INSERT 
TO authenticated 
WITH CHECK (
  user_id = auth.uid() AND 
  verification_status = 'pending'
);
```

---

#### Table: `performance_votes`
```sql
ALTER TABLE performance_votes ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can see ONLY their own votes
CREATE POLICY "votes_select_own" 
ON performance_votes FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- INSERT: Users can vote
CREATE POLICY "votes_insert_own" 
ON performance_votes FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- DELETE: Users can remove their own votes
CREATE POLICY "votes_delete_own" 
ON performance_votes FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());
```

**Rationale:**
- SELECT own only: Prevents user behavior tracking, scales better
- Query pattern: `SELECT * FROM performance_votes WHERE user_id = auth.uid() AND report_id IN (...)`

---

#### Admin Operations (Service Role Pattern)

**Critical Security Rules:**
```typescript
// ✅ CORRECT Pattern:
const supabaseUser = createClient(); // User's session
const { data: { user } } = await supabaseUser.auth.getUser();

if (!user) return unauthorized();

// Check admin via RPC (minimizes table exposure)
const { data: isAdmin } = await supabaseUser.rpc('is_user_admin');

if (!isAdmin) return forbidden();

// ONLY AFTER verification, use service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

**SQL Function:**
```sql
CREATE OR REPLACE FUNCTION is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 2.4 Triggers & Functions

#### Auto-Create Profile on Signup
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
BEGIN
  v_username := NEW.raw_user_meta_data->>'username';
  
  IF v_username IS NULL THEN
    RAISE EXCEPTION 'username_required: raw_user_meta_data must contain username';
  END IF;
  
  INSERT INTO public.profiles (id, username, avatar_url, is_admin)
  VALUES (
    NEW.id,
    v_username,
    NULL,
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

#### Maintain Upvote Counter
```sql
CREATE OR REPLACE FUNCTION public.increment_report_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE performance_reports
  SET upvotes = upvotes + 1
  WHERE id = NEW.report_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_report_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE performance_reports
  SET upvotes = GREATEST(upvotes - 1, 0)
  WHERE id = OLD.report_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_created
  AFTER INSERT ON performance_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_report_upvotes();

CREATE TRIGGER on_vote_deleted
  AFTER DELETE ON performance_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_report_upvotes();
```

---

#### Auto-Update Timestamps
```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER games_set_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER reports_set_updated_at
  BEFORE UPDATE ON performance_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

---

#### Admin Approve Report (Atomic Transaction)
```sql
CREATE OR REPLACE FUNCTION admin_approve_report(
  p_report_id UUID,
  p_admin_id UUID
)
RETURNS TABLE (
  report_id UUID,
  game_approved BOOLEAN
) AS $$
DECLARE
  v_game_id UUID;
  v_game_status TEXT;
  v_game_approved BOOLEAN := false;
BEGIN
  UPDATE performance_reports
  SET 
    verification_status = 'verified',
    moderated_at = now(),
    moderated_by = p_admin_id
  WHERE id = p_report_id
  RETURNING game_id INTO v_game_id;
  
  SELECT status INTO v_game_status
  FROM games
  WHERE id = v_game_id;
  
  IF v_game_status = 'pending' THEN
    UPDATE games
    SET status = 'approved'
    WHERE id = v_game_id;
    v_game_approved := true;
  END IF;
  
  RETURN QUERY SELECT p_report_id, v_game_approved;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 3. API Design

### 3.1 API Routes (Complete List)

#### Authentication Routes (Supabase Auth)

**Not custom API routes - built into Supabase:**
- `POST /auth/v1/signup`
- `POST /auth/v1/token?grant_type=password`
- `POST /auth/v1/logout`
- `POST /auth/v1/recover`
- `GET /auth/v1/verify`

**Custom callback:**
- `GET /auth/callback` - Email confirmation redirect

---

#### Public Queries (Server Components)

**Not API routes - direct Supabase queries:**
- `getGameBySlug(slug)` - Fetch game metadata
- `getReportsForGame(gameId, filters, sort, offset)` - Fetch reports
- `getUserVotesForReports(userId, reportIds)` - Fetch vote state map
- `getPopularGames(limit)` - Homepage grid
- `getUserReports(userId)` - Profile page

---

#### Client-Side API Routes

##### POST /api/reports

**Auth:** Required  
**Content-Type:** `multipart/form-data`

**Request (FormData):**
```typescript
{
  screenshot: File; // Max 5MB, jpeg/png
  gameId: string;
  deviceId: string;
  fpsAverage: string; // "60"
  fpsMin?: string;
  fpsMax?: string;
  tdpWatts: string; // "15"
  resolution: string;
  graphicsPreset: string;
  protonVersion?: string;
  additionalNotes?: string;
}
```

**Response (201):**
```typescript
{
  reportId: string;
  status: 'pending';
  message: string;
}
```

**Errors:** 400, 413, 415

---

##### POST /api/games

**Auth:** Required

**Request:**
```typescript
{
  name: string; // Trimmed, spaces collapsed
  steamAppId?: number;
}
```

**Response (201):**
```typescript
{
  gameId: string;
  slug: string;
  status: 'pending';
}
```

**Response (409 - Conflict):**
```typescript
{
  error: 'Game already exists';
  code: 'CONFLICT';
  conflictType: 'slug' | 'steam_app_id';
  existingGameId: string;
  existingGameSlug: string;
}
```

---

##### POST /api/reports/[id]/vote (Idempotent)

**Auth:** Required

**Response (200/201):**
```typescript
{
  upvoted: true;
  newUpvoteCount: number;
  created: boolean; // true if new, false if already existed
}
```

---

##### DELETE /api/reports/[id]/vote (Idempotent)

**Auth:** Required

**Response (200):**
```typescript
{
  upvoted: false;
  newUpvoteCount: number;
  deleted: boolean;
}
```

---

##### POST /api/admin/reports/[id]/approve

**Auth:** Admin only

**Response (200):**
```typescript
{
  reportId: string;
  status: 'verified';
  moderatedAt: string;
  moderatedBy: string;
  gameApproved?: boolean;
}
```

**Uses SQL function `admin_approve_report()` for atomic transaction.**

---

##### POST /api/admin/reports/[id]/reject

**Auth:** Admin only

**Request:**
```typescript
{
  reason: 'invalid_screenshot' | 'unrealistic_data' | 'duplicate' | 'other';
  customReason?: string; // Required if reason='other'
}
```

**Response (200):**
```typescript
{
  reportId: string;
  status: 'rejected';
  rejectionReason: string;
  moderatedAt: string;
  moderatedBy: string;
}
```

---

### 3.2 Request/Response Schemas (Zod)
```typescript
// src/lib/validations/report.ts
import { z } from 'zod';

export const createReportSchema = z.object({
  gameId: z.string().uuid(),
  deviceId: z.string().uuid(),
  fpsAverage: z.number().int().min(1).max(999),
  fpsMin: z.number().int().min(1).max(999).optional(),
  fpsMax: z.number().int().min(1).max(999).optional(),
  tdpWatts: z.number().int().min(5).max(30),
  resolution: z.enum(['native', '1080p', '900p', '800p', '720p', '540p']),
  graphicsPreset: z.enum(['low', 'medium', 'high', 'ultra', 'custom']),
  protonVersion: z.string().max(50).optional(),
  additionalNotes: z.string().max(500).optional(),
}).refine(
  (data) => {
    if (data.fpsMin && data.fpsMax) {
      return data.fpsMin <= data.fpsAverage && data.fpsAverage <= data.fpsMax;
    }
    if (data.fpsMin) return data.fpsMin <= data.fpsAverage;
    if (data.fpsMax) return data.fpsAverage <= data.fpsMax;
    return true;
  },
  { message: 'FPS values must follow: min ≤ average ≤ max' }
);

export const createGameSchema = z.object({
  name: z.string().min(1).max(100).transform(val => 
    val.trim().replace(/\s+/g, ' ')
  ),
  steamAppId: z.number().int().positive().optional(),
});

export const rejectReportSchema = z.object({
  reason: z.enum(['invalid_screenshot', 'unrealistic_data', 'duplicate', 'other']),
  customReason: z.string().max(500).optional(),
}).refine(
  (data) => data.reason !== 'other' || !!data.customReason,
  { message: 'Custom reason required when reason is "other"', path: ['customReason'] }
);
```

---

### 3.3 Error Handling

**HTTP Status Codes:**
- 200 OK, 201 Created
- 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found
- 409 Conflict, 413 Payload Too Large, 415 Unsupported Media Type
- 500 Internal Server Error

**Error Response Format:**
```typescript
{
  error: string;
  code: string;
  field?: string;
  requestId: string; // UUID for debugging
  details?: any; // Only in development
}
```

**Error Handler:**
```typescript
// src/lib/api/error-handler.ts
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { randomUUID } from 'crypto';

export function handleAPIError(error: unknown, requestId?: string) {
  const rid = requestId || randomUUID();
  console.error(`[API Error ${rid}]`, error);

  if (error instanceof ZodError) {
    const firstError = error.errors[0];
    return NextResponse.json(
      {
        error: firstError.message,
        code: 'VALIDATION_ERROR',
        field: firstError.path.join('.'),
        requestId: rid,
        ...(process.env.NODE_ENV !== 'production' && { 
          details: error.errors 
        }),
      },
      { status: 400 }
    );
  }

  // Supabase errors
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const supabaseError = error as { code: string; message: string };
    
    if (supabaseError.code === '23505') {
      return NextResponse.json(
        { error: 'Resource already exists', code: 'CONFLICT', requestId: rid },
        { status: 409 }
      );
    }
    
    if (supabaseError.code === '23503') {
      return NextResponse.json(
        { error: 'Referenced resource not found', code: 'INVALID_REFERENCE', requestId: rid },
        { status: 400 }
      );
    }
  }

  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      requestId: rid,
      ...(process.env.NODE_ENV !== 'production' && { 
        details: error instanceof Error ? error.message : String(error)
      }),
    },
    { status: 500 }
  );
}
```

---

## 4. Authentication & Authorization

### 4.1 Auth Flow (Supabase Auth)

**Sign Up Flow:**
1. User submits email/password/username
2. Supabase creates auth.users row
3. Trigger creates profiles row
4. Email verification sent
5. User confirms → session created

**Login Flow:**
1. User enters email/password
2. Supabase verifies credentials
3. Session + JWT tokens returned
4. Cookie set (httpOnly, secure, sameSite=lax)

**Logout Flow:**
1. User clicks logout
2. Session invalidated
3. Cookie cleared

---

### 4.2 Middleware (Protected Routes)

**Purpose:** UX-level gate (NOT primary security)
```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // ... cookie setup ...
  
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  const protectedPaths = ['/submit', '/profile', '/admin']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    redirectUrl.searchParams.set('error', 'auth_required')
    return NextResponse.redirect(redirectUrl)
  }

  // Admin check (UX only - re-verified in page/API)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/', request.url))
    
    const { data: isAdmin } = await supabase.rpc('is_user_admin')
    
    if (!isAdmin) {
      return new NextResponse(null, { status: 404 })
    }
  }

  return response
}
```

**Critical:** Middleware is UX only. Real auth ALWAYS in page/API routes.

---

### 4.3 Authorization Levels

**Level 1: Anonymous**
- View approved games, verified reports, active devices, public profiles
- Cannot submit, upvote, or access admin

**Level 2: Authenticated**
- All anonymous access +
- Submit reports/games, upvote, view own submissions, update profile
- Cannot see others' private data or access admin

**Level 3: Admin**
- All authenticated access +
- Verification queue, approve/reject, manage devices

**Admin Pattern (Two-Step):**
```typescript
// 1. Check admin via USER session
const { data: { user } } = await supabaseUser.auth.getUser();
const { data: isAdmin } = await supabaseUser.rpc('is_user_admin');
if (!isAdmin) return forbidden();

// 2. ONLY AFTER verification, use service role
const supabaseAdmin = createClient(..., SERVICE_ROLE_KEY);
```

---

### 4.4 CSRF Protection

**Mitigations:**
- httpOnly cookies
- sameSite=lax (reduces risk)
- **Primary defense: Origin header validation**
```typescript
// src/lib/api/validate-origin.ts
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL!;
  return origin === allowedOrigin;
}

// Use in all mutation routes
if (!validateOrigin(request)) {
  return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
}
```

---

### 4.5 Client-Side Auth State
```typescript
// src/contexts/AuthContext.tsx
'use client'

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const loadProfile = async (userId: string) => {
    const { data } = await supabase.rpc('is_user_admin')
    setIsAdmin(data || false)
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) await loadProfile(user.id)
      setLoading(false)
    }
    
    getUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const newUser = session?.user ?? null
        setUser(newUser)
        
        if (newUser && newUser.id !== user?.id) {
          await loadProfile(newUser.id)
        } else if (!newUser) {
          setIsAdmin(false)
        }
        
        setLoading(false)
      }
    )
    
    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

---

## 5. File Storage

### 5.1 Storage Architecture

**Bucket:** `screenshots` (private)

**Settings:**
- Public: false
- Max size: 5MB
- Allowed types: image/jpeg, image/png
- Path structure: `{userId}/{timestamp}-{random}.{ext}`

---

### 5.2 Storage Policies
```sql
CREATE POLICY "users_upload_own_folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'screenshots' AND
  name LIKE auth.uid()::text || '/%'
);

CREATE POLICY "users_read_own_files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'screenshots' AND
  name LIKE auth.uid()::text || '/%'
);
```

**Pattern:** `name LIKE auth.uid()::text || '/%'` enforces path prefix

---

### 5.3 Upload Flow
```typescript
// src/lib/storage/upload.ts
export async function uploadScreenshot(
  file: File,
  userId: string
): Promise<{ path: string; error?: string }> {
  // Validate type, size
  const allowedTypes = ['image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    return { path: '', error: 'Invalid file type' }
  }
  
  if (file.size > 5 * 1024 * 1024) {
    return { path: '', error: 'File size exceeds 5MB' }
  }
  
  // Generate unique path
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/${timestamp}-${random}.${ext}`
  
  // Upload
  const { data, error } = await supabase.storage
    .from('screenshots')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
  
  if (error) return { path: '', error: 'Upload failed' }
  return { path: data.path }
}
```

---

### 5.4 Server-Side Verification (CRITICAL)

**After upload, before DB insert:**
```typescript
// src/app/api/reports/route.ts
const storagePath = formData.get('screenshotPath') as string

// Verify path belongs to user
if (!storagePath.startsWith(`${user.id}/`)) {
  return forbidden('Invalid storage path')
}

// Verify file exists
const { data: fileExists } = await supabase.storage
  .from('screenshots')
  .list(user.id, {
    search: storagePath.split('/')[1],
  })

if (!fileExists || fileExists.length === 0) {
  return notFound('Screenshot not found')
}

// Safe to insert
await insertReport({ ...data, screenshot_storage_path: storagePath })
```

**Why:** Defense-in-depth against path traversal and phantom references

---

### 5.5 Signed URL Generation
```typescript
// src/lib/storage/signed-urls.ts
const urlCache = new Map<string, { url: string; expiresAt: number }>()

export async function createSignedUrl(
  storagePath: string,
  expiresIn: number = 3600 // seconds
): Promise<string | null> {
  const cached = urlCache.get(storagePath)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url
  }
  
  const { data, error } = await supabase.storage
    .from('screenshots')
    .createSignedUrl(storagePath, expiresIn)
  
  if (error) return null
  
  // Cache with 50% TTL (safety margin)
  urlCache.set(storagePath, {
    url: data.signedUrl,
    expiresAt: Date.now() + (expiresIn * 1000 * 0.5), // Convert to ms, then 50%
  })
  
  return data.signedUrl
}
```

**Cache:** Best-effort per instance (not distributed)

**Real MVP Guardrail:**
- Pagination (12 reports/page)
- Lazy loading (generate URLs for visible reports only)

---

### 5.6 Image Optimization (Next.js)
```typescript
import Image from 'next/image'

<Image
  src={signedUrl}
  alt="Performance screenshot"
  width={1920}
  height={1080}
  loading="lazy"
  quality={85}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  unoptimized={false} // Set true if Next.js Image optimization fails with signed URLs
/>
```

**Configuration:**
```typescript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/sign/**',
      },
    ],
  },
}
```

**Fallback:** If Next.js Image has issues with signed URLs, use `unoptimized={true}` for MVP.

---

## 6. Security Considerations

### 6.1 Threat Model (MVP)

**In-Scope:**
1. Unauthorized access (RLS + middleware + API auth)
2. Data injection (Zod validation, parameterized queries)
3. CSRF (sameSite=lax + Origin validation)
4. File upload abuse (type/size validation, storage policies, path verification)
5. Spam (admin verification, unique constraints)

**Out-of-Scope:**
- DDoS (rely on infrastructure)
- Advanced threats (not realistic for MVP)
- Phishing (user education, 2FA in v2)

---

### 6.2 Input Validation

**Client:** react-hook-form + Zod (UX only)

**Server:** Zod schemas (security)
```typescript
const validated = createReportSchema.parse(data)
```

**Sanitization:**
```typescript
function sanitizeUsername(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .substring(0, 20)
}

function sanitizeNotes(input: string): string {
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .substring(0, 500)
}
```

**Note:** React auto-escapes, but sanitize as defense-in-depth

---

### 6.3 Security Headers
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}
```

---

### 6.4 Security Checklist

- [ ] All secrets in environment variables
- [ ] Service role key NEVER exposed to client
- [ ] RLS enabled on all tables
- [ ] File upload validation (type, size, path) - client + server
- [ ] Server-side path ownership + existence verification
- [ ] Origin header validation on mutations
- [ ] Security headers configured
- [ ] HTTPS enforced (Vercel automatic)
- [ ] Database backups enabled (Supabase automatic)

---

## 7. Performance & Scalability (MVP Guardrails)

### 7.1 Overview

**Goals:**
- Lighthouse >80 on public pages
- Game page loads <3s (TTI)
- API routes <500ms (p95)
- Zero N+1 on critical pages (homepage, game page)
- Acceptable UX at 10k MAU

---

### 7.2 Database Performance

**Index Strategy:**
- ✅ Composite indexes for sort + filter (game_id + device_id + upvotes DESC, etc.)
- ✅ Partial indexes WHERE verified (reduces index size)
- ✅ User/admin indexes for profile/queue

**Pagination (CRITICAL):**
```typescript
async function getReportsForGame(
  gameId: string,
  filters: { deviceId?: string },
  sort: 'upvotes' | 'newest' | 'fps' | 'tdp',
  offset: number = 0,
  limit: number = 12 // Hard limit
) {
  // Offset max: 500 (max 50 pages), then v2 cursor pagination
  if (offset > 500) {
    throw new Error('Offset too large, use cursor pagination')
  }
  
  const query = supabase
    .from('performance_reports')
    .select(`
      *,
      user:public_profiles!user_id(id, username),
      device:devices(id, name, slug)
    `)
    .eq('game_id', gameId)
    .eq('verification_status', 'verified')
    .range(offset, offset + limit - 1)
  
  // ... filters, sort ...
  
  return query
}
```

**N+1 Prevention:**
```typescript
// ✅ GOOD: Single query with joins
const { data: reports } = await supabase
  .from('performance_reports')
  .select(`
    *,
    user:public_profiles!user_id(id, username),
    device:devices(id, name, slug)
  `)
  .eq('game_id', gameId)
  .eq('verification_status', 'verified')
  .range(0, 11)
```

**Note:** Join uses `public_profiles` view (RLS-safe for public data)

---

### 7.3 API Performance

**Targets:**
- GET (Server Components): <200ms (p95)
- POST /api/reports: <1s (p95)
- POST vote: <300ms (p95)
- Admin routes: <500ms (p95)

**Parallelization:**
```typescript
// ✅ GOOD: Parallel
const { data: { user } } = await supabase.auth.getUser()

const [profile, reports] = await Promise.all([
  getProfile(user.id),
  getReports(user.id),
])
```

---

### 7.4 Frontend Performance

**Code Splitting:**
```typescript
import dynamic from 'next/dynamic'

const AdminPanel = dynamic(() => import('@/components/AdminPanel'), {
  ssr: false,
})
```

**Image Optimization:**
```typescript
<Image
  src={signedUrl}
  width={1920}
  height={1080}
  loading="lazy"
  quality={85}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

**Bundle Target:** <200KB initial JS

---

### 7.5 Caching Strategy

**Browser:**
- Static assets: 1 year
- HTML: stale-while-revalidate (ISR)

**Server:**
- React automatic request deduplication (no additional caching needed)

**ISR:**
```typescript
// src/app/games/[slug]/page.tsx
export const revalidate = 300 // 5 minutes

export async function generateStaticParams() {
  const games = await getPopularGames(50)
  return games.map((game) => ({ slug: game.slug }))
}
```

**Important:** Signed URLs generated on runtime (not cached in static HTML). Generate per-request or client-side fetch after mount.

---

### 7.6 Performance Checklist

**Database:**
- [ ] All frequent queries indexed
- [ ] Pagination enforced (max 50 items, offset ≤500)
- [ ] Zero N+1 on homepage + game page
- [ ] Query count <10 per page

**API:**
- [ ] Response times <500ms (p95)
- [ ] Parallel async where possible
- [ ] Origin validation on mutations

**Frontend:**
- [ ] Images lazy-loaded
- [ ] Heavy components code-split
- [ ] Bundle <200KB
- [ ] No layout shift

**Caching:**
- [ ] Static assets cached (1 year)
- [ ] ISR enabled (5 min revalidate)
- [ ] Signed URLs generated runtime (not static)

**Monitoring:**
- [ ] Vercel Analytics enabled
- [ ] Lighthouse baseline tracked
- [ ] Query performance reviewed weekly

---

### 7.7 Scalability Guardrails

**❌ Don't:**
- Fetch all reports for a game (always paginate)
- Load all games in dropdown (limit 100, search in v2)
- Generate 100 signed URLs at once (paginate, lazy load)
- Add real-time features without infrastructure

**✅ Do:**
- Paginate everything (default 12, max 50, offset ≤500)
- Use database for sorting/filtering
- Cache signed URLs (best-effort, 50% TTL)
- Monitor weekly
- Plan for 10x but don't over-engineer

---

### 7.8 When to Optimize

**Optimize ONLY if:**
1. Measurable problem (Lighthouse <80 OR p95 >500ms OR user complaints)
2. High impact (affects >50% users OR critical path)
3. Low effort (<4h OR config change)

**Example:**
- "Game page Lighthouse 65" → Optimize (high impact)
- "Admin panel slow" → Defer (low traffic)
- "Could use Redis" → Defer (no data proving need)

---

## End of Document

**Status:** 03-TECHNICAL-ARCHITECTURE.md COMPLETE ✅

**Next Steps:**
- Proceed to `06-IMPLEMENTATION-PLAN.md` for phase-by-phase task breakdown