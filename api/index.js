import express from 'express';
import mod from '../dist/server.cjs';

const app = mod.default || mod;

// Wrapper to catch and return unhandled errors directly in response
export default async (req, res) => {
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
