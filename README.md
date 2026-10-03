# PlayNexus

PlayNexus is a competitive gaming social platform built with Next.js, React, Tailwind CSS, MongoDB or PostgreSQL, JWT authentication, and Drizzle ORM.

## Requirements

- Node.js 20.19 or later
- A MongoDB Atlas or PostgreSQL database for any persistent deployment

## Run locally

1. Copy `.env.example` to `.env.local` and set the required values.
2. Install dependencies with `npm install`.
3. Start the development server with `npm run dev`.

The app has a local file-backed fallback for development only. It is not a production data store.

## Deploy on Vercel

1. Import this GitHub repository in [Vercel](https://vercel.com/new). Vercel detects Next.js automatically; no `vercel.json` is required.
2. In **Settings → Environment Variables**, set the following for Production, Preview, and Development as appropriate:

   ```env
   # Set exactly one persistent database connection
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/playnexus?retryWrites=true&w=majority
   # or DATABASE_URL=postgresql://<username>:<password>@<host>/<database>?sslmode=require

   # Use a unique random secret; never reuse the example value.
   JWT_SECRET=<a-long-random-secret>
   ```

3. Optional: create the initial administrator during the first seed by setting all three values below. Remove `ADMIN_PASSWORD` after the account has been created.

   ```env
   ADMIN_USERNAME=<administrator-username>
   ADMIN_EMAIL=<administrator-email>
   ADMIN_PASSWORD=<strong-unique-password>
   ```

4. Deploy. Vercel runs `npm run build` automatically.

Do not deploy without a database connection: Vercel serverless filesystems are ephemeral, so the development fallback cannot retain user data.

## Checks completed before publishing

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Production dependency audit

The project pins Next.js 16.3.8 and matching `eslint-config-next` 16.3.8, which address the advisories reported for the prior Next.js release.
