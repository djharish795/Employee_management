const axios = require('axios');
async function test() {
  try {
    const res = await axios.post('http://localhost:3001/api/v1/work-reports', {
      reportType: 'Daily Standup',
      title: 'Test',
      priority: 'MEDIUM',
      content: { details: 'Test' }
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response?.status, err.response?.data);
  }
}
test();
