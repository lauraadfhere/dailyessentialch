This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Content backend

The journal reads published content directly from the configured Parse Server. The browser calls the same-origin `/api/posts` endpoint, so the Parse REST key stays on the server. `Article`, legacy `BlogPost`, and `Note` records are supported; a record needs a `slug` and `title`, and is shown when its `status` is empty or `published`, `publish`, `live`, or `public`.

Post pages use the same live source. Comments are saved to Parse as unapproved `Comment` records, so they only display after moderation.

Book pages live at `/<locale>/books/<slug>` and read approved reviews from the Parse `Review` class. New reviews are saved unapproved; approve, reply to, or hide them in Admin → Book reviews. Author replies are `Review` records with `isAdminReply: true` and `parentReviewId` pointing at the review they answer, so the class needs `bookSlug`, `userName`, `rating`, `title`, `content`, `isApproved`, `isDeleted`, `isAdminReply`, and `parentReviewId` fields (Parse creates them on first write).

Copy `.env.example` to `.env.local` and supply the production credentials. `NEXT_PUBLIC_SITE_URL` is the public origin used for canonicals, hreflang alternates, Open Graph URLs, `sitemap.xml` and `robots.txt`; it defaults to `https://dailyessential.ch` when unset. `.env.local` is ignored by git. Set the same server-side `PARSE_*` and `R2_*` values in the deployment provider; do not expose `PARSE_MASTER_KEY`, `PARSE_REST_KEY`, or any R2 access key as `NEXT_PUBLIC_*` values.

`R2_PUBLIC_URL` is reserved for public media delivered from the Cloudflare R2 bucket. Files should be uploaded under stable object keys and their public URL stored in Parse (`coverImage`, `imageUrl`, or a Media record URL). Cloudflare account configuration, DNS, and bucket permissions must be completed in the Cloudflare dashboard because this repository does not have credentials for that account’s control-plane API.

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
