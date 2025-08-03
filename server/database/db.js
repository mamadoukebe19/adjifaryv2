const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://docc_user:docc_password@localhost:5432/docc_stock',
  ssl: false
});

module.exports = pool;