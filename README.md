HandheldLab

Performance database for handheld gaming PCs.

Real-world, community-driven performance reports for Steam Deck, ROG Ally, Legion Go, and other handheld gaming devices.

🔗 Live: https://handheldlab.vercel.app

🚀 Quick Start (Development)
Prerequisites

Node.js 18+

npm or pnpm

Supabase account (free tier)

Vercel account (optional, for deployment)

Setup

Clone the repository

git clone https://github.com/hkzlvski/handheldlab.git
cd handheldlab


Install dependencies

npm install


Environment variables

cp .env.example .env.local


Fill in:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000


Run dev server

npm run dev


Open http://localhost:3000

🧠 What HandheldLab Is (and Isn’t)

HandheldLab is:

A real-world performance database

Focused on actual playable settings, not benchmarks

Community-driven, evidence-first

Device-agnostic (Steam Deck ≠ default)

HandheldLab is NOT:

A price comparison site

A benchmark leaderboard

A marketing page for hardware vendors

🛠 Tech Stack

Frontend

Next.js 14 (App Router)

TypeScript

Tailwind CSS

Radix UI

React Hook Form + Zod

Backend

Supabase (PostgreSQL)

Supabase Auth

Supabase Storage (screenshots / proof)

Next.js API Routes

Deployment

Vercel (GitHub → auto deploy)

📁 Project Structure
handheldlab/
├── app/
│   ├── (auth)/            # Login / Signup
│   ├── submit/            # Submit performance report
│   ├── profile/           # User reports (WIP)
│   ├── admin/             # Admin tools (WIP)
│   ├── page.tsx           # Homepage
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   └── features/
├── lib/
│   ├── supabase/
│   ├── validations/
│   ├── storage/
│   └── api/
├── docs/
└── public/

🗄 Database

Tables

profiles

devices

games

performance_reports

performance_votes

Security

Full RLS on all tables

Users can only modify their own data

Admin-only operations enforced at DB + middleware level

🚦 Project Status
✅ Phase A — Foundation (COMPLETE)

Database schema + RLS

Authentication (email verification)

Core layout & UI components

Storage setup (proof uploads)

✅ Phase B.1 — Submit Report Flow (COMPLETE)

Submit page UI

Manual game entry (pending games)

Screenshot upload (optional)

Server-side validation

Storage path verification

Success & error UX

🏗 Phase B.2 — Profiles & Browsing (NEXT)

User profile page

List of submitted reports

Pending / verified / rejected states

Report deletion (pending only)

🎯 MVP Feature Set (Current)

✅ User signup / login

✅ Email verification

✅ Submit performance reports

✅ Optional proof screenshots

✅ Manual game submission (pending)

⏳ Browse reports (in progress)

⏳ Voting system (planned)

⏳ Admin verification queue (planned)

🧪 Development Commands
npm run dev      # Dev server
npm run build    # Production build
npm start        # Start production server
npm run lint     # Lint

🔐 Environment Variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=


⚠️ Never commit .env.local.

👤 Author

Juno
https://github.com/hkzlvski

📄 License

MIT

🧠 Philosophy

Proof is optional.
Transparency is mandatory.
Data beats opinions.