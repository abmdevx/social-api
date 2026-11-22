# Streamline

A video sharing and community platform: Express 5 + MongoDB backend and a React 19 frontend, both in strict TypeScript.
The UI uses Tailwind CSS v4, shadcn/ui (Radix) and Lucide icons, with light, dark and system themes.

Features: registration and login, video feed / trending / search, watch page with likes and comments, channels
(videos, community posts, playlists), subscriptions, watch history, liked videos, playlists, a creator Studio
(stats, upload with progress, edit, thumbnail change, publish toggle, delete) and account settings.

## Getting started

Requirements: Node.js 20+, a MongoDB instance, a Cloudinary account.

```bash
npm run install:all
cp backend/.env.example backend/.env      # then fill in the values (see below)
cp frontend/.env.example frontend/.env    # optional – the dev proxy works without it
npm run dev                               # API on :8000, web on :5173
```

Generate the two JWT secrets with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
The API refuses to start with a readable message if the environment is invalid.

If you are upgrading an existing database, run `npm --prefix backend run db:migrate-legacy` once
(see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#database-migration)). All users must sign in again.

## Scripts (run from the repo root)

| Command                                     | Does                                                                              |
| ------------------------------------------- | --------------------------------------------------------------------------------- |
| `npm run dev`                               | API (tsx watch) and web (Vite) together                                           |
| `npm run typecheck`                         | `tsc` for backend and frontend                                                    |
| `npm run lint`                              | ESLint for both                                                                   |
| `npm test`                                  | Backend unit tests + frontend unit tests                                          |
| `npm run build`                             | Compile backend to `backend/dist`, build frontend to `frontend/dist`              |
| `npm --prefix backend run test:integration` | API tests against a real MongoDB (`TEST_MONGO_URI` required, use a throw-away DB) |

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) – structure, request flow, auth design, frontend layout, deployment notes
- [docs/SECURITY.md](docs/SECURITY.md) – what was fixed, what is still open, and what has and has not been verified
- `backend/openapi.yaml` – API contract (served by the backend in development)
