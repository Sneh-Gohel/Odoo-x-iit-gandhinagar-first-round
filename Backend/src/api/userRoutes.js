// src/api/userRoutes.js
const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();

// POST /api/users/signup - Initiates signup and sends OTP
router.post('/signup', UserController.signupCompanyAdmin);

// POST /api/users/verify-otp - Verifies OTP and finalizes signup
router.post('/verify-otp', UserController.verifyOtp); // <--- Make sure this line exists and is correct!

module.exports = router;