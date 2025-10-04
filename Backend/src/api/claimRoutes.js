// src/api/claimRoutes.js
const express = require('express');
const ClaimController = require('../controllers/claimController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All claim routes require a user to be logged in
router.use(authMiddleware);

// --- Employee Claim Management ---

// POST /api/claims/draft: Create a new claim with 'Draft' status
router.post('/draft', ClaimController.createDraftClaim);

// PUT /api/claims/draft/:id: Update an existing draft claim
router.put('/draft/:id', ClaimController.updateDraftClaim);

// POST /api/claims: Create and directly submit a new claim (status 'Processing')
router.post('/', ClaimController.addAndSubmitClaim);

// PUT /api/claims/:id/submit-draft: Submit an existing draft claim for approval
router.put('/:id/submit-draft', ClaimController.submitExistingDraftClaim);

// GET /api/claims: Get all claims (drafts, processing, etc.) for the authenticated user
router.get('/', ClaimController.getUserClaims);

// (Optional) GET /api/claims/:id: Get a specific claim by ID for viewing
// router.get('/:id', ClaimController.getClaimById); // You can add this later if needed

module.exports = router;