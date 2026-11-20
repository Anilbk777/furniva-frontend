# Furniva frontend

React + TypeScript frontend for Furniva, using Vite, Tailwind CSS v4, React Router, React Query, i18next, MSW, and Vitest.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The Vite dev server proxies `/api` to `VITE_API_ORIGIN` from `.env`, so keep `VITE_API_URL=/api/v1`.

Environment variables:

- `VITE_API_ORIGIN`: backend origin used only by the Vite dev proxy and API type generation.
- `VITE_API_URL`: API base path. Use the same-origin `/api/v1` path.
- `VITE_USE_MOCKS`: set to `true` to start the MSW browser worker in development.

## Scripts

- `npm run dev`: start the dev server.
- `npm test`: run the Vitest suite.
- `npm run typecheck`: run TypeScript checks.
- `npm run lint`: run ESLint.
- `npm run build`: typecheck and build for production.

## Development auth

When `VITE_USE_MOCKS=true`, the mock backend accepts OTP `123456`. The seeded demo account is `demo@furniva.local` with password `Password1!`.

Phone numbers are exactly 10 ASCII digits without a country code. Backend 422 responses are a single string message with `data: null`; `GET /auth/me` returns flat user fields plus `organization`.

## Production API and cookies

Keep `VITE_API_URL=/api/v1` in production and configure the web server or reverse proxy to forward `/api/*` to the backend on the same origin. Do not point `VITE_API_URL` at an absolute cross-origin backend URL: the auth flow relies on same-site cookies, and a cross-origin base URL will break cookie sending and CORS behavior.

The backend must set its auth refresh cookie with `HttpOnly`, `Secure`, and an appropriate `SameSite` policy for the deployed origin. Same-host `/api/*` rewriting keeps the browser on one origin and avoids third-party-cookie restrictions.
