// Pulls Turing's public jobs API and curates it into the JOBS shape used by
// index.html: { company, title, pay, tag, blurb, url, domain }.
// Run with: node generate-turing-jobs.js
// Writes jobs-turing.json (curated Turing listings) to this directory.

const fs = require('fs');
const path = require('path');
const { mapDomain } = require('./domain-categories');
const { normalizePosted } = require('./posted-date');
const { markFetched } = require('./fetch-log');

const API_URL = 'https://work.turing.com/api/jobs/all';
const PER_GROUP_CAP = 8;

// Turing's API has no pay field. The "$100"/"$750" badge on each card at
// work.turing.com/jobs is `referralReward`, a referral bonus (gift icon,
// "Referral Bonus" popover), not what the role pays, so it is never used
// here. Some listings do state a rate in the title or description prose
// ("$25/hour", "Payment: $280 per approved task", "Pay up to $150/hr");
// only figures tied to an hourly or per-task unit count. Weekly totals and
// unit-less amounts ("Earn up to ~$150–$160 across both days") are skipped.
const RATE_RE =
  /(up to\s*)?~?\$(\d[\d,]*(?:\.\d+)?)(\+)?(?:\s*(?:-|–|—|to)\s*\$?(\d[\d,]*(?:\.\d+)?)(\+)?)?\s*(?:USD\s*)?(?:\/\s*(?:per\s+)?|per\s+|an\s+)?(?:ap?proved\s+)?(hr|hour|task)\b/gi;

function payFromListing(j) {
  const rates = new Set();
  for (const text of [j.title, j.description]) {
    const plain = (text || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
    for (const [, upTo, lo, loPlus, hi, hiPlus, unit] of plain.matchAll(RATE_RE)) {
      const amount = `$${lo}${loPlus || ''}` + (hi ? `–$${hi}${hiPlus || ''}` : '');
      rates.add(`${upTo ? 'Up to ' : ''}${amount}${unit.toLowerCase() === 'task' ? '/task' : '/hr'}`);
    }
  }
  // Two different rates on one listing (tiers by region, say) can't be
  // collapsed into one honest figure, so those stay unlisted too.
  return rates.size === 1 ? [...rates][0] : 'Not listed';
}

async function main() {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ pageNumber: 1, pageSize: 2000 }),
  });
  if (!res.ok) throw new Error(`Turing API returned ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error('Turing API returned success:false');
  if (typeof data.totalCount === 'number' && data.jobs.length < data.totalCount) {
    console.warn(
      `[generate-turing-jobs] Fetched ${data.jobs.length} of ${data.totalCount} total jobs — ` +
        `pageSize may need to increase.`
    );
  }

  const byGroup = {};
  for (const j of data.jobs) (byGroup[j.roleGroup || 'Other'] ||= []).push(j);

  let curated = [];
  for (const group of Object.keys(byGroup)) {
    const sorted = byGroup[group].sort(
      (a, b) => (b.featuredJob || 0) - (a.featuredJob || 0) || new Date(b.createdDate) - new Date(a.createdDate)
    );
    curated.push(...sorted.slice(0, PER_GROUP_CAP));
  }

  const jobs = curated.map(j => ({
    company: 'Turing',
    title: j.title,
    pay: payFromListing(j),
    tag: j.locationType === 'remote' ? 'Remote' : j.locationType === 'on-site' ? 'On-site' : 'New opportunity',
    blurb: j.oneLinerDescription || '',
    url: `https://work.turing.com/jobs?jobId=${j.id}`,
    domain: mapDomain(j.roleGroup, 'Turing'),
    posted: normalizePosted(j.createdDate),
  }));

  const outPath = path.join(__dirname, 'jobs-turing.json');
  // A 200 response that yields nothing almost always means the source
  // changed its API/markup, not that Turing has zero openings. Bail out
  // rather than overwriting good data with an empty file — the catch below
  // then keeps the previous snapshot and logs it.
  if (jobs.length === 0) {
    throw new Error('parsed 0 listings — refusing to overwrite existing data (source API or markup likely changed)');
  }

  fs.writeFileSync(outPath, JSON.stringify(jobs, null, 2));
  markFetched('Turing');
  console.log(`Wrote ${jobs.length} curated Turing listings to ${outPath}`);
}

main().catch(err => {
  // Exit 0 (not 1) so npm run generate's && chain keeps going even if this
  // one source is having a bad day (rate limit, timeout, brief outage) —
  // jobs-*.json for this source is only overwritten on success above, so
  // build.js falls back to this source's last-known-good snapshot instead
  // of taking the whole site down. Logged loudly so it is still visible in
  // Vercel build logs.
  console.error(`[generate-turing-jobs.js] FAILED, keeping previous jobs data for this source:`, err);
});
