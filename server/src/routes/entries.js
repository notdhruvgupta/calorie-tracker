import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

// Get entries for a date (defaults to today)
router.get('/', async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const { rows } = await pool.query(
    'SELECT * FROM food_entries WHERE user_id = $1 AND date = $2 ORDER BY created_at',
    [req.userId, date]
  );
  res.json(rows.map(formatEntry));
});

// Create entry
router.post('/', async (req, res) => {
  const { category, dishName, items, totalCalories, date } = req.body;
  const d = date || new Date().toISOString().slice(0, 10);
  const { rows } = await pool.query(
    `INSERT INTO food_entries (user_id, date, category, dish_name, items, total_calories)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [req.userId, d, category, dishName, JSON.stringify(items), totalCalories]
  );
  res.status(201).json(formatEntry(rows[0]));
});

// Delete entry
router.delete('/:id', async (req, res) => {
  const { rowCount } = await pool.query(
    'DELETE FROM food_entries WHERE id = $1 AND user_id = $2',
    [req.params.id, req.userId]
  );
  if (rowCount === 0) return res.status(404).json({ error: 'Entry not found' });
  res.json({ ok: true });
});

function formatEntry(row) {
  return {
    id: row.id,
    category: row.category,
    dishName: row.dish_name,
    items: row.items,
    totalCalories: row.total_calories,
    date: row.date,
    createdAt: row.created_at,
  };
}

export default router;
