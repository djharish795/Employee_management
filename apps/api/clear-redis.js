const Redis = require('ioredis');

const redis = new Redis();

async function main() {
  const keys = await redis.keys('attendance_state:*');
  if (keys.length > 0) {
    await redis.del(...keys);
    console.log(`Cleared ${keys.length} Redis attendance state keys.`);
  } else {
    console.log('No Redis attendance state keys to clear.');
  }
}

main().catch(console.error).finally(() => redis.quit());
