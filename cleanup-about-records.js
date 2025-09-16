import db from './src/config/database.js';

async function cleanupAboutRecords() {
  try {
    // Get all records ordered by created_at
    const rows = await db.allAsync(`
      SELECT id, content, created_at, updated_at 
      FROM about 
      ORDER BY created_at DESC
    `);
    
    console.log('All about records:', rows);
    
    if (rows.length > 1) {
      // Keep the first record (most recent) and delete the rest
      const recordToKeep = rows[0];
      const recordsToDelete = rows.slice(1);
      
      console.log('Keeping record with ID:', recordToKeep.id);
      console.log('Deleting records with IDs:', recordsToDelete.map(r => r.id));
      
      // Delete all records except the most recent one
      for (const record of recordsToDelete) {
        await db.runAsync('DELETE FROM about WHERE id = ?', [record.id]);
        console.log('Deleted record with ID:', record.id);
      }
      
      console.log('Cleanup completed. Kept only the most recent record.');
    } else {
      console.log('No cleanup needed. Only one record exists.');
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

cleanupAboutRecords();