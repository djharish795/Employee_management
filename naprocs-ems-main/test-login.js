async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ceo@naprocs.in', password: 'Naprocs@2026!' })
    });
    const data = await res.json();
    console.log("Login Response:", res.status, data);
  } catch(e) {
    console.error(e);
  }
}
test();
