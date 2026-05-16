# Operations

## Configure a Major

Tournament setup lives in `src/config/tournamentConfig.js`. The active config is exported as `tournamentConfig`.

For a new major, update or add:

- `displayName`
- `majorName`
- `espnEventMatchers`
- `courseName`
- `coursePars`
- `firstTeeIso`
- `entryLockIso`
- `sheetId`
- `sheetName`
- `timezone`
- `roundDates`
- `prizes`

Keep inactive future majors marked with `active: false` until their sheet, course, tee times, and ESPN matcher are verified.

## Entry Sheet

Entries load from Google Sheets through `/api/entries`. The sheet ID and tab name come from `tournamentConfig`.

Expected columns:

`Timestamp | Name | Group1 | Group2 | ... | Group14`

Rows submitted after `entryLockIso` are excluded and counted as locked out.

## Scoring Refresh

Scores load through `/api/scores`, which proxies ESPN server-side. The browser does not call ESPN directly.

The app refreshes scores about every 60 seconds and stores the last successful score payload in `localStorage`. If ESPN fails after a good load, the app keeps showing the last known good data and displays a subtle warning.

## Scoring Rules

Each team has 14 golfer slots. The 10 lowest total scores count and the 4 highest are dropped.

Matched CUT, WD, and DQ golfers keep their real numeric score when ESPN provides one. Only truly missing, unmatched, blank, or duplicate-invalid slots receive the `999` review penalty. This prevents incomplete teams from looking artificially good.

## Manual Overrides

Manual status and score overrides live in `src/data/manualOverrides.js`.

Use overrides sparingly, only when ESPN data is wrong or missing. Keep the normalized player name as the key.

## Unmatched Or Duplicate Players

Open the app with `?debug=1` to see:

- unmatched players by team
- duplicate picks
- selected ESPN event
- golfer and entry counts
- last score and entry fetch times

Fix name matching in `src/lib/normalizeName.js` or correct the sheet entry if the pick itself is wrong.

## Deploy

Run:

```bash
npm run lint
npm run build
npx wrangler deploy worker.js --name pga-mordway --assets dist --domain pga.mordway.com --compatibility-date 2026-05-13 --compatibility-flag nodejs_compat
```

After deploy, verify:

- `/api/entries` returns entries
- `/api/scores` returns golfers
- the public UI is not showing simulation data
- top team totals match the sum of counting players

