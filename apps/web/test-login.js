const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'pradeep.chandra@naprocs.in',
      password: 'Password@123'
    });
    
    // get cookies
    const cookies = res.headers['set-cookie'];
    
    // wait for OTP or is it required? The flow says MFA is required. 
    // Let me just check the response
    console.log("Login response:", res.data);
  } catch(e) {
    console.error("Login failed:", e.response?.data || e.message);
  }
}
test();
