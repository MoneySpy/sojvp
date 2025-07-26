const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, '../../public/uploads') });

// สมัครสมาชิก
router.post('/register', authController.register);
// เข้าสู่ระบบ
router.post('/login', authController.login);
// ดูโปรไฟล์ (ต้องล็อกอิน)
router.get('/profile', authenticate, authController.getProfile);
// แก้ไขโปรไฟล์ (ต้องล็อกอิน)
router.post('/profile', authenticate, authController.updateProfile);
// เปลี่ยนรหัสผ่าน (ต้องล็อกอิน)
router.post('/change-password', authenticate, authController.changePassword);
// อัปโหลดรูปโปรไฟล์ (ต้องล็อกอิน)
router.post('/upload-profile', authenticate, upload.single('file'), authController.uploadProfileImage);
// อัปโหลดรูปลายเซ็น (ต้องล็อกอิน)
router.post('/upload-signature', authenticate, upload.single('file'), authController.uploadSignatureImage);

module.exports = router;
