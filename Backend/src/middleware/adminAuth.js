// src/middleware/adminAuth.js

const adminAuth = (req, res, next) => {
  // Assuming authMiddleware has already run and attached req.user
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only.' });
  }
  next();
};

module.exports = adminAuth;