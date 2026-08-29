# Hallstones — Widows Sons MBA (Buckinghamshire chapter)

A mobile-friendly web app: news/notices, ride calendar with RSVPs, photo gallery, chapter shop, and a
public "join us" form. Built with React + Vite, data stored in Supabase.

This is a real, deployable app — not the earlier throwaway prototype. Follow the steps below and you'll
have it live at a URL you can share, and people can "Add to Home Screen" so it sits on their phone like
an app icon (no App Store needed for this version).

## 1. Set up Supabase (the backend)

1. Go to [supabase.com](https://supabase.com) and create a free account + new project.
2. In your new project, open **SQL Editor → New query**, paste in the contents of
   `supabase/schema.sql` from this folder, and run it. This creates all the tables, sets up
   permissions, and adds some starter content you can edit or delete later.
3. Go to **Project Settings → API**. You'll need two values from here in a moment:
   - **Project URL**
   - **anon public** key (NOT the `service_role` key — that one must never be used in the app)
4. (Optional, for the Gallery) Go to **Storage → New bucket**, call it `gallery`, and make it
   **public**. Upload photos there, then add a row to the `gallery_items` table (via
   **Table Editor**) with the caption and the public URL of the photo (Storage will show you the
   URL when you click a file).

## 2. Configure the app

1. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
2. Fill in `.env` with the Project URL and anon key from step 1.

## 3. Run it locally (optional, to check it before deploying)

```
npm install
npm run dev
```

Open the URL it gives you (usually `http://localhost:5173`).

## 4. Deploy to Netlify

The easiest way, same as the Football Lodge sweepstake app:

1. Push this folder to a GitHub repo (or use Netlify's drag-and-drop deploy with a `dist` folder
   built via `npm run build`).
2. In Netlify: **Add new site → Import an existing project**, connect the repo.
3. Build command: `npm run build` — Publish directory: `dist` (both already set in `netlify.toml`).
4. Under **Site settings → Environment variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Netlify gives you a URL like `hallstones.netlify.app` — you can attach a custom domain
   later under **Domain settings** if you want.

Once it's live, on an iPhone: open the site in Safari → Share → **Add to Home Screen**. On Android,
Chrome will usually prompt to "Install app" automatically. Either way it opens full-screen like a
native app.

## What's real vs. what's a placeholder

- **News, Rides/RSVPs, Join requests** — fully working. Anyone using the app writes real rows to
  your Supabase project, which you can view/manage in the Supabase dashboard (Table Editor).
- **Gallery** — working, but needs photos uploading to the Storage bucket and rows added to
  `gallery_items` (see step 1.4). There's no in-app upload yet — that would be a good next feature.
- **Shop** — orders are logged to the `orders` table for an officer to action manually. There's
  **no real payment processing yet**. To take actual card payments, the cleanest option is to add
  [Stripe Checkout](https://stripe.com/docs/checkout/quickstart) — that needs a small serverless
  function (Netlify Functions work well with Supabase) to create the Checkout session securely.
  Ask if you want this built out.

## Managing content day-to-day

Everything (news posts, rides, shop items, join requests, orders) can be added, edited, or removed
directly from the **Supabase Table Editor** — no code changes needed. That's the same dashboard
where you'll review new membership requests and orders as they come in.

## Path to a native app later

If you later want this in the App Store / Play Store proper (push notifications, offline use), this
same codebase is a solid starting point for wrapping in **React Native** or **Capacitor** — a
developer can reuse the Supabase backend as-is and just rebuild the screens natively.
