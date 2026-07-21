const jwt = require('jsonwebtoken');

async function test() {
  const secret = process.env.JWT_SECRET || 'super-secret-key-for-jwt-auth';
  
  // payload for junaid
  const payload = {
    sub: 'cmr1mlmee000b3y1w5u6bknfe',
    email: 'junaid@naprocs.in',
    role: 'OM',
    employeeId: 'cmr1mlmdm00093y1wwy06vrdt',
    jti: 'test-jti-123'
  };

  const token = jwt.sign(payload, secret);
  
  try {
    const res = await fetch('http://localhost:3001/api/v1/work-reports/team', {
      headers: {
        Cookie: `token=${token}`
      }
    });
    const data = await res.json();
    if (!res.ok) {
       console.log("Error:", res.status, data);
       return;
    }
    console.log("Reports length:", data.length);
    console.log("Reports data:", JSON.stringify(data, null, 2).substring(0, 500));
  } catch(err) {
    console.log("Error:", err);
  }
}
test();
