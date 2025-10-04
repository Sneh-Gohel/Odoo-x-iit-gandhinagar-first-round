// src/models/userModel.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

class UserModel {
  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0] : null;
  }
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

  static async updateUserPassword(email, newPasswordHash) {
    const [result] = await db.execute(
      'UPDATE Users SET password_hash = ? WHERE email = ?',
      [newPasswordHash, email]
    );
    return result.affectedRows > 0;
  }

  static async findUsersByCompanyId(companyId) {
    const sql = `
      SELECT
        u1.id,
        u1.name,
        u1.email,
        u1.role,
        u1.manager_id,
        u2.name AS manager_name
      FROM
        Users u1
      LEFT JOIN
        Users u2 ON u1.manager_id = u2.id
      WHERE
        u1.company_id = ?
    `;
    const [rows] = await db.execute(sql, [companyId]);
    return rows;
  }

  static async createUser({ company_id, name, email, password_hash, role, manager_id = null }) {
    const [result] = await db.execute(
      'INSERT INTO Users (company_id, name, email, password_hash, role, manager_id) VALUES (?, ?, ?, ?, ?, ?)',
      [company_id, name, email, password_hash, role, manager_id]
    );
    // Return the newly created user's basic info
    const [rows] = await db.execute('SELECT id, name, email, role, manager_id, company_id FROM Users WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  static async isManagerInCompany(managerId, companyId) {
    if (!managerId) return true; // If no manager_id is provided, it's valid (e.g., for a new manager)
    const [rows] = await db.execute(
      'SELECT id FROM Users WHERE id = ? AND company_id = ? AND role = ?',
      [managerId, companyId, 'Manager'] // Ensure the manager actually has the 'Manager' role
    );
    return rows.length > 0;
  }
}

module.exports = UserModel;