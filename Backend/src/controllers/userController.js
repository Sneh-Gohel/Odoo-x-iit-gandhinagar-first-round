// src/controllers/userController.js
const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOtpEmail, sendPasswordResetEmail } = require('../utils/emailService');

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

      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      global.unverifiedSignups[adminEmail] = {
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
      const pendingSignup = global.unverifiedSignups[email];

      if (!pendingSignup) {
        return res.status(400).json({ message: 'No pending signup for this email, or session expired.' });
      }

      if (new Date() > new Date(pendingSignup.expiresAt)) {
        delete global.unverifiedSignups[email];
        return res.status(400).json({ message: 'OTP has expired. Please try signing up again.' });
      }

      if (pendingSignup.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP.' });
      }

      const user = await UserModel.createVerifiedCompanyAndAdmin(pendingSignup.details);

      delete global.unverifiedSignups[email];

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, companyId: user.company_id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(201).json({
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
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
      const user = await UserModel.findByEmail(email);
      const genericErrorMessage = 'Invalid credentials. Please check your email and password.';
      
      if (!user) {
        return res.status(401).json({ message: genericErrorMessage });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordMatch) {
        return res.status(401).json({ message: genericErrorMessage });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, companyId: user.company_id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

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

  static async forgotPassword(req, res) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    try {
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(200).json({ message: 'If an account with this email exists, a password reset OTP has been sent.' });
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      global.passwordResetRequests[email] = { otp, expiresAt };
      
      // This line will now work correctly
      await sendPasswordResetEmail(email, otp); 
      
      res.status(200).json({ message: 'If an account with this email exists, a password reset OTP has been sent.' });
    } catch (error) {
      console.error('Error during forgot password:', error);
      res.status(500).json({ message: 'Server error during forgot password.' });
    }
  }

  static async resetPassword(req, res) {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
        const resetRequest = global.passwordResetRequests[email];

        if (!resetRequest) {
            return res.status(400).json({ message: 'No pending password reset for this email, or session expired.' });
        }

        if (new Date() > new Date(resetRequest.expiresAt)) {
            delete global.passwordResetRequests[email];
            return res.status(400).json({ message: 'OTP has expired. Please request a new password reset.' });
        }

        if (resetRequest.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        const updated = await UserModel.updateUserPassword(email, newPasswordHash);

        if (!updated) {
            return res.status(404).json({ message: 'User not found or password could not be updated.' });
        }

        delete global.passwordResetRequests[email];
        
        res.status(200).json({ message: 'Password has been reset successfully.' });

    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(500).json({ message: 'Server error during password reset.' });
    }
  }
  static async getCompanyUsers(req, res) {
    // req.user is populated by authMiddleware
    const { companyId, role } = req.user; 

    // Extra check (though adminAuth middleware should handle this)
    if (role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden: Only administrators can view all company users.' });
    }

    try {
      const users = await UserModel.findUsersByCompanyId(companyId);

      // Filter out sensitive data like password_hash if present (though model already excludes it)
      const sanitizedUsers = users.map(user => {
        const { password_hash, ...rest } = user;
        return rest;
      });

      res.status(200).json({
        message: 'Company users fetched successfully.',
        users: sanitizedUsers,
      });

    } catch (error) {
      console.error('Error fetching company users:', error);
      res.status(500).json({ message: 'Server error while fetching company users.' });
    }
  }
}

module.exports = UserController;