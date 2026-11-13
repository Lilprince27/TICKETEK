// Tiny JSON-file store: enough for a demo box office, no native dependencies.
// Data lives outside the source tree (DATA_DIR) so edits never dirty git.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSeedData } from "./seed.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(here, "data");

export const dataFile = path.join(dataDir, "db.json");

let db = null;

function persist() {
  fs.mkdirSync(dataDir, { recursive: true });
  const tmp = `${dataFile}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, dataFile);
}

function load() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (fs.existsSync(dataFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(dataFile, "utf8"));
      if (Array.isArray(parsed?.events) && Array.isArray(parsed?.bookings)) return parsed;
    } catch (error) {
      console.warn(`[ticketek] could not read ${dataFile}: ${error.message}`);
    }
  }
  db = createSeedData();
  persist();
  console.log(`[ticketek] seeded ${db.events.length} events into ${dataFile}`);
  return db;
}

export function getDb() {
  if (!db) db = load();
  return db;
}

// Mutations run one at a time inside a single process, so a seat can't be sold
// twice: availability is rebuilt from the current bookings inside the callback.
export function updateDb(mutate) {
  const current = getDb();
  const result = mutate(current);
  persist();
  return result;
}
