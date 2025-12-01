const express = require('express');
const router = express.Router();
const {
  linkABHA,
  getABHAProfile,
  getHealthRecords,
  queryHealthRecords,
  shareRecordWithDoctor,
  syncABHARecords
} = require('../controllers/abhaController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validator');

router.use(protect); // All routes require authentication

router.post('/link', validate(schemas.linkABHA), linkABHA);
router.get('/profile', getABHAProfile);
router.get('/records', getHealthRecords);
router.post('/query', queryHealthRecords);
router.post('/share', shareRecordWithDoctor);
router.post('/sync', syncABHARecords);

module.exports = router;
