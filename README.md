# a tiny gesture

A gift-sending web application built by our team at the Odyssey Hackathon in Amsterdam.
We secured 51 pre-sales before writing code, then built and shipped the project in 29 hours.
The project won the hackathon.

[Hackathon announcement](https://www.linkedin.com/feed/update/urn:li:activity:7429072421695086592/)

## What we built

- A flow for choosing a recipient and sending a gift.
- A checkout and fulfillment trigger.
- A responsive marketing page.
- Supabase-backed authentication and storage.

The stack uses Next.js 16 and TypeScript, with Tailwind CSS.
Supabase provides the database and authentication.
Stripe handles checkout and Resend handles email delivery.

## Team

This was a team build.
Daniel Puri drove the pre-sales work.
See the announcement for team credits.

## Local development

```bash
npm install
npm run dev
```

Supabase configuration is required for the application features.
Inspect [`src/`](src/) and [`supabase/`](supabase/) before connecting a project.

The historical project URL was `https://www.atinygesture.com`.
Current service availability is not established by this repository.
