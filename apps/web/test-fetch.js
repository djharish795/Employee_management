const axios = require('axios');
const fs = require('fs');

async function test() {
  try {
    const res = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'pradeep.chandra@naprocs.in',
      password: 'Password@123'
    });
    
    // Cookie parsing to extract the token and refreshToken
    const cookies = res.headers['set-cookie'];
    const cookieStr = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';
    
    const token = res.data.token;
    
    const deptRes = await axios.get('http://localhost:3001/api/v1/departments', {
      headers: {
        'Cookie': cookieStr,
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log("Response data keys:", Object.keys(deptRes.data));
    console.log("Response data.data type:", Array.isArray(deptRes.data.data) ? "Array" : typeof deptRes.data.data);
    console.log("Response data.data length:", deptRes.data.data ? deptRes.data.data.length : 0);
    
  } catch(e) {
    console.error("Test failed:", e.response?.status, e.response?.data || e.message);
  }
}
test();
