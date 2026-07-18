# Hir3d App

Recruiter-facing Hir3d application for AI-assisted job searches, candidate review, organization management, API keys, and background job monitoring.

Maintained portfolio project. The original `hir3d.one` domain is inactive; the live deployment is [hir3d-app.vercel.app](https://hir3d-app.vercel.app).

## Stack

- Next.js 16 and React 19
- TypeScript, Tailwind CSS 3, and Radix UI
- Better Auth
- Prisma with separate auth and application databases
- Vercel AI SDK with Google Gemini
- Trigger.dev for background tasks
- Turborepo and pnpm workspaces

## Requirements

- Node.js 22
- pnpm 11.13.1 (via Corepack)
- Credentials for the database, auth, AI, email, Stripe, and Trigger.dev features you use

## Local development

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
cp apps/app/.env.example apps/app/.env.local
```

Fill in the environment files, then:

```bash
pnpm db:migrate
pnpm dev
```

App: [localhost:3000](http://localhost:3000). The root `dev` script also starts Prisma Studio, Trigger.dev, and the Stripe webhook listener. Web app only:

```bash
pnpm --filter @hir3d/app dev
```

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm build` | Build all workspace packages |
| `pnpm lint` | Lint the workspace |
| `pnpm check-types` | TypeScript checks |
| `pnpm db:migrate` | Generate clients and run Prisma migrations |
| `pnpm format` | Format TypeScript and Markdown |

## Workspace

```text
apps/app                  Next.js application
packages/ai               Shared AI SDK helpers
packages/database/app     Application Prisma schema and client
packages/database/auth    Authentication Prisma schema and client
packages/tasks            Trigger.dev tasks
```

## Deployment

Linked to the `hir3d-app` Vercel project. Builds from the repo root with Node.js 22 and pnpm 11. Production env vars should match the checked-in `.env.example` files.

Set `BETTER_AUTH_ADMIN_USER_IDS` to a comma-separated list of Better Auth user IDs that should have admin access. Leave it empty for public clones (default: no admins).

## License

MIT — see [LICENSE](./LICENSE).

## Related repositories

| Repo | Role |
| --- | --- |
| [hir3d-one/web](https://github.com/hir3d-one/web) | Marketing / portfolio site |
| [hir3d-one/upload](https://github.com/hir3d-one/upload) | Candidate CV upload portal |
| [hir3d-one/cli](https://github.com/hir3d-one/cli) | Dev CLI for ingestion and search |
