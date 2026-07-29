const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'pradeep.chandra@naprocs.in',
      password: 'Password@123'
    });
    
    // Cookie parsing
    const cookies = res.headers['set-cookie'];
    const cookieStr = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';
    const token = res.data.token;
    
    const reqRes = await axios.post('http://localhost:3001/api/v1/reports/generate', {
      type: 'HEADCOUNT',
      format: 'PDF'
    }, {
      headers: {
        'Cookie': cookieStr,
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log("Success:", reqRes.data);
  } catch(e) {
    console.error("Failed:", e.response?.status, e.response?.data || e.message);
  }
}
test();
