const axios = require('axios').default;
const qs = require('querystring');

// Usage: node scripts/test_login.js <BASE_URL> <UID> <PASSWORD>
// Example: node scripts/test_login.js http://localhost:3000 admin01 Admin@123

const args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Usage: node scripts/test_login.js <BASE_URL> <UID> <PASSWORD>');
  process.exit(1);
}

const [BASE_URL, UID, PASSWORD] = args;

(async () => {
  try {
    const data = qs.stringify({ UID, password: PASSWORD });
    const resp = await axios.post(`${BASE_URL}/loginpanel`, data, {
      maxRedirects: 0,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      validateStatus: s => s >= 200 && s < 400
    });

    console.log('Status:', resp.status);
    console.log('Headers:', resp.headers);
    if (resp.headers['set-cookie']) console.log('Set-Cookie:', resp.headers['set-cookie']);
    console.log('Redirected to:', resp.headers.location || 'none');
  } catch (err) {
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response headers:', err.response.headers);
      console.error('Response data:', err.response.data);
    } else {
      console.error('Request error:', err.message);
    }
    process.exit(1);
  }
})();
