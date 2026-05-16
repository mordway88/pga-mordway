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
npm run build
npx wrangler deploy
```

Tournament setup lives in `src/config/tournamentConfig.js`.
