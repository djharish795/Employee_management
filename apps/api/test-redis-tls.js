const tls = require('tls');
console.log('Attempting to connect via TLS to Redis host...');
const client = tls.connect({
  host: 'master.naprocs-ems-staging-redis.z4pah1.aps1.cache.amazonaws.com',
  port: 6379,
  timeout: 5000
}, () => {
  console.log('TLS Connection established successfully!');
  client.end();
});

client.on('error', (err) => {
  console.error('TLS Connection error:', err.message);
});

client.on('timeout', () => {
  console.error('TLS Connection timeout!');
  client.destroy();
});
