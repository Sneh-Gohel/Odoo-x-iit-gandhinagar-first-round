// src/api/userRoutes.js
const express = require('express');
const UserController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// POST /api/users/signup - Initiates signup and sends OTP
router.post('/signup', UserController.signupCompanyAdmin);

// POST /api/users/verify-otp - Verifies OTP and finalizes signup
router.post('/verify-otp', UserController.verifyOtp); // <--- Make sure this line exists and is correct!

// POST /api/users/login - Logs in a user
router.post('/login', UserController.loginUser);

router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);

router.get('/company-users', authMiddleware, adminAuth, UserController.getCompanyUsers);

router.post('/add-user', authMiddleware, adminAuth, UserController.addNewUser);

module.exports = router;