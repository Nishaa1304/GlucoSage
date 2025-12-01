const express = require('express');
const router = express.Router();
const {
  getAllPatients,
  getPatientDetail,
  getHighRiskPatients,
  getPatientAnalytics,
  updatePatientNote
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require authentication
router.use(authorize('doctor')); // Only doctors can access

router.get('/patients', getAllPatients);
router.get('/patients/high-risk', getHighRiskPatients);
router.get('/patients/:id', getPatientDetail);
router.get('/patients/:id/analytics', getPatientAnalytics);
router.put('/patients/:id/note', updatePatientNote);

module.exports = router;
