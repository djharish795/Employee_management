async function testLogin() {
  try {
    const res = await fetch("http://localhost:3001/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "tejesh@naprocs.com", password: "ChangeMe123!" })
    });
    const data = await res.json();
    console.log("Login Response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}
testLogin();
