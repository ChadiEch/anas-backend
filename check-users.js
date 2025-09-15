import db from './src/config/database.js';

async function checkUsers() {
  try {
    console.log('Checking users in database...');
    const rows = await db.allAsync('SELECT email, full_name FROM profiles');
    console.log('Users in database:', rows);
    
    // Also check the homepage settings
    const homepage = await db.allAsync('SELECT * FROM homepage_settings');
    console.log('Homepage settings:', homepage);
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    db.close();
  }
}

checkUsers();