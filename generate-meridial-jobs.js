// Pulls Meridial's public Greenhouse job board and keeps US/Canada listings
// plus World Wide - Remote listings in English, curated into the JOBS shape
// used by index.html: { company, title, pay, tag, blurb, url, domain }.
// "English" is computed the same way Meridial's own site computes it (see
// the Greenhouse Integration script on meridial.ai/projects): the first
// "Language Proficiency" metadata value, or "English" when that's unset —
// so a handful of roles that clearly target a non-English speaker (title
// says "Albanian Language Specialist") but that Meridial left untagged will
// still come through as English here, matching what their own site shows.
// Run with: node generate-meridial-jobs.js
// Writes jobs-meridial.json to this directory.

const fs = require('fs');
const path = require('path');
const { mapDomain } = require('./domain-categories');

const API_URL = 'https://boards-api.greenhouse.io/v1/boards/agency/jobs?content=true';
const TITLE_SUFFIX = /\s*[-–]\s*Freelance( AI Trainer)? Project\s*$/i;

function getLanguage(job) {
  const entry = (job.metadata || []).find(m => m && m.name === 'Language Proficiency');
  if (!entry || entry.value == null) return 'English';
  if (Array.isArray(entry.value) && entry.value.length > 0) return String(entry.value[0]).trim() || 'English';
  return String(entry.value).trim() || 'English';
}

function isIncluded(job) {
  const loc = job.location && job.location.name;
  if (loc === 'United States of America' || loc === 'Canada') return true;
  if (loc === 'World Wide - Remote') return getLanguage(job) === 'English';
  return false;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function cleanBlurb(html) {
  let t = decodeEntities(html || '');
  t = t.replace(/<[^>]+>/g, ' ');
  t = decodeEntities(t); // entities can be double-encoded in this feed
  t = t.replace(/\s+/g, ' ').trim();
  if (t.length <= 190) return t;
  const cut = t.slice(0, 190);
  const lastPeriod = cut.lastIndexOf('. ');
  if (lastPeriod > 60) return cut.slice(0, lastPeriod + 1);
  const lastSpace = cut.lastIndexOf(' ');
  return cut.slice(0, lastSpace) + '…';
}

async function main() {
  const res = await fetch(API_URL, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Meridial (Greenhouse) API returned ${res.status}`);
  const data = await res.json();

  const included = data.jobs.filter(isIncluded);

  const jobs = included.map(j => ({
    company: 'Meridial',
    title: j.title.replace(TITLE_SUFFIX, ''),
    pay: 'Not listed', // Meridial's board doesn't expose a rate field
    tag: j.location.name,
    blurb: cleanBlurb(j.content),
    url: j.absolute_url,
    domain: mapDomain((j.departments && j.departments[0] && j.departments[0].name) || '', 'Meridial'),
  }));

  const outPath = path.join(__dirname, 'jobs-meridial.json');
  fs.writeFileSync(outPath, JSON.stringify(jobs, null, 2));
  console.log(`Wrote ${jobs.length} US/Canada + English World Wide Meridial listings (of ${data.jobs.length} total) to ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
