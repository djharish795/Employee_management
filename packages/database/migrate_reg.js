const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  
  try {
    await client.query(`ALTER TYPE "RegularizationCorrectionType" ADD VALUE IF NOT EXISTS 'LATE_CHECKIN';`);
    console.log("Added LATE_CHECKIN to RegularizationCorrectionType enum");
  } catch (err) {
    console.error("Error altering type:", err.message);
  }

  try {
    await client.query(`ALTER TYPE "RegularizationCorrectionType" ADD VALUE IF NOT EXISTS 'EARLY_CHECKOUT';`);
    console.log("Added EARLY_CHECKOUT to RegularizationCorrectionType enum");
  } catch (err) {
    console.error("Error altering type:", err.message);
  }

  await client.end();
}

run();
