# AI_HANDOFF.md — Skillet Project State

> **Instructions for any AI working on this project:**
> 1. Read this whole file before making any changes.
> 2. Make changes ONE STEP AT A TIME — the user is a beginner coder and needs exact
>    file paths, exact code, and confirmation before moving to the next step.
> 3. NEVER approve/run a database migration without showing the user the exact
>    proposed SQL first and getting explicit confirmation — a near-miss data-loss
>    incident already happened once (see Bug Log).
> 4. Before adding any new data field, check ALL of: Drizzle schema, backend routes,
>    OpenAPI spec, generated types (lib/api-zod), generated client (lib/api-client-react).
> 5. When you finish a session, update the "Current Status" and "Bug Log" sections
>    below with exactly what you changed and why, so the next AI (or the same one,
>    next session) doesn't repeat work or reintroduce fixed bugs.

---

## Project Overview
**Skillet** — peer skill-sharing + campus marketplace app for university students.
- Frontend: React (`artifacts/campus-skill-share`)
- Backend: Express/TypeScript (`artifacts/api-server`)
- DB: Drizzle ORM + Postgres, on Replit
- Auth: Firebase (Google Sign-In) + custom session system (NOT Passport — see Key Learnings)
- Dev preview: `*.picard.replit.dev`
- Production: `campus-skill-share--alasqalaani1.replit.app`
- Repo: `github.com/alasqalaani/Campus-Skill-Share`

## Key Learnings (read before touching auth/db code)
- `usersTable` lives in `lib/db/src/schema/auth.ts`, NOT a separate `users.ts`.
- Session auth = custom `getSessionId(req)` / `getSession(sid)` in
  `artifacts/api-server/src/lib/auth.ts`. Never use `req.isAuthenticated()`/`req.user`
  (Passport relics from the old, removed Replit OIDC system).
- `getSessionId()` supports both cookie AND `Authorization: Bearer <token>` header.
- Dev and Production use SEPARATE databases. Running `npm run push` in the workspace
  shell only updates DEV. To migrate production, must temporarily set a
  `PROD_DATABASE_URL` secret (from Database → Settings → connection string) and run:
  `cd ~/workspace/lib/db && DATABASE_URL=$PROD_DATABASE_URL npm run push`
  — then DELETE that secret immediately after.
- **CRITICAL:** Publishing/Republishing generates its migration by comparing schema
  code against DEV's database state — not production's. If dev and prod DBs drift
  apart, the publish flow can propose DESTRUCTIVE migrations (e.g. DROP COLUMN) that
  look like they're "reverting" changes that were actually already correctly applied
  directly to production. ALWAYS sync dev's DB (`npm run push`, no PROD_DATABASE_URL)
  before republishing, and ALWAYS read the full proposed migration list before
  confirming — never approve blind.
- `usersTable.id` and `postsTable.id` are `varchar`, NOT `uuid`. Any new table with a
  foreign key to users/posts must use `varchar` for that FK column, not `uuid`.
- Route order matters in Express — specific routes (`/me`) must be defined BEFORE
  wildcard routes (`/:userId`) in the same router, or the wildcard swallows them.
- Service worker (`public/sw.js`) must ignore cross-origin requests (only intercept
  same-origin fetches) or it can break Firebase/Google auth network calls.

## Working Conventions for the User
- Beginner coder. Explain everything step by step, one change at a time, wait for
  confirmation before the next step.
- When user pastes a file, always return the FULL corrected file back — never just
  a line/snippet, they don't know how to locate and edit lines themselves.
- Budget-conscious (self-described "poor student") — always flag if a suggested
  tool/service has a cost, prefer free-tier solutions (Groq API for AI features).
- User prefers pasted code/text over screenshots when possible.

---

## Current Status (update this each session)
**Last updated by:** [AI name] on [date]

