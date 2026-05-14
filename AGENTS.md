# Codex Project Memory

## Trust-Critical QA Standard

The user was frustrated, fairly, after finding that the scorecard used incorrect course pars. Treat this as a standing lesson for this project and future PGA leaderboard work:

- Do not treat scoring constants as cosmetic data. Course par, hole pars, lock times, rankings, statuses, entry counts, and score totals are trust-critical.
- Before deploying scoring changes, verify trust-critical constants against an official or live source.
- Add spot checks for known truths. Example: if ESPN says a finished player shot 72 and displays +2, the app scorecard must show par 70.
- Check invariants, not just UI rendering:
  - `round score - round par = displayed score to par`
  - `counting + dropped = selected players`
  - `team total = sum(counting player scores)`
  - tied totals receive tied ranks
- Test non-happy states: not started, on course, finished, cut, WD/DQ, stale data, missing data, and mobile scorecard views.
- Before telling the user a production change is done, do a product sanity pass: would a normal user trust what they are seeing?

Plain language version: numbers, dates, scores, and statuses need proof. Do not ship those on assumptions.
