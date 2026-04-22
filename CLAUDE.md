# IJsMadeSomeBullshit — project context for Claude

## What this is

A "Roblox-style" hub for AP exam study mini-apps. Grid of AP subject tiles → click → enter that subject's world (fullscreen sandboxed iframe loading whatever mini-app the admin deployed to that slot).

This project is a **framework**, not an AP content authoring tool. Content lives in the mini-apps that plug in. MemoryForge (sibling project) is the first mini-app — it gets assigned to the AP HUG slot.

## Stack

React + Vite + react-router-dom + Supabase (Postgres + Auth). Vercel hosting. Same shape as MemoryForge so patterns are reusable.

## File layout

```
src/
├── App.jsx              ← route shell
├── main.jsx             ← React entry
├── pages/
│   ├── Home.jsx         ← AP tile grid + category/search filters
│   ├── Subject.jsx      ← iframe loader for a slot
│   └── Admin.jsx        ← password-gated metadata + deploy editor
├── components/
│   ├── SubjectTile.jsx  ← one tile on the home grid
│   ├── SubjectFrame.jsx ← the sandboxed iframe
│   └── EmptySlot.jsx    ← empty-state when nothing's deployed
├── lib/
│   ├── supabase.js      ← client + fetchSubjects/upsertSubject/auth helpers
│   └── subjects.js      ← canonical AP_SUBJECTS list + CATEGORIES + findSubject()
└── styles/global.css    ← design tokens + components, CSS variables
supabase/schema.sql      ← subjects table + admins table + RLS
```

## Data model

`subjects` table — one row per AP. Public SELECT (so anyone can view the hub). INSERT/UPDATE gated by `admins.email` allowlist via RLS.

Key columns: `id` (slug), `name`, `short`, `icon`, `color`, `category`, `deploy_mode` (`'url' | 'bundle' | null`), `deploy_url`, `bundle_path`.

The canonical local list in `src/lib/subjects.js` is the fallback when Supabase is empty/unreachable — tiles still render.

## Security model

- iframe sandbox: `allow-scripts allow-forms allow-popups allow-downloads allow-pointer-lock` — **no `allow-same-origin`** so third-party embeds can't reach same-origin resources through us.
- `referrerPolicy="no-referrer"`.
- RLS on `subjects`: public read, admin-only write (via `admins` allowlist table).
- No cross-frame messaging API in v1. If you add one, consider origin checks carefully.

## What not to change without thinking

- The `mergeSubjects` pattern in `Home.jsx` / `Subject.jsx`: DB values win over local constants, but local always renders first. Keeps the UI working if Supabase is down.
- The `iframe sandbox` attribute in `SubjectFrame.jsx`. Widening it (especially `allow-same-origin`) is a security decision, not a UX one.
- The `admins` allowlist. Don't replace it with a "first signup becomes admin" pattern — the anon key can sign anyone up.

## Related projects

- `../memoryforge/` — flashcard mini-app. First thing to plug into the hub (assign to AP HUG slot).
- `../../LLM Wiki/wiki/synthesis/ux-study-apps-thesis.md` — the UX research that informs both projects.

## Plan reference

Full original plan: `C:\Users\aarav\.claude\plans\ok-planning-time-ap-reflective-koala.md`
