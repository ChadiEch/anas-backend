import db from './src/config/database.js';

async function checkTables() {
  try {
    console.log('Checking database tables...');
    const rows = await db.allAsync("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('Tables in database:', rows);
    
    // Check structure of each table
    for (const row of rows) {
      const tableName = row.name;
      console.log(`\nStructure of ${tableName}:`);
      try {
        const columns = await db.allAsync(`PRAGMA table_info(${tableName})`);
        console.log(columns);
      } catch (err) {
        console.error(`Error getting structure for ${tableName}:`, err);
      }
    }
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    db.close();
  }
}

checkTables();