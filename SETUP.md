# Setup — click-by-click

The app is already running at **http://localhost:5174/** with the local fallback subject list. You can click around and see everything now. The only thing that won't work yet is saving deploy URLs in the admin panel — that needs Supabase.

## What I need you to do (5 minutes)

### 1. Create a Supabase project
- Go to **https://supabase.com** → sign in (use Google, it's fastest)
- Click **New project**
- Name: `ap-hub` (or whatever)
- Database password: generate one and **save it somewhere** (you probably won't need it again, but save it)
- Region: pick the closest one (e.g. `us-east-1` or `us-west-1`)
- Wait ~1 minute for it to spin up

### 2. Run the setup SQL
- In the left sidebar click **SQL Editor** → **New query**
- Open `supabase/setup.sql` in this project, copy the whole file, paste it in, click **Run**
- You should see "Success. No rows returned." or similar

### 3. Create your admin user
- Left sidebar → **Authentication** → **Users** → **Add user** → **Create new user**
- Email: `aaravmaggon@gmail.com` (must match — that's the admin email baked into the SQL)
- Password: pick one you'll remember. **This is the password you'll use to log into `/admin`.**
- Check **Auto Confirm User** so you don't have to click an email link
- Click **Create user**

### 4. Grab your API credentials
- Left sidebar → **Project Settings** (gear icon) → **API**
- Copy the **Project URL** (looks like `https://xxxxxxxxxx.supabase.co`)
- Copy the **anon / public** key (long `eyJ...` string)

### 5. Hand them back to me
Paste them into chat like this:
```
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

I'll write them into `.env`, restart the dev server, and verify end-to-end that:
- Home grid loads from Supabase
- `/admin` login works
- Saving a deploy URL to a slot persists + renders the iframe

## What's safe to share
The **anon key** is a public key meant for client-side code. It's designed to be shipped in browser bundles. Sharing it in this chat is fine — RLS is what actually protects your data, and the schema we just applied sets that up correctly.

The **database password** from step 1 is different — don't share that. You won't need it for this app.
