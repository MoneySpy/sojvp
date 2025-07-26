const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authenticate, authorize } = require('../middleware/auth');

// เพิ่มครุภัณฑ์ (Admin, SuperAdmin)
router.post('/add', authenticate, authorize(['SuperAdmin', 'Admin']), equipmentController.addEquipment);
// แก้ไขครุภัณฑ์ (Admin, SuperAdmin)
router.post('/update', authenticate, authorize(['SuperAdmin', 'Admin']), equipmentController.updateEquipment);
// ลบครุภัณฑ์ (Admin, SuperAdmin)
router.post('/delete', authenticate, authorize(['SuperAdmin', 'Admin']), equipmentController.deleteEquipment);
// ดึงรายการครุภัณฑ์ (Admin, SuperAdmin, SuperUser)
router.get('/list', authenticate, authorize(['SuperAdmin', 'Admin', 'SuperUser']), equipmentController.getEquipments);
// ปรับสถานะการใช้งาน (Admin, SuperAdmin)
router.post('/update-status', authenticate, authorize(['SuperAdmin', 'Admin']), equipmentController.updateEquipmentStatus);

module.exports = router; 