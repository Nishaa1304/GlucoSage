const GlucoseReading = require('../models/GlucoseReading');
const { predictGlucose, calculateWhatIfScenario } = require('../services/predictionService');
const { successResponse, errorResponse, paginate, getDateRange } = require('../utils/helpers');

// @desc    Add glucose reading
// @route   POST /api/glucose/reading
// @access  Private
exports.addGlucoseReading = async (req, res, next) => {
  try {
    const { value, readingType, mealContext, notes, symptoms, mood } = req.body;

    const reading = await GlucoseReading.create({
      userId: req.user._id,
      value,
      readingType,
      mealContext,
      notes,
      symptoms,
      mood,
      timestamp: new Date()
    });

    res.status(201).json(successResponse(reading, 'Glucose reading added successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Get glucose readings
// @route   GET /api/glucose/readings?page=1&limit=20&period=7d
// @access  Private
exports.getGlucoseReadings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, period = '7d', readingType, zone } = req.query;
    const { skip, limit: parsedLimit } = paginate(page, limit);
    const { startDate, endDate } = getDateRange(period);

    const query = {
      userId: req.user._id,
      timestamp: { $gte: startDate, $lte: endDate }
    };

    if (readingType) query.readingType = readingType;
    if (zone) query.zone = zone;

    const readings = await GlucoseReading.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parsedLimit);

    const total = await GlucoseReading.countDocuments(query);

    res.status(200).json({
      success: true,
      data: readings,
      pagination: {
        page: parseInt(page),
        limit: parsedLimit,
        total,
        pages: Math.ceil(total / parsedLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get glucose trend data
// @route   GET /api/glucose/trend?period=7d
// @access  Private
exports.getGlucoseTrend = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    const readings = await GlucoseReading.find({
      userId: req.user._id,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 });

    // Group by time of day
    const trendData = readings.map(r => ({
      time: r.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: r.value,
      zone: r.zone,
      readingType: r.readingType
    }));

    res.status(200).json(successResponse(trendData, 'Trend data fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Get glucose prediction
// @route   GET /api/glucose/prediction
// @access  Private
exports.getPrediction = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get recent readings for prediction
    const recentReadings = await GlucoseReading.find({ userId })
      .sort({ timestamp: -1 })
      .limit(10);

    if (recentReadings.length === 0) {
      return next(errorResponse('Not enough data for prediction. Please add more glucose readings.', 400));
    }

    // Get prediction
    const prediction = await predictGlucose(userId, recentReadings);

    res.status(200).json(successResponse(prediction, 'Prediction generated successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate what-if scenario
// @route   POST /api/glucose/what-if
// @access  Private
exports.getWhatIfScenario = async (req, res, next) => {
  try {
    const { scenarioType, parameters } = req.body;
    const userId = req.user._id;

    // Get recent readings
    const recentReadings = await GlucoseReading.find({ userId })
      .sort({ timestamp: -1 })
      .limit(10);

    if (recentReadings.length === 0) {
      return next(errorResponse('Not enough data for scenario analysis', 400));
    }

    // Calculate scenario
    const scenarioResult = await calculateWhatIfScenario(
      userId,
      recentReadings,
      scenarioType,
      parameters
    );

    res.status(200).json(successResponse(scenarioResult, 'Scenario calculated successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Get glucose statistics
// @route   GET /api/glucose/statistics?period=7d
// @access  Private
exports.getGlucoseStatistics = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    const readings = await GlucoseReading.find({
      userId: req.user._id,
      timestamp: { $gte: startDate, $lte: endDate }
    });

    if (readings.length === 0) {
      return res.status(200).json(successResponse({
        totalReadings: 0,
        message: 'No readings found for this period'
      }));
    }

    // Calculate statistics
    const values = readings.map(r => r.value);
    const avgGlucose = values.reduce((sum, val) => sum + val, 0) / values.length;
    const minGlucose = Math.min(...values);
    const maxGlucose = Math.max(...values);

    // Zone distribution
    const zoneDistribution = {
      normal: readings.filter(r => r.zone === 'normal').length,
      moderate: readings.filter(r => r.zone === 'moderate').length,
      high: readings.filter(r => r.zone === 'high').length,
      low: readings.filter(r => r.zone === 'low').length
    };

    // Time in range
    const timeInRange = {
      inRange: readings.filter(r => r.value >= 70 && r.value <= 140).length,
      aboveRange: readings.filter(r => r.value > 140).length,
      belowRange: readings.filter(r => r.value < 70).length
    };

    const statistics = {
      totalReadings: readings.length,
      avgGlucose: Math.round(avgGlucose),
      minGlucose,
      maxGlucose,
      zoneDistribution,
      timeInRange: {
        inRange: Math.round((timeInRange.inRange / readings.length) * 100),
        aboveRange: Math.round((timeInRange.aboveRange / readings.length) * 100),
        belowRange: Math.round((timeInRange.belowRange / readings.length) * 100)
      },
      period: {
        startDate,
        endDate,
        days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      }
    };

    res.status(200).json(successResponse(statistics, 'Statistics calculated successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete glucose reading
// @route   DELETE /api/glucose/reading/:id
// @access  Private
exports.deleteGlucoseReading = async (req, res, next) => {
  try {
    const reading = await GlucoseReading.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!reading) {
      return next(errorResponse('Glucose reading not found', 404));
    }

    res.status(200).json(successResponse(null, 'Reading deleted successfully'));
  } catch (error) {
    next(error);
  }
};
