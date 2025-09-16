import express from 'express';
import db from '../config/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get about information (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const result = await db.getAsync(`
      SELECT id, content, skills, experience_years, created_at, updated_at
      FROM about
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (!result) {
      return res.status(404).json({ error: 'About information not found' });
    }

    // Parse skills JSON if it exists
    if (result.skills && typeof result.skills === 'string') {
      try {
        result.skills = JSON.parse(result.skills);
      } catch (e) {
        result.skills = [];
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching about information:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update about information (admin only)
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { content, skills, experience_years } = req.body;

    // First, check if about record exists - get the same record as GET endpoint
    const existingResult = await db.getAsync(`
      SELECT id FROM about
      ORDER BY created_at DESC
      LIMIT 1
    `);

    let result;
    const skillsJson = skills ? JSON.stringify(skills) : null;

    if (existingResult) {
      // Update existing record
      await db.runAsync(`
        UPDATE about 
        SET content = COALESCE(?, content),
            skills = COALESCE(?, skills),
            experience_years = COALESCE(?, experience_years),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [content, skillsJson, experience_years, existingResult.id]);
      
      result = await db.getAsync('SELECT * FROM about WHERE id = ?', [existingResult.id]);
    } else {
      // Create new record
      const insertResult = await db.runAsync(`
        INSERT INTO about (content, skills, experience_years)
        VALUES (?, ?, ?)
      `, [
        content || 'About content goes here...',
        skillsJson || JSON.stringify([]),
        experience_years || 0
      ]);
      
      result = await db.getAsync('SELECT * FROM about WHERE id = ?', [insertResult.lastID]);
    }

    // Parse skills JSON
    if (result.skills && typeof result.skills === 'string') {
      try {
        result.skills = JSON.parse(result.skills);
      } catch (e) {
        result.skills = [];
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating about information:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create about information (admin only) - for completeness
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, skills, experience_years } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if about record already exists
    const existingResult = await db.getAsync(`
      SELECT id FROM about
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    if (existingResult) {
      return res.status(409).json({ error: 'About information already exists. Use PUT to update.' });
    }

    const skillsJson = JSON.stringify(skills || []);
    const insertResult = await db.runAsync(`
      INSERT INTO about (content, skills, experience_years)
      VALUES (?, ?, ?)
    `, [content, skillsJson, experience_years || 0]);

    const result = await db.getAsync('SELECT * FROM about WHERE id = ?', [insertResult.lastID]);
    
    // Parse skills JSON
    if (result.skills && typeof result.skills === 'string') {
      try {
        result.skills = JSON.parse(result.skills);
      } catch (e) {
        result.skills = [];
      }
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating about information:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;