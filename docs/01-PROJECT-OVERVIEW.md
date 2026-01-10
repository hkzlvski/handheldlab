# HandheldLab - Project Overview

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Status:** Foundation Document - LOCKED ✅

---

## 1. Executive Summary

**HandheldLab odpowiada na jedno pytanie zakupowe:**  
*"Jak ta gra faktycznie działa na konkretnym handheldzie — i jakie kompromisy muszę zaakceptować?"*

Platforma pokazuje zweryfikowane, real-world raporty wydajności: FPS, zużycie baterii (TDP), ustawienia graficzne i wersję Proton — poparte screenshotami z overlay.

**Nie mówimy czy gra działa.**  
Pokazujemy *jak dobrze* działa, *jak długo*, i *kosztem czego*.

**HandheldLab = realne testy w warunkach handheldowych, a nie opinie.**

---

## 2. Problem Statement

### 2.1 Główny Problem (The Core Pain)

**Buying a game for a handheld PC is a gamble.**

Użytkownik chce kupić grę za 60€, ale nie wie:
- Czy osiągnie 30 FPS? 60 FPS?
- Ile baterii to zje? (2h? 4h?)
- Jakie ustawienia graficzne da się ustawić?
- Czy musi obniżyć rozdzielczość?
- Jaki TDP ustawić żeby było grywalnie?
- Czy Proton zadziała stabilnie?

**Nawet jeśli gra "działa", może być głośna, żreć baterię w 90 minut albo wymagać kompromisów, które zabijają przyjemność grania na handheldzie.**

**Obecne "rozwiązania" zawodzą:**

#### YouTube benchmarks:
- ❌ Pokazują ustawienia które tester wybrał, nie optymalne
- ❌ Różne wersje Proton/sterowniki = inne wyniki
- ❌ Brak porównywalności (każdy ma inne overlay)
- ❌ Clickbait thumbnails ("60 FPS!" ale przez 5 minut)

#### ProtonDB:
- ✅ Mówi "czy działa"
- ❌ NIE mówi "jak dobrze działa"
- ❌ Brak danych o FPS/baterii/TDP
- ❌ Komentarze to opinie, nie dane

#### Steam Deck Verified:
- ✅ Valve weryfikuje czy gra odpala
- ❌ "Playable" może znaczyć 25 FPS
- ❌ Zero informacji o innych handheldach (ROG Ally, Legion Go)
- ❌ Brak danych o ustawieniach

#### Reddit/Discord:
- ❌ Fragmentaryczne info rozproszone po wątkach
- ❌ "U mnie działa" bez screenshota = nieweryfikowalne
- ❌ Nie da się wyszukać po device + game
- ❌ Stare posty dezaktualizują się (nowe Proton/patche)

---

### 2.2 Kto Cierpi? (User Segments)

#### Persona A: "The Buyer" (70% traffic)

**Kim jest:**
- Posiada Steam Deck / ROG Ally / Legion Go
- Casual-moderate gamer
- Budżet 20-60€/gra
- Ograniczone umiejętności techniczne

**Jego problem:**
- Chce kupić Elden Ring, ale nie wie czy Steam Deck da radę w 40+ FPS
- YouTube pokazuje 45 FPS, ale jakim TDP? Jaką baterią?
- ProtonDB mówi "Gold" ale to nic nie znaczy
- Nie chce kupić gry i się rozczarować
- **Nie chce spędzić godziny na YouTube ani w ustawieniach — chce szybkiej, wiarygodnej odpowiedzi przed kliknięciem "Kup".**

**Job To Be Done:**
> "Przed zakupem chcę wiedzieć czy ta gra będzie PRZYJEMNA do grania na moim urządzeniu — nie tylko czy odpali."

---

#### Persona B: "The Optimizer" (20% traffic)

**Kim jest:**
- Enthusiast/power user
- Tweak'uje TDP/resolution/Proton
- Aktywny na r/SteamDeck, Discord
- Lubi pomagać community

