const net = require('net');
console.log('Connecting...');
const client = net.createConnection({
  host: 'master.naprocs-ems-staging-redis.z4pah1.aps1.cache.amazonaws.com',
  port: 6379,
  timeout: 5000
}, () => {
  console.log('TCP Connected. Sending PING...');
  client.write('*1\r\n$4\r\nPING\r\n');
});

client.on('data', (data) => {
  console.log('Received:', data.toString());
  client.end();
});

client.on('error', (err) => {
  console.error('Error:', err.message);
});

client.on('end', () => {
  console.log('Connection closed by server.');
});
