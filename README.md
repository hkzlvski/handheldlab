# HandheldLab

**Performance database for handheld gaming PCs.**

Find the perfect settings for your Steam Deck, ROG Ally, Legion Go, and other handheld gaming devices.

🔗 **Live:** [handheldlab.vercel.app](https://handheldlab.vercel.app)

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Supabase account (free tier)
- Vercel account (optional, for deployment)

### Setup

1. **Clone the repository:**
```bash
   git clone https://github.com/hkzlvski/handheldlab.git
   cd handheldlab
```

2. **Install dependencies:**
```bash
   npm install
```

3. **Set up environment variables:**
```bash
   cp .env.example .env.local
```
   
   Fill in your Supabase credentials in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep secret!)
   - `NEXT_PUBLIC_APP_URL` - `http://localhost:3000` for development

4. **Run development server:**
```bash
   npm run dev
```
   
   Open [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentation

Complete project documentation in `docs/` folder:

| Document | Description |
|----------|-------------|
| [01-PROJECT-OVERVIEW.md](docs/01-PROJECT-OVERVIEW.md) | Vision, problem statement, solution, competitive analysis |
| [02-PRODUCT-REQUIREMENTS.md](docs/02-PRODUCT-REQUIREMENTS.md) | Features, user stories, success metrics, roadmap |
| [03-TECHNICAL-ARCHITECTURE.md](docs/03-TECHNICAL-ARCHITECTURE.md) | Tech stack, database schema, API design, security |
| [04-USER-FLOWS.md](docs/04-USER-FLOWS.md) | User journeys, edge cases, error states |
| [05-UI-UX-SPECIFICATION.md](docs/05-UI-UX-SPECIFICATION.md) | Design system, components, accessibility |
| [06-IMPLEMENTATION-PLAN.md](docs/06-IMPLEMENTATION-PLAN.md) | Phase-by-phase build plan, tasks, timeline |

---

## 🛠️ Tech Stack

**Frontend:**
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

**Backend:**
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (for screenshots)
- **API:** Next.js API Routes

**Deployment:**
- **Hosting:** Vercel
- **CI/CD:** GitHub → Vercel auto-deploy

---

## 📁 Project Structure
```
handheldlab/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth routes (login, signup)
│   ├── games/               # Game pages
│   ├── submit/              # Submit report page
│   ├── profile/             # User profile
│   ├── admin/               # Admin panel
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # Base UI components (buttons, inputs)
│   ├── layout/              # Layout components (header, footer)
│   └── features/            # Feature components (report cards, etc.)
├── lib/                     # Utility functions
│   ├── supabase/            # Supabase clients
│   ├── validations/         # Zod schemas
│   └── utils.ts             # Helper functions
├── docs/                    # Project documentation
├── public/                  # Static assets
└── .env.local               # Environment variables (gitignored)
```

---

## 🗄️ Database Schema

**Tables:**
- `profiles` - User accounts
- `devices` - Handheld gaming devices (Steam Deck, ROG Ally, etc.)
- `games` - Game catalog
- `performance_reports` - User-submitted performance data
- `performance_votes` - Upvote system

**Security:**
- Row Level Security (RLS) enabled on all tables
- Users can only modify their own data
- Admin-only routes protected via middleware

See [03-TECHNICAL-ARCHITECTURE.md](docs/03-TECHNICAL-ARCHITECTURE.md) for complete schema.

---

## 🚦 Project Status

### ✅ Phase 0: Project Setup (COMPLETE)
- Next.js project initialized
- Supabase configured
- Vercel deployment working
- Documentation complete

### 🏗️ Phase A: Foundation (IN PROGRESS)
- Database schema implementation
- Authentication system
- Layout and core components

### ⏳ Upcoming Phases
- **Phase B:** Core Features (Submit reports, game pages, upvoting)
- **Phase C:** Admin & Polish (Verification queue, accessibility)
- **Phase D:** Testing & Launch

See [06-IMPLEMENTATION-PLAN.md](docs/06-IMPLEMENTATION-PLAN.md) for detailed roadmap.

---

## 🎯 MVP Features

- ✅ User authentication (signup, login, email verification)
- ✅ Submit performance reports (with screenshots)
- ✅ Browse verified reports by game and device
- ✅ Filter and sort reports (by FPS, TDP, upvotes)
- ✅ Upvote helpful reports
- ✅ Admin verification queue

---

## 🧪 Development Commands
```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Format code
npm run format
```

---

## 🔐 Environment Variables

Required environment variables (add to `.env.local`):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ Never commit `.env.local` to Git!**

---

## 🤝 Contributing

This is a solo project for MVP. Contributions welcome post-launch.

**If you find a bug:**
1. Check existing issues on GitHub
2. Create a new issue with details
3. Include screenshots if applicable

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 👤 Author

**Juno** ([@hkzlvski](https://github.com/hkzlvski))

---

## 🙏 Acknowledgments

- **Next.js** by Vercel
- **Supabase** for backend infrastructure
- **Tailwind CSS** for styling
- **Radix UI** for accessible components

---

**Built with ❤️ for the handheld gaming community.**