**Jego problem:**
- Spędził 2h optymalizując Cyberpunk na ROG Ally
- Znalazł sweet spot: Medium, 20W TDP, FSR Quality = 60 FPS stabilne
- Chce się podzielić, ale:
  - Reddit post zginie w archiwum
  - Discord wiadomość przepadnie
  - Nikt nie da mu credit za pomoc
- **Chce, żeby jego konfiguracje były odnajdywalne, aktualne i przypisane do niego jako autora.**

**Job To Be Done:**
> "Chcę dzielić się swoimi optymalizacjami i dostać uznanie jako trusted source."

---

#### Persona C: "The Quality Gate"

**Kim jest:**
- Owner projektu
- Domain expert (zna handhelde)
- Quality gatekeeper

**Jego problem:**
- Musi zapewnić że dane są wiarygodne
- Fake screeny / troll reports niszczą wartość
- Za dużo spam = użytkownicy tracą zaufanie

**Job To Be Done:**
> "Chcę utrzymać jakość danych przy minimalnym wysiłku moderacji."

---

## 3. Solution (Jak HandheldLab Rozwiązuje Problem)

### 3.1 Core Solution Mechanism

**HandheldLab = Verified Performance Database**

**Trzy filary:**

**1. Evidence-Based (Screenshot Required)**
- Każdy raport MUSI mieć screenshot z FPS overlay (Mangohud/MSI Afterburner)
- Bez screenshota = nie ma raportu
- **Automatyczne walidacje (zakres FPS/TDP, overlay detection, metadata) odsiewają większość błędów — admin ręcznie sprawdza tylko raporty oznaczone jako podejrzane lub wysoko oceniane.**

**2. Device-Specific Data**
- Reports podzielone po konkretnych urządzeniach (Steam Deck OLED ≠ Steam Deck LCD)
- Filtry: device, FPS range, TDP
- Sorting: most helpful, newest, highest FPS, lowest TDP
- **Każdy raport jest timestampowany i powiązany z konkretną wersją gry i środowiska, dzięki czemu stare konfiguracje nie udają aktualnych.**

**3. Tradeoff Transparency**
- Każdy raport pokazuje: FPS + TDP + resolution + graphics preset + Proton
- User widzi KOMPROMISY: "60 FPS ale 25W TDP = 1.5h baterii" vs "40 FPS ale 15W = 3h"
- FPS Class badge: "60+ Smooth", "40+ Comfort", "30+ Playable"

---

### 3.2 Jak To Rozwiązuje Każdy Ból?

#### ❌ Problem: "YouTube benchmarks są nieporównywalne"
#### ✅ Solution: 
- Standaryzowane formularze (TDP dropdown: 5W-30W, resolution dropdown, preset dropdown)
- Wszyscy raportują te same metryki
- Sortowanie po upvotes = najlepsze konfiguracje wynurzają się naturalnie

---

#### ❌ Problem: "ProtonDB nie ma danych o performance"
#### ✅ Solution:
- HandheldLab WYMAGA FPS average/min/max
- Wymaga TDP i resolution
- Opcjonalnie: Proton version, custom settings, notes
- ProtonDB mówi "czy", HandheldLab mówi "jak dobrze"

---

#### ❌ Problem: "Steam Deck Verified ignoruje inne handhelde"
#### ✅ Solution:
- Support dla 12 devices na MVP (Steam Deck LCD/OLED, ROG Ally, Legion Go, AYANEO, GPD, etc.)
- Device-agnostic = każdy handheld ma równe traktowanie
- Filtry pozwalają porównać performance cross-device

---

#### ❌ Problem: "Reddit/Discord info przepada"
#### ✅ Solution:
- Centralna baza danych (PostgreSQL)
- Wyszukiwanie po game + device
- Reports nie dezaktualizują się (są timestampowane + można dodać nowe dla nowych Proton)
- SEO-friendly URLs: `/games/elden-ring` → Google indexuje

