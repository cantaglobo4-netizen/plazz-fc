# PLAZZ FC Backend

Servidor Node.js/Express para o app PLAZZ FC, usando API-Football (API-Sports).

## Deploy no Render
- Service type: Web Service
- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Environment variable: `API_FOOTBALL_KEY` = sua chave (não publique no GitHub)

## Endpoints
- `GET /health`
- `GET /api/fixtures?date=YYYY-MM-DD`
- `GET /api/live`
- `GET /api/leagues?season=YYYY`
- `GET /api/standings?league=ID&season=YYYY`
- `GET /api/teams?league=ID&season=YYYY`
- `GET /api/players?team=ID&season=YYYY`

O backend usa cache em memória simples para reduzir chamadas à API externa. O plano da API pode limitar ligas, jogadores, chamadas ou cobertura.
