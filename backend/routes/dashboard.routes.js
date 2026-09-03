const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// الحصول على لوحة التحكم
router.get('/', authMiddleware, dashboardController.getDashboard);

// الحصول على الإحصائيات
router.get('/statistics', authMiddleware, dashboardController.getStatistics);

module.exports = router;
