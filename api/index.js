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
    res.status(500).json({ error: 'Server initialization failed', detail: e.message, stack: e.stack });
  });
  app = fallback;
}

// Wrapper to catch and return unhandled errors directly in response
module.exports = async (req, res) => {
  let activeRes = res;
  
  const errorHandler = (err) => {
    console.error('[Vercel Global Error]', err);
    if (!activeRes.headersSent) {
      activeRes.status(500).json({
        error: 'Global Runtime Error',
        message: err?.message || String(err),
        stack: err?.stack || ''
      });
    }
  };

  process.once('uncaughtException', errorHandler);
  process.once('unhandledRejection', errorHandler);

  try {
    const result = app(req, res);
    if (result && typeof result.catch === 'function') {
      await result.catch(errorHandler);
    }
  } catch (err) {
    errorHandler(err);
  } finally {
    process.off('uncaughtException', errorHandler);
    process.off('unhandledRejection', errorHandler);
  }
};
