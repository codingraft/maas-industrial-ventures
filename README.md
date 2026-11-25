# Running MAAS

Use Node 22.13 or newer with built-in SQLite support. Install the lockfile with `npm ci`, copy `.env.example` to `.env.local` and provide explicit ADMIN_USERNAME, ADMIN_PASSWORD and a strong random ADMIN_SECRET. Start locally with `npm run dev`.

Public pages and admin HTTP routes live under app/. Interactive UI lives in components/. Database access and settings normalization live in lib/db.ts. ENGINEERING-AUDIT.md records feature ownership, risk and verification evidence.

Without MONGODB_URI a local installation writes to data/maas.db. SQLITE_DATA_DIR selects another local directory. Hosted instances require durable Mongo storage and Cloudinary for uploads. Configure MONGODB_DB, the Cloudinary variables, and optional enquiry webhook in the hosting environment. Protect both database and media backups. Never commit local environment values.

Run lint, typecheck, production build and tests with `npm run lint`, `npm run typecheck`, `npm run build` and `npm test` in that order. Tests start production servers bound to loopback using temporary databases. Rebuild after source changes. For a local production preview use `npm start`.

Before release, inventory any leads or CMS edits written to older SQLite fallbacks. Back up Mongo and persistent SQLite independently, restore to an isolated environment, and compare counts and IDs. Stop older enquiry writers before enabling the new Mongo counter. For rollback, drain writers, restore the previous application revision and verify newly received enquiries are retained. Reconcile counters with the highest allocated numeric ID before re-enabling new writers after a rollback. Rotate any credentials previously shared outside the deployment environment. Deployment and recovery drills require a designated target and owner.
