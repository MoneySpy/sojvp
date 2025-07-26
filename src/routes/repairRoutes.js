const express = require('express');
const router = express.Router();
const repairController = require('../controllers/repairController');
const { authenticate, authorize } = require('../middleware/auth');

// แจ้งซ่อมใหม่ (ทุกคนที่ล็อกอิน)
router.post('/create', authenticate, repairController.createRepair);
// ดึงรายการแจ้งซ่อม (ตามสิทธิ์)
router.get('/list', authenticate, repairController.getRepairs);
// อัปเดตสถานะ (Admin, SuperAdmin, SuperUser)
router.post('/update-status', authenticate, authorize(['SuperAdmin', 'Admin', 'SuperUser']), repairController.updateRepairStatus);
// มอบหมายงาน (เฉพาะ SuperAdmin)
router.post('/assign', authenticate, authorize(['SuperAdmin']), repairController.assignRepair);
// ประวัติแจ้งซ่อม (ของ user)
router.get('/history', authenticate, repairController.getRepairHistory);

module.exports = router; 