// Writes refresh-afterquery-bookmark.html: a local page with a "Refresh
// AfterQuery" link to drag onto the browser's bookmarks bar.
//
//   node make-bookmarklet.js <UPLOAD_SECRET>
//
// The secret must match UPLOAD_SECRET in the Vercel project settings, and it
// ends up inside the bookmark itself — which is why the generated page is
// gitignored. Re-run this (and replace the bookmark) if the secret changes.
//
// Clicking the bookmark on any experts.afterquery.com page reads AfterQuery's
// jobs API as that page (a real browser passes the bot challenge that blocks
// the daily build) and POSTs it to api/afterquery-refresh.js.

const fs = require('fs');
const path = require('path');

const ENDPOINT = 'https://www.oneaitrainer.com/api/afterquery-refresh';

const secret = process.argv[2];
if (!secret) {
  console.error('Usage: node make-bookmarklet.js <UPLOAD_SECRET>');
  process.exit(1);
}

// Runs in AfterQuery's page, so it must be self-contained and plain ES2017.
function bookmark(endpoint, secret) {
  (async () => {
    if (location.hostname !== 'experts.afterquery.com') {
      alert('Open experts.afterquery.com first, then click this bookmark on that page.');
      return;
    }
    try {
      const res = await fetch('/api/jobs/listings', { credentials: 'include', cache: 'no-store' });
      if (!res.ok) throw new Error('AfterQuery returned ' + res.status);
      const body = await res.text();
      const up = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + secret },
        body,
      });
      const out = await up.json().catch(() => ({}));
      if (!up.ok) throw new Error(out.error || 'HTTP ' + up.status);
      alert(
        'Sent ' + out.jobs + ' AfterQuery jobs to One AI Trainer. ' +
          (out.deployTriggered
            ? 'The site is redeploying and will update in about a minute.'
            : 'They will go live with the next daily rebuild.')
      );
    } catch (err) {
      alert('AfterQuery refresh failed: ' + err.message);
    }
  })();
}

const code = `(${bookmark.toString()})(${JSON.stringify(ENDPOINT)}, ${JSON.stringify(secret)});`;
const href = 'javascript:' + encodeURIComponent(code);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Refresh AfterQuery bookmark</title>
<style>
  body { margin: 0; padding: 48px 16px; background: #0f1412; color: #e8ece9; font: 16px/1.55 system-ui, sans-serif; }
  main { max-width: 560px; margin: 0 auto; }
  h1 { font-size: 24px; margin: 0 0 8px; }
  p, li { color: #b9c2bd; }
  .bm { display: inline-block; margin: 20px 0 28px; padding: 12px 20px; border-radius: 10px; background: #7bd88f; color: #0f1412; font-weight: 700; text-decoration: none; cursor: grab; }
  ol { padding-left: 20px; }
  li { margin-bottom: 8px; }
  code { background: #1b2320; padding: 1px 6px; border-radius: 5px; color: #e8ece9; }
  .note { font-size: 14px; border-top: 1px solid #26302c; padding-top: 16px; margin-top: 28px; }
  h2 { font-size: 17px; margin: 32px 0 6px; }
  textarea { width: 100%; box-sizing: border-box; height: 84px; background: #1b2320; color: #e8ece9; border: 1px solid #26302c; border-radius: 8px; padding: 8px; font: 12px/1.4 ui-monospace, monospace; resize: none; }
  button { margin-top: 8px; padding: 8px 14px; border-radius: 8px; border: 1px solid #7bd88f; background: transparent; color: #7bd88f; font-weight: 600; cursor: pointer; }
</style>
</head>
<body>
<main>
  <h1>Refresh AfterQuery</h1>
  <p>Drag this button onto your bookmarks bar. Clicking it here does nothing useful; it only works on an AfterQuery page.</p>
  <a class="bm" href="${href}">Refresh AfterQuery</a>
  <h2>If dragging doesn't work</h2>
  <ol>
    <li>Click <b>Copy</b> below.</li>
    <li>Right-click your bookmarks bar and choose <b>Add page…</b></li>
    <li>Name it <code>Refresh AfterQuery</code>, paste into the <b>URL</b> box, and save. (Paste it there, not in the address bar; Chrome strips the <code>javascript:</code> start from anything pasted into the address bar.)</li>
  </ol>
  <textarea id="code" readonly>${href}</textarea>
  <button type="button" id="copy">Copy</button>
  <h2>Using it</h2>
  <ol>
    <li>Open <code>experts.afterquery.com</code> in this browser (any page; you don't need to sign in).</li>
    <li>Click <b>Refresh AfterQuery</b> in your bookmarks bar.</li>
    <li>You'll get a pop-up saying how many jobs were sent. The site updates about a minute later.</li>
  </ol>
  <p class="note">This bookmark contains the site's upload password. Keep it in your own browser and don't share it or this file. If the bookmarks bar is hidden, press Ctrl+Shift+B.</p>
</main>
<script>
  document.getElementById('copy').addEventListener('click', async e => {
    const box = document.getElementById('code');
    try {
      await navigator.clipboard.writeText(box.value);
    } catch {
      box.select();
      document.execCommand('copy');
    }
    e.target.textContent = 'Copied';
  });
</script>
</body>
</html>
`;

const outPath = path.join(__dirname, 'refresh-afterquery-bookmark.html');
fs.writeFileSync(outPath, html);
console.log(`Wrote ${outPath}`);
