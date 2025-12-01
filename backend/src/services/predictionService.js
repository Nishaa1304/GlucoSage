const GlucoseReading = require('../models/GlucoseReading');
const FoodLog = require('../models/FoodLog');

/**
 * Predict future glucose levels based on historical data
 * @param {string} userId - User ID
 * @param {Array} recentReadings - Recent glucose readings
 * @returns {Promise<Object>} Prediction data
 */
exports.predictGlucose = async (userId, recentReadings) => {
  // Get current reading
  const currentValue = recentReadings[0].value;
  
  // Generate trend data (simulate next 8 hours)
  const trend = [];
  const baseHours = ['Now', '+1h', '+2h', '+3h', '+4h', '+5h', '+6h', '+7h', '+8h'];
  
  // Simple prediction algorithm (in production, use ML model)
  let predictedValue = currentValue;
  const avgChange = calculateAverageChange(recentReadings);
  
  for (let i = 0; i < baseHours.length; i++) {
    if (i === 0) {
      trend.push({
        time: baseHours[i],
        value: currentValue,
        zone: getZone(currentValue)
      });
    } else {
      // Apply some variation
      const randomFactor = (Math.random() - 0.5) * 10;
      predictedValue = Math.max(70, Math.min(250, predictedValue + avgChange + randomFactor));
      
      trend.push({
        time: baseHours[i],
        value: Math.round(predictedValue),
        zone: getZone(predictedValue)
      });
    }
  }
  
  // Find peak
  const peak = trend.reduce((max, curr) => curr.value > max.value ? curr : max, trend[0]);
  
  return {
    current: currentValue,
    trend,
    prediction: {
      peakTime: peak.time,
      peakValue: peak.value,
      message: `You may reach ${peak.value} mg/dL at ${peak.time}.`
    }
  };
};

/**
 * Calculate what-if scenario
 * @param {string} userId - User ID
 * @param {Array} recentReadings - Recent glucose readings
 * @param {string} scenarioType - Type of scenario
 * @param {Object} parameters - Additional parameters
 * @returns {Promise<Object>} Scenario prediction
 */
exports.calculateWhatIfScenario = async (userId, recentReadings, scenarioType, parameters = {}) => {
  const basePrediction = await exports.predictGlucose(userId, recentReadings);
  
  let modifiedTrend;
  let message;
  
  switch (scenarioType) {
    case 'sweet':
      // Adding a sweet increases glucose by ~25-30 mg/dL
      modifiedTrend = basePrediction.trend.map(point => ({
        ...point,
        value: Math.min(250, point.value + 25 + Math.random() * 5),
        zone: getZone(point.value + 25)
      }));
      message = 'Adding a sweet may spike your sugar by 25-30 mg/dL';
      break;
      
    case 'walk':
      // 15-minute walk reduces glucose by ~15-20 mg/dL
      modifiedTrend = basePrediction.trend.map((point, i) => ({
        ...point,
        value: i > 0 ? Math.max(70, point.value - 15 - Math.random() * 5) : point.value,
        zone: i > 0 ? getZone(point.value - 15) : point.zone
      }));
      message = 'A 15-minute walk could lower your peak by 15-20 mg/dL';
      break;
      
    case 'skip-meal':
      // Skipping meal may cause low glucose
      modifiedTrend = basePrediction.trend.map((point, i) => ({
        ...point,
        value: i > 2 ? Math.max(60, point.value - 30) : point.value,
        zone: i > 2 ? getZone(point.value - 30) : point.zone
      }));
      message = 'Skipping meals may cause low blood sugar';
      break;
      
    case 'medication':
      // Taking medication helps stabilize
      modifiedTrend = basePrediction.trend.map((point, i) => ({
        ...point,
        value: i > 0 ? Math.max(80, Math.min(140, point.value - 10)) : point.value,
        zone: i > 0 ? getZone(point.value - 10) : point.zone
      }));
      message = 'Medication can help keep levels within target range';
      break;
      
    default:
      return basePrediction;
  }
  
  const peak = modifiedTrend.reduce((max, curr) => curr.value > max.value ? curr : max, modifiedTrend[0]);
  
  return {
    scenarioType,
    current: basePrediction.current,
    trend: modifiedTrend,
    prediction: {
      peakTime: peak.time,
      peakValue: peak.value,
      message
    }
  };
};

/**
 * Calculate average change in glucose from readings
 */
function calculateAverageChange(readings) {
  if (readings.length < 2) return 0;
  
  let totalChange = 0;
  for (let i = 0; i < readings.length - 1; i++) {
    totalChange += readings[i].value - readings[i + 1].value;
  }
  
  return totalChange / (readings.length - 1);
}

/**
 * Determine glucose zone
 */
function getZone(value) {
  if (value < 70) return 'low';
  if (value <= 140) return 'normal';
  if (value <= 180) return 'moderate';
  return 'high';
}
