# HelpHive Web

The customer and provider website for HelpHive, served at `https://helphive.himaiz.com`. Built with Vite, React,
TypeScript and MUI; it talks to the HelpHive API at `https://api.helphive.himaiz.com`.

## Run it

Node version: see `.nvmrc` (20).

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:5173
```

| Variable                      | Purpose                                                                                                                                                                                |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL`                | API base URL. The live API only accepts browser calls from the production site, so local development needs a local API (`http://localhost:8080`, started with `NODE_ENV=development`). |
| `VITE_GOOGLE_MAPS_API_KEY`    | Google Maps key. Each key is restricted to its own site; localhost uses the "local dev" key.                                                                                           |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (test mode today).                                                                                                                                              |
| `VITE_RECAPTCHA_SITE_KEY`     | reCAPTCHA Enterprise site key for client attestation. Leave it empty locally; the key only works on `helphive.himaiz.com`.                                                             |
| `VITE_GCLOUD_BUCKET_USERS`    | Cloud Storage bucket for profile pictures (`helphive-users`).                                                                                                                          |
| `VITE_ONESIGNAL_APP_ID`       | Optional override of the OneSignal app id built into the code.                                                                                                                         |

Everything in a `VITE_` variable ships to every visitor's browser. Never put a secret in one.

| Script                      | Does                                 |
| --------------------------- | ------------------------------------ |
| `npm run dev`               | Dev server with hot reload.          |
| `npm run build`             | Type-checks, then builds to `dist/`. |
| `npm run lint` / `lint:fix` | ESLint.                              |
| `npm run format`            | Prettier over `src`.                 |

## Deployment

The shared infrastructure (API, Cloudflare zone, secrets, client attestation, data) is described in
[helphive-backend/docs/infrastructure.md](https://github.com/Helphive/helphive-backend/blob/main/docs/infrastructure.md).
This site's part, checked against the live setup on 2026-11-22:

- **Hosting:** Cloudflare Worker `helphive-web`, serving static assets from `dist/` with a single-page-app fallback
  (`wrangler.jsonc`). `workers_dev` and preview URLs are off. The old Firebase Hosting site is disabled.
- **Domain:** `helphive.himaiz.com`, a custom domain of the Worker in the shared Cloudflare zone `himaiz.com`.
- **CI:** none in this repo. Run `npm run build` and `npm run lint` before pushing.
- **CD:** Cloudflare Workers Builds deploys every push to `main`:

    | Setting         | Value                                                                                                                                                                                                     |
    | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | Branch          | `main` (preview builds off)                                                                                                                                                                               |
    | Root directory  | `/`                                                                                                                                                                                                       |
    | Watch paths     | `*` (every change)                                                                                                                                                                                        |
    | Build command   | `npm run build`                                                                                                                                                                                           |
    | Deploy command  | `npx wrangler deploy`                                                                                                                                                                                     |
    | Build variables | `NODE_VERSION` (20), `SWC_NATIVE_BINDING_CACHE_SKIP_SECURITY_CHECK` (1), `VITE_API_URL`, `VITE_GCLOUD_BUCKET_USERS`, `VITE_GOOGLE_MAPS_API_KEY`, `VITE_RECAPTCHA_SITE_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY` |

    The production values live only as build variables on the Worker (Settings > Builds); a new `VITE_` variable has
    to be added there too, or the build ships without it. `SWC_NATIVE_BINDING_CACHE_SKIP_SECURITY_CHECK=1` lets
    `@swc/core` 1.16.13 and later load in the build image, whose cache folders it otherwise refuses. Build logs are in
    the Worker's Deployments tab. There are no manual deploy steps and no preview deployments: the live API only
    accepts the production origins.

- **Rollback:** roll back to an earlier version in the Worker's Deployments tab (or `npx wrangler rollback`), or
  revert the commit on `main`.
- **Cloudflare:** the site is behind the shared `himaiz.com` zone WAF, whose rules are managed centrally in
  `maiznadeem/OracleVMOps`. It follows Pattern B for static sites: the security headers, including the Content
  Security Policy, are in `public/_headers`. The CSP's `script-src` holds the hash of the inline colour-scheme script
  in `index.html`; update it whenever that script changes.
- **Secrets:** none. The site holds only public build values; GitHub Actions secrets aren't used.
- **Bot protection:** the site gets a client pass from the API with a reCAPTCHA Enterprise score
  (`src/store/api/clientPass.ts`) and sends it as `X-Client-Pass` on the protected API routes.
- **Data:** none of its own. It reads and writes through the API, and shows profile pictures from Cloud Storage.
