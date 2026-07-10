const http = require('http');

const data = JSON.stringify({
  category: 'LAPTOP',
  description: 'test',
  justification: 'test',
  priority: 'MEDIUM'
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/assets/requests',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
