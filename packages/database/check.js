const { Client } = require('pg');
const client = new Client({ 
  connectionString: 'postgresql://naprocs_admin:naprocsems.3689@naprocs-ems.cjga40iiqk8m.ap-south-1.rds.amazonaws.com:5432/naprocs-ems?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name='attendance_records'`);
    console.log("Cols:", res.rows.map(r => r.column_name).join(', '));
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
