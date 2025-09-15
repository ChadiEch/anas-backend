import db from './src/config/database.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const cleanupDatabase = async () => {
  try {
    console.log('Cleaning up database...');
    
    // Delete all existing users
    await db.runAsync('DELETE FROM profiles');
    console.log('Deleted all existing users');
    
    // Create admin user with environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create new user
    await db.runAsync(`
      INSERT INTO profiles (email, full_name, password_hash)
      VALUES (?, ?, ?)
    `, [adminEmail, 'Admin User', hashedPassword]);
    
    console.log(`Created new admin user with email: ${adminEmail}`);
    
    console.log('Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error cleaning up database:', error);
  } finally {
    db.close();
  }
};

cleanupDatabase();