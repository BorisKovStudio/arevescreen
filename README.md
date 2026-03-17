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