---

#### ❌ Problem: "Nie wiem komu ufać"
#### ✅ Solution:
- Admin verification (pending → verified badge)
- Community upvotes (helpful reports wynurzają się)
- Screenshot jako proof (nie można sfake'ować bez effort)
- W v2: Reputation system dla trusted contributors

---

### 3.3 User Journey Solved

#### Persona A ("The Buyer") - Before HandheldLab:
1. Googles "Elden Ring Steam Deck"
2. Watches 3 YouTube videos (20 min)
3. Checks ProtonDB (mówi "Gold" - nic nie wie)
4. Scrolls Reddit (fragmentaryczne info)
5. **Still uncertain** → might not buy

#### Persona A - With HandheldLab:
1. Googles "Elden Ring Steam Deck performance"
2. Lands on `/games/elden-ring`
3. Filters: Steam Deck OLED
4. Sees 12 verified reports sorted by upvotes
5. Top report: "52 FPS avg (45-60), Medium, 15W, 800p, Proton 8.0" ← 47 upvotes
6. **Decision made in <60 seconds** → buys confidently

---

#### Persona B ("The Optimizer") - Before HandheldLab:
1. Spends 2h optimizing Cyberpunk on ROG Ally
2. Posts on Reddit with screenshot
3. Gets 5 upvotes, post archived after 24h
4. **No lasting impact, no credit**

#### Persona B - With HandheldLab:
1. Optimizes Cyberpunk
2. Submits report: screenshot + settings
3. Report gets verified (✅ badge)
4. Gets 30+ upvotes over time
5. Username visible on report → **builds reputation**
6. Other users find his profile → see all his quality reports
7. **Becomes trusted contributor** (v2: special badge)
8. **Jego konfiguracja staje się domyślną rekomendacją dla setek kupujących.**

---

#### Persona C ("Quality Gate") - Before HandheldLab:
1. Platform doesn't exist
2. N/A

#### Persona C - With HandheldLab:
1. Reviews pending reports in admin panel
2. Checks screenshot vs reported FPS
3. Sanity checks: FPS >200? TDP >30W? Screenshot <50KB? → auto-flag
4. Approves/rejects with reason
5. **<30 min/day** to maintain quality with 50-100 pending reports

---

### 3.4 What HandheldLab IS and IS NOT

#### ✅ IS:
- Performance database with verified data
- Decision tool for buyers
- Recognition platform for contributors
- Device-agnostic handheld resource

#### ❌ IS NOT:
- Social network (no DMs, no follows, no feeds)
- Benchmarking tool (nie robimy synthetic tests)
- Game store (affiliate links możliwe, ale nie core)
- ProtonDB competitor (komplementarne, nie competing)
- YouTube alternative (nie robimy video benchmarks)

---

### 3.5 Competitive Moat (Dlaczego Ktoś Inny Tego Nie Zrobi)

**Network Effect:**
- Więcej reports = więcej wartości
- Więcej coverage (game × device pairs)
- First mover advantage w niche

**Quality Bar:**
- Screenshot requirement = wysoki effort barrier
- Admin verification = trust
- Community upvotes = self-cleaning

**Domain Expertise:**
- Curated device list (nie chaos user-submitted devices)
- Handheld-specific metrics (TDP, battery, not just FPS)
- Understanding tradeoffs (nie tylko "max settings")

**Data Ownership:**
- Własna baza danych (nie scraping)
- User-generated ale verified
- Trudna do zreplikowania bez critical mass

**Najtrudniejsze do skopiowania nie jest UI ani technologia, ale zaufana, historyczna baza porównywalnych danych performance dla setek gier i urządzeń.**

---

## End of Document

**Next Steps:**
- Proceed to `02-PRODUCT-REQUIREMENTS.md` for detailed MVP specification
- Define exact features, user stories, and acceptance criteria
- Build implementation roadmap in `06-IMPLEMENTATION-PLAN.md`