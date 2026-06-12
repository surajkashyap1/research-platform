# Research Platform — Build Roadmap (Solo, Web-first, £0/month)

**Stack:** Next.js (App Router) + TypeScript · Supabase (Postgres + Auth + Realtime + Storage, EU/London region) · Drizzle ORM · Tailwind CSS · Resend (email) · deployed on Vercel (or Cloudflare Pages).

**Guiding rule:** ship the smallest thing that lets a student find a project and apply, then a supervisor pick them. Everything else is later.

---

## Phase 0 — Foundations (½–1 day)
Goal: a deployed "hello world" wired to the database.

- [ ] `npx create-next-app@latest` (TypeScript, App Router, Tailwind).
- [ ] Create a free Supabase project — **choose the EU (London/Frankfurt) region**.
- [ ] Add Drizzle; point it at the Supabase Postgres connection string.
- [ ] Translate `docs/schema.sql` into Drizzle schema (or run the SQL directly in Supabase's SQL editor and introspect).
- [ ] Buy the domain. Deploy to Vercel, connect the domain, confirm HTTPS works.
- [ ] Commit to a private GitHub repo (`git init` — this folder isn't a repo yet).

**Done when:** the live URL renders a page that reads one row from Supabase.

---

## Phase 1 — Auth & Profiles (2–4 days)
Goal: users can sign up, verify, and build a profile.

- [ ] Supabase Auth: email/password + magic link.
- [ ] Profile creation/edit: name, university, career stage, specialty, summary, skills, publications, availability.
- [ ] **Verification:** domain-based email check (`.ac.uk` → student/university; NHS trust domains → professional). Set `is_verified` / `can_supervise` from the verified email.
- [ ] Compute `profile_completeness` (0–100) and show a progress nudge.
- [ ] Public profile page (read-only view others see).

**Done when:** you can register, verify via a university/NHS email, and a complete profile renders.

---

## Phase 2 — Project Listings (3–5 days)
Goal: supervisors/students post opportunities; everyone can browse.

- [ ] Create/edit/close a project (only `can_supervise` users, or students posting with a validated supervisor email — see plan §8).
- [ ] Fields per `projects`: type, **experience level**, specialty, beginner-friendly flag, role category, positions, deadline.
- [ ] Browse/list page with **search + filters** (specialty, experience level, beginner-friendly, project type) — Postgres full-text + indexed columns.
- [ ] Project detail page showing **live application count** (plan wants this visible).
- [ ] **Separate tabs: Beginner Roles vs Competitive Roles.**

**Done when:** a supervisor posts a project and a student finds it via filters.

---

## Phase 3 — Applications & Limits (3–4 days)
Goal: the core marketplace loop.

- [ ] Standardised application form: motivation, suitability, skills (enforce word limits).
- [ ] **Rate limit: 3 applications / rolling 7 days** (count rows in window). +3 / 2 weeks if the user posted a project with a validated supervisor email.
- [ ] Applicant dashboard: track application statuses (pending/shortlisted/accepted/rejected).
- [ ] Lister dashboard: view applicants, shortlist/accept/reject.
- [ ] Public Q&A on listings (`listing_questions`).

**Done when:** student applies (and is blocked at #4 in a week); supervisor accepts.

---

## Phase 4 — Messaging & Notifications (3–5 days)
Goal: people can talk, gated by the rules.

- [ ] One short **DM after applying** (`application_dm`, limited).
- [ ] **Unlimited project chat after acceptance/shortlist** (`project_chat`) via Supabase Realtime.
- [ ] In-app notifications (new application, message, status change) via Realtime + `notifications` table.
- [ ] Email notifications for key events (Resend).

**Done when:** an accepted applicant and supervisor hold a live chat; both get notified.

---

## Phase 5 — Reviews, Reputation & Badges (2–4 days)
Goal: trust signals.

- [ ] Reviews after/during projects — **supervisor → member** (reliability, communication, contribution, deadlines) and **member → supervisor** (communication, supervision, teaching, fair authorship).
- [ ] Aggregate `reliability_score` onto profiles.
- [ ] Badges: **New Researcher** (auto), **Research Mentor** (6-month validity, persists as history), **Project Lead**.
- [ ] Beginner-friendly listings get visibility boost in search ordering.

**Done when:** a completed project produces reviews and a visible reliability score.

---

## Phase 6 — Matching & Polish (2–4 days)
Goal: fairness mechanics + launch readiness.

- [ ] Applicant ranking for listers: weighted score over reliability, motivation, availability, relevant skills, **beginner boost**, prior experience (not sole factor). Pure server-side scoring — **no ML needed**.
- [ ] Optional **anonymous first-review mode** (hide university/publications initially).
- [ ] Empty states, loading states, mobile-responsive pass, accessibility check.

**Done when:** a lister sees applicants ranked fairly with beginners boosted.

---

## Phase 7 — Pre-Launch (2–3 days)
Goal: legal + content before real users.

- [ ] **About/Ethos page** — use the text from the plan (§1).
- [ ] **Usage policy, Privacy Policy, Terms** — required (UK GDPR; you handle healthcare professionals' data).
- [ ] Cookie/consent banner.
- [ ] Seed a handful of real listings (partner with 1–2 societies first — plan §13).
- [ ] Set up a **weekly cron ping** so the free Supabase project never auto-pauses.
- [ ] Basic analytics for key metrics (§14): active listings, applications/listing, complete-profile %.

**Done when:** a stranger can land on the site, understand the ethos, and trust it.

---

## Explicitly DEFERRED (don't build yet — your plan agrees)
- Pricing tiers / Premium / Elite (Stripe) — §8
- Ads & featured listings — §8/§14
- Native mobile app (Expo/React Native reuses your TS) — revisit after traction
- Mentor admin tooling (checklists, auto-reminders) — §7 admin
- Leaderboards / "Top Mentor 2026" automation — §11

---

### Rough total
~**4–6 weeks of focused solo evenings/weekends** to a launchable MVP (Phases 0–7). Cost so far: **the domain only.**
