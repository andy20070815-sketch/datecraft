# DateCraft — Product Requirements Document

**Version:** 1.0  
**Date:** May 2026  
**Owner:** Andy  
**Status:** Living document

---

## 1. Problem Statement

Planning a date in Taipei is genuinely hard. The options are overwhelming, the information is scattered across Google Maps, Instagram, and LINE group chats, and most people default to the same three places out of friction. Couples who want something thoughtful end up either over-researching for hours or under-delivering with "just pick anywhere."

DateCraft removes that friction — one place to discover, plan, and coordinate a date in Taipei.

---

## 2. Target Users

**Primary:** Couples aged 18–32 based in or visiting Taipei who want to plan intentional dates without spending an hour figuring out where to go.

**Secondary:** Anyone planning a first date, anniversary, or friend outing in Taipei who needs a starting point and a way to lock in a plan.

**Key insight:** The user is not looking for a list of restaurants. They're looking for a complete plan that fits their mood, budget, and schedule — and a frictionless way to actually commit to it.

---

## 3. Goals

| Goal | Metric |
|------|--------|
| Reduce time-to-plan a date | User finds a spot and adds it to schedule in < 3 minutes |
| Drive repeat usage | User returns to plan the next date |
| Couples adoption | % of users who connect a partner account |
| Engagement | AI search bar used on > 50% of sessions |

---

## 4. What's Already Shipped (v1)

### Discovery
- **AI search bar** — natural language input; Claude asks ≤ 2 follow-up questions with clickable option chips, then auto-fills filters and searches
- **Manual filters** — neighbourhood, budget, vibe, time of day, 390+ interest tags across 6 categories
- **Google Places results** — real Taipei venues with photo, rating, price level, address, maps link, and reservation/website link when available
- **Curated recommendations** — 6 hand-picked Taipei date spots shown on the schedule page when no dates are planned

### Scheduling
- **Per-user schedule** — Google sign-in via Firebase Auth; schedule persists across devices in Firestore
- **Couple sync** — 6-character invite code; once linked, both partners share a single Firestore schedule with real-time updates
- **Date cards** — title, venue, date, time, notes, status (Planned → Confirmed → Completed)
- **Google Calendar export** — one-click "Add to Google Calendar" URL scheme on every date card
- **Share & PDF export** — copy schedule as text, or print to PDF

### Design & UX
- **Full-bleed gradient hero** on both pages (dark burgundy → purple)
- **Cormorant Garamond** headings + **DM Sans** body — editorial, non-generic feel
- **Frosted glass navbar** with user avatar
- **Mobile-optimized** — hamburger menu, stacked cards, responsive grids
- **EN / 中文 toggle** — full bilingual support including 390+ tag translations, neighbourhood names, vibes, budgets, times

### Tech Stack
- Next.js App Router + TypeScript
- Tailwind CSS v4
- Anthropic Claude API (`claude-sonnet-4-5`) for AI search
- Google Places API (New) for venue data
- Firebase Auth (Google sign-in) + Firestore (schedule + couple sync)
- Vercel (auto-deploy on push to `main`)

---

## 5. What's Not In Scope (v1)

- Payment / booking integration
- Venue reviews or user-generated content
- City expansion beyond Taipei
- Native mobile app
- Social features (sharing with friends beyond partner)
- Automated reminders or notifications

---

## 6. Roadmap

### Phase 2 — Retention & Depth

| Feature | Why | Effort |
|---------|-----|--------|
| **Push / email reminders** | "Your date is tomorrow" nudge drives follow-through | M |
| **Date history & memories** | Photos, notes, ratings on completed dates — turns DateCraft into a relationship journal | M |
| **Venue detail page** | Full page per venue with hours, menu link, photos, past visits | L |
| **Re-book a favourite** | "You went to X 3 months ago — go again?" surfaced from completed dates | S |
| **Itinerary builder** | String 2–3 spots into a single evening plan (pre-dinner, dinner, after) | L |

### Phase 3 — Growth & Discovery

| Feature | Why | Effort |
|---------|-----|--------|
| **Shareable date plans** | Public URL for a date plan — viral loop, also useful for first dates | M |
| **Seasonal / event suggestions** | Integrate local Taipei events calendar (concerts, exhibitions, festivals) | L |
| **"Surprise me" mode** | Fully AI-generated date plan based on just mood and budget, no filters needed | S |
| **Partner preference sync** | Both partners set preferences; AI finds the overlap | M |
| **City expansion** | New Taipei, Taichung, Kaohsiung as pilot | L |

### Phase 4 — Monetisation

| Feature | Why | Effort |
|---------|-----|--------|
| **Venue partnerships** | Featured placement for restaurants with available reservations | M |
| **Premium couple features** | Anniversary reminders, relationship milestones, private notes | M |
| **Affiliate reservation links** | Commission via inline/KKday/Klook when user books via DateCraft | L |

---

## 7. Open Questions

1. **Retention:** What brings users back after their first date? Is the schedule page enough, or do we need a feed/history?
2. **Couple adoption:** How do we get both partners to sign in, not just one?
3. **AI quality:** When Claude asks follow-up questions, does it help or add friction for users who already know what they want? Should the search go straight to results more often?
4. **Expansion:** Does the product idea translate outside Taipei, or is the Taipei-specific curation (neighbourhoods, local tags) the core value?

---

## 8. Success Story (What v2 Looks Like)

A couple opens DateCraft on a Thursday. They type "something cosy, not too loud, we feel like Japanese food." Claude asks one question about budget. It returns 6 spots in Da-an. They pick one, add it to Saturday, and both see it on their shared calendar. Saturday night they go. Sunday they mark it completed and leave a note. Six weeks later, DateCraft surfaces it as a suggested re-book.

That loop — discover, schedule, experience, remember — is the product.
