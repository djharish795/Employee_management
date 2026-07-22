async function test() {
  try {
    const login = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'salman@naprocs.in', password: 'Password@123' })
    });
    const loginData = await login.json();
    console.log('Login:', loginData);
    const token = loginData.accessToken || loginData.data?.accessToken;
    console.log('Token:', token);
    const calendar = await fetch('http://localhost:3001/api/v1/leaves/calendar', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const calendarData = await calendar.json();
    console.log('Calendar type:', Array.isArray(calendarData) ? 'Array' : typeof calendarData);
    console.log(JSON.stringify(calendarData, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
