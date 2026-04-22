# IJsMadeSomeBullshit — project log

## 2026-04-19 — v0.1 scaffold

**Context.** AP exams are ~3 weeks away but the goal of this project is framework, not content. User wants a Roblox-style hub where each AP subject is a "slot" that loads whatever mini-app gets deployed to it. MemoryForge (sibling project) is the first mini-app to plug in (AP HUG slot).

**What got built:**
- Vite + React + react-router-dom + Supabase scaffold
- Canonical 40-subject AP list in `src/lib/subjects.js` (covers all current College Board AP offerings, including Art & Design variants and Capstone)
- Home grid with category filter + search, visually differentiated tiles per subject (icon + gradient)
- Subject page with sandboxed iframe loader + empty-slot fallback
- Admin page: Supabase email/password auth, subject metadata editor, URL-mode deploy (bundle-mode deferred to v1.1)
- Schema with RLS: public read on `subjects`, admin-only write gated by `admins` allowlist table

**Decisions locked in:**
- v1 = URL mode only. Bundle upload deferred. Rationale: MemoryForge is already on Vercel — zero extra work to plug in. Bundle mode adds storage + extraction + sandbox-origin complexity we don't need until someone actually wants to upload a zip.
- Admin auth via Supabase email/password (not Google OAuth like MemoryForge). Rationale: this is a single-user-for-now admin portal. Email/password is faster to set up than OAuth for a closed use case.
- `admins` allowlist table instead of "first user = admin". Rationale: safer — the anon key can sign anyone up, so "first signup" isn't a real gate.
- No `allow-same-origin` on the iframe sandbox for third-party URLs. Rationale: defensive. If we ever need cross-origin messaging, do it via postMessage with explicit origin checks, not by widening sandbox.

**Not yet done (follow-ups):**
- Install dependencies and run `npm run dev` to verify
- Create Supabase project + apply schema + set up first admin user
- Write actual `.env` with live credentials
- Deploy to Vercel
- Point AP HUG slot at MemoryForge's Vercel URL

**Open questions for future:**
- Should the iframe get a minimal postMessage channel so mini-apps can report "session completed" / "streak updated" back to the hub? Trades simplicity for unified streaks.
- Is a single-active-app-per-slot the right constraint long-term, or do we want a per-subject mini-app browser (flashcards / timeline / practice test as three tabs within AP HUG)?
