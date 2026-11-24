
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

async function apiFootball(endpoint) {
  if (!API_KEY) {
    throw new Error("API_FOOTBALL_KEY não configurada no Render");
  }

  const response = await fetch(BASE_URL + endpoint, {
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error("API-Football HTTP " + response.status);
  }

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(JSON.stringify(data.errors));
  }

  return data;
}

// Página inicial
app.get("/", (req, res) => {
  res.json({
    name: "PLAZZ FC API",
    status: "ok",
    routes: [
      "/api/fixtures?date=YYYY-MM-DD",
      "/api/live",
      "/api/leagues?season=YYYY",
      "/api/standings?league=ID&season=YYYY",
      "/api/teams?league=ID&season=YYYY",
      "/api/players?team=ID&season=YYYY"
    ]
  });
});

// Jogos por data
app.get("/api/fixtures", async (req, res) => {
  try {
    const date = req.query.date;

    if (!date) {
      return res.status(400).json({ error: "Informe a data" });
    }

    const data = await apiFootball(
      "/fixtures?date=" + encodeURIComponent(date)
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Jogos ao vivo
app.get("/api/live", async (req, res) => {
  try {
    const data = await apiFootball("/fixtures?live=all");
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Competições
app.get("/api/leagues", async (req, res) => {
  try {
    const season = req.query.season || 2026;
    const data = await apiFootball(
      "/leagues?season=" + encodeURIComponent(season)
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Classificação
app.get("/api/standings", async (req, res) => {
  try {
    const { league, season } = req.query;

    if (!league || !season) {
      return res.status(400).json({
        error: "Informe league e season"
      });
    }

    const data = await apiFootball(
      "/standings?league=" + encodeURIComponent(league) +
      "&season=" + encodeURIComponent(season)
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Times
app.get("/api/teams", async (req, res) => {
  try {
    const { league, season } = req.query;

    if (!league || !season) {
      return res.status(400).json({
        error: "Informe league e season"
      });
    }

    const data = await apiFootball(
      "/teams?league=" + encodeURIComponent(league) +
      "&season=" + encodeURIComponent(season)
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Jogadores de um time
app.get("/api/players", async (req, res) => {
  try {
    const { team, season } = req.query;

    if (!team || !season) {
      return res.status(400).json({
        error: "Informe team e season"
      });
    }

    const data = await apiFootball(
      "/players?team=" + encodeURIComponent(team) +
      "&season=" + encodeURIComponent(season)
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log("PLAZZ FC API rodando na porta " + PORT);
});
                                  
