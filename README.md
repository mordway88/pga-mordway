# Major Fantasy Leaderboard

React/Vite fantasy golf leaderboard for major championship pools.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Current production deploy uses Cloudflare Workers with static assets:

```bash
npx wrangler deploy worker.js --name pga-mordway --assets dist --domain pga.mordway.com --compatibility-date 2026-05-13 --compatibility-flag nodejs_compat
```

Tournament setup lives in `src/config/tournamentConfig.js`.

