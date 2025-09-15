import express from 'express';
import db from '../config/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all projects (public)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const projects = await db.allAsync(`
      SELECT id, title, description, image_url, technologies, project_url, github_url, featured, created_at, updated_at
      FROM projects
      ORDER BY created_at DESC
    `);

    // Parse technologies JSON for each project
    const formattedProjects = projects.map(project => ({
      ...project,
      technologies: project.technologies ? JSON.parse(project.technologies) : [],
      featured: Boolean(project.featured)
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single project by ID (public)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await db.getAsync(`
      SELECT id, title, description, image_url, technologies, project_url, github_url, featured, created_at, updated_at
      FROM projects
      WHERE id = ?
    `, [id]);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Parse technologies JSON
    const formattedProject = {
      ...project,
      technologies: project.technologies ? JSON.parse(project.technologies) : [],
      featured: Boolean(project.featured)
    };

    res.json(formattedProject);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new project (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, image_url, technologies, project_url, github_url, featured } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await db.runAsync(`
      INSERT INTO projects (title, description, image_url, technologies, project_url, github_url, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, description, image_url, JSON.stringify(technologies || []), project_url, github_url, featured ? 1 : 0]);

    // Get the created project
    const project = await db.getAsync('SELECT * FROM projects WHERE id = ?', [result.lastID]);
    
    const formattedProject = {
      ...project,
      technologies: project.technologies ? JSON.parse(project.technologies) : [],
      featured: Boolean(project.featured)
    };

    res.status(201).json(formattedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image_url, technologies, project_url, github_url, featured } = req.body;

    const result = await db.runAsync(`
      UPDATE projects 
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          image_url = COALESCE(?, image_url),
          technologies = COALESCE(?, technologies),
          project_url = COALESCE(?, project_url),
          github_url = COALESCE(?, github_url),
          featured = COALESCE(?, featured),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, description, image_url, technologies ? JSON.stringify(technologies) : null, project_url, github_url, featured !== undefined ? (featured ? 1 : 0) : null, id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get the updated project
    const project = await db.getAsync('SELECT * FROM projects WHERE id = ?', [id]);
    
    const formattedProject = {
      ...project,
      technologies: project.technologies ? JSON.parse(project.technologies) : [],
      featured: Boolean(project.featured)
    };

    res.json(formattedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete project (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.runAsync('DELETE FROM projects WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully', id: id });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;