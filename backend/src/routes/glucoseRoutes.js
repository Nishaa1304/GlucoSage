const express = require('express');
const router = express.Router();
const {
  addGlucoseReading,
  getGlucoseReadings,
  getGlucoseTrend,
  getPrediction,
  getWhatIfScenario,
  getGlucoseStatistics,
  deleteGlucoseReading
} = require('../controllers/glucoseController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validator');

router.use(protect); // All routes require authentication

router.post('/reading', validate(schemas.glucoseReading), addGlucoseReading);
router.get('/readings', getGlucoseReadings);
router.get('/trend', getGlucoseTrend);
router.get('/prediction', getPrediction);
router.post('/what-if', getWhatIfScenario);
router.get('/statistics', getGlucoseStatistics);
router.delete('/reading/:id', deleteGlucoseReading);

module.exports = router;
