// Vercel Cron hits this endpoint on the schedule set in vercel.json.
// It doesn't regenerate any data itself — it just triggers a fresh Vercel
// deployment via a Deploy Hook, and the deployment's own build command
// (`npm run build`) is what actually re-pulls all four job sources and
// rebuilds index.html. That keeps "refresh the data" and "serve the site"
// as the same well-tested path used for every manual rebuild.
//
// Requires two environment variables, set in the Vercel project settings:
//   DEPLOY_HOOK_URL — a Deploy Hook URL from Project Settings > Git > Deploy Hooks
//   CRON_SECRET      — any random string; Vercel automatically sends it back
//                       as "Authorization: Bearer <CRON_SECRET>" on cron
//                       requests, which is how this endpoint tells a real
//                       cron trigger apart from someone just visiting the URL

module.exports = async function handler(req, res) {
  if (process.env.CRON_SECRET) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  const hookUrl = process.env.DEPLOY_HOOK_URL;
  if (!hookUrl) {
    res.status(500).json({ error: 'DEPLOY_HOOK_URL is not set' });
    return;
  }

  try {
    const hookRes = await fetch(hookUrl, { method: 'POST' });
    res.status(hookRes.ok ? 200 : 502).json({
      triggered: hookRes.ok,
      status: hookRes.status,
    });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
};
