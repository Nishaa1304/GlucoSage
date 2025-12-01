const { successResponse } = require('../utils/helpers');

// @desc    Process voice command
// @route   POST /api/voice/command
// @access  Private
exports.processVoiceCommand = async (req, res, next) => {
  try {
    const { transcript, language, intent } = req.body;
    const userId = req.user._id;

    // Log voice interaction for analytics
    console.log(`Voice command from user ${userId}:`, { transcript, language, intent });

    // Parse and respond based on intent
    let response = {
      transcript,
      language,
      intent,
      action: null,
      message: ''
    };

    switch (intent) {
      case 'scan':
        response.action = 'navigate';
        response.route = '/scan';
        response.message = language === 'hi-IN' 
          ? 'खाना स्कैनर खोल रहा हूं'
          : 'Opening food scanner';
        break;

      case 'prediction':
        response.action = 'navigate';
        response.route = '/prediction';
        response.message = language === 'hi-IN'
          ? 'आपकी ग्लूकोज भविष्यवाणी दिखा रहा हूं'
          : 'Showing your glucose predictions';
        break;

      case 'abha':
        response.action = 'navigate';
        response.route = '/abha';
        response.message = language === 'hi-IN'
          ? 'आपके स्वास्थ्य रिकॉर्ड खोल रहा हूं'
          : 'Opening your health records';
        break;

      case 'query':
      case 'unknown':
      default:
        response.action = 'acknowledge';
        response.message = language === 'hi-IN'
          ? `मैंने सुना: ${transcript}`
          : `I heard: ${transcript}`;
    }

    res.status(200).json(successResponse(response, 'Voice command processed'));
  } catch (error) {
    next(error);
  }
};

// @desc    Text-to-speech endpoint
// @route   POST /api/voice/speak
// @access  Private
exports.textToSpeech = async (req, res, next) => {
  try {
    const { text, language = 'en-US' } = req.body;

    // In a real implementation, this would call a TTS service
    // For now, we just acknowledge the request
    const response = {
      text,
      language,
      audioUrl: null, // Would contain URL to generated audio
      message: 'TTS request received. Client-side synthesis recommended.'
    };

    res.status(200).json(successResponse(response, 'TTS processed'));
  } catch (error) {
    next(error);
  }
};
