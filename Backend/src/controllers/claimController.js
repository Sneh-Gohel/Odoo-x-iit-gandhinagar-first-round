// src/controllers/claimController.js
const ClaimModel = require('../models/claimModel');

// Helper function for common validation for claim submission
const validateSubmissionFields = (body) => {
  const { description, expense_date, category_id, original_amount, original_currency_code, policy_id } = body;

  if (!description || !expense_date || !category_id || !original_amount || !original_currency_code || !policy_id) {
    return 'All required fields (description, expense date, category, amount, currency, and policy) must be provided for claim submission.';
  }
  if (isNaN(original_amount) || parseFloat(original_amount) <= 0) {
    return 'Amount must be a positive number.';
  }
  if (original_currency_code.length !== 3) {
    return 'Currency code must be 3 characters (e.g., USD).';
  }
  return null; // No validation errors
};

class ClaimController {
  /**
   * Creates a new claim with initial data, setting its status to 'Draft'.
   * Allows for partial data, with unspecified nullable fields defaulting to null.
   * Endpoint: POST /api/claims/draft
   */
  static async createDraftClaim(req, res) {
    const { userId, companyId } = req.user;
    // Explicitly set nullable fields to null if not provided in the request body
    const { 
      description = null, 
      expense_date = null, 
      category_id = null, 
      original_amount = null, 
      original_currency_code = null, 
      receipt_url = null,
      policy_id = null // Policy can also be null for a draft
    } = req.body;

    try {
      const newDraftClaim = await ClaimModel.createDraftClaim({
        user_id: userId,
        company_id: companyId,
        description, expense_date, category_id, original_amount, original_currency_code, receipt_url, policy_id
      });
      res.status(201).json({ message: 'Draft claim created successfully.', claim: newDraftClaim });
    } catch (error) {
      console.error('Error creating draft claim:', error);
      res.status(500).json({ message: 'Server error while creating draft claim.' });
    }
  }

  /**
   * Updates an existing draft claim.
   * This allows employees to continue editing their drafts before submission.
   * Endpoint: PUT /api/claims/draft/:id
   */
  static async updateDraftClaim(req, res) {
    const { userId } = req.user;
    const { id: claimId } = req.params; // Get claim ID from URL parameters
    const updateData = req.body;

    // Filter out undefined values from updateData and ensure nullable fields are explicitly null
    const cleanedUpdateData = {};
    const nullableFields = ['description', 'expense_date', 'category_id', 'original_amount', 'original_currency_code', 'receipt_url', 'policy_id'];
    
    for (const key in updateData) {
      if (updateData[key] !== undefined) { // Only include fields that were actually sent
        cleanedUpdateData[key] = updateData[key];
      }
    }
    // Ensure that if a nullable field is sent as `null`, it's explicitly stored as `null`
    nullableFields.forEach(field => {
      if (field in req.body && req.body[field] === null) {
        cleanedUpdateData[field] = null;
      }
    });

    try {
      const claim = await ClaimModel.findClaimByIdAndUser(claimId, userId);
      if (!claim) {
        return res.status(404).json({ message: 'Draft claim not found or you do not have permission to access it.' });
      }
      if (claim.status !== 'Draft') {
        return res.status(400).json({ message: 'Only claims with "Draft" status can be updated.' });
      }

      const updated = await ClaimModel.updateDraftClaim(claimId, userId, cleanedUpdateData);
      if (updated) {
        // Fetch and return the updated claim to the user
        const updatedClaim = await ClaimModel.findClaimByIdAndUser(claimId, userId);
        res.status(200).json({ message: 'Draft claim updated successfully.', claim: updatedClaim });
      } else {
        res.status(400).json({ message: 'Failed to update draft claim, or no changes were provided.' });
      }
    } catch (error) {
      console.error('Error updating draft claim:', error);
      res.status(500).json({ message: 'Server error while updating draft claim.' });
    }
  }

