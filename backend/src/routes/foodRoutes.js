const express = require('express');
const router = express.Router();
const {
  scanFood,
  getFoodLogs,
  getFoodLogById,
  updateFoodLog,
  deleteFoodLog,
  getFoodStatistics
} = require('../controllers/foodController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect); // All routes require authentication

router.post('/scan', upload.single('foodImage'), scanFood);
router.get('/logs', getFoodLogs);
router.get('/logs/:id', getFoodLogById);
router.put('/logs/:id', updateFoodLog);
router.delete('/logs/:id', deleteFoodLog);
router.get('/statistics', getFoodStatistics);

module.exports = router;
