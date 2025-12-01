const express = require('express');
const router = express.Router();
const {
  processVoiceCommand,
  textToSpeech
} = require('../controllers/voiceController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validator');

router.use(protect); // All routes require authentication

router.post('/command', validate(schemas.voiceQuery), processVoiceCommand);
router.post('/speak', textToSpeech);

module.exports = router;
