# Manually refreshing AfterQuery

Five of the six sources refresh automatically every day. **AfterQuery does
not**, and can't — this is the workaround.

## Why

AfterQuery put Vercel's bot-protection challenge in front of
`experts.afterquery.com/api/jobs/listings`. A scripted request (the daily
build, curl, anything without a browser) gets:

```
HTTP/1.1 429 Too Many Requests
X-Vercel-Mitigated: challenge
```

…which is a "Vercel Security Checkpoint" page, not a rate limit. It doesn't
clear on its own, and waiting won't fix it. A normal browser loads the same
URL fine, because a browser can complete the challenge.

So the daily build logs the failure, keeps AfterQuery's previous listings,
and carries on. That's deliberate — the site stays up and the other five
sources stay fresh — but AfterQuery's listings freeze until someone runs
the steps below.

`build.js` prints a `STALE DATA WARNING` for any source that hasn't
refreshed in more than 2 days, so this won't go unnoticed again.

## Steps

1. Open this in a normal browser:
   `https://experts.afterquery.com/api/jobs/listings`

2. Save the page as `afterquery-raw.json` in this folder
   (Ctrl+S, or select all the JSON and paste it into a new file).

3. From this folder, run:

   ```bash
   node generate-afterquery-jobs.js --from afterquery-raw.json
   npm run build
   git add -A && git commit -m "Manual AfterQuery refresh" && git push
   ```

   The push triggers a Vercel deploy and the new listings go live.

`--from` runs the exact same transform as a live fetch, so a manual refresh
produces byte-identical output to an automated one. Everything else in
`npm run build` still fetches live as normal.

Once done, `afterquery-raw.json` can be deleted — it's gitignored and only
an input.

## The durable fix

You're an active AfterQuery affiliate sending them real signups, so you
have standing to just ask. Worth emailing them for either:

- an allowlist for the build (so the daily automation can reach the API), or
- a proper affiliate/jobs feed endpoint that isn't behind the challenge.

That would let AfterQuery go back to refreshing automatically like the
other five, and this file could go away.
