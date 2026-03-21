require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const command = process.argv[2];
const query = process.argv.slice(3).join(' ');

async function run() {
  try {
    if (command === 'exec' && query) {
      const result = await pool.query(query);
      console.log(JSON.stringify(result.rows, null, 2));
    } else if (command === 'schema') {
      const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      console.log(JSON.stringify(result.rows, null, 2));
    } else if (command === 'tables' && query) {
      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [query]);
      console.log(JSON.stringify(result.rows, null, 2));
    } else {
      console.log('Usage: node db-helper.js [exec|schema|tables <table_name>] "<sql_query>"');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
