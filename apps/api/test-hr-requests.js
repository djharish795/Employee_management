const http = require('http');

async function loginAsHR() {
  const payload = JSON.stringify({ email: 'hr@naprocs.in', password: 'Password123!', mfaCode: '000000', device: { location: 'Local', device: 'Test', time: new Date().toISOString() } });
  
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': payload.length }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function fetchRequests(token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/assets/requests',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log("Logging in...");
  const loginRes = await loginAsHR();
  if (!loginRes.accessToken) {
    console.error("Login failed:", loginRes);
    return;
  }
  console.log("Logged in, token:", loginRes.accessToken.substring(0, 10) + "...");
  console.log("Fetching requests...");
  const reqs = await fetchRequests(loginRes.accessToken);
  console.log("Response:", reqs);
}

main().catch(console.error);
