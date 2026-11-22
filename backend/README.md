# Streamline backend

The REST API behind Streamline. It handles accounts and sessions, video upload and discovery, comments, likes,
subscriptions, community posts, playlists and creator statistics. It is built with Express 5, Mongoose and Zod in
strict TypeScript.

## Highlights

- **Typed end to end:** strict TypeScript, with Zod schemas validating every request's params, query and body
- **Secure sessions:** JWT access and refresh tokens in httpOnly cookies; refresh tokens are stored hashed and rotated
  on every use, and reusing an old one ends the session
- **Safe by default:** helmet, a strict CORS allow-list, origin checks on state-changing requests, rate limits (with a
  stricter one for auth), request body limits
- **Correct permissions:** only owners can change their own videos, playlists, comments and posts, and unpublished
  videos are hidden from everyone else, including inside playlists and liked videos
- **Careful uploads:** files are checked by their real signature rather than the client's MIME type, size-limited, sent
  to Cloudinary, and cleaned up on failure
- **Consistent responses:** one success shape and one error shape that includes a request ID
- **Operable:** structured logs that redact secrets, environment validation on start, graceful shutdown, a health check
  endpoint, and Swagger UI in development

## Requirements

Node.js 20+, MongoDB, and a Cloudinary account.

## Getting started

```bash
npm install
cp .env.example .env      # fill in the values
npm run dev               # http://localhost:8000
```

If the environment is invalid the server exits and lists exactly what to fix.

## Environment variables

Required:

| Variable                                                               | Notes                                        |
| ---------------------------------------------------------------------- | -------------------------------------------- |
| `MONGO_URI`                                                            | Connection string without a database name    |
| `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`                          | At least 32 characters each, and different   |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary credentials                       |

Optional (defaults in brackets):

| Variable                              | Purpose                                                               |
| ------------------------------------- | --------------------------------------------------------------------- |
| `PORT` [8000]                         | HTTP port                                                             |
| `NODE_ENV` [development]              | `development`, `test` or `production`                                 |
| `DB_NAME` [streamline]                | Database name                                                         |
| `CORS_ORIGIN` [http://localhost:5173] | Allowed web origin(s), comma separated                                |
| `ACCESS_TOKEN_EXPIRY` [15m]           | For example `15m` or `1d`                                             |
| `REFRESH_TOKEN_EXPIRY` [7d]           | For example `7d` or `10d`                                             |
| `COOKIE_SAMESITE` [lax]               | `lax`, `strict` or `none` (`none` needs production and HTTPS)         |
| `COOKIE_DOMAIN`                       | Only when sharing cookies across subdomains                           |
| `TRUST_PROXY` [0]                     | Number of proxies in front of the API                                 |
| `LOG_LEVEL` [info]                    | `debug`, `info`, `warn`, `error` or `silent`                          |
| `MAX_IMAGE_SIZE_MB` [5]               | Image upload limit                                                    |
| `MAX_VIDEO_SIZE_MB` [100]             | Video upload limit                                                    |
| `UPLOAD_TMP_DIR`                      | Temporary upload folder (defaults to the OS temp directory)           |
| `RATE_LIMIT_ENABLED` [true]           | Switch rate limiting on or off                                        |
| `RATE_LIMIT_WINDOW_MINUTES` [15]      | Rate limit window                                                     |
| `RATE_LIMIT_MAX` [600]                | Requests per window per client                                        |
| `AUTH_RATE_LIMIT_MAX` [20]            | Limit for login, register, refresh and password change                |
| `ENABLE_API_DOCS`                     | `true` or `false`; Swagger UI at `/api-docs` (on outside production)  |

## Commands

| Command                     | What it does                                                    |
| --------------------------- | --------------------------------------------------------------- |
| `npm run dev`               | Start with file watching                                        |
| `npm run build`             | Compile to `dist/`                                              |
| `npm start`                 | Run the compiled server                                         |
| `npm run typecheck`         | Type-check without emitting                                     |
| `npm run lint`              | Lint                                                            |
| `npm run format`            | Format with Prettier                                            |
| `npm test`                  | Unit tests (no database needed)                                 |
| `npm run test:integration`  | API tests against MongoDB; set `TEST_MONGO_URI` to a throw-away database |
| `npm run db:migrate-legacy` | One-time migration from the original JavaScript version         |

## API overview

All endpoints live under `/api/v1`. Successful responses look like this:

```json
{ "statusCode": 200, "data": {}, "message": "…", "success": true }
```

Errors look like this:

```json
{ "success": false, "message": "…", "errors": [{ "path": "…", "message": "…" }], "requestId": "…" }
```

| Area          | What it covers                                                                              |
| ------------- | ------------------------------------------------------------------------------------------- |
| Users         | Register, login, logout, refresh session, profile, avatar and cover, password, channel page, watch history |
| Videos        | Upload, list with search / sort / pagination, details, edit, thumbnail, publish toggle, delete |
| Comments      | List per video, add, edit, delete                                                           |
| Likes         | Toggle likes on videos, comments and posts; list liked videos                               |
| Posts (tweets)| Create, list, edit, delete, bulk delete                                                     |
| Subscriptions | Toggle a subscription, list subscribers, list subscribed channels                           |
| Playlists     | Create, list per user, details, edit, delete, add and remove videos                         |
| Dashboard     | Channel statistics and the creator's own video list                                         |

The complete contract with request and response schemas is in `openapi.yaml`, also served as Swagger UI at
`/api-docs` outside production.

## How authentication works

1. Login sets two httpOnly cookies: a short-lived access token and a longer-lived refresh token.
2. When the access token expires, the client calls the refresh endpoint. It returns a new pair and invalidates the old
   refresh token.
3. If an already-used refresh token shows up again, the session is revoked, because it suggests the token was stolen.
4. Logout revokes the stored session.

## Testing

`npm test` covers environment parsing, validators, error and log handling, the origin check, token hashing and helper
functions. `npm run test:integration` exercises the real API against MongoDB, so point it at a throw-away database
because it creates and deletes data.