const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getPbaTypes,
  getDailyStock,
  createOrUpdateDailyStock,
  getStockHistory,
  getDashboardData
} = require('../controllers/stockController');
const { setInitialStock } = require('../controllers/initialStockController');

const router = express.Router();

router.get('/pba-types', authenticateToken, getPbaTypes);
router.get('/daily/:date', authenticateToken, getDailyStock);
router.post('/daily', authenticateToken, createOrUpdateDailyStock);
router.post('/initial-stock', authenticateToken, setInitialStock);
router.get('/history', authenticateToken, requireAdmin, getStockHistory);
router.get('/dashboard', authenticateToken, requireAdmin, getDashboardData);

module.exports = router;