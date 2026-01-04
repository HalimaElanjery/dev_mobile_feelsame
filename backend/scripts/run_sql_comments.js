const fs = require('fs');
const path = require('path');
const { query, end } = require('../src/config/database');

async function run() {
    try {
        const sqlPath = path.join(__dirname, 'create_comments_table.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon to handle multiple statements if any, though here it's simple
        const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

        for (const stmt of statements) {
            await query(stmt);
            console.log('Executed SQL');
        }

        console.log('Sales table created successfully');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

run();
