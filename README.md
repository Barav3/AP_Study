# IJsMadeSomeBullshit

A Roblox-style hub for AP exam study mini-apps. Pick a subject tile, enter its world, study with whatever app is deployed to that slot.

## What it is

One web app (the **hub**) that hosts many small study apps (the **mini-apps**). Each of the 38+ AP subjects has its own "slot". The admin assigns a deployed app URL to a slot, and anyone hitting that tile gets an immersive fullscreen view of that app, sandboxed in an iframe.

The hub itself does **not** author AP content. It's a framework. Content comes from whatever gets deployed into each slot — starting with [MemoryForge](../memoryforge) for AP HUG.

## Stack

- **React + Vite** — frontend
- **react-router-dom** — routing
- **Supabase** — Postgres + Auth + (future) Storage
- **Vercel** — hosting

No 3D, no WebAssembly, no custom sandboxing infra in v1. Iframes do the heavy lifting.

## First-run setup

1. `npm install`
2. Create a Supabase project. In the SQL editor, paste `supabase/schema.sql` and run it.
3. In Supabase Auth → Users, create an email/password user for yourself.
4. In the SQL editor, add yourself as an admin:
   ```sql
   insert into public.admins (email) values ('you@example.com');
   ```
5. Copy `.env.example` → `.env` and fill in `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` from Supabase → Settings → API.
6. `npm run dev` — hub boots on `http://localhost:5174`.

## Using it

- `/` — hub home. Grid of AP tiles. Click one to enter its world.
- `/s/:subjectId` — subject page. Shows the deployed mini-app in a sandboxed iframe, or an empty-slot message if nothing's deployed yet.
- `/admin` — password-gated. Sign in, pick a subject, paste a URL, save. Slot goes live instantly.

## Day-one workflow

To make AP HUG immediately studyable with MemoryForge:

1. Sign in at `/admin`.
2. Select "AP Human Geography" from the dropdown.
3. Paste the MemoryForge Vercel URL into "Deployed app URL".
4. Save. Open `/s/ap-hug` — MemoryForge loads inside the hub.

## Deploying new mini-apps

Build any static web app you want — React, Vue, vanilla HTML. Deploy it somewhere (Vercel, Netlify, GitHub Pages, Supabase Storage). Grab the URL. Paste it into any subject slot via admin. Done.

This means you can:
- Build an AP Chem stoichiometry practice app → deploy → assign to AP Chem slot
- Build an APUSH timeline explorer → deploy → assign to APUSH slot
- Eventually open this up so other students can share their apps (future phase)

## Security model

- Subjects table is world-readable (so the hub can list tiles for anyone).
- Only admin-allowlisted emails can write to it (enforced by RLS + `admins` table).
- Embedded apps run in an iframe with a restrictive `sandbox` attribute and `referrerPolicy="no-referrer"`. No `allow-same-origin` for third-party URLs — the embedded page can't reach into the hub.
- No cross-frame messaging API in v1. Mini-apps are fully isolated.

## Roadmap

See the full plan at `C:\Users\aarav\.claude\plans\ok-planning-time-ap-reflective-koala.md` and the project log at `docs/project-log.md`.

Near-term:
- **Bundle upload mode** — upload zipped `dist/` straight into Supabase Storage
- **Themed portal transitions** — when entering a subject, play a subject-themed animation
- **Multiple apps per slot** — let one slot host several apps with a picker

Long-term:
- Public sharing + moderation
- `postMessage` API so mini-apps can report progress back to the hub (streaks across subjects)
- Pyodide slots for CS/Math subjects that want to run Python in-browser
