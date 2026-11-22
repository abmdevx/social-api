<p align="center">
  <img src="frontend/public/favicon.svg" alt="Streamline logo" width="96" height="96" />
</p>

<h1 align="center">Streamline</h1>

<p align="center">
  A full-stack video sharing and community platform built with React, Express and MongoDB.
</p>

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Mongoose-47a248?logo=mongodb&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white" />
</p>

---

Streamline lets creators upload videos, build a channel, post short updates and organise playlists. Viewers search and
watch videos, like and comment, subscribe to channels, and keep a personal library of history, likes and playlists.

The backend is an Express 5 + MongoDB REST API and the frontend is a React 19 single-page app. Both are written in
strict TypeScript.

## What you can do

- Create an account with an avatar and cover image, sign in and out, change your password and edit your profile
- Browse a home feed and a trending page, search videos, sort and paginate
- Watch videos, like them, and see view counts
- Comment on videos, edit or delete your comments, and like comments
- Visit channels to see their videos, community posts and playlists, and subscribe or unsubscribe
- Post short community updates, edit them, delete them one by one or in bulk, and like them
- Save videos to playlists, and edit or delete playlists
- Review your watch history, liked videos and subscriptions
- Manage your videos in Studio: see channel stats, upload with a progress bar, edit details, change the thumbnail,
  publish or unpublish, and delete
- Switch between light, dark and system themes on any screen size

## Tech stack

| Part     | Technology                                                                         |
| -------- | ---------------------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Lucide icons, React Router |
| Backend  | Node.js, Express 5, TypeScript, Mongoose, Zod, JWT, bcrypt, Multer                 |
| Database | MongoDB                                                                            |
| Media    | Cloudinary                                                                         |

## Requirements

- Node.js 20 or newer
- A MongoDB database (local or Atlas)
- A Cloudinary account

## Getting started

```bash
npm run install:all                          # install backend and frontend
cp backend/.env.example backend/.env         # fill in your values
cp frontend/.env.example frontend/.env       # optional
npm run dev                                  # API on :8000, web app on :5173
```

Create the two JWT secrets (they must be different and at least 32 characters):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Commands

| Command             | What it does                         |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Run the API and the web app together |
| `npm run build`     | Production build of both             |
| `npm run typecheck` | Type-check both                      |
| `npm run lint`      | Lint both                            |
| `npm test`          | Run the unit tests of both           |

## How it fits together

The web app talks to the API under `/api/v1`. Sign-in sets httpOnly cookies, so the browser never handles a token
directly. In development, Vite proxies `/api` to the backend, which keeps cookies same-origin without extra setup.

More detail is in [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md).

## Upgrading from the original JavaScript version

Back up your database, then run once: `npm --prefix backend run db:migrate-legacy`. Everyone has to sign in again,
because sessions now use hashed, rotating refresh tokens.

## Deployment

- Serve the web app and the API under the same registrable domain where possible, and set `CORS_ORIGIN` to the web
  app's origin.
- For a cross-site setup, use HTTPS with `NODE_ENV=production` and `COOKIE_SAMESITE=none`.
- Behind a proxy or load balancer, set `TRUST_PROXY` so rate limiting sees real client IPs.
- Build with `npm run build`, run the API with `node backend/dist/index.js`, and serve `frontend/dist` as static files
  with a fallback to `index.html`.