**What's confirmed working in production right now:**
- Google Sign-In (as of this morning's session — NOT yet re-verified after
  DeepSeek's redirect-based auth change, see Bug Log)
- Admin badge/avatar display
- Feed loading, Likes, Bookmarks
- Settings page: Profile fields (displayName/university/bio) save correctly
- Explore People page

**What's currently broken / in progress:**
- [fill in based on latest testing]

---

## Bug Log (append new entries at the top, don't delete old ones)

### [Date] — Google Sign-In `auth/network-request-failed` + "requested action is invalid"
- Root cause found: `public/sw.js` was intercepting ALL fetch requests including
  cross-origin calls to Firebase/Google auth servers, breaking the sign-in flow.
- Fix applied: added origin check in sw.js fetch listener to skip cross-origin requests.
- **UNVERIFIED SINCE:** DeepSeek separately switched the auth flow from
  `signInWithPopup` to `signInWithRedirect` in `firebase-client.ts` and `useAuth.ts`,
  claiming the error persists even with sw.js disabled. This needs re-verification —
  unclear if service worker was properly unregistered during that test (browsers
  don't auto-remove a service worker just because the file is renamed/deleted —
  must explicitly unregister via DevTools → Application → Service Workers).
- **NEXT STEP:** Confirm current publish state, review the redirect-based auth code
  for correctness, re-test with a genuinely clean service worker state.

### [Date] — Migration near-miss (data loss prevented)
- A republish attempt generated a migration that would have DROPPED the `preferences`
  column and reverted `category`/`role` back to enums — reversing fixes already
  applied directly to production. User caught it before confirming (migration
  preview screen), cancelled it.
- Root cause: dev database was never synced after fixes were pushed directly to
  production via `PROD_DATABASE_URL`. Publish flow compares against dev's DB state.
- Fix: ran `npm run push` (no PROD_DATABASE_URL, targeting dev) to sync dev DB to
  match the already-correct schema code. Republish after that was clean and safe.
- Verified post-fix: `preferences` column exists (jsonb) and `category` is `text`
  in production, confirmed via SQL console query.

### [Date] — "User not found" on /me despite correct session data
- Root cause: `router.get("/:userId", ...)` was defined BEFORE `router.get("/me", ...)`
  in `users.ts`. Express matched `/me` requests to the wildcard route first, with
  `userId` literally set to the string "me", so the DB query `WHERE id = 'me'` found
  nothing.
- Fix: reordered routes so `/me` (GET and PATCH) come before `/:userId`.

### [Date] — Likes/Bookmarks routes commented out
- Root cause: `likes.ts`/`bookmarks.ts` route files were fully written and correct,
  but their import/registration in `routes/index.ts` was commented out (leftover
  temp workaround from before the real schema bug — uuid/varchar mismatch on FK
  columns — was found and fixed).
- Fix: uncommented the import and `router.use()` lines in `index.ts`.

*(earlier auth-migration bug log from the original Firebase OIDC→Firebase migration
omitted here for length — see full conversation history / earlier summary docs if
needed)*

---

## Feature Roadmap (simplest → most complex, from user's wishlist)
1. ~~Comments~~ — dropped, private messaging covers this need
2. Likes — ✅ built and working
3. Bookmarks — ✅ built and working
4. Share Posts — not started
5. Follow Users — not started
6. Report/Block Users — not started
7. User Verification (Student ID) — UI only, not connected
8. Content Moderation (Admin Dashboard expansion) — not started
9. Scam Detection (via Groq API — user confirmed free tier, already used for chatbot)
10. User Badges + Reputation Score — not started
11. Marketplace Categories (Textbooks, Gadgets, Fashion, Hostel Essentials) — not started
12. Freelancing & Skills Categories (Tutor Booking, Designers, Programmers, etc.) — not started

**Differentiation ideas discussed (not yet built), to make Skillet stand out from
competing Nigerian campus marketplace apps (Campus Biz, CampusPlug, Campus Market, etc.):**
- Skill-for-skill bartering (no money) — most competitors only do goods marketplace
- AI-powered match suggestions using existing Groq integration
- "Skill Passport" — public portfolio of completed exchanges/ratings, shareable like a CV
- Course/department-specific study materials (more specific than generic categories)
- Revenue ideas: small commission on completed paid bookings, boosted/featured
  listings, premium tier, paid priority verification (all avoid upfront payment
  processor complexity — commission model is post-transaction only)

---

## Known Deployment Details
- Deployment type: Autoscale (Reserved VM not available on current free plan)
- "Made with Replit" badge + `.replit.app` URL both require paid Replit Core plan
  to remove — decision deferred until closer to public launch; alternative is
  migrating to a free host (Render/Railway/Vercel) later if desired
- Admin email: `alasqalaanichubby91@gmail.com` (in `ADMIN_EMAILS` secret, both
  dev and deployment)
- Firebase project: `skillet-app-caccd`