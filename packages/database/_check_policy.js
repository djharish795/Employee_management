const { Client } = require('pg');
require('dotenv').config({ path: '../../apps/api/.env' });

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const policy = await client.query(`SELECT * FROM org_policies LIMIT 5`).catch(e => ({ error: e.message }));
  console.log('=== org_policies ===');
  console.log(JSON.stringify(policy.rows || policy, null, 2));

  await client.end();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