  /**
   * Creates and directly submits a new claim (without a prior draft phase).
   * Endpoint: POST /api/claims
   */
  static async addAndSubmitClaim(req, res) {
    const { userId, companyId } = req.user;
    const { description, expense_date, category_id, original_amount, original_currency_code, receipt_url = null, policy_id } = req.body;

    const validationError = validateSubmissionFields(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    try {
      // Create the claim directly with 'Processing' status
      const newClaim = await ClaimModel.createAndSubmitClaim({
        user_id: userId,
        company_id: companyId,
        description, expense_date, category_id, 
        original_amount: parseFloat(original_amount), 
        original_currency_code: original_currency_code.toUpperCase(), 
        receipt_url, policy_id
      });

      // Determine the first approver
      const nextApproverId = await ClaimModel.findNextApprover(newClaim.id, userId);
      if (!nextApproverId) {
          console.warn(`No next approver found for new claim ${newClaim.id}. Check approval policy steps and user manager assignments.`);
          return res.status(400).json({ message: 'Could not determine the first approver for this claim. Please check approval policy configuration and user hierarchy.' });
      }

      // Create the initial pending approval record
      await ClaimModel.createApprovalRecord({
          claim_id: newClaim.id,
          approver_user_id: nextApproverId
      });

      res.status(201).json({ message: 'New claim submitted successfully and is now pending approval.', claim: newClaim });
    } catch (error) {
      console.error('Error adding and submitting new claim:', error);
      res.status(500).json({ message: 'Server error while adding and submitting new claim.' });
    }
  }

  /**
   * Submits an existing draft claim for approval.
   * Endpoint: PUT /api/claims/:id/submit-draft
   */
  static async submitExistingDraftClaim(req, res) {
    const { userId } = req.user;
    const { id: claimId } = req.params;
    const { description, expense_date, category_id, original_amount, original_currency_code, receipt_url = null, policy_id } = req.body;

    const validationError = validateSubmissionFields(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    try {
      const claim = await ClaimModel.findClaimByIdAndUser(claimId, userId);
      if (!claim) {
        return res.status(404).json({ message: 'Draft claim not found or you do not have permission to access it.' });
      }
      if (claim.status !== 'Draft') {
        return res.status(400).json({ message: 'Only claims with "Draft" status can be submitted.' });
      }

      // Update status to 'Processing' and save final details (implicitly sets submitted_at)
      const submitted = await ClaimModel.submitExistingDraftClaim(claimId, userId, {
        description, expense_date, category_id, 
        original_amount: parseFloat(original_amount), 
        original_currency_code: original_currency_code.toUpperCase(), 
        receipt_url, policy_id
      });

      if (!submitted) {
          return res.status(500).json({ message: 'Failed to submit draft claim. The claim might no longer be a draft or does not exist.' });
      }
      
      // Determine the first approver based on the policy and user hierarchy
      const nextApproverId = await ClaimModel.findNextApprover(claimId, userId);
      if (!nextApproverId) {
          console.warn(`No next approver found for claim ${claimId}. Check approval policy steps and user manager assignments.`);
          // IMPORTANT: If no approver, consider what happens. For now, it fails submission.
          return res.status(400).json({ message: 'Could not determine the first approver for this claim based on the assigned policy and user hierarchy. Please check configurations.' });
      }

      // Create the initial pending approval record for the determined approver
      await ClaimModel.createApprovalRecord({
          claim_id: claimId,
          approver_user_id: nextApproverId
      });

      res.status(200).json({ message: 'Draft claim submitted successfully and is now pending approval.', claimId });
    } catch (error) {
      console.error('Error submitting draft claim:', error);
      res.status(500).json({ message: 'Server error while submitting draft claim.' });
    }
  }

  /**
   * Gets all claims for the currently authenticated user (including drafts, processing, etc.).
   * Endpoint: GET /api/claims
   */
  static async getUserClaims(req, res) {
      const { userId } = req.user;
      try {
          const claims = await ClaimModel.findClaimsByUserId(userId);
          res.status(200).json({ claims });
      } catch (error) {
          console.error('Error fetching user claims:', error);
          res.status(500).json({ message: 'Server error while fetching claims.' });
      }
  }
}

module.exports = ClaimController;