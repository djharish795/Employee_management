const jwt = require('jsonwebtoken');

const secret = 'wjzDFlB9Ib8n5hsQeJucCRSWxgmMiZ2aN4TPofrYXd6OVEptHGqy1kA0K3vLU7';
const payload = {
  sub: 'cmr1mlmz9001r3y1wqac2j9bx',
  email: 'imthiyaz@naprocs.in',
  role: 'EMPLOYEE',
  employeeId: 'cmr1mlmyj001p3y1w9ho73rt1',
};

const token = jwt.sign(payload, secret);
console.log("Token:", token);

fetch('http://localhost:3001/api/v1/profile/me', {
  headers: { Authorization: `Bearer ${token}` }
})
  .then(res => res.json())
  .then(data => {
    console.log("API Response:");
    console.log(data);
  })
  .catch(err => console.error(err));
