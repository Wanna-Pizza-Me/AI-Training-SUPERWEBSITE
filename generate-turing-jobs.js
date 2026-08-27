// Pulls Turing's public jobs API and curates it into the JOBS shape used by
// index.html: { company, title, pay, tag, blurb, url, domain }.
// Run with: node generate-turing-jobs.js
// Writes jobs-turing.json (curated Turing listings) to this directory.

const fs = require('fs');
const path = require('path');
const { mapDomain } = require('./domain-categories');

const API_URL = 'https://work.turing.com/api/jobs/all';
const PER_GROUP_CAP = 8;

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
    pay: 'Not listed', // Turing's API doesn't expose a rate field
    tag: j.locationType === 'remote' ? 'Remote' : j.locationType === 'on-site' ? 'On-site' : 'New opportunity',
    blurb: j.oneLinerDescription || '',
    url: `https://work.turing.com/jobs?jobId=${j.id}`,
    domain: mapDomain(j.roleGroup, 'Turing'),
  }));

  const outPath = path.join(__dirname, 'jobs-turing.json');
  fs.writeFileSync(outPath, JSON.stringify(jobs, null, 2));
  console.log(`Wrote ${jobs.length} curated Turing listings to ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
