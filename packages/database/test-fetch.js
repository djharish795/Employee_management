async function test() {
  try {
    const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'junaid@naprocs.in', password: 'password' })
    });
    const loginData = await loginRes.json();
    console.log('Login:', loginData);
    
    // Get cookies
    const cookies = loginRes.headers.get('set-cookie');
    if (!cookies) return;
    
    const reportsRes = await fetch('http://localhost:3001/api/v1/work-reports/team', {
      headers: { 'Cookie': cookies }
    });
    
    const reportsData = await reportsRes.json();
    console.log('Reports length:', reportsData.length);
  } catch (err) {
    console.error(err);
  }
}
test();
