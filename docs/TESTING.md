# Manual Test Guide — through Phase 4 (Step 4)

What exists today: **auth + opportunities + mandates + explainable matching**, on a
Next.js web app talking to a NestJS API over PostgreSQL.

---

## 1. Run it

Two terminals (PostgreSQL must be running with the `jvsolution` DB from Step 1):

```bash
# Terminal 1 — API  → http://localhost:4000/api   (Swagger: /api/docs)
cd backend
npm run start:dev

# Terminal 2 — Web  → http://localhost:3000   (or 3001/3002 if 3000 is taken — watch the log)
cd frontend
npm run dev
```

Open the web URL the frontend log prints. Swagger UI (browse/try every API) is at
`http://localhost:4000/api/docs`.

## 2. Test accounts

Create your own via **Join**, or reuse the ones seeded during development:

| Role | Email | Password |
|---|---|---|
| Landowner | `jane@example.com` | `strongpass123` |
| Developer | `dan+m@example.com` | `strongpass123` |

(Register fresh ones any time — pick a role on the register screen.)

---

## 3. What to test (by area)

### A. Authentication (Step 2)
1. **Register** — click **Join**, pick a role (Landowner / Developer / Investor / Government),
   fill name/email/password (min 8)/country → you land on **/dashboard**.
2. **Header changes** — once logged in, the top-right shows your name + **Sign out**
   (logged out it shows **Sign in / Join**).
3. **Sign out** → returns to login; visiting **/dashboard** now redirects to **/login**.
4. **Login** — sign back in.
5. **Negative checks:** wrong password → error; duplicate email on register → error;
   password < 8 chars → blocked.

### B. Opportunities — owner side (Step 3)
Sign in as a **Landowner** (or Government).
1. Sidebar → **My opportunities** → **+ New opportunity**.
2. Complete the **4-step wizard**: Basics → Location (note the *confidential* address field)
   → Commercial → Structure & review → **Create**. It opens the detail page.
3. It’s a **DRAFT** — go back to **My opportunities**, click **Publish**.
4. **Delete** removes it (soft delete).

### C. Opportunities — public browse (Step 3)
No login needed (or any role).
1. Go to **/opportunities** (nav: **Opportunities**).
2. Use the **filters** (search, sector, owner type, risk) — the list updates.
3. Open an opportunity. As an **anonymous / non-owner** viewer you should see the
   **🔒 “Anonymous until approved”** panel — **no exact address, coords, or owner identity**.
4. Now sign in as the **owner of that opportunity** and open it again — the confidential
   **address, coordinates and owner** are revealed. *(This is the core privacy guarantee.)*

### D. Mandates + Matching (Step 4)
Sign in as a **Developer** or **Investor**.
1. Sidebar → **My mandates** → **+ New mandate**.
2. Pick target **sectors / countries / structures / owner types**, ticket-size range,
   target IRR, risk appetite → **Create mandate & see matches**.
3. On the mandate page you get **ranked matches**, each with a **0–100 Fit Score**, an
   **A/B/C/D grade**, and a **“Why this score”** breakdown (per-factor points + reasons).
4. Matched opportunities show in **public view** (confidential still hidden) — matching
   never leaks private data.
5. Try a **narrow** mandate (e.g. only sector `airport`, country `US`) → fewer/lower matches;
   a **broad** one → more/higher. The score should move logically.

### E. Access → NDA → Reveal (Step 5, completes Area 1)
This is the "anonymous until approved" loop.
1. As a **Developer** (e.g. Eve), open a published opportunity you don't own → confidential
   panel shows **Request access**. Click it (optional note) → status becomes **pending**.
2. Sign in as the **owner** → sidebar **Access requests** → **Incoming** shows the request →
   **Approve**.
3. Back as the **Developer** → sidebar **Access requests** → **My requests** → the approved row
   shows **Sign NDA & unlock** (or use the panel on the opportunity page).
4. After signing, open the opportunity → the **exact address, coordinates and owner identity are
   now revealed**. Every reveal is written to the audit log.
5. Negative checks: signing the NDA **before** approval is blocked; requesting your **own**
   opportunity is blocked; another user can't approve/see a request that isn't theirs.

### F. Roles & permissions (server-enforced)
- A **Landowner** has **My opportunities** in the sidebar; a **Developer/Investor** has
  **My mandates**. (Admins see both.)
- Via API/Swagger: an owner calling `POST /mandates` → **403**; a developer calling
  `POST /opportunities` → **403**. Accessing someone else’s item → **403/404**.

---

## 4. Bugs found & fixed during this review

| # | Issue | Fix |
|---|---|---|
| 1 | Header always showed “Sign in / Join” even when logged in | Header is now auth-aware (Dashboard + Sign out when logged in) |
| 2 | Nav linked to `/how-it-works`, `/countries`, `/structures` which 404 (Step 6) | Trimmed nav to existing routes until those pages are built |
| 3 | **Security:** register API accepted `role: "ADMIN"` (privilege escalation) | Backend now rejects self-registration as ADMIN (403) + test added |

## 5. Known limitations (by design, not bugs — coming in later steps)

- **Session length:** access tokens last 15 minutes. If you leave the app idle longer,
  you may need to sign in again — automatic token refresh is a Step 5 hardening.
- **Access request / NDA / reveal flow** (unlocking a specific opportunity’s confidential
  data for a specific developer) — **Step 5**.
- **Data Room** (documents/folders) — Step 5.
- **Public marketing pages** (home hero content, how-it-works, country intelligence,
  structures library) — **Step 6**.
- **Admin console UI** — later. (Admin API exists; admins are created directly in the DB.)
- **AI feasibility / valuation / estimate, tenders/PPP, chatbot/avatar** — Phases 2–4.
- Login extras from the reference site (email magic-link, admin PIN) — not yet; password
  auth only.

## 6. Automated tests

```bash
cd backend && npx jest      # 17 unit tests: auth, opportunity authz + confidentiality, fit-score
```
