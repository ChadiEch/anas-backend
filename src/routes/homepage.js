import express from 'express';
import db from '../config/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get homepage settings (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const result = await db.getAsync(`
      SELECT id, banner_title, banner_subtitle, banner_description, cv_file_path, created_at, updated_at
      FROM homepage_settings
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (!result) {
      return res.status(404).json({ error: 'Homepage settings not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching homepage settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update homepage settings (admin only)
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { banner_title, banner_subtitle, banner_description } = req.body;

    // First, check if homepage settings record exists
    const existingResult = await db.getAsync('SELECT id FROM homepage_settings LIMIT 1');

    let result;

    if (existingResult) {
      // Update existing record
      await db.runAsync(`
        UPDATE homepage_settings 
        SET banner_title = COALESCE(?, banner_title),
            banner_subtitle = COALESCE(?, banner_subtitle),
            banner_description = COALESCE(?, banner_description),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [banner_title, banner_subtitle, banner_description, existingResult.id]);
      
      result = await db.getAsync('SELECT * FROM homepage_settings WHERE id = ?', [existingResult.id]);
    } else {
      // Create new record
      const insertResult = await db.runAsync(`
        INSERT INTO homepage_settings (banner_title, banner_subtitle, banner_description)
        VALUES (?, ?, ?)
      `, [
        banner_title || 'Mechanical Engineer',
        banner_subtitle || 'Designing innovative solutions with precision and creativity',
        banner_description || 'Experienced in CAD design, 3D modeling, and engineering analysis using AutoCAD, SolidWorks, Revit, and cutting-edge engineering tools.'
      ]);
      
      result = await db.getAsync('SELECT * FROM homepage_settings WHERE id = ?', [insertResult.lastID]);
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating homepage settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload CV (admin only)
router.post('/upload-cv', authenticateToken, async (req, res) => {
  try {
    if (!req.files || !req.files.cv) {
      return res.status(400).json({ error: 'No CV file uploaded' });
    }

    const cvFile = req.files.cv;
    const uploadPath = path.join(__dirname, '..', '..', 'public', 'cv.pdf');

    // Move the file to the public directory
    await new Promise((resolve, reject) => {
      cvFile.mv(uploadPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Update the database with the CV file path
    try {
      const existingResult = await db.getAsync('SELECT id FROM homepage_settings LIMIT 1');
      
      let result;
      if (existingResult) {
        await db.runAsync(`
          UPDATE homepage_settings 
          SET cv_file_path = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, ['/cv.pdf', existingResult.id]);
        
        result = await db.getAsync('SELECT * FROM homepage_settings WHERE id = ?', [existingResult.id]);
      } else {
        // Create a new record with just the CV file path
        const insertResult = await db.runAsync(`
          INSERT INTO homepage_settings (cv_file_path, banner_title, banner_subtitle, banner_description)
          VALUES (?, ?, ?, ?)
        `, [
          '/cv.pdf',
          'Mechanical Engineer',
          'Designing innovative solutions with precision and creativity',
          'Experienced in CAD design, 3D modeling, and engineering analysis using AutoCAD, SolidWorks, Revit, and cutting-edge engineering tools.'
        ]);
        
        result = await db.getAsync('SELECT * FROM homepage_settings WHERE id = ?', [insertResult.lastID]);
      }

      // Return the expected format for the frontend
      res.json({ 
        message: 'CV uploaded successfully', 
        cv_url: '/cv.pdf',
        ...result 
      });
    } catch (dbError) {
      console.error('Error updating database with CV path:', dbError);
      res.status(500).json({ error: 'Failed to update database' });
    }
  } catch (error) {
    console.error('Error uploading CV:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;