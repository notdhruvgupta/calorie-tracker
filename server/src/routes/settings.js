import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT daily_goal FROM users WHERE id = $1', [req.userId]);
  res.json({ dailyGoal: rows[0].daily_goal });
});

router.put('/', async (req, res) => {
  const { dailyGoal } = req.body;
  if (!dailyGoal || dailyGoal < 100) return res.status(400).json({ error: 'Invalid goal' });
  await pool.query('UPDATE users SET daily_goal = $1 WHERE id = $2', [dailyGoal, req.userId]);
  res.json({ dailyGoal });
});

export default router;
