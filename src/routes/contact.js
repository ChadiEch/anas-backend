import express from 'express';
import db from '../config/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get contact information (public)
router.get('/info', optionalAuth, async (req, res) => {
  try {
    const result = await db.getAsync(`
      SELECT id, email, phone, github, linkedin, address, created_at, updated_at
      FROM contact_info
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (!result) {
      return res.status(404).json({ error: 'Contact information not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching contact information:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contact information (admin only)
router.put('/info', authenticateToken, async (req, res) => {
  try {
    const { email, phone, github, linkedin, address } = req.body;

    // First, check if contact info record exists
    const existingResult = await db.getAsync('SELECT id FROM contact_info LIMIT 1');

    let result;

    if (existingResult) {
      // Update existing record
      await db.runAsync(`
        UPDATE contact_info 
        SET email = COALESCE(?, email),
            phone = COALESCE(?, phone),
            github = COALESCE(?, github),
            linkedin = COALESCE(?, linkedin),
            address = COALESCE(?, address),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [email, phone, github, linkedin, address, existingResult.id]);
      
      result = await db.getAsync('SELECT * FROM contact_info WHERE id = ?', [existingResult.id]);
    } else {
      // Create new record
      const insertResult = await db.runAsync(`
        INSERT INTO contact_info (email, phone, github, linkedin, address)
        VALUES (?, ?, ?, ?, ?)
      `, [email, phone, github, linkedin, address]);
      
      result = await db.getAsync('SELECT * FROM contact_info WHERE id = ?', [insertResult.lastID]);
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating contact information:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit contact form (public)
router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    await db.runAsync(`
      INSERT INTO contact_submissions (name, email, phone, message)
      VALUES (?, ?, ?, ?)
    `, [name, email, phone, message]);

    // Get the created submission using the lastID from the database instance
    const submission = await db.getAsync('SELECT * FROM contact_submissions WHERE id = last_insert_rowid()');

    res.status(201).json({
      message: 'Contact form submitted successfully',
      submission: submission
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all contact submissions (admin only)
router.get('/submissions', authenticateToken, async (req, res) => {
  try {
    const submissions = await db.allAsync(`
      SELECT id, name, email, phone, message, created_at, updated_at
      FROM contact_submissions
      ORDER BY created_at DESC
    `);

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get contact submission by ID (admin only)
router.get('/submissions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const submission = await db.getAsync(`
      SELECT id, name, email, phone, message, created_at, updated_at
      FROM contact_submissions
      WHERE id = ?
    `, [id]);

    if (!submission) {
      return res.status(404).json({ error: 'Contact submission not found' });
    }

    res.json(submission);
  } catch (error) {
    console.error('Error fetching contact submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete contact submission (admin only)
router.delete('/submissions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // First check if contact submission exists
    const existingSubmission = await db.getAsync('SELECT id FROM contact_submissions WHERE id = ?', [id]);
    if (!existingSubmission) {
      return res.status(404).json({ error: 'Contact submission not found' });
    }

    // Delete the contact submission
    await db.runAsync('DELETE FROM contact_submissions WHERE id = ?', [id]);

    res.json({ message: 'Contact submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;