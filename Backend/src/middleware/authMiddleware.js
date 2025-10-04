// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided, authorization denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user info (userId, email, role, companyId) to the request
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error('Token verification failed:', error); // Log the actual error for debugging
    return res.status(401).json({ message: 'Token is not valid, authorization denied.' });
  }
};

module.exports = authMiddleware;