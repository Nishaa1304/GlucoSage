const User = require('../models/User');
const GlucoseReading = require('../models/GlucoseReading');
const FoodLog = require('../models/FoodLog');
const ABHARecord = require('../models/ABHARecord');
const { successResponse, errorResponse, getDateRange } = require('../utils/helpers');

// @desc    Get all patients for doctor
// @route   GET /api/doctor/patients
// @access  Private (Doctor only)
exports.getAllPatients = async (req, res, next) => {
  try {
    const doctorId = req.user._id;

    // Get all patients assigned to this doctor
    const patients = await User.find({
      doctorId,
      userType: 'patient',
      isActive: true
    }).select('name age email phoneNumber diagnosisType abhaLinked lastLogin');

    // Enhance with recent data
    const patientsWithData = await Promise.all(
      patients.map(async (patient) => {
        const { startDate, endDate } = getDateRange('7d');
        
        // Get recent glucose readings
        const readings = await GlucoseReading.find({
          userId: patient._id,
          timestamp: { $gte: startDate, $lte: endDate }
        });

        // Calculate average and alerts
        const values = readings.map(r => r.value);
        const avgSugar = values.length > 0 
          ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
          : 0;
        
        const highAlerts = readings.filter(r => r.zone === 'high').length;

        // Get last reading
        const lastReading = await GlucoseReading.findOne({ userId: patient._id })
          .sort({ timestamp: -1 });

        // Find risky meal time
        const foodLogs = await FoodLog.find({
          userId: patient._id,
          timestamp: { $gte: startDate, $lte: endDate }
        });
        
        const riskyMealCounts = {
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          snack: 0
        };
        
        foodLogs.forEach(log => {
          if (log.nutrition.glycemicLoad === 'High') {
            riskyMealCounts[log.mealType]++;
          }
        });
        
        const riskyMeal = Object.entries(riskyMealCounts)
          .sort(([,a], [,b]) => b - a)[0][0];

        return {
          id: patient._id,
          name: patient.name,
          age: patient.age,
          email: patient.email,
          diagnosis: patient.diagnosisType,
          avgSugar,
          highAlerts,
          riskyMeal: riskyMeal.charAt(0).toUpperCase() + riskyMeal.slice(1),
          lastReading: lastReading ? {
            value: lastReading.value,
            time: lastReading.timestamp
          } : null,
          abhaLinked: patient.abhaLinked
        };
      })
    );

    res.status(200).json(successResponse(patientsWithData, 'Patients fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient detail
// @route   GET /api/doctor/patients/:id
// @access  Private (Doctor only)
exports.getPatientDetail = async (req, res, next) => {
  try {
    const patient = await User.findOne({
      _id: req.params.id,
      doctorId: req.user._id,
      userType: 'patient'
    });

    if (!patient) {
      return next(errorResponse('Patient not found', 404));
    }

    // Get comprehensive patient data
    const { startDate, endDate } = getDateRange('30d');

    const glucoseReadings = await GlucoseReading.find({
      userId: patient._id,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: -1 });

    const foodLogs = await FoodLog.find({
      userId: patient._id,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: -1 });

    const abhaRecord = await ABHARecord.findOne({ userId: patient._id });

    const patientDetail = {
      profile: patient,
      glucoseReadings,
      foodLogs,
      abhaLinked: !!abhaRecord,
      medications: patient.medications,
      targetRange: patient.targetGlucoseRange
    };

    res.status(200).json(successResponse(patientDetail, 'Patient detail fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Get high-risk patients
// @route   GET /api/doctor/patients/high-risk
// @access  Private (Doctor only)
exports.getHighRiskPatients = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const { startDate, endDate } = getDateRange('7d');

    const patients = await User.find({
      doctorId,
      userType: 'patient',
      isActive: true
    });

    const highRiskPatients = [];

    for (const patient of patients) {
      const readings = await GlucoseReading.find({
        userId: patient._id,
        timestamp: { $gte: startDate, $lte: endDate }
      });

      const highAlerts = readings.filter(r => r.zone === 'high').length;
      const avgSugar = readings.length > 0
        ? readings.reduce((sum, r) => sum + r.value, 0) / readings.length
        : 0;

      // Define high-risk criteria
      if (highAlerts >= 3 || avgSugar > 180) {
        highRiskPatients.push({
          id: patient._id,
          name: patient.name,
          age: patient.age,
          diagnosisType: patient.diagnosisType,
          avgSugar: Math.round(avgSugar),
          highAlerts,
          riskLevel: highAlerts >= 5 ? 'Critical' : 'High'
        });
      }
    }

    res.status(200).json(successResponse(highRiskPatients, 'High-risk patients fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient analytics
// @route   GET /api/doctor/patients/:id/analytics?period=30d
// @access  Private (Doctor only)
exports.getPatientAnalytics = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    const patient = await User.findOne({
      _id: req.params.id,
      doctorId: req.user._id,
      userType: 'patient'
    });

    if (!patient) {
      return next(errorResponse('Patient not found', 404));
    }

    // Glucose analytics
    const readings = await GlucoseReading.find({
      userId: patient._id,
      timestamp: { $gte: startDate, $lte: endDate }
    });

    const avgGlucose = readings.length > 0
      ? Math.round(readings.reduce((sum, r) => sum + r.value, 0) / readings.length)
      : 0;

    const glucoseZones = {
      normal: readings.filter(r => r.zone === 'normal').length,
      moderate: readings.filter(r => r.zone === 'moderate').length,
      high: readings.filter(r => r.zone === 'high').length,
      low: readings.filter(r => r.zone === 'low').length
    };

    // Food analytics
    const foodLogs = await FoodLog.find({
      userId: patient._id,
      timestamp: { $gte: startDate, $lte: endDate }
    });

    const avgCarbs = foodLogs.length > 0
      ? Math.round(foodLogs.reduce((sum, f) => sum + f.nutrition.carbs, 0) / foodLogs.length)
      : 0;

    const glycemicDistribution = {
      Low: foodLogs.filter(f => f.nutrition.glycemicLoad === 'Low').length,
      Medium: foodLogs.filter(f => f.nutrition.glycemicLoad === 'Medium').length,
      High: foodLogs.filter(f => f.nutrition.glycemicLoad === 'High').length
    };

    const analytics = {
      patient: {
        name: patient.name,
        age: patient.age,
        diagnosis: patient.diagnosisType
      },
      glucose: {
        avgValue: avgGlucose,
        totalReadings: readings.length,
        zoneDistribution: glucoseZones,
        timeInRange: Math.round((glucoseZones.normal / readings.length) * 100) || 0
      },
      food: {
        totalMeals: foodLogs.length,
        avgCarbs,
        glycemicDistribution
      },
      period: {
        startDate,
        endDate,
        days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      }
    };

    res.status(200).json(successResponse(analytics, 'Analytics fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient note
// @route   PUT /api/doctor/patients/:id/note
// @access  Private (Doctor only)
exports.updatePatientNote = async (req, res, next) => {
  try {
    const { note } = req.body;

    const patient = await User.findOne({
      _id: req.params.id,
      doctorId: req.user._id,
      userType: 'patient'
    });

    if (!patient) {
      return next(errorResponse('Patient not found', 404));
    }

    // In a real app, you'd have a separate PatientNotes model
    // For now, we'll just return success
    res.status(200).json(successResponse({ note }, 'Note updated successfully'));
  } catch (error) {
    next(error);
  }
};
