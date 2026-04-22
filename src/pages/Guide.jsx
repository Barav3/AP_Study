import { Link } from "react-router-dom";

// Guide page — user-facing walkthrough of how to plug a mini-app into a slot.
// Linked from: home header, admin panel, empty-slot state.
export default function Guide() {
  return (
    <div className="guide">
      <header className="guide-header">
        <div>
          <h1>How to upload a mini-app</h1>
          <p className="note">
            Every AP tile is a slot. A slot loads whatever web app you point it at.
            Here's the full flow — skim the quick version or read the whole thing.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/" className="btn">← Hub</Link>
          <Link to="/admin" className="btn primary">Open admin</Link>
        </div>
      </header>

      {/* Quick version */}
      <section className="card">
        <h2 style={{ marginTop: 0 }}>⚡ Quick version</h2>
        <ol className="guide-list">
          <li>Deploy any web app somewhere public (Vercel, Netlify, GitHub Pages — anywhere with a URL).</li>
          <li>Copy the URL.</li>
          <li>Go to <Link to="/admin">/admin</Link> → pick a subject → paste URL → save.</li>
        </ol>
        <p className="note">That's it. The tile is live. Everything below is detail.</p>
      </section>

      {/* Step by step */}
      <section className="card">
        <h2 style={{ marginTop: 0 }}>📖 Step by step</h2>

        <h3>1. Have (or build) a web app</h3>
        <p>
          Any site that loads in a browser works — React, Vue, plain HTML, a game, a
          flashcard app, a quiz, a simulator, a notebook. If you can open it at a URL,
          you can embed it.
        </p>
        <p className="note">
          Don't have one yet? The sibling project{" "}
          <code>aphug-practice-tests</code> in this vault is a ready-to-deploy mini-app
          you can use to fill the AP HUG slot.
        </p>

        <h3>2. Deploy it to a public URL</h3>
        <p>
          Easiest route is Vercel. From your app folder:
        </p>
        <pre className="code-block">{`npm install
npm run build
npx vercel --prod`}</pre>
        <p>
          Vercel gives you a URL like <code>your-app-abc123.vercel.app</code>. That's
          the URL you'll paste into the hub.
        </p>
        <p className="note">
          Other hosts that work fine: Netlify, Cloudflare Pages, GitHub Pages, Render,
          Railway, Surge — anywhere that serves HTTPS. Local URLs like{" "}
          <code>localhost:5173</code> only work while you're running the dev server on
          the same machine.
        </p>

        <h3>3. Sign into the admin panel</h3>
        <p>
          Go to <Link to="/admin">/admin</Link>. You'll need the Supabase
          email/password you set up during initial configuration (see{" "}
          <code>SETUP.md</code> in the repo if you haven't done this yet).
        </p>

        <h3>4. Pick the slot and paste the URL</h3>
        <ol className="guide-list">
          <li>Pick the subject from the dropdown (e.g. "AP Human Geography").</li>
          <li>Paste your deployed URL into the <strong>Deployed app URL</strong> field.</li>
          <li>Optionally tweak the icon emoji, tile color, display name, or description.</li>
          <li>Click <strong>Save slot</strong>.</li>
        </ol>

        <h3>5. Verify it loads</h3>
        <p>
          Click <strong>Preview ↗</strong> in the admin panel, or go back to the hub
          and click the tile. The app loads inside a fullscreen sandboxed iframe. Press
          Esc or click "← Hub" to come back.
        </p>
      </section>

      {/* What works */}
      <section className="card">
        <h2 style={{ marginTop: 0 }}>✅ What kinds of apps work?</h2>
        <ul className="guide-list">
          <li><strong>Anything served over HTTPS</strong> — static sites, SPAs, server-rendered apps, games.</li>
          <li><strong>Anything that allows iframe embedding.</strong> Most apps do by default. Some sites (Google, YouTube in certain modes, bank sites) block embedding on purpose.</li>
          <li><strong>Mobile-friendly apps look best</strong> — the iframe respects whatever responsive design the app has.</li>
        </ul>
      </section>

      {/* Troubleshooting */}
      <section className="card">
        <h2 style={{ marginTop: 0 }}>🛠 Troubleshooting</h2>

        <h3>The iframe is blank / shows "refused to connect"</h3>
        <p>
          The app is blocking embedding. Check its response headers — if you see
          either of these, the hub can't load it:
        </p>
        <pre className="code-block">{`X-Frame-Options: DENY
X-Frame-Options: SAMEORIGIN
Content-Security-Policy: frame-ancestors 'none'`}</pre>
        <p>
          Fix: if it's your own app, remove those headers or allow your hub's origin.
          If it's someone else's app you can't modify, that slot can't use URL mode.
        </p>

        <h3>The tile doesn't show "LIVE"</h3>
        <p>
          Make sure you clicked Save slot and the status below said "Saved." Refresh
          the hub.
        </p>

        <h3>The app loads but can't sign in / cookies don't persist</h3>
        <p>
          Third-party cookie restrictions. Apps that depend on cookie-based auth may
          not fully work inside an iframe from a different origin. Workaround: use
          token-based auth or deploy the mini-app to a subdomain of the hub.
        </p>

        <h3>Admin panel says "Supabase not configured"</h3>
        <p>
          The <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>{" "}
          env vars aren't set on Vercel. Add them in Vercel → Settings → Environment
          Variables, then redeploy.
        </p>
      </section>

      {/* Removing */}
      <section className="card">
        <h2 style={{ marginTop: 0 }}>🧹 Removing or swapping an app</h2>
        <p>
          In <Link to="/admin">/admin</Link>, pick the slot and either:
        </p>
        <ul className="guide-list">
          <li>Paste a new URL and click <strong>Save slot</strong> to swap.</li>
          <li>Click <strong>Clear deploy</strong> then <strong>Save slot</strong> to empty the slot (it'll show the empty-state message again).</li>
        </ul>
      </section>

      {/* Safety */}
      <section className="card">
        <h2 style={{ marginTop: 0 }}>🔒 Security notes</h2>
        <ul className="guide-list">
          <li>Mini-apps load in a sandboxed iframe — they can run scripts but can't access the hub's cookies, localStorage, or DOM.</li>
          <li>Only the admin (email/password on the <code>admins</code> allowlist in Supabase) can add or remove apps. Anyone else visiting <code>/admin</code> gets a login screen.</li>
          <li>You're responsible for what you embed. Anything malicious at the URL you paste will be served to whoever opens that slot.</li>
        </ul>
      </section>

      <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "center" }}>
        <Link to="/" className="btn">← Back to hub</Link>
        <Link to="/admin" className="btn primary">Open admin panel</Link>
      </div>
    </div>
  );
}
