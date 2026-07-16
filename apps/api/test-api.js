const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign(
  { sub: 'user-id', employeeId: 'cmr1mlmbc00053y1wbxcs4p0x', role: 'HR' },
  process.env.JWT_SECRET || 'wjzDFlB9Ib8n5hsQeJucCRSWxgmMiZ2aN4TPofrYXd6OVEptHGqy1kA0K3vLU7'
);

async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/v1/lifecycle/offboarding?page=1&limit=10', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) {
    console.log("Error:", e.message);
  }
}
test();
