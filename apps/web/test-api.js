const axios = require('axios');
axios.post('http://localhost:3001/api/v1/auth/login', { email: 'ceo@naprocs.in', password: 'password123' })
  .then(res => {
     axios.get('http://localhost:3001/api/v1/attendance/summary-today', { headers: { Authorization: 'Bearer ' + res.data.token } })
       .then(res => console.log('SUCCESS:', Object.keys(res.data)))
       .catch(err => console.log('GET ERROR:', err.response?.data || err.message));
  })
  .catch(err => {
    if(err.response) console.log('LOGIN ERROR:', err.response.data);
    else console.log('LOGIN ERROR:', err.message);
  });
