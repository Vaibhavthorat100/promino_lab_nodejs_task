const express = require('express');
const {
  login,
  addProduct,
  listProducts,
  deleteProduct,
  viewProductPDF,
} = require('../controllers/seller.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public route for seller login
router.post('/login', login);

// Protected routes (Only authenticated sellers can access)
router.post('/products', authenticateToken, requireRole('seller'), addProduct);
router.get('/products', authenticateToken, requireRole('seller'), listProducts);
router.delete('/products/:id', authenticateToken, requireRole('seller'), deleteProduct);
router.get('/products/:id/pdf', authenticateToken, requireRole('seller'), viewProductPDF);

module.exports = router;
