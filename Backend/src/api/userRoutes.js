// src/api/userRoutes.js
const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();

// POST /api/users/signup - Route for company and admin user signup
router.post('/signup', UserController.signupCompanyAdmin);

module.exports = router;