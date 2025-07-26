const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authenticate, authorize } = require('../middleware/auth');

// เพิ่มอะไหล่ (Admin, SuperAdmin, SuperUser)
router.post('/add', authenticate, authorize(['SuperAdmin', 'Admin', 'SuperUser']), stockController.addStock);
// แก้ไขอะไหล่ (Admin, SuperAdmin, SuperUser)
router.post('/update', authenticate, authorize(['SuperAdmin', 'Admin', 'SuperUser']), stockController.updateStock);
// ลบอะไหล่ (Admin, SuperAdmin, SuperUser)
router.post('/delete', authenticate, authorize(['SuperAdmin', 'Admin', 'SuperUser']), stockController.deleteStock);
// ดึงรายการอะไหล่ (Admin, SuperAdmin, SuperUser)
router.get('/list', authenticate, authorize(['SuperAdmin', 'Admin', 'SuperUser']), stockController.getStocks);
// ตัดสต็อก (Admin, SuperAdmin, SuperUser)
router.post('/deduct', authenticate, authorize(['SuperAdmin', 'Admin', 'SuperUser']), stockController.deductStock);
// ประวัติการตัดสต็อก (Admin, SuperAdmin, SuperUser)
router.get('/history', authenticate, authorize(['SuperAdmin', 'Admin', 'SuperUser']), stockController.getStockHistory);

module.exports = router; 