const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;
const API_KEY = process.env.API_FOOTBALL_KEY;
const API_BASE = 'https://v3.football.api-sports.io';

app.use(express.json());

// Small in-memory cache to reduce upstream API calls.
const cache = new Map();
async function footballApi(path, cacheSeconds = 60) {
  if (!API_KEY) throw new Error('API_FOOTBALL_KEY is not configured');
  const cached = cache.get(path);
  if (cached && cached.expires > Date.now()) return cached.data;
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'x-apisports-key': API_KEY }
  });
  if (!response.ok) throw new Error(`Football API returned HTTP ${response.status}`);
  const data = await response.json();
  if (data.errors && Object.keys(data.errors).length) throw new Error('Upstream API reported an error');
  cache.set(path, { data, expires: Date.now() + cacheSeconds * 1000 });
  return data;
}
app.get('/', (_req, res) => res.json({ name: 'PLAZZ FC API', status: 'ok', routes: ['/api/fixtures?date=YYYY-MM-DD', '/api/live', '/api/leagues?season=YYYY', '/api/standings?league=ID&season=YYYY', '/api/teams?league=ID&season=YYYY', '/api/players?team=ID&season=YYYY'] }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/fixtures', async (req, res) => {
  const date = req.query.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return res.status(400).json({ error: 'Provide date in YYYY-MM-DD format' });
  try { res.json(await footballApi(`/fixtures?date=${encodeURIComponent(date)}`, 60)); }
  catch (e) { res.status(502).json({ error: 'Could not retrieve fixtures', detail: e.message }); }
});
app.get('/api/live', async (_req, res) => {
  try { res.json(await footballApi('/fixtures?live=all', 30)); }
  catch (e) { res.status(502).json({ error: 'Could not retrieve live matches', detail: e.message }); }
});
app.get('/api/leagues', async (req, res) => {
  const season = req.query.season;
  if (!/^\d{4}$/.test(season || '')) return res.status(400).json({ error: 'Provide season (YYYY)' });
  try { res.json(await footballApi(`/leagues?season=${encodeURIComponent(season)}`, 3600)); }
  catch (e) { res.status(502).json({ error: 'Could not retrieve leagues', detail: e.message }); }
});
app.get('/api/standings', async (req, res) => {
  const { league, season } = req.query;
  if (!/^\d+$/.test(league || '') || !/^\d{4}$/.test(season || '')) return res.status(400).json({ error: 'Provide league ID and season (YYYY)' });
  try { res.json(await footballApi(`/standings?league=${league}&season=${season}`, 1800)); }
  catch (e) { res.status(502).json({ error: 'Could not retrieve standings', detail: e.message }); }
});
app.get('/api/teams', async (req, res) => {
  const { league, season } = req.query;
  if (!/^\d+$/.test(league || '') || !/^\d{4}$/.test(season || '')) return res.status(400).json({ error: 'Provide league ID and season (YYYY)' });
  try { res.json(await footballApi(`/teams?league=${league}&season=${season}`, 3600)); }
  catch (e) { res.status(502).json({ error: 'Could not retrieve teams', detail: e.message }); }
});
app.get('/api/players', async (req, res) => {
  const { team, season } = req.query;
  if (!/^\d+$/.test(team || '') || !/^\d{4}$/.test(season || '')) return res.status(400).json({ error: 'Provide team ID and season (YYYY)' });
  try { res.json(await footballApi(`/players?team=${team}&season=${season}`, 3600)); }
  catch (e) { res.status(502).json({ error: 'Could not retrieve players', detail: e.message }); }
});
app.listen(PORT, () => console.log(`PLAZZ FC API listening on port ${PORT}`));
