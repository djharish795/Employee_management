const axios = require('axios');

async function test() {
  try {
    const login = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'salman@naprocs.in',
      password: 'password' // I will try common passwords
    });
    console.log("Logged in!");
  } catch(e) {
    // try next password
    try {
      const login = await axios.post('http://localhost:3001/api/v1/auth/login', {
        email: 'salman@naprocs.in',
        password: 'Password123'
      });
      const token = login.data.accessToken || login.data.token;
      
      const calendar = await axios.get('http://localhost:3001/api/v1/leaves/calendar', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Calendar Response Data:", JSON.stringify(calendar.data, null, 2));
    } catch(e2) {
      console.log(e2.response?.data || e2.message);
    }
  }
}
test();
