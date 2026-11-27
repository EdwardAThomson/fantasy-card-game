# Rooms worker

The server side of online 2-player play: a Cloudflare Worker with one Durable
Object per room. See `/mnt/project-files/lobby-plan/lobby-plan.md` (project
files) for the full plan; this directory is the Phase 2 sketch.

## What is here

| File | Purpose |
|------|---------|
| `wrangler.toml` | Worker config and the `Room` Durable Object binding |
| `SETUP.md` | One-off Cloudflare and GitHub steps to deploy it |
| `package.json` | `npm run dev` / `deploy` / `check` (wrangler) |
| `src/index.js` | `POST /api/rooms` (create, returns a 5-letter code) and `GET /ws/:code` (WebSocket) |
| `src/Room.js` | The room: seats, sockets, lobby, authoritative match, pick timer, reconnect grace, cleanup |

The rules themselves are **not** duplicated here. `Room.js` imports
`src/engine/match.js`, `src/gameEngine.js` and `src/creatures.js` from the
React app, and wrangler bundles them, so browser and server always run the
same engine.

The message protocol is in `src/engine/protocol.js`, shared with the client
hook `src/online/useOnlineMatch.js`.

## How a match runs

1. Both players connect with `hello`. The first message back is `welcome`
   with a seat (`p1`/`p2`) and a token the browser keeps in `sessionStorage`
   so a refresh or dropped connection takes the same seat back.
2. Each player sends `setDeck` (3 creature names) or `randomDeck`, then
   `ready`. The room validates decks against its own `creatures.js`.
3. When both are ready the room creates a `MatchState` with a random seed
   and starts a 60s pick timer.
4. Players send `pick` and `lock`. `viewFor` hides the opponent's pick
   until both have locked. When both are locked the room calls
   `resolveRound`, sends each side the `round` events plus its own view,
   and re-arms the timer. On timeout `makeAIDecision` picks for anyone
   not locked.
5. A player away for more than 2 minutes forfeits. Empty lobby/finished rooms
   are deleted after 10 minutes. `rematch` reuses the room.

## Running locally

```sh
cd worker
npm install
npm run dev                      # ws://localhost:8787, accepts http://localhost:3000
```

Then from the repo root `REACT_APP_ROOMS_WS=ws://localhost:8787 npm start`
and open two browser tabs.

Deploying is `npm run deploy` from `worker/`, or automatic from the
GitHub Action in `.github/workflows/deploy-worker.yml` once the secrets in
`SETUP.md` are set.

## Not done yet (Phase 2 work)

- Rate limiting on `POST /api/rooms`.
- Tests for the room (`@cloudflare/vitest-pool-workers`); so far it has been
  exercised by a two-client script against `wrangler dev` (full match, bad
  deck rejected, hidden picks, reconnect by token, third player refused).
