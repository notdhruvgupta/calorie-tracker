import 'dotenv/config';
import pool from './pool.js';

const SQL = `
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  daily_goal  INT NOT NULL DEFAULT 2000,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS food_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  category      TEXT NOT NULL CHECK (category IN ('Breakfast','Lunch','Dinner','Snack')),
  dish_name     TEXT NOT NULL,
  items         JSONB NOT NULL DEFAULT '[]',
  total_calories INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_entries_user_date ON food_entries(user_id, date);
`;

try {
  await pool.query(SQL);
  console.log('Migration complete');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  await pool.end();
}
