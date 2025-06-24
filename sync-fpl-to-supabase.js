import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// FPL APIs
const urls = {
  bootstrap: "https://fantasy.premierleague.com/api/bootstrap-static/",
  fixtures: "https://fantasy.premierleague.com/api/fixtures/",
  league: "https://fantasy.premierleague.com/api/leagues-classic/1077888/standings/?page_standings=1",
  picks: "https://fantasy.premierleague.com/api/entry/36524492/event/1/picks/",
  history: "https://fantasy.premierleague.com/api/entry/36524492/history/"
};

async function fetchAndInsert(type, url) {
  try {
    const res = await fetch(url);
    const json = await res.json();

    const { error } = await supabase
      .from("fpl_data")
      .upsert([
        {
          type,
          name: type,
          data: json,
          updated_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;
    console.log(`✅ Synced ${type}`);
  } catch (err) {
    console.error(`❌ Failed ${type}:`, err.message);
  }
}

async function sync() {
  console.log("🔄 Starting sync...");

  await fetchAndInsert("bootstrap", urls.bootstrap);
  await fetchAndInsert("fixtures", urls.fixtures);
  await fetchAndInsert("league", urls.league);
  await fetchAndInsert("picks", urls.picks);
  await fetchAndInsert("history", urls.history);

  console.log("✅ Sync complete.");
}

sync();
