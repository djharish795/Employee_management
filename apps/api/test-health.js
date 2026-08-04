const jwt = require('jsonwebtoken');
const token = jwt.sign({ sub: 'master-admin', role: 'MASTER_ADMIN' }, '8456a47f50cb97a70086678293e64a62b1e0c00a60e991c802d6cbc722184c14', { expiresIn: '1h' });

fetch('http://localhost:3001/api/v1/master-admin/system/health', { 
  headers: { 'x-master-admin-token': token } 
})
.then(r => r.text())
.then(text => console.log('RESPONSE:', text))
.catch(console.error);
