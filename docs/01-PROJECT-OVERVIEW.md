# HandheldLab - Project Overview

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Status:** Foundation Document - LOCKED ✅

---

## 1. Executive Summary

**HandheldLab answers one purchase question:**  
*"How does this game actually run on a specific handheld — and what tradeoffs will I have to accept?"*

The platform shows verified, real-world performance reports: FPS, battery draw (TDP), graphics settings, and Proton version — backed by screenshots with an FPS overlay.

**We don’t say whether a game runs.**  
We show *how well* it runs, *for how long*, and *at what cost*.

**HandheldLab = real handheld conditions testing, not opinions.**

---

## 2. Problem Statement

### 2.1 The Core Pain

**Buying a game for a handheld PC is a gamble.**

A user wants to buy a €60 game, but doesn’t know:
- Will it hit 30 FPS? 60 FPS?
- How much battery will it eat? (2h? 4h?)
- What graphics settings are realistically usable?
- Do they need to drop resolution?
- What TDP is the “playable” sweet spot?
- Will Proton run it stably?

**Even if a game “runs,” it can be loud, kill the battery in 90 minutes, or require tradeoffs that ruin handheld comfort.**

**Existing “solutions” fail:**

#### YouTube benchmarks:
- ❌ Show the tester’s chosen settings, not the optimal ones
- ❌ Different Proton/driver versions = different results
- ❌ Poor comparability (everyone uses a different overlay/setup)
- ❌ Clickbait thumbnails (“60 FPS!” for five minutes)

#### ProtonDB:
- ✅ Says “does it run”
- ❌ Does NOT say “how well does it run”
- ❌ No FPS/battery/TDP data
- ❌ Comments are opinions, not standardized data

#### Steam Deck Verified:
- ✅ Valve verifies whether the game boots and is usable
- ❌ “Playable” can still mean 25 FPS
- ❌ No coverage for other handhelds (ROG Ally, Legion Go)
- ❌ No real settings data

#### Reddit/Discord:
- ❌ Fragmented info scattered across threads
- ❌ “Works for me” without proof = unverifiable
- ❌ Not searchable by device + game in a consistent way
- ❌ Old posts become outdated (new Proton/patches)

---

### 2.2 Who Suffers? (User Segments)

#### Persona A: “The Buyer” (70% traffic)

**Who they are:**
- Owns a Steam Deck / ROG Ally / Legion Go
- Casual-to-moderate gamer
- €20–€60 per game budget
- Limited technical skills

**Their problem:**
- Wants to buy Elden Ring but doesn’t know if Steam Deck can do 40+ FPS
- YouTube shows “45 FPS” but… what TDP? what battery life?
- ProtonDB says “Gold,” which doesn’t answer the real question
- Doesn’t want to buy and regret it
- **Doesn’t want to spend an hour on YouTube or tweaking — wants a fast, trustworthy answer before clicking “Buy.”**

**Job To Be Done:**
> “Before I buy, I want to know if this game will feel GOOD on my device — not just whether it launches.”

---

#### Persona B: “The Optimizer” (20% traffic)

**Who they are:**
- Enthusiast / power user
- Tweaks TDP/resolution/Proton
- Active on r/SteamDeck and Discord
- Enjoys helping the community

**Their problem:**
- Spent 2 hours optimizing Cyberpunk on a ROG Ally
- Found a sweet spot: Medium, 20W TDP, FSR Quality = stable 60 FPS
- Wants to share it, but:
  - A Reddit post gets buried
  - A Discord message disappears
  - They don’t get lasting credit for helping
- **Wants their configurations to be searchable, durable, and attributed to them as the author — as long as their account exists. If they delete their account, reports remain but attribution becomes `@[deleted]` (locked product rule).**

**Job To Be Done:**
> “I want to share my optimizations and be recognized as a trusted source.”

---

#### Persona C: “The Quality Gate”

**Who they are:**
- Project owner
- Domain expert (knows handhelds)
- Quality gatekeeper

**Their problem:**
- Must ensure the data is trustworthy
- Fake screenshots / troll reports destroy value
- Too much spam = users lose trust

**Job To Be Done:**
> “I want to maintain data quality with minimal moderation effort.”

---

## 3. Solution (How HandheldLab Solves the Problem)

### 3.1 Core Solution Mechanism

**HandheldLab = a Verified Performance Database**

**Three pillars:**

**1. Evidence-Based (Screenshot Required)**
- Every report MUST include a screenshot with an FPS overlay (MangoHud / MSI Afterburner)
- No screenshot = no report
- **Automatic validations (FPS/TDP ranges, anomaly checks, metadata stripping) catch most issues — admin manually reviews only suspicious or high-impact reports.**

**2. Device-Specific Data**
- Reports are tied to specific devices (Steam Deck OLED ≠ Steam Deck LCD)
- Filters: device, FPS range, TDP
- Sorting: most helpful, newest, highest FPS, lowest TDP
- **Each report is timestamped and linked to a specific environment (settings + Proton version), so old configs don’t pretend to be current.**

