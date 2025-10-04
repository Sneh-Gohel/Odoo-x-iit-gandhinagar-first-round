// src/server.js
const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env'), debug: true });

// Global objects for OTP and password reset requests (in-memory, for demo purposes)
// In a production application, these would typically be stored in a database or a more persistent cache (e.g., Redis).
global.unverifiedSignups = {};
global.passwordResetRequests = {};

// Log loaded environment variables (for debugging and verification)
console.log('--- Environment Variables Loaded ---');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '*****' : 'undefined'); // Mask sensitive info
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '*****' : 'undefined');     // Mask sensitive info
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('------------------------------------');

// Import database connection module
const db = require('./config/db');

// Import API routes
const userRoutes = require('./api/userRoutes');
const claimRoutes = require('./api/claimRoutes'); // Import claim routes

// Initialize the Express app AFTER all imports
const app = express(); // <--- This line must come before app.use() calls
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000

// CORS configuration: Allows frontend on localhost:5173 to make requests
app.use(cors({
  origin: 'http://localhost:5173', // Adjust this to your actual frontend's URL in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Database connection check: Ensures the application doesn't start if DB is unreachable
db.getConnection()
  .then(connection => {
    console.log('✅ MySQL Database connected successfully!');
    connection.release(); // Release the connection back to the pool immediately
  })
  .catch(err => {
    console.error('❌ Failed to connect to MySQL Database:', err);
    process.exit(1); // Exit the application if database connection fails
  });

// Root API endpoint for a simple health check
app.get('/', (req, res) => {
  res.send('Expense Management API is running!');
});

// Use the imported API routes
app.use('/api/users', userRoutes);     // User-related routes (auth, admin functions)
app.use('/api/claims', claimRoutes); // Use '/api/claims' as the base path for claims

// Start the Express server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}`);
});