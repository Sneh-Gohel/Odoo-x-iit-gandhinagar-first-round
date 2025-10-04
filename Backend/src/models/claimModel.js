// src/models/claimModel.js
const db = require('../config/db');

class ClaimModel {
  /**
   * Creates a new claim with a 'Draft' status, allowing for partial data.
   * @param {object} claimData - Contains user_id, company_id, and initial details.
   * @returns {Promise<object>} The newly created draft claim.
   */
  static async createDraftClaim(claimData) {
    // Ensure all nullable fields are explicitly null if not provided, not undefined
    const { 
      user_id, company_id, 
      description = null, expense_date = null, category_id = null, 
      original_amount = null, original_currency_code = null, 
      receipt_url = null, policy_id = null 
    } = claimData;

    const [result] = await db.execute(
      `INSERT INTO Claims (user_id, company_id, description, expense_date, category_id, original_amount, original_currency_code, receipt_url, policy_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft')`,
      [user_id, company_id, description, expense_date, category_id, original_amount, original_currency_code, receipt_url, policy_id]
    );
    const [rows] = await db.execute('SELECT * FROM Claims WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  /**
   * Creates a new claim directly with 'Processing' status (for immediate submission).
   * All required fields must be present.
   * @param {object} claimData - Complete claim data including user_id, company_id, etc.
   * @returns {Promise<object>} The newly created and submitted claim.
   */
  static async createAndSubmitClaim(claimData) {
    // Ensure all nullable fields are explicitly null if not provided, not undefined
    const { 
      user_id, company_id, description, expense_date, category_id, 
      original_amount, original_currency_code, 
      receipt_url = null, policy_id 
    } = claimData;

    const [result] = await db.execute(
      `INSERT INTO Claims (user_id, company_id, description, expense_date, category_id, original_amount, original_currency_code, receipt_url, policy_id, status, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Processing', NOW())`,
      [user_id, company_id, description, expense_date, category_id, original_amount, original_currency_code, receipt_url, policy_id]
    );
    const [rows] = await db.execute('SELECT * FROM Claims WHERE id = ?', [result.insertId]);
    return rows[0];
  }


  /**
   * Finds a specific claim by its ID, ensuring it belongs to the correct user.
   * @param {number} claimId - The ID of the claim.
   * @param {number} userId - The ID of the user requesting the claim.
   * @returns {Promise<object|null>} The claim object if found and owned by user, otherwise null.
   */
  static async findClaimByIdAndUser(claimId, userId) {
    const [rows] = await db.execute('SELECT * FROM Claims WHERE id = ? AND user_id = ?', [claimId, userId]);
    return rows.length > 0 ? rows[0] : null;
  }
  
  /**
   * Fetches all claims for a specific user.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Array<object>>} An array of the user's claims.
   */
  static async findClaimsByUserId(userId) {
      const [rows] = await db.execute('SELECT * FROM Claims WHERE user_id = ? ORDER BY created_at DESC', [userId]);
      return rows;
  }

  /**
   * Updates an existing draft claim.
   * @param {number} claimId - The ID of the claim to update.
   * @param {number} userId - The ID of the user who owns the claim (for security).
   * @param {object} updateData - An object with fields to update (e.g., description, amount).
   * @returns {Promise<boolean>} True if the update was successful.
   */
  static async updateDraftClaim(claimId, userId, updateData) {
    const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
    const values = fields.map(key => updateData[key]);

    if (fields.length === 0) {
      return false; // No fields to update
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const [result] = await db.execute(
      `UPDATE Claims SET ${setClause}, updated_at = NOW() WHERE id = ? AND user_id = ? AND status = 'Draft'`,
      [...values, claimId, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Submits an existing draft claim, changing its status to 'Processing' and updating all final details.
   * @param {number} claimId - The ID of the claim to submit.
   * @param {number} userId - The ID of the user who owns the claim.
   * @param {object} finalDetails - Final details to update before submission.
   * @returns {Promise<boolean>} True if the update was successful.
   */
  static async submitExistingDraftClaim(claimId, userId, finalDetails) {
    const { description, expense_date, category_id, original_amount, original_currency_code, receipt_url, policy_id } = finalDetails;
    const [result] = await db.execute(
      `UPDATE Claims SET 
        description = ?, expense_date = ?, category_id = ?, original_amount = ?, original_currency_code = ?, receipt_url = ?, policy_id = ?, status = 'Processing', submitted_at = NOW(), updated_at = NOW()
       WHERE id = ? AND user_id = ? AND status = 'Draft'`,
      [description, expense_date, category_id, original_amount, original_currency_code, receipt_url, policy_id, claimId, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Determines the user ID of the next approver in the sequence for a given claim.
   * This is a simplified implementation. A real-world scenario might involve more complex hierarchy traversal.
   * @param {number} claimId - The ID of the claim.
   * @param {number} employeeId - The ID of the employee who submitted the claim.
   * @returns {Promise<number|null>} The user ID of the next approver, or null if no further approver is found.
   */
  static async findNextApprover(claimId, employeeId) {
    // Get the claim's policy and current step
    const [claimRows] = await db.execute('SELECT policy_id, current_approval_step FROM Claims WHERE id = ?', [claimId]);
    if (claimRows.length === 0) return null;
    const { policy_id, current_approval_step } = claimRows[0];

    // If no policy_id is set, or current_approval_step is beyond defined steps, then no approver
    if (!policy_id) return null;

    // Get the rule for the current step from the policy
    const [stepRows] = await db.execute(
      'SELECT approver_determination_type, manager_level_offset, approver_user_id FROM ApprovalPolicySteps WHERE policy_id = ? AND sequence_order = ?',
      [policy_id, current_approval_step]
    );
    if (stepRows.length === 0) return null; // End of the line or misconfigured policy
    const rule = stepRows[0];

    // Determine approver based on rule type
    if (rule.approver_determination_type === 'SpecificUser') {
      return rule.approver_user_id;
    }

    if (rule.approver_determination_type === 'DirectManager') {
      const [userRows] = await db.execute('SELECT manager_id FROM Users WHERE id = ?', [employeeId]);
      return userRows.length > 0 ? userRows[0].manager_id : null;
    }
    
    if (rule.approver_determination_type === 'ManagerNUp') {
        let currentUserId = employeeId;
        for (let i = 0; i < rule.manager_level_offset; i++) {
            const [userRows] = await db.execute('SELECT manager_id FROM Users WHERE id = ?', [currentUserId]);
            if (userRows.length > 0 && userRows[0].manager_id) {
                currentUserId = userRows[0].manager_id;
            } else {
                return null; // No manager at this level
            }
        }
        return currentUserId;
    }
    
    return null; // Fallback if type not recognized or no logic matched
  }

  /**
   * Creates a pending approval record in the ExpenseApprovals table for the next approver.
   * @param {object} approvalData - Contains claim_id and approver_user_id.
   */
  static async createApprovalRecord({ claim_id, approver_user_id }) {
    await db.execute(
      `INSERT INTO ExpenseApprovals (claim_id, approver_user_id, approval_status, action_date) VALUES (?, ?, 'Pending', NOW())`,
      [claim_id, approver_user_id]
    );
  }
}

module.exports = ClaimModel;