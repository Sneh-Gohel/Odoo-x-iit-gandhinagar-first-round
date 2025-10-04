// src/controllers/userController.js
const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken'); // For generating a token on signup

class UserController {
  /**
   * Handles the company and admin user signup.
   * Required body: companyName, defaultCurrencyCode, adminName, adminEmail, adminPassword
   */
  static async signupCompanyAdmin(req, res) {
    const { companyName, defaultCurrencyCode, adminName, adminEmail, adminPassword } = req.body;

    // Basic validation
    if (!companyName || !defaultCurrencyCode || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({ message: 'All fields are required for signup.' });
    }

    // Email format validation (simple regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    try {
      // Check if admin email already exists
      const existingUser = await UserModel.findByEmail(adminEmail);
      if (existingUser) {
        return res.status(409).json({ message: 'Admin email already registered.' });
      }

      // Create company and admin user
      const { company, admin } = await UserModel.createCompanyAndAdmin(
        companyName,
        defaultCurrencyCode,
        adminName,
        adminEmail,
        adminPassword
      );

      // Generate JWT for the new admin (optional, but good practice for immediate login)
      const token = jwt.sign(
        { userId: admin.id, email: admin.email, role: admin.role, companyId: company.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );

      res.status(201).json({
        message: 'Company and Admin user created successfully!',
        company: { id: company.id, name: company.name, default_currency_code: company.default_currency_code },
        admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
        token // Send token for immediate authentication
      });

    } catch (error) {
      console.error('Error during company admin signup:', error);
      res.status(500).json({ message: 'Server error during signup.', error: error.message });
    }
  }
}

module.exports = UserController;