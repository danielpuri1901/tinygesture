# a tiny gesture

> **Winner — The Odyssey Hackathon, Amsterdam 2026.**
> 51 pre-sales before writing a single line of code. Built and launched in 29 hours. Judged on traction. ([writeup](https://www.linkedin.com/posts/danielpuri_we-won-amsterdams-the-odyssey-hackathon-share-7428919681983340544-Pahi))

**Live:** [atinygesture.com](https://www.atinygesture.com)

A small web app for sending a thoughtful gift on someone's behalf — the "tiny gesture" — without the friction of traditional gifting flows. Built end-to-end in a weekend.

## Stack

- **Frontend:** Next.js 15 · TypeScript · Tailwind CSS
- **Backend:** Supabase (Postgres + auth + storage)
- **Hosting:** Vercel

## What was built in 29 hours

- End-to-end gift-sending flow (recipient capture → payment → fulfilment trigger)
- Supabase schema + auth + storage
- Responsive marketing surface + checkout
- Live deployment with the production URL above

## Team

Hackathon team build. See the [LinkedIn writeup](https://www.linkedin.com/posts/danielpuri_we-won-amsterdams-the-odyssey-hackathon-share-7428919681983340544-Pahi) for credits.

## Local development

```bash
npm install
npm run dev
# open http://localhost:3000
```

Supabase env vars are required for a fully-working build — see `src/` and `supabase/` for the schema.

---

Maintained by [Daniel Puri](https://github.com/danielpuri1901). See [my profile](https://github.com/danielpuri1901) for other shipped work.