**3. Tradeoff Transparency**
- Every report shows: FPS + TDP + resolution + graphics preset + Proton
- Users see the TRADEOFFS: “60 FPS at 25W = ~1.5h battery” vs “40 FPS at 15W = ~3h”
- FPS Class badges: “60+ Smooth”, “40+ Comfort”, “30+ Playable”

---

### 3.2 How This Solves Each Pain

#### ❌ Problem: “YouTube benchmarks aren’t comparable”
#### ✅ Solution:
- Standardized submission forms (TDP dropdown 5W–30W, resolution dropdown, preset dropdown)
- Everyone reports the same metrics
- Upvote-based sorting surfaces the best configs over time

---

#### ❌ Problem: “ProtonDB has no performance data”
#### ✅ Solution:
- HandheldLab REQUIRES FPS average/min/max
- Requires TDP and resolution
- Optional: Proton version, custom settings, notes
- ProtonDB answers “whether,” HandheldLab answers “how well”

---

#### ❌ Problem: “Steam Deck Verified ignores other handhelds”
#### ✅ Solution:
- Support for 12 devices in MVP (Steam Deck LCD/OLED, ROG Ally, Legion Go, AYANEO, GPD, etc.)
- Device-agnostic approach: every handheld is treated equally
- Filters enable cross-device comparison

---

#### ❌ Problem: “Reddit/Discord info disappears”
#### ✅ Solution:
- Central database (PostgreSQL)
- Searchable by game + device
- Reports don’t “expire” (timestamped; users can submit new ones for newer Proton/patches)
- SEO-friendly URLs: `/games/elden-ring` → indexed by Google

---

#### ❌ Problem: “I don’t know who to trust”
#### ✅ Solution:
- Admin verification (pending → verified badge)
- Community upvotes (helpful reports rise)
- Screenshot as proof (faking requires real effort)
- v2: reputation system for trusted contributors

---

### 3.3 User Journey Solved

#### Persona A (“The Buyer”) — Before HandheldLab:
1. Googles “Elden Ring Steam Deck”
2. Watches 3 YouTube videos (20 min)
3. Checks ProtonDB (“Gold” — still unclear)
4. Scrolls Reddit (fragmented info)
5. **Still uncertain** → might not buy

#### Persona A — With HandheldLab:
1. Googles “Elden Ring Steam Deck performance”
2. Lands on `/games/elden-ring`
3. Filters: Steam Deck OLED
4. Sees 12 verified reports sorted by upvotes
5. Top report: “52 FPS avg (45–60), Medium, 15W, 800p, Proton 8.0” ← 47 upvotes
6. **Decision made in <60 seconds** → buys confidently

---

#### Persona B (“The Optimizer”) — Before HandheldLab:
1. Spends 2 hours optimizing Cyberpunk on a ROG Ally
2. Posts on Reddit with a screenshot
3. Gets 5 upvotes, post archived quickly
4. **No lasting impact, no durable credit**

#### Persona B — With HandheldLab:
1. Optimizes Cyberpunk
2. Submits a report: screenshot + settings
3. Report gets verified (✅ badge)
4. Gets 30+ upvotes over time
5. Username is visible on the report → **builds reputation**
6. Other users can browse their contributions
7. **If the user deletes their account, reports remain, but author becomes `@[deleted]` (locked product rule).**

---

#### Persona C (“The Quality Gate”) — Before HandheldLab:
1. Platform doesn’t exist
2. N/A

#### Persona C — With HandheldLab:
1. Reviews pending reports in the admin panel
2. Checks screenshot vs reported FPS
3. Sanity checks: FPS >200? TDP >30W? Screenshot <50KB? → auto-flag
4. Approves/rejects with a reason
5. **<30 min/day** to maintain quality with 50–100 pending reports

---

### 3.4 What HandheldLab IS and IS NOT

#### ✅ IS:
- A performance database with verified data
- A decision tool for buyers
- A recognition platform for contributors (while accounts exist)
- A device-agnostic handheld resource

#### ❌ IS NOT:
- A social network (no DMs, no follows, no feeds)
- A benchmarking tool (no synthetic tests)
- A game store (affiliate links possible, but not core)
- A ProtonDB competitor (complementary, not competing)
- A YouTube alternative (no video benchmarks)

---

### 3.5 Competitive Moat (Why Someone Else Won’t Easily Replicate This)

**Network Effects:**
- More reports = more value
- More coverage (game × device pairs)
- First-mover advantage in a niche

**Quality Bar:**
- Screenshot requirement = high effort barrier
- Admin verification = trust
- Community upvotes = self-cleaning

**Domain Expertise:**
- Curated device list (no chaos from user-submitted devices)
- Handheld-specific metrics (TDP, battery tradeoffs, not just FPS)
- Understanding tradeoffs (not just “max settings”)

**Data Ownership:**
- Proprietary database (no scraping)
- User-generated but verified
- Hard to replicate without critical mass

**The hardest thing to copy isn’t the UI or the tech — it’s a trusted, historical database of comparable performance data across hundreds of games and devices.**

---

## End of Document

**Next Steps:**
- Proceed to `02-PRODUCT-REQUIREMENTS.md` for detailed MVP specification
- Define exact features, user stories, and acceptance criteria
- Build implementation roadmap in `06-IMPLEMENTATION-PLAN.md`