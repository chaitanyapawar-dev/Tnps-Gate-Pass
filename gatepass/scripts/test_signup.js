const axios = require('axios').default;
const qs = require('querystring');

// Usage: node scripts/test_signup.js <BASE_URL> <UID> <NAME> <PASSWORD> <CATEGORY> [HOSTEL]
// Example: node scripts/test_signup.js http://localhost:3000 signup01 "Test User" Pass@123 Gateauthority

const args = process.argv.slice(2);
if (args.length < 5) {
  console.error('Usage: node scripts/test_signup.js <BASE_URL> <UID> <NAME> <PASSWORD> <CATEGORY> [HOSTEL]');
  process.exit(1);
}

const [BASE_URL, UID, NAME, PASSWORD, CATEGORY, HOSTEL] = args;

(async () => {
  try {
    const data = qs.stringify({ UID, name: NAME, password: PASSWORD, category: CATEGORY, Hostel: HOSTEL });
    const resp = await axios.post(`${BASE_URL}/signup`, data, {
      maxRedirects: 0,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      validateStatus: s => s >= 200 && s < 400
    });

    console.log('Signup status:', resp.status);
    console.log('Location (if redirect):', resp.headers.location || 'none');
    if (resp.headers['set-cookie']) console.log('Set-Cookie:', resp.headers['set-cookie']);
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
