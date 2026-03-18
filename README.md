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

### Vercel Blob setup

- Local: add `BLOB_READ_WRITE_TOKEN` to `.env.local`, or run `vercel env pull` after creating the Blob store in Vercel
- Production: add `BLOB_READ_WRITE_TOKEN` in Vercel Project Settings -> Environment Variables for the `Production` environment
