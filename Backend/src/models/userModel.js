// src/models/userModel.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

class UserModel {

  /**
   * Finds a user by email.
   * @param {string} email
   * @returns {Promise<Object|null>} User object or null if not found.
   */
  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Creates a new company and its first admin user.
   * @param {string} companyName
   * @param {string} defaultCurrencyCode
   * @param {string} adminName
   * @param {string} adminEmail
   * @param {string} adminPassword
   * @returns {Promise<Object>} Created company and admin user details.
   */
  static async createCompanyAndAdmin(companyName, defaultCurrencyCode, adminName, adminEmail, adminPassword) {
    const connection = await db.getConnection(); // Get a connection from the pool
    try {
      await connection.beginTransaction(); // Start a transaction

      // 1. Create the Company
      const [companyResult] = await connection.execute(
        'INSERT INTO Companies (name, default_currency_code) VALUES (?, ?)',
        [companyName, defaultCurrencyCode]
      );
      const companyId = companyResult.insertId;

      // 2. Hash the admin password
      const passwordHash = await bcrypt.hash(adminPassword, 10); // Salt rounds: 10

      // 3. Create the Admin User
      const [userResult] = await connection.execute(
        'INSERT INTO Users (company_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [companyId, adminName, adminEmail, passwordHash, 'Admin']
      );
      const adminUserId = userResult.insertId;

      await connection.commit(); // Commit the transaction

      return {
        company: { id: companyId, name: companyName, default_currency_code: defaultCurrencyCode },
        admin: { id: adminUserId, name: adminName, email: adminEmail, role: 'Admin' }
      };

    } catch (error) {
      await connection.rollback(); // Rollback if any error occurs
      throw error;
    } finally {
      connection.release(); // Release the connection back to the pool
    }
  }

  // You would add more user-related functions here later, e.g., createEmployee, createManager
}

module.exports = UserModel;