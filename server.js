
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "*"
}));
app.use(express.json());

const API_KEY = process.env.API_FOOTBALL_KEY;

const BASE_URL = "https://v3.football.api-sports.io";

async function apiFootball(endpoint) {
  const response = await fetch(BASE_URL + endpoint, {
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

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

app.get("/api/fixtures", async (req, res) => {
  try {
    const date = req.query.date;
    if (!date) {
      return res.status(400).json({ error: "Informe a data" });
    }
    const data = await apiFootball("/fixtures?date=" + date);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/live", async (req, res) => {
  try {
    const data = await apiFootball("/fixtures?live=all");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/leagues", async (req, res) => {
  try {
    const season = req.query.season || 2026;
    const data = await apiFootball("/leagues?season=" + season);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/standings", async (req, res) => {
  try {
    const { league, season } = req.query;
    const data = await apiFootball("/standings?league=" + league + "&season=" + season);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/teams", async (req, res) => {
  try {
    const { league, season } = req.query;
    const data = await apiFootball("/teams?league=" + league + "&season=" + season);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/players", async (req, res) => {
  try {
    const { team, season } = req.query;
    const data = await apiFootball("/players?team=" + team + "&season=" + season);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log("PLAZZ FC rodando na porta " + PORT);
});
