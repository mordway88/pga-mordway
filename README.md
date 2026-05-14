# PGA Championship Fantasy Leaderboard

React/Vite fantasy golf leaderboard for the PGA Championship pool.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Cloudflare Pages should build with:

- Build command: `npm run build`
- Build output: `dist`
- Functions directory: `functions`

The live pool entries are read from the connected Google Sheet through the Pages Function at `/api/entries`.
