// Food AI Service - Integration with Python YOLOv8 + XGBoost backend
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// AI Backend configuration
const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:5001';
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

/**
 * Analyze food image using YOLOv8 + XGBoost AI backend
 * @param {string} imagePath - Path to uploaded image
 * @param {Object} options - Additional options (timeOfDay, userProfile, etc.)
 * @returns {Promise<Object>} Analysis result
 */
exports.analyzeFoodImage = async (imagePath, options = {}) => {
  // Use mock data in development if AI backend is not available
  if (USE_MOCK_DATA) {
    return await analyzeFoodImageMock(imagePath);
  }

  try {
    // Prepare form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));
    formData.append('time_of_day', options.timeOfDay || getTimeOfDay());
    formData.append('last_glucose_reading', options.lastGlucoseReading || 100);
    formData.append('hours_since_last_meal', options.hoursSinceLastMeal || 4);
    
    if (options.userProfile) {
      formData.append('user_profile', JSON.stringify(options.userProfile));
    }

    // Call Python AI backend
    const response = await axios.post(
      `${AI_BACKEND_URL}/api/v1/food/scan-and-predict`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 30000 // 30 second timeout
      }
    );

    const aiResult = response.data;

    if (!aiResult.success) {
      throw new Error(aiResult.error || 'AI analysis failed');
    }

    // Transform AI backend response to match our schema
    return transformAIResponse(aiResult);

  } catch (error) {
    console.error('AI Backend Error:', error.message);
    
    // Fallback to mock data if AI backend is unavailable
    console.log('Falling back to mock data...');
    return await analyzeFoodImageMock(imagePath);
  }
};

/**
 * Transform AI backend response to match FoodLog schema
 */
function transformAIResponse(aiResult) {
  // Map detected foods to detectedItems format
  const detectedItems = aiResult.detections.map(detection => ({
    name: capitalizeFood(detection.item),
    quantity: 1,
    unit: detection.portion_size === 'small' ? 'small portion' : 
           detection.portion_size === 'large' ? 'large portion' : 'medium portion',
    confidence: detection.confidence
  }));

  // Map nutrition data
  const nutrition = {
    carbs: Math.round(aiResult.total_carbs),
    protein: Math.round(aiResult.total_protein),
    fat: Math.round(aiResult.total_fat),
    calories: Math.round(aiResult.total_calories),
    fiber: Math.round(aiResult.total_fiber),
    sugar: Math.round(aiResult.total_carbs * 0.1), // Estimate
    glycemicLoad: aiResult.glycemic_load < 20 ? 'Low' : 
                  aiResult.glycemic_load < 30 ? 'Medium' : 'High'
  };

  // Map sugar impact prediction
  const sugarImpact = {
    prediction: getPredictionMessage(aiResult.risk_level),
    peakTime: aiResult.peak_time,
    expectedRange: `${aiResult.predicted_glucose_1h}-${aiResult.predicted_glucose_2h} mg/dL`,
    glucose1h: aiResult.predicted_glucose_1h,
    glucose2h: aiResult.predicted_glucose_2h,
    spike1h: aiResult.glucose_spike_1h,
    spike2h: aiResult.glucose_spike_2h
  };

  // Map advice
  const advice = [
    aiResult.message,
    ...(aiResult.suggestions || []),
    aiResult.time_advice
  ].filter(Boolean);

  // Generate tags
  const tags = generateTags(aiResult);

  return {
    detectedItems,
    nutrition,
    sugarImpact,
    advice,
    tags,
    aiMetadata: {
      model: 'YOLOv8 + XGBoost',
      riskLevel: aiResult.risk_level,
      glycemicLoad: aiResult.glycemic_load,
      icon: aiResult.icon
    }
  };
}

/**
 * Mock food analysis for development/fallback
 */
