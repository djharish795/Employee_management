const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/tasks',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => console.log('Response:', data));
});
req.write(JSON.stringify({title: 'Test task', type: 'TASK', priority: 'MEDIUM'}));
req.end();
