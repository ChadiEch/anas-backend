import db from './src/config/database.js';

async function checkAboutRecords() {
  try {
    const rows = await db.allAsync('SELECT id, content, created_at, updated_at FROM about ORDER BY created_at;');
    console.log('About records:', rows);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAboutRecords();