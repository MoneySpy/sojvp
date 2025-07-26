const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { authenticate, authorize } = require('../middleware/auth');

// สร้างใบสั่งซื้อ PDF (Admin, SuperAdmin, SuperUser)
router.post('/generate-purchase-order', authenticate, authorize(['SuperAdmin', 'Admin', 'SuperUser']), pdfController.generatePurchaseOrderPDF);
// ดูประวัติใบสั่งซื้อย้อนหลัง (Admin, SuperAdmin, SuperUser)
router.get('/purchase-order-history', authenticate, authorize(['SuperAdmin', 'Admin', 'SuperUser']), pdfController.getPurchaseOrderHistory);

module.exports = router; 