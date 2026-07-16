const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Token required. Please log in first.',
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_change_me_in_production', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token. Access forbidden.',
      });
    }
    req.user = user;
    next();
  });
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Only authorized ${role} users can access this resource.`,
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
};
