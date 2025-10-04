// src/server.js
const dotenv = require('dotenv');
const path = require('path');
const express = require('express'); // Ensure express is imported
const cors = require('cors');       // ⭐️ NEW: Import the cors package

// ⭐️ Load environment variables first and with debug enabled
dotenv.config({ path: path.resolve(__dirname, '../.env'), debug: true });

// ⭐️ Initialize global in-memory store for unverified signups
global.unverifiedSignups = {};

// --- VERIFICATION LOGS ---
console.log('--- Environment Variables Loaded ---');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '*****' : 'undefined'); // Mask sensitive secret
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('------------------------------------');
// --- END VERIFICATION LOGS ---


const db = require('./config/db');         // Import database connection
const userRoutes = require('./api/userRoutes'); // Import user routes

const app = express();
const PORT = process.env.PORT || 5000;

// ⭐️ NEW: Configure and use the CORS middleware.
// This allows your frontend (localhost:5173) to communicate with this backend.
app.use(cors({
  origin: 'http://localhost:5173',          // ⭐️ IMPORTANT: Specify your frontend's exact origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow common HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'],    // Allow necessary headers for requests
  credentials: true, // If you need to send cookies/auth headers with requests
}));

// Middleware to parse JSON bodies (should come after cors)
app.use(express.json());

// Test DB connection
db.getConnection()
  .then(connection => {
    console.log('✅ MySQL Database connected successfully!');
    connection.release(); // Release the connection back to the pool
  })
  .catch(err => {
    console.error('❌ Failed to connect to MySQL Database:', err);
    process.exit(1); // Exit process if DB connection fails
  });

// Root route (optional)
app.get('/', (req, res) => {
  res.send('Expense Management API is running!');
});

// Use User Routes for paths starting with /api/users
app.use('/api/users', userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}`);
});