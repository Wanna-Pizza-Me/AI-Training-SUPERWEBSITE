// Pulls DataAnnotation's public job board (server-rendered static HTML — no
// API) and curates it into the JOBS shape used by index.html:
// { company, title, pay, tag, blurb, url, domain }.
// The board's per-job "Apply now" links carry a worker_src=ai_jobs param;
// the site's own REFERRAL_CONFIG overwrites that with the user's referral
// code client-side (same mechanism used for Mercor), so we keep the raw
// scraped apply URL (worker_src=ai_jobs) as-is here.
// Run with: node generate-dataannotation-jobs.js
// Writes jobs-dataannotation.json to this directory.

const fs = require('fs');
const path = require('path');
const { mapDomain } = require('./domain-categories');

const BASE_URL = 'https://www.dataannotation.tech';
const CONCURRENCY = 8;

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripTagsAndComments(html) {
  return decodeEntities(html.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function formatPay(raw) {
  // "$75 – $150+ / hr" -> "$75–$150+/hr", matching the rest of the site's style
  return raw.replace(/\s*–\s*/g, '–').replace(/\s*\/\s*/g, '/');
}

function parseCards(homeHtml) {
  const cardRe = /<a class="card jb-card jb-item" href="([^"]+)" data-domain="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  const cards = [];
  let m;
  while ((m = cardRe.exec(homeHtml))) {
    const [, href, domain, inner] = m;
    const titleM = inner.match(/<h2>([^<]+)<\/h2>/);
    const rateM = inner.match(/<span class="rate">([\s\S]*?)<\/span>/);
    const hiredM = inner.match(/<span class="hired">([\s\S]*?)<\/span>/);
    if (!titleM) continue;
    cards.push({
      slug: href.replace(/^\//, ''),
      href,
      domain: decodeEntities(domain),
      title: decodeEntities(titleM[1]),
      pay: rateM ? formatPay(stripTagsAndComments(rateM[1])) : 'Not listed',
      tag: hiredM ? stripTagsAndComments(hiredM[1]) : 'New opportunity',
    });
  }
  return cards;
}

function parseDetail(rawDetailHtml) {
  // The role detail content is shipped HTML-entity-encoded inside the page
  // (client hydrates it into the DOM), so it must be decoded before regex
  // matching — unlike the homepage cards, which are plain literal HTML.
  const detailHtml = decodeEntities(rawDetailHtml);
  const overviewM = detailHtml.match(/<h2>Overview<\/h2>([\s\S]*?)<\/section>/);
  let blurb = '';
  if (overviewM) {
    const paras = [...overviewM[1].matchAll(/<p>([\s\S]*?)<\/p>/g)].map(p => stripTagsAndComments(p[1]));
    blurb = paras.join(' ');
    if (blurb.length > 190) {
      const cut = blurb.slice(0, 190);
      const lastPeriod = cut.lastIndexOf('. ');
      blurb = lastPeriod > 60 ? cut.slice(0, lastPeriod + 1) : cut.slice(0, cut.lastIndexOf(' ')) + '…';
    }
  }
  const applyM = detailHtml.match(/class="btn btn-primary btn-lg rd-cta-btn" href="([^"]+)"/);
  const applyUrl = applyM ? decodeEntities(applyM[1]) : null;
  return { blurb, applyUrl };
}

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  const homeRes = await fetch(BASE_URL + '/');
  if (!homeRes.ok) throw new Error(`DataAnnotation homepage returned ${homeRes.status}`);
  const homeHtml = await homeRes.text();
  const cards = parseCards(homeHtml);
  if (cards.length === 0) throw new Error('No job cards found — DataAnnotation may have changed their markup.');

  const jobs = await mapWithConcurrency(cards, CONCURRENCY, async card => {
    const res = await fetch(BASE_URL + card.href);
    if (!res.ok) return null;
    const html = await res.text();
    const { blurb, applyUrl } = parseDetail(html);
    if (!applyUrl) return null;
    return {
      company: 'DataAnnotation',
      title: card.title,
      pay: card.pay,
      tag: card.tag,
      blurb,
      url: applyUrl,
      domain: mapDomain(card.domain, 'DataAnnotation'),
    };
  });

  const clean = jobs.filter(Boolean);
  const outPath = path.join(__dirname, 'jobs-dataannotation.json');
  fs.writeFileSync(outPath, JSON.stringify(clean, null, 2));
  console.log(`Wrote ${clean.length} DataAnnotation listings (of ${cards.length} found) to ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
