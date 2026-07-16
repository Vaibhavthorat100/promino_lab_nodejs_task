const express = require('express');
const { login, createSeller, listSellers } = require('../controllers/admin.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public route for admin login
router.post('/login', login);

// Protected routes (Only admin can access)
router.post('/sellers', authenticateToken, requireRole('admin'), createSeller);
router.get('/sellers', authenticateToken, requireRole('admin'), listSellers);

module.exports = router;
