const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

// กราฟจำนวนแจ้งซ่อมแต่ละเดือน
router.get('/monthly-repair-stats', authenticate, dashboardController.getMonthlyRepairStats);
// กราฟค่าใช้จ่ายแต่ละเดือน
router.get('/monthly-expense-stats', authenticate, dashboardController.getMonthlyExpenseStats);

module.exports = router; 