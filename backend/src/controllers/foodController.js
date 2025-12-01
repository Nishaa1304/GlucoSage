const FoodLog = require('../models/FoodLog');
const { analyzeFoodImage } = require('../services/foodAIService');
const { successResponse, errorResponse, paginate, getDateRange } = require('../utils/helpers');

// @desc    Scan food and get nutrition analysis
// @route   POST /api/food/scan
// @access  Private
exports.scanFood = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(errorResponse('Please upload a food image', 400));
    }

    const imageUrl = `/uploads/food/${req.file.filename}`;
    const { mealType, notes } = req.body;

    // Analyze food image using AI service
    const analysisResult = await analyzeFoodImage(req.file.path);

    // Create food log
    const foodLog = await FoodLog.create({
      userId: req.user._id,
      mealType: mealType || 'snack',
      imageUrl,
      detectedItems: analysisResult.detectedItems,
      nutrition: analysisResult.nutrition,
      sugarImpact: analysisResult.sugarImpact,
      advice: analysisResult.advice,
      notes,
      tags: analysisResult.tags || []
    });

    res.status(201).json(successResponse(foodLog, 'Food analyzed successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's food logs
// @route   GET /api/food/logs?page=1&limit=10&period=7d
// @access  Private
exports.getFoodLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, period = '7d', mealType } = req.query;
    const { skip, limit: parsedLimit } = paginate(page, limit);
    const { startDate, endDate } = getDateRange(period);

    const query = {
      userId: req.user._id,
      timestamp: { $gte: startDate, $lte: endDate }
    };

    if (mealType) {
      query.mealType = mealType;
    }

    const foodLogs = await FoodLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parsedLimit);

    const total = await FoodLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: foodLogs,
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

// @desc    Get single food log by ID
// @route   GET /api/food/logs/:id
// @access  Private
exports.getFoodLogById = async (req, res, next) => {
  try {
    const foodLog = await FoodLog.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!foodLog) {
      return next(errorResponse('Food log not found', 404));
    }

    res.status(200).json(successResponse(foodLog, 'Food log fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Update food log
// @route   PUT /api/food/logs/:id
// @access  Private
exports.updateFoodLog = async (req, res, next) => {
  try {
    const { notes, liked, tags } = req.body;
    
    const foodLog = await FoodLog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { notes, liked, tags },
      { new: true, runValidators: true }
    );

    if (!foodLog) {
      return next(errorResponse('Food log not found', 404));
    }

    res.status(200).json(successResponse(foodLog, 'Food log updated successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete food log
// @route   DELETE /api/food/logs/:id
// @access  Private
exports.deleteFoodLog = async (req, res, next) => {
  try {
    const foodLog = await FoodLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!foodLog) {
      return next(errorResponse('Food log not found', 404));
    }

    res.status(200).json(successResponse(null, 'Food log deleted successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Get food statistics
// @route   GET /api/food/statistics?period=7d
// @access  Private
exports.getFoodStatistics = async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    const foodLogs = await FoodLog.find({
      userId: req.user._id,
      timestamp: { $gte: startDate, $lte: endDate }
    });

    // Calculate statistics
    const totalMeals = foodLogs.length;
    const avgCarbs = foodLogs.reduce((sum, log) => sum + log.nutrition.carbs, 0) / totalMeals || 0;
    const avgProtein = foodLogs.reduce((sum, log) => sum + log.nutrition.protein, 0) / totalMeals || 0;
    const avgCalories = foodLogs.reduce((sum, log) => sum + log.nutrition.calories, 0) / totalMeals || 0;
    
    const glycemicLoadDistribution = {
      Low: foodLogs.filter(log => log.nutrition.glycemicLoad === 'Low').length,
      Medium: foodLogs.filter(log => log.nutrition.glycemicLoad === 'Medium').length,
      High: foodLogs.filter(log => log.nutrition.glycemicLoad === 'High').length
    };

    const mealTypeDistribution = {
      breakfast: foodLogs.filter(log => log.mealType === 'breakfast').length,
      lunch: foodLogs.filter(log => log.mealType === 'lunch').length,
      dinner: foodLogs.filter(log => log.mealType === 'dinner').length,
      snack: foodLogs.filter(log => log.mealType === 'snack').length
    };

    const statistics = {
      totalMeals,
      avgNutrition: {
        carbs: Math.round(avgCarbs),
        protein: Math.round(avgProtein),
        calories: Math.round(avgCalories)
      },
      glycemicLoadDistribution,
      mealTypeDistribution,
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
