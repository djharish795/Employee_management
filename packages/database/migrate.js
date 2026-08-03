const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  
  try {
    await client.query(`ALTER TYPE "KnowledgeCategory" ADD VALUE IF NOT EXISTS 'OTHER';`);
    console.log("Added OTHER to KnowledgeCategory enum");
  } catch (err) {
    console.error("Error altering type:", err.message);
  }

  try {
    await client.query(`ALTER TABLE "knowledge_docs" ADD COLUMN IF NOT EXISTS "customCategory" TEXT;`);
    console.log("Added customCategory column");
  } catch (err) {
    console.error("Error altering table:", err.message);
  }

  await client.end();
}

run();
