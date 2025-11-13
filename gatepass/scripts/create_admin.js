const db = require('../server');
const bcrypt = require('bcrypt');

// Usage: node scripts/create_admin.js <UID> <NAME> <PASSWORD> <CATEGORY> [HOSTEL]
// Example: node scripts/create_admin.js admin01 "Super Admin" mypassword SuperID

const args = process.argv.slice(2);
if (args.length < 4) {
  console.error('Usage: node scripts/create_admin.js <UID> <NAME> <PASSWORD> <CATEGORY> [HOSTEL]');
  process.exit(1);
}

const [UID, NAME, PASSWORD, CATEGORY, HOSTEL] = args;

(async function() {
  try {
    const hashed = await bcrypt.hash(PASSWORD, 12);

    db.getConnection(function(err, connection) {
      if (err) {
        console.error('DB connection error:', err);
        process.exit(1);
      }

      const sql = 'INSERT INTO admin (uid, name, password, category, Hostel) VALUES (?, ?, ?, ?, ?)';
      const params = [UID, NAME, hashed, CATEGORY, HOSTEL || null];

      connection.query(sql, params, function(err, result) {
        connection.release();
        if (err) {
          console.error('Error inserting admin:', err);
          process.exit(1);
        }
        console.log('Admin created successfully. UID:', UID);
        process.exit(0);
      });
    });
  } catch (e) {
    console.error('Error hashing password:', e);
    process.exit(1);
  }
})();
