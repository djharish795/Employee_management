const net = require('net');
console.log('Attempting to connect via plain TCP to Redis host...');
const client = net.createConnection({
  host: 'master.naprocs-ems-staging-redis.z4pah1.aps1.cache.amazonaws.com',
  port: 6379,
  timeout: 5000
}, () => {
  console.log('TCP Connection established successfully!');
  client.end();
});

client.on('error', (err) => {
  console.error('TCP Connection error:', err.message);
});

client.on('timeout', () => {
  console.error('TCP Connection timeout!');
  client.destroy();
});
