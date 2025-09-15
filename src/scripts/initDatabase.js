import db from '../config/database.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async () => {
  try {
    console.log('Initializing SQLite database...');

    // Create profiles table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        password_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create about table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS about (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        skills TEXT,
        experience_years INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create technologies table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS technologies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create projects table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        technologies TEXT,
        project_url TEXT,
        github_url TEXT,
        featured INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create homepage settings table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS homepage_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        banner_title TEXT,
        banner_subtitle TEXT,
        banner_description TEXT,
        cv_file_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create contact info table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS contact_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        phone TEXT,
        github TEXT,
        linkedin TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create contact submissions table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create or update admin user with environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // First check if any user exists
    const existingUser = await db.getAsync('SELECT id FROM profiles LIMIT 1');
    
    if (existingUser) {
      // Update existing user
      await db.runAsync(`
        UPDATE profiles 
        SET email = ?, 
            full_name = ?, 
            password_hash = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [adminEmail, 'Admin User', hashedPassword, existingUser.id]);
      
      console.log(`Updated existing admin user with email: ${adminEmail}`);
    } else {
      // Create new user
      await db.runAsync(`
        INSERT INTO profiles (email, full_name, password_hash)
        VALUES (?, ?, ?)
      `, [adminEmail, 'Admin User', hashedPassword]);
      
      console.log(`Created new admin user with email: ${adminEmail}`);
    }

    // Insert default homepage settings
    await db.runAsync(`
      INSERT OR IGNORE INTO homepage_settings (banner_title, banner_subtitle, banner_description)
      VALUES (?, ?, ?)
    `, [
      'Mechanical Engineer',
      'Designing innovative solutions with precision and creativity',
      'Experienced in CAD design, 3D modeling, and engineering analysis using AutoCAD, SolidWorks, Revit, and cutting-edge engineering tools.'
    ]);

    // Insert default contact info
    await db.runAsync(`
      INSERT OR IGNORE INTO contact_info (email, phone, github, linkedin)
      VALUES (?, ?, ?, ?)
    `, [
      'anas.ismail@example.com',
      '+1 (555) 123-4567',
      'github.com/anasismail',
      'linkedin.com/in/anasismail'
    ]);

    // Insert default about data
    await db.runAsync(`
      INSERT OR IGNORE INTO about (content, skills, experience_years)
      VALUES (?, ?, ?)
    `, [
      'I am a passionate Mechanical Engineer with over 3 years of experience in CAD design, 3D modeling, and engineering analysis. I specialize in creating innovative solutions using industry-leading software and have a proven track record of delivering high-quality engineering projects across various industries.',
      JSON.stringify(['AutoCAD', 'SolidWorks', 'Revit', '3D Modeling', 'Engineering Analysis', 'Project Management']),
      3
    ]);

    // Insert default technologies
    const defaultTechnologies = [
      { name: 'AutoCAD', category: 'CAD Software', icon: '🏗️', color: '#E74C3C' },
      { name: 'SolidWorks', category: 'CAD Software', icon: '⚙️', color: '#3498DB' },
      { name: 'Revit', category: 'CAD Software', icon: '🏢', color: '#F39C12' },
      { name: 'ANSYS', category: 'Engineering Tools', icon: '📊', color: '#9B59B6' },
      { name: 'MATLAB', category: 'Engineering Tools', icon: '📈', color: '#E67E22' },
      { name: 'Python', category: 'Programming', icon: '🐍', color: '#27AE60' }
    ];

    for (const tech of defaultTechnologies) {
      await db.runAsync(`
        INSERT OR IGNORE INTO technologies (name, category, icon, color)
        VALUES (?, ?, ?, ?)
      `, [tech.name, tech.category, tech.icon, tech.color]);
    }

    // Insert default projects
    const defaultProjects = [
      {
        title: 'Mechanical Design Project',
        description: 'Complete mechanical system design using SolidWorks and AutoCAD for industrial automation.',
        image_url: '/placeholder.svg',
        technologies: ['SolidWorks', 'AutoCAD', 'ANSYS'],
        project_url: '#',
        github_url: '#',
        featured: true
      },
      {
        title: 'HVAC System Design',
        description: 'Energy-efficient HVAC system design for commercial buildings using Revit and simulation tools.',
        image_url: '/placeholder.svg',
        technologies: ['Revit', 'ANSYS', 'Energy Modeling'],
        project_url: '#',
        featured: true
      },
      {
        title: 'Structural Analysis',
        description: 'Comprehensive structural analysis and optimization using FEA and advanced simulation techniques.',
        image_url: '/placeholder.svg',
        technologies: ['ANSYS', 'MATLAB', 'FEA'],
        project_url: '#',
        featured: false
      }
    ];

    for (const project of defaultProjects) {
      await db.runAsync(`
        INSERT OR IGNORE INTO projects (title, description, image_url, technologies, project_url, github_url, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        project.title,
        project.description,
        project.image_url,
        JSON.stringify(project.technologies),
        project.project_url,
        project.github_url,
        project.featured ? 1 : 0
      ]);
    }

    console.log('Database initialized successfully!');
    console.log(`Admin user created/updated with email: ${adminEmail}`);
    console.log('Please change your password after first login for security.');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    db.close();
  }
};

initDatabase();