This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Setup

The site has four sections — Home, Gallery, Prints, and About — all backed
by Supabase (Postgres + Storage), not hardcoded. The schema lives in
`supabase/migrations/` and is applied automatically by Supabase's GitHub
integration whenever it's pushed to `main`.

- **Home** shows whichever photo is marked as the hero (from Gallery or
  Prints).
- **Gallery** and **Prints** are each a flat, ordered set of photos.
- **About** is editable body copy plus contact details (phone, email,
  Instagram).

To run locally:

1. Copy `.env.local.example` to `.env.local`.
2. Fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the Supabase
   project's Settings > API page.
3. Pick an `ADMIN_PASSCODE` (whatever Alex will type to reach `/admin`) and
   generate `ADMIN_SESSION_SECRET` with `openssl rand -hex 32`.
4. Set the same four variables in Vercel's project settings for production.

`/admin` is where all four sections get managed — Gallery and Prints photos
get uploaded, reordered, deleted, and marked as the home hero, and About's
copy and contact details get edited. It's gated by the passcode, not a full
login — anyone with the passcode and a link can manage the site, which is
the intended scope for a single-person portfolio.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
