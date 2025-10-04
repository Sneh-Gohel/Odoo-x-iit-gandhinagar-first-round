// src/controllers/userController.js
const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOtpEmail } = require('../utils/emailService');

class UserController {
  /**
   * Step 1 of Signup: Temporarily stores user data, sends OTP.
   */
  static async signupCompanyAdmin(req, res) {
    const { companyName, defaultCurrencyCode, adminName, adminEmail, adminPassword } = req.body;
    if (!companyName || !defaultCurrencyCode || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
      const existingUser = await UserModel.findByEmail(adminEmail);
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered.' });
      }

      // Hash the password before storing it temporarily
      const passwordHash = await bcrypt.hash(adminPassword, 10);

      // Generate OTP and expiration
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store the entire payload in our in-memory object
      unverifiedSignups[adminEmail] = {
        details: { companyName, defaultCurrencyCode, adminName, adminEmail, passwordHash },
        otp,
        expiresAt,
      };

      await sendOtpEmail(adminEmail, otp);

      res.status(200).json({
        message: 'OTP sent to your email. Please verify to complete signup.',
        email: adminEmail
      });

    } catch (error) {
      console.error('Error during signup initiation:', error);
      res.status(500).json({ message: 'Server error during signup.' });
    }
  }

  /**
   * Step 2 of Signup: Verifies OTP, creates user in DB, and logs them in.
   */
  static async verifyOtp(req, res) {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    try {
      const pendingSignup = unverifiedSignups[email];

      // Check 1: Is there a pending signup for this email?
      if (!pendingSignup) {
        return res.status(400).json({ message: 'No pending signup for this email, or session expired.' });
      }

      // Check 2: Has the OTP expired?
      if (new Date() > new Date(pendingSignup.expiresAt)) {
        delete unverifiedSignups[email]; // Clean up expired entry
        return res.status(400).json({ message: 'OTP has expired. Please try signing up again.' });
      }

      // Check 3: Does the OTP match?
      if (pendingSignup.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP.' });
      }

      // SUCCESS! Now create the user and company in the database
      const user = await UserModel.createVerifiedCompanyAndAdmin(pendingSignup.details);

      // Clean up the in-memory store
      delete unverifiedSignups[email];

      // Generate JWT for the new admin
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, companyId: user.company_id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(201).json({ // 201 Created is more appropriate here
        message: 'Account created and verified successfully! You are now logged in.',
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      });

    } catch (error) {
      console.error('Error during OTP verification:', error);
      res.status(500).json({ message: 'Server error during verification.' });
    }
  }
  static async loginUser(req, res) {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
      // 1. Find the user by email
      const user = await UserModel.findByEmail(email);

      // Security: Use a generic error message to prevent "user enumeration"
      // This way, an attacker can't guess which emails are registered.
      const genericErrorMessage = 'Invalid credentials. Please check your email and password.';
      
      if (!user) {
        return res.status(401).json({ message: genericErrorMessage });
      }

      // 2. Compare the provided password with the stored hash
      const isPasswordMatch = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordMatch) {
        return res.status(401).json({ message: genericErrorMessage });
      }

      // 3. If password matches, generate a JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, companyId: user.company_id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token expires in 1 hour
      );

      // SUCCESS!
      res.status(200).json({
        message: 'Login successful!',
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role, 
          companyId: user.company_id 
        },
        token,
      });

    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Server error during login.' });
    }
  }
}



module.exports = UserController;