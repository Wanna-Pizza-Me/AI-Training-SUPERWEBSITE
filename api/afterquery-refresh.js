// Receives AfterQuery's job listings from the "Refresh AfterQuery" bookmark
// (see make-bookmarklet.js) and kicks off a redeploy that publishes them.
//
// Why a bookmark: AfterQuery put Vercel's bot challenge in front of its jobs
// API, so the daily build (and anything else scripted) gets a 429, while a
// real browser gets through. The bookmark runs inside an open
// experts.afterquery.com tab, reads the API as that page, and POSTs the raw
// payload here. This endpoint stores it in Vercel Blob and fires the same
// Deploy Hook the daily cron uses; generate-afterquery-jobs.js reads the
// newest stored payload when its live fetch fails. See MANUAL-REFRESH.md.
//
// Requires, in the Vercel project settings:
//   UPLOAD_SECRET          — the password baked into the bookmark
//   BLOB_READ_WRITE_TOKEN  — added automatically by the connected Blob store
//   DEPLOY_HOOK_URL        — shared with api/cron-refresh.js

const crypto = require('crypto');
const { put, list, del } = require('@vercel/blob');

// The bookmark's request comes from AfterQuery's page, so the browser only
// lets it read our response if we name that origin.
const ALLOWED_ORIGIN = 'https://experts.afterquery.com';
// generate-afterquery-jobs.js reads from the same prefix.
const BLOB_PREFIX = 'afterquery/';

function authorized(header, secret) {
  const given = Buffer.from(header || '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }

  // Fail closed, same as cron-refresh.js: a missing secret must never mean
  // "accept anyone", since a successful request triggers a production deploy.
  const secret = process.env.UPLOAD_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'UPLOAD_SECRET is not set; refusing to accept uploads' });
    return;
  }
  if (!authorized(req.headers.authorization, secret)) {
    res.status(401).json({ error: 'Wrong or missing password in the bookmark' });
    return;
  }

  let payload = req.body;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      payload = null;
    }
  }
  // Same "has a jobs array" check as generate-afterquery-jobs.js --from, plus
  // at least one listing it could turn into a card. Catches the bookmark being
  // clicked on a page that served a challenge or an error instead of JSON.
  const jobs = payload && Array.isArray(payload.jobs) ? payload.jobs : [];
  const usable = jobs.filter(j => j && j.id != null && j.title).length;
  if (usable === 0) {
    res.status(400).json({ error: 'That does not look like AfterQuery\'s job list (no usable listings)' });
    return;
  }

  try {
    // A random suffix gives every upload a fresh URL, so the build never reads
    // a CDN-cached copy of an older upload; older ones are deleted below.
    const blob = await put(`${BLOB_PREFIX}listings.json`, JSON.stringify(payload), {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'application/json',
    });
    const { blobs } = await list({ prefix: BLOB_PREFIX });
    const older = blobs.filter(b => b.url !== blob.url).map(b => b.url);
    if (older.length) await del(older);
  } catch (err) {
    res.status(502).json({ error: `Could not save the listings: ${err.message}` });
    return;
  }

  // The listings are saved either way; without a deploy they'd still go live
  // with tomorrow's scheduled rebuild, so report rather than fail.
  const hookUrl = process.env.DEPLOY_HOOK_URL;
  let deployTriggered = false;
  if (hookUrl) {
    try {
      deployTriggered = (await fetch(hookUrl, { method: 'POST' })).ok;
    } catch {
      deployTriggered = false;
    }
  }
  res.status(200).json({ stored: true, jobs: usable, deployTriggered });
};
