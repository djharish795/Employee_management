async function testApi() {
  try {
    const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'imthiyaz@naprocs.in', password: 'Naprocs@123' })
    });
    
    if (!loginRes.ok) {
      console.log("Login failed", await loginRes.text());
      return;
    }
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("Logged in:", !!token);

    const profileRes = await fetch('http://localhost:3001/api/v1/profile/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!profileRes.ok) {
      console.log("Profile Error:", await profileRes.text());
      return;
    }
    const profileData = await profileRes.json();
    console.log("Profile keys:", Object.keys(profileData));
    console.log("Profile:", profileData);
  } catch (e) {
    console.error("API Error:", e.message);
  }
}

testApi();