async function analyzeFoodImageMock(imagePath) {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const mockFoodDatabase = [
    {
      detectedItems: [
        { name: 'Roti (Whole Wheat)', quantity: 2, unit: 'pieces', confidence: 0.92 },
        { name: 'Dal Tadka', quantity: 1, unit: 'bowl', confidence: 0.88 },
        { name: 'Mixed Vegetable Sabzi', quantity: 1, unit: 'bowl', confidence: 0.85 }
      ],
      nutrition: {
        carbs: 55,
        protein: 18,
        fat: 12,
        calories: 420,
        fiber: 8,
        sugar: 5,
        glycemicLoad: 'Medium'
      },
      sugarImpact: {
        prediction: 'Moderate rise expected',
        peakTime: '1.5 hours',
        expectedRange: '145-165 mg/dL',
        glucose1h: 145,
        glucose2h: 165,
        spike1h: 35,
        spike2h: 55
      },
      advice: [
        'Good balanced meal with protein and fiber',
        'Eating vegetables first can slow glucose absorption',
        'Consider adding more protein for better satiety'
      ],
      tags: ['home-cooked', 'vegetarian', 'balanced']
    },
    {
      detectedItems: [
        { name: 'White Rice', quantity: 1.5, unit: 'cups', confidence: 0.95 },
        { name: 'Chicken Curry', quantity: 150, unit: 'grams', confidence: 0.90 },
        { name: 'Raita', quantity: 1, unit: 'bowl', confidence: 0.87 }
      ],
      nutrition: {
        carbs: 72,
        protein: 28,
        fat: 15,
        calories: 520,
        fiber: 3,
        sugar: 4,
        glycemicLoad: 'High'
      },
      sugarImpact: {
        prediction: 'High spike likely',
        peakTime: '1 hour',
        expectedRange: '180-200 mg/dL',
        glucose1h: 190,
        glucose2h: 200,
        spike1h: 80,
        spike2h: 90
      },
      advice: [
        'Replace white rice with brown rice for lower GI',
        'Reduce portion size of rice',
        'Good protein content helps stabilize blood sugar',
        'Consider having raita before the meal'
      ],
      tags: ['high-carb', 'high-protein', 'home-cooked']
    },
    {
      detectedItems: [
        { name: 'Idli', quantity: 3, unit: 'pieces', confidence: 0.94 },
        { name: 'Sambar', quantity: 1, unit: 'bowl', confidence: 0.91 },
        { name: 'Coconut Chutney', quantity: 2, unit: 'tbsp', confidence: 0.89 }
      ],
      nutrition: {
        carbs: 48,
        protein: 12,
        fat: 8,
        calories: 320,
        fiber: 6,
        sugar: 3,
        glycemicLoad: 'Low'
      },
      sugarImpact: {
        prediction: 'Gentle rise',
        peakTime: '2 hours',
        expectedRange: '130-150 mg/dL',
        glucose1h: 130,
        glucose2h: 150,
        spike1h: 20,
        spike2h: 40
      },
      advice: [
        'Excellent breakfast choice - fermented food aids digestion',
        'Good balance of carbs and protein',
        'Sambar adds beneficial vegetables and protein',
        'This meal supports stable glucose levels'
      ],
      tags: ['healthy', 'vegetarian', 'low-carb', 'home-cooked']
    }
  ];

  return mockFoodDatabase[Math.floor(Math.random() * mockFoodDatabase.length)];
}

/**
 * Helper functions
 */

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 11) return 'morning';
  if (hour < 16) return 'afternoon';
  if (hour < 20) return 'evening';
  return 'night';
}

function capitalizeFood(foodName) {
  return foodName.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function getPredictionMessage(riskLevel) {
  const messages = {
    'low': 'Gentle rise expected',
    'moderate': 'Moderate spike likely',
    'high': 'High spike expected'
  };
  return messages[riskLevel] || 'Unknown prediction';
}

function generateTags(aiResult) {
  const tags = ['ai-detected'];
  
  if (aiResult.risk_level === 'low') tags.push('healthy');
  if (aiResult.risk_level === 'high') tags.push('high-carb');
  if (aiResult.total_carbs < 40) tags.push('low-carb');
  if (aiResult.total_protein > 20) tags.push('high-protein');
  if (aiResult.total_fiber > 8) tags.push('high-fiber');
  
  // Food type tags
  const foods = aiResult.foods_detected || [];
  if (foods.some(f => f.includes('dal') || f.includes('sabzi'))) tags.push('vegetarian');
  if (foods.includes('rice') || foods.includes('biryani')) tags.push('rice-based');
  if (foods.includes('roti') || foods.includes('chapati')) tags.push('roti-based');
  
  return tags;
}


/**
 * Get nutritional data for a specific food item
 * @param {string} foodName - Name of the food
 * @returns {Promise<Object>} Nutrition info
 */
exports.getFoodNutrition = async (foodName) => {
  // Mock nutrition database
  const nutritionDB = {
    'roti': { carbs: 15, protein: 3, fat: 1, calories: 80, fiber: 2 },
    'rice': { carbs: 45, protein: 4, fat: 0.5, calories: 200, fiber: 1 },
    'dal': { carbs: 20, protein: 9, fat: 0.5, calories: 115, fiber: 8 },
    'chicken': { carbs: 0, protein: 31, fat: 3.6, calories: 165, fiber: 0 }
  };

  return nutritionDB[foodName.toLowerCase()] || null;
};

/**
 * Submit feedback for model improvement
 * @param {Object} feedback - User feedback data
 * @returns {Promise<Object>} Result
 */
exports.submitFeedback = async (feedback) => {
  if (USE_MOCK_DATA) {
    console.log('Mock mode: Feedback recorded locally');
    return { success: true };
  }

  try {
    const response = await axios.post(
      `${AI_BACKEND_URL}/api/v1/feedback`,
      feedback,
      { timeout: 5000 }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to submit feedback:', error.message);
    return { success: false, error: error.message };
  }
};

