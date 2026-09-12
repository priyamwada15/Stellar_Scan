import type { Plugin } from 'vite';
import { getVisibleConstellation, parseTargetDate, fetchCloudCover } from './api/constellation';

/**
 * api/constellation.ts is a Vercel serverless function — Vercel's routing only exists
 * when actually deployed, or under `vercel dev`. Plain `vite dev` has no concept of the
 * /api directory, so requests to it 404. This plugin serves the same logic through Vite's
 * own dev server middleware so `npm run dev` works standalone. It only runs in dev
 * (configureServer is never invoked during `vite build`) — production continues to use
 * the real serverless function unchanged.
 */
export function apiDevPlugin(): Plugin {
  return {
    name: 'stellar-scan-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/constellation', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Content-Type', 'application/json');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            const { date, lat, lon } = parsed;
            if (!date || typeof date !== 'string') {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'INVALID_REQUEST: date field required.' }));
              return;
            }
            if (typeof lat !== 'number' || typeof lon !== 'number') {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'INVALID_REQUEST: lat/lon required for an accurate scan.' }));
              return;
            }
            const constellation = getVisibleConstellation(date, lat, lon);
            const targetDate = parseTargetDate(date);
            const cloudCover = targetDate
              ? await fetchCloudCover(lat, lon, targetDate.year, targetDate.month, targetDate.day)
              : null;
            res.statusCode = 200;
            res.end(JSON.stringify({ ...constellation, cloudCover }));
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'INVALID_REQUEST: malformed JSON body.' }));
          }
        });
      });
    },
  };
}
