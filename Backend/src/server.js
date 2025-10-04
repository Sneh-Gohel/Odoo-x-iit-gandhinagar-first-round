// Import required packages
const express = require('express');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize the express app
const app = express();

// Define the port. It will use the PORT from the .env file, or 3000 if it's not available.
const PORT = process.env.PORT || 3000;

// A simple test route to check if the server is up
app.get('/', (req, res) => {
  res.send('Expense Management API is running!');
});

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});