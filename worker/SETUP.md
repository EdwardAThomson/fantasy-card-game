# Setting up the rooms worker on Cloudflare

One-off steps to get the online rooms server running under your own
Cloudflare account, with GitHub Actions redeploying it on every merge to
`master`. Allow about fifteen minutes.

You need: a Cloudflare account (free plan is fine), admin on this GitHub
repo, and Node 18+ on your machine for the optional local steps.

## 1. Merge the lobby PR

Merge the branch that contains `worker/` and
`.github/workflows/deploy-worker.yml` into `master`. Nothing deploys yet:
the workflow runs, finds no Cloudflare secrets, and fails. That is expected
until step 4.

## 2. Get your Cloudflare account ID

1. Sign in at https://dash.cloudflare.com.
2. Open **Compute (Workers)** in the left menu (older dashboards call it
   **Workers & Pages**).
3. The **Account ID** is on the right of the overview page. Copy it.

## 3. Create an API token for deploys

1. Go to https://dash.cloudflare.com/profile/api-tokens and click
   **Create Token**.
2. Pick the **Edit Cloudflare Workers** template and click **Use template**.
3. Under **Account Resources** choose your account. Leave the rest as it is.
4. **Continue to summary**, then **Create Token**.
5. Copy the token now; Cloudflare only shows it once.

The token can deploy workers and nothing else. If it ever leaks, roll it
from the same page.

## 4. Put both values in the GitHub repo

1. On GitHub open the repo, then **Settings → Secrets and variables →
   Actions**.
2. **New repository secret** twice:
   - Name `CLOUDFLARE_API_TOKEN`, value: the token from step 3.
   - Name `CLOUDFLARE_ACCOUNT_ID`, value: the ID from step 2.

## 5. Run the first deploy

1. On GitHub open **Actions → Deploy rooms worker → Run workflow → Run
   workflow** (on `master`).
2. When it goes green, open the job log. The last lines include the
   worker's URL, which looks like
   `https://fantasy-card-game-rooms.<your-subdomain>.workers.dev`.
   You can also find it in the Cloudflare dashboard under **Compute
   (Workers) → fantasy-card-game-rooms**.

The first deploy also creates the `Room` Durable Object class. Durable
Objects need the Workers Free or Paid plan; the free plan includes them with
SQLite storage, which is what `wrangler.toml` asks for.

From now on, any merge to `master` that touches `worker/` or the engine
files it bundles redeploys automatically. Other merges leave the worker
alone.

## 6. Tell the game where the rooms are

1. In Vercel open the **fantasy-card-game** project → **Settings →
   Environment Variables**.
2. Add `REACT_APP_ROOMS_WS` with the value from step 5, but with `wss://`
   in place of `https://`, e.g.
   `wss://fantasy-card-game-rooms.<your-subdomain>.workers.dev`.
3. Apply it to **Production** (previews can be added later, see below).
4. Redeploy the site (**Deployments → ⋯ on the latest → Redeploy**) so the
   build picks the variable up.

## 7. Check it works

Open https://fantasy-card-game.vercel.app in two browsers (or one normal
and one private window), choose **Play Online**, create a room in one and
join with the code in the other. If the second window says it cannot
connect, see the Troubleshooting section.

## Troubleshooting

- **Workflow fails with "Authentication error"**: the token or account ID
  secret is wrong or missing. Re-check step 4; secret names are case
  sensitive.
- **Workflow fails mentioning Durable Objects or a plan**: open
  **Compute (Workers) → Plans** in the Cloudflare dashboard and make sure
  the Workers Free plan is enabled for the account.
- **Game shows "Could not connect"**: the browser's origin must match
  `ALLOWED_ORIGIN` in `worker/wrangler.toml`
  (`https://fantasy-card-game.vercel.app`). If the game moves to a custom
  domain, change that value and merge; the workflow redeploys. Vercel
  preview deployments have different origins, so online play is
  production-only unless you add their origin too.
- **Nothing happens after both players ready up**: open the worker's
  **Logs** tab in the Cloudflare dashboard (Real-time logs) and try again;
  errors from `Room.js` show up there.

## Local development (optional)

```sh
cd worker
npm install
npm run dev        # rooms server on ws://localhost:8787, accepting http://localhost:3000
```

In another terminal, from the repo root:

```sh
REACT_APP_ROOMS_WS=ws://localhost:8787 npm start
```

Open http://localhost:3000 in two tabs and play against yourself. `npm run
check` in `worker/` does a dry-run build without deploying.
