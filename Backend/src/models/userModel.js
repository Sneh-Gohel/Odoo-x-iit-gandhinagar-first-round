// src/models/userModel.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

class UserModel {
  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Creates a new company and a fully verified admin user in a single transaction.
   * This is only called AFTER OTP verification is successful.
   * @param {Object} details - Contains companyName, defaultCurrencyCode, adminName, adminEmail, passwordHash
   * @returns {Promise<Object>} The created user and company details.
   */
  static async createVerifiedCompanyAndAdmin(details) {
    const { companyName, defaultCurrencyCode, adminName, adminEmail, passwordHash } = details;
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [companyResult] = await connection.execute(
        'INSERT INTO Companies (name, default_currency_code) VALUES (?, ?)',
        [companyName, defaultCurrencyCode]
      );
      const companyId = companyResult.insertId;

      const [userResult] = await connection.execute(
        'INSERT INTO Users (company_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [companyId, adminName, adminEmail, passwordHash, 'Admin']
      );
      const adminUserId = userResult.insertId;

      await connection.commit();

      // Return the newly created user and company info
      const [userRows] = await connection.execute('SELECT * FROM Users WHERE id = ?', [adminUserId]);
      return userRows[0];

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = UserModel;