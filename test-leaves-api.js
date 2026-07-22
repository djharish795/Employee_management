const http = require('http');

http.get('http://localhost:3001/api/v1/leaves/my?employeeId=cmruova880001xw3r7g1da9za', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("Response:", data);
  });
}).on('error', (err) => {
  console.log("Error:", err.message);
});
