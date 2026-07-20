const http = require('http');
const req = http.request('http://localhost:3001/api/v1/cem/leads', { method: 'GET' }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(`Status: ${res.statusCode}\nBody: ${data.substring(0, 500)}`));
});
req.on('error', console.error);
req.end();
