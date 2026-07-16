async function test() {
  try {
    const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'imthiyaz@naprocs.in', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    const res = await fetch('http://localhost:3001/api/v1/attendance/team-view?date=2026-07-16', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const text = await res.text();
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", text);
  } catch (err) {
    console.error("ERROR:", err);
  }
}
test();
