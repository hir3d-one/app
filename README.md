# Hir3d App

The main Hir3d recruitment application. It lets recruiters create AI-assisted
job searches, review candidates, manage organizations and API keys, and monitor
background jobs.

This is a maintained portfolio project. The original `hir3d.one` domain is no
longer active; the current deployment is
[hir3d-app.vercel.app](https://hir3d-app.vercel.app).

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
- pnpm 11.13.1 (declared through Corepack)
- Database, authentication, AI, email, Stripe, and Trigger.dev credentials for
  the features you plan to use

## Local development

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
cp apps/app/.env.example apps/app/.env.local
```

Fill in the required values in the copied environment files, then generate and
migrate the Prisma clients:

```bash
pnpm db:migrate
pnpm dev
```

The web application runs at [localhost:3000](http://localhost:3000). The root
development command also starts the two Prisma Studio instances, Trigger.dev,
and the Stripe webhook listener, so their respective CLIs and credentials must
be available. To run only the web application:

```bash
pnpm --filter @hir3d/app dev
```

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm build` | Build all workspace packages with Turborepo |
| `pnpm lint` | Lint the workspace |
| `pnpm check-types` | Run TypeScript checks |
| `pnpm db:migrate` | Generate clients and run both Prisma migrations |
| `pnpm format` | Format TypeScript and Markdown files |

## Workspace

```text
apps/app                  Next.js application
packages/ai               Shared AI SDK helpers
packages/database/app     Application Prisma schema and client
packages/database/auth    Authentication Prisma schema and client
packages/tasks            Trigger.dev tasks
```

## Deployment

The repository is linked to the `hir3d-app` Vercel project. Vercel builds the
workspace from the repository root with Node.js 22 and pnpm 11. The production
environment must contain the values represented by the checked-in
`.env.example` files.
