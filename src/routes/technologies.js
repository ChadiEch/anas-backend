import express from 'express';
import db from '../config/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all technologies (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const technologies = await db.allAsync(`
      SELECT id, name, category, icon, color, created_at, updated_at
      FROM technologies
      ORDER BY name
    `);

    res.json(technologies);
  } catch (error) {
    console.error('Error fetching technologies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single technology by ID (public)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const technology = await db.getAsync(`
      SELECT id, name, category, icon, color, created_at, updated_at
      FROM technologies
      WHERE id = ?
    `, [id]);

    if (!technology) {
      return res.status(404).json({ error: 'Technology not found' });
    }

    res.json(technology);
  } catch (error) {
    console.error('Error fetching technology:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new technology (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, category, icon, color } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const result = await db.runAsync(`
      INSERT INTO technologies (name, category, icon, color)
      VALUES (?, ?, ?, ?)
    `, [name, category, icon, color]);

    // Get the created technology
    const technology = await db.getAsync('SELECT * FROM technologies WHERE id = ?', [result.lastID]);

    res.status(201).json(technology);
  } catch (error) {
    console.error('Error creating technology:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update technology (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, icon, color } = req.body;

    const result = await db.runAsync(`
      UPDATE technologies 
      SET name = COALESCE(?, name),
          category = COALESCE(?, category),
          icon = COALESCE(?, icon),
          color = COALESCE(?, color),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, category, icon, color, id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Technology not found' });
    }

    // Get the updated technology
    const technology = await db.getAsync('SELECT * FROM technologies WHERE id = ?', [id]);

    res.json(technology);
  } catch (error) {
    console.error('Error updating technology:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete technology (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.runAsync('DELETE FROM technologies WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Technology not found' });
    }

    res.json({ message: 'Technology deleted successfully', id: id });
  } catch (error) {
    console.error('Error deleting technology:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;