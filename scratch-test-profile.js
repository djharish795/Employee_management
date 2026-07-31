const fetch = require('node-fetch');

async function testProfile() {
  // Let's call the API
  const url = 'http://localhost:3001/api/v1/employees/NAP/OR/002'; // An employee we seeded requests for
  try {
    const res = await fetch(url, {
      headers: {
        'Cookie': 'accessToken=' + process.env.ACCESS_TOKEN // wait, I don't have token
      }
    });
    // Actually it's easier to run it inside the Nest context or just test Prisma directly.
  } catch (e) {
    console.error(e);
  }
}

testProfile();
