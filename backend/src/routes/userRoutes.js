const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  linkAbha,
  unlinkAbha,
  getAbhaLinkedUsers,
  getProfile,
  updateProfile,
  deleteAccount,
  updateLanguage
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validator');

// Public routes for ABHA management (should be protected in production)
router.get('/abha/linked', getAbhaLinkedUsers);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id/abha', linkAbha);
router.delete('/:id/abha', unlinkAbha);

// Protected routes
router.use(protect); // All routes below require authentication

router.route('/profile')
  .get(getProfile)
  .put(validate(schemas.updateProfile), updateProfile);

router.put('/language', updateLanguage);
router.delete('/account', deleteAccount);

module.exports = router;
