# arevescreen

Next.js adaptation of the current Areve Screen marketing site.

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run db:migrate`
- `npm run db:studio`

## Admin

- Route: `/admin`
- Database: Prisma Postgres / PostgreSQL
- First admin is created automatically from `.env` values `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- On Vercel the app supports `DATABASE_URL`, `PRISMA_DATABASE_URL`, and `POSTGRES_URL`
- Hero slides can be uploaded from `/admin` and stored in Vercel Blob using `BLOB_READ_WRITE_TOKEN`
- Contact form submissions are sent server-side through `SMTP2GO` to `info@areve.us`

### Vercel Blob setup

- Local: add `BLOB_READ_WRITE_TOKEN` to `.env.local`, or run `vercel env pull` after creating the Blob store in Vercel
- Production: add `BLOB_READ_WRITE_TOKEN` in Vercel Project Settings -> Environment Variables for the `Production` environment

### Contact Form Email

- Provider: `SMTP2GO`
- Required env vars: `SMTP2GO_API_KEY`, `SMTP2GO_SENDER_EMAIL`
- Optional env var: `SMTP2GO_API_BASE_URL` defaults to `https://api.smtp2go.com/v3/`
- Recipient env var: `CONTACT_FORM_RECIPIENT_EMAIL`
- For this project set `CONTACT_FORM_RECIPIENT_EMAIL=info@areve.us`

### Vercel Email Setup

- Add `SMTP2GO_API_KEY` in Vercel Project Settings -> Environment Variables
- Add `SMTP2GO_SENDER_EMAIL=info@boriskov.com`
- Add `CONTACT_FORM_RECIPIENT_EMAIL=info@areve.us`
- Add `SMTP2GO_API_BASE_URL=https://api.smtp2go.com/v3/` if you want the value explicit in Vercel as well
