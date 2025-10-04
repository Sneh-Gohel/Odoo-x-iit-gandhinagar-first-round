// src/server.js
// src/server.js
const dotenv = require('dotenv');
const path = require('path'); // Ensure path module is imported

// ⭐️ Add debug: true
dotenv.config({ path: path.resolve(__dirname, '../.env'), debug: true });

global.unverifiedSignups = {};

// --- VERIFICATION LOGS ---
console.log('--- Environment Variables Loaded (Attempt 2) ---');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD); // Also log password to confirm
console.log('------------------------------------');
// ... rest of your server.js code // Check if DB_NAME is correctly loaded here
console.log('------------------------------------');
// --- END VERIFICATION LOGS ---


const express = require('express');
const db = require('./config/db');
const userRoutes = require('./api/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Test DB connection
db.getConnection()
  .then(connection => {
    console.log('✅ MySQL Database connected successfully!');
    // ⭐️ You can also verify DB_NAME here inside the connection block
    // console.log('DB_NAME used by connection:', connection.config.database);
    connection.release();
  })
  .catch(err => {
    console.error('❌ Failed to connect to MySQL Database:', err);
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.send('Expense Management API is running!');
});

app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}`);
});