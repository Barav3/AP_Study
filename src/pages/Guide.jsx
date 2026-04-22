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
        <h2 style={{ marginTop: 0 }}>⚡ Quick version — pick one</h2>
        <p style={{ marginTop: 0 }}>There are two ways to fill a slot:</p>
        <ol className="guide-list">
          <li>
            <strong>In-house (easiest):</strong> paste an HTML file's code or upload a <code>.html</code> file
            in <Link to="/admin">/admin</Link>. The hub hosts it for you.
          </li>
          <li>
            <strong>Hosted URL:</strong> deploy a web app to Vercel/Netlify/etc, then paste its URL into
            <Link to="/admin"> /admin</Link>.
          </li>
        </ol>
        <p className="note">
          In-house is simplest for small apps (single-file HTML/CSS/JS). Hosted URL is
          right for bigger apps like React builds that span multiple files.
        </p>
      </section>

      {/* In-house option */}
      <section className="card">
        <h2 style={{ marginTop: 0 }}>🏠 Option A — In-house (paste or upload HTML)</h2>
        <p>
          You don't need any external host. Write (or find) a single-file HTML app and
          drop it right into the hub.
        </p>

        <h3>1. Make a single-file HTML app</h3>
        <p>Anything that fits in one <code>.html</code> file works:</p>
        <pre className="code-block">{`<!doctype html>
<html>
  <head><title>Flashcards</title></head>
  <body>
    <h1>My tiny study app</h1>
    <button id="b">Click me</button>
    <style>body { font-family: sans-serif; padding: 24px; }</style>
    <script>
      document.getElementById('b').onclick = () => alert('Hello from the hub!');
    </script>
  </body>
</html>`}</pre>
        <p className="note">
          Allowed: inline <code>&lt;style&gt;</code>, inline <code>&lt;script&gt;</code>,
          data-URI images (<code>&lt;img src="data:image/png;base64,..."&gt;</code>),
          and fetches to public HTTPS APIs. Not allowed: relative file references like
          <code> &lt;script src="./app.js"&gt;</code> — those would 404 because the hub
          isn't serving the file; it embeds the whole HTML as-is.
        </p>

        <h3>2. Open <Link to="/admin">/admin</Link> and switch to "Paste / upload HTML"</h3>
        <p>
          In the deploy source row, click <strong>📝 Paste / upload HTML</strong>. You'll
          see two boxes:
        </p>
        <ul className="guide-list">
          <li><strong>File picker</strong> — choose a <code>.html</code> file; its contents load into the textarea.</li>
          <li><strong>Textarea</strong> — or just paste/edit code directly.</li>
        </ul>

        <h3>3. Save and verify</h3>
        <p>Click <strong>Save slot</strong>, then <strong>Preview ↗</strong> to see it live.</p>

        <h3>Limits</h3>
        <ul className="guide-list">
          <li>Max file size: <strong>2 MB</strong>. Big enough for meaningful apps, small enough to keep the database fast.</li>
          <li>Single file only — no multi-file React/Vue builds in this mode.</li>
          <li>If your app is bigger or has a build step, use <em>Option B</em> below instead.</li>
        </ul>
      </section>

      {/* Hosted URL option */}
      <section className="card">
        <h2 style={{ marginTop: 0 }}>🌐 Option B — Hosted URL (external deploy)</h2>
        <p>For full apps with build steps, dependencies, or multiple files.</p>

        <h3>1. Have (or build) a web app</h3>
        <p>
          Any site that loads in a browser works — React, Vue, plain HTML, a game, a
          flashcard app, a quiz, a simulator, a notebook. The sibling project{" "}
          <code>aphug-practice-tests</code> in this vault is a ready-to-deploy mini-app
          you can use to fill the AP HUG slot.
        </p>

        <h3>2. Deploy it to a public URL</h3>
        <p>Easiest route is Vercel. From your app folder:</p>
        <pre className="code-block">{`npm install
npm run build
npx vercel --prod`}</pre>
        <p>
          Vercel gives you a URL like <code>your-app-abc123.vercel.app</code>. Other
          hosts that work fine: Netlify, Cloudflare Pages, GitHub Pages, Render,
          Railway, Surge — anywhere that serves HTTPS. Local URLs like{" "}
          <code>localhost:5173</code> only work while you're running the dev server on
          the same machine.
        </p>

        <h3>3. In <Link to="/admin">/admin</Link>, pick "🌐 Hosted URL" and paste</h3>
        <ol className="guide-list">
          <li>Pick the subject from the dropdown (e.g. "AP Human Geography").</li>
          <li>Click the <strong>🌐 Hosted URL</strong> tab in the deploy source row.</li>
          <li>Paste your deployed URL into the <strong>Deployed app URL</strong> field.</li>
          <li>Click <strong>Save slot</strong>. Preview with the <strong>Preview ↗</strong> button.</li>
        </ol>
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
