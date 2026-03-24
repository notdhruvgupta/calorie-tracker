import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

// Weekly analytics — last 7 days
router.get('/weekly', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT
       date,
       SUM(total_calories) AS total_calories,
       SUM((SELECT SUM((i->>'protein')::int) FROM jsonb_array_elements(items) i)) AS total_protein,
       SUM((SELECT SUM((i->>'carbs')::int) FROM jsonb_array_elements(items) i)) AS total_carbs,
       SUM((SELECT SUM((i->>'fat')::int) FROM jsonb_array_elements(items) i)) AS total_fat,
       COUNT(*)::int AS entry_count
     FROM food_entries
     WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '6 days'
     GROUP BY date
     ORDER BY date`,
    [req.userId]
  );

  // Fill in missing days with zeroes
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = rows.find((r) => r.date.toISOString().slice(0, 10) === key);
    days.push({
      date: key,
      totalCalories: found ? Number(found.total_calories) : 0,
      totalProtein: found ? Number(found.total_protein || 0) : 0,
      totalCarbs: found ? Number(found.total_carbs || 0) : 0,
      totalFat: found ? Number(found.total_fat || 0) : 0,
      entryCount: found ? found.entry_count : 0,
    });
  }

  const avg = days.reduce((s, d) => s + d.totalCalories, 0) / 7;
  res.json({ days, avgCalories: Math.round(avg) });
});

// Monthly analytics — last 30 days
router.get('/monthly', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT
       date,
       SUM(total_calories) AS total_calories,
       SUM((SELECT SUM((i->>'protein')::int) FROM jsonb_array_elements(items) i)) AS total_protein,
       SUM((SELECT SUM((i->>'carbs')::int) FROM jsonb_array_elements(items) i)) AS total_carbs,
       SUM((SELECT SUM((i->>'fat')::int) FROM jsonb_array_elements(items) i)) AS total_fat,
       COUNT(*)::int AS entry_count
     FROM food_entries
     WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '29 days'
     GROUP BY date
     ORDER BY date`,
    [req.userId]
  );

  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = rows.find((r) => r.date.toISOString().slice(0, 10) === key);
    days.push({
      date: key,
      totalCalories: found ? Number(found.total_calories) : 0,
      totalProtein: found ? Number(found.total_protein || 0) : 0,
      totalCarbs: found ? Number(found.total_carbs || 0) : 0,
      totalFat: found ? Number(found.total_fat || 0) : 0,
      entryCount: found ? found.entry_count : 0,
    });
  }

  const daysWithData = days.filter((d) => d.entryCount > 0);
  const avg = daysWithData.length > 0
    ? daysWithData.reduce((s, d) => s + d.totalCalories, 0) / daysWithData.length
    : 0;
  res.json({ days, avgCalories: Math.round(avg) });
});

export default router;
