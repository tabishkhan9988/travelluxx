let app;
try {
  const mod = require('../dist/server.cjs');
  app = mod.default || mod;
} catch (e) {
  console.error('[Vercel] Failed to load server.cjs:', e.message);
  // Minimal fallback express app if server.cjs fails to load
  const express = require('express');
  const fallback = express();
  fallback.use((req, res) => {
    res.status(500).json({ error: 'Server initialization failed', detail: e.message });
  });
  app = fallback;
}
module.exports = app;
