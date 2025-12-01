const ABHARecord = require('../models/ABHARecord');
const User = require('../models/User');
const { linkABHAAccount, fetchHealthRecords } = require('../services/abhaService');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Link ABHA account
// @route   POST /api/abha/link
// @access  Private
exports.linkABHA = async (req, res, next) => {
  try {
    const { abhaNumber, abhaAddress } = req.body;
    const userId = req.user._id;

    // Check if ABHA already linked
    const existingABHA = await ABHARecord.findOne({ userId });
    if (existingABHA) {
      return next(errorResponse('ABHA account already linked', 400));
    }

    // Verify ABHA with external service (mock for now)
    const verificationResult = await linkABHAAccount(abhaNumber, abhaAddress);

    if (!verificationResult.success) {
      return next(errorResponse('ABHA verification failed', 400));
    }

    // Create ABHA record
    const abhaRecord = await ABHARecord.create({
      userId,
      abhaNumber,
      abhaAddress,
      isVerified: true,
      healthRecords: verificationResult.initialRecords || []
    });

    // Update user
    await User.findByIdAndUpdate(userId, {
      abhaLinked: true,
      abhaNumber
    });

    res.status(201).json(successResponse(abhaRecord, 'ABHA linked successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Get ABHA profile
// @route   GET /api/abha/profile
// @access  Private
exports.getABHAProfile = async (req, res, next) => {
  try {
    const abhaRecord = await ABHARecord.findOne({ userId: req.user._id })
      .populate('userId', 'name age email');

    if (!abhaRecord) {
      return next(errorResponse('ABHA account not linked', 404));
    }

    res.status(200).json(successResponse(abhaRecord, 'ABHA profile fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Get health records
// @route   GET /api/abha/records?type=glucose&limit=10
// @access  Private
exports.getHealthRecords = async (req, res, next) => {
  try {
    const { type, limit = 20 } = req.query;

    const abhaRecord = await ABHARecord.findOne({ userId: req.user._id });

    if (!abhaRecord) {
      return next(errorResponse('ABHA account not linked', 404));
    }

    let records = abhaRecord.healthRecords;

    // Filter by type if provided
    if (type) {
      records = records.filter(r => r.type === type);
    }

    // Sort by date descending
    records = records.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Limit results
    records = records.slice(0, parseInt(limit));

    res.status(200).json(successResponse(records, 'Health records fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Query health records using voice/text
// @route   POST /api/abha/query
// @access  Private
exports.queryHealthRecords = async (req, res, next) => {
  try {
    const { query, language = 'en' } = req.body;

    const abhaRecord = await ABHARecord.findOne({ userId: req.user._id });

    if (!abhaRecord) {
      return next(errorResponse('ABHA account not linked', 404));
    }

    // Parse query (simple keyword matching for now)
    const lowerQuery = query.toLowerCase();
    let filteredRecords = abhaRecord.healthRecords;

    if (lowerQuery.includes('sugar') || lowerQuery.includes('glucose') || lowerQuery.includes('शुगर')) {
      filteredRecords = filteredRecords.filter(r => r.type === 'glucose');
    } else if (lowerQuery.includes('prescription') || lowerQuery.includes('medicine') || lowerQuery.includes('दवा')) {
      filteredRecords = filteredRecords.filter(r => r.type === 'prescription');
    } else if (lowerQuery.includes('lab') || lowerQuery.includes('test') || lowerQuery.includes('टेस्ट')) {
      filteredRecords = filteredRecords.filter(r => r.type === 'lab');
    } else if (lowerQuery.includes('last') || lowerQuery.includes('recent')) {
      const count = parseInt(lowerQuery.match(/\d+/)?.[0]) || 3;
      filteredRecords = filteredRecords.slice(0, count);
    }

    // Sort by date
    filteredRecords = filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    const response = {
      query,
      language,
      results: filteredRecords,
      count: filteredRecords.length
    };

    res.status(200).json(successResponse(response, 'Records queried successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Share records with doctor
// @route   POST /api/abha/share
// @access  Private
exports.shareRecordWithDoctor = async (req, res, next) => {
  try {
    const { doctorId, recordIds } = req.body;

    // Verify doctor exists
    const doctor = await User.findOne({ _id: doctorId, userType: 'doctor' });
    if (!doctor) {
      return next(errorResponse('Doctor not found', 404));
    }

    const abhaRecord = await ABHARecord.findOne({ userId: req.user._id });
    if (!abhaRecord) {
      return next(errorResponse('ABHA account not linked', 404));
    }

    // Share specified records
    let sharedCount = 0;
    for (const recordId of recordIds) {
      const record = abhaRecord.healthRecords.find(r => r.recordId === recordId);
      if (record) {
        record.isShared = true;
        record.sharedWith.push({
          doctorId,
          sharedDate: new Date()
        });
        sharedCount++;
      }
    }

    await abhaRecord.save();

    res.status(200).json(successResponse({
      sharedCount,
      doctorName: doctor.name,
      doctorEmail: doctor.email
    }, 'Records shared successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Sync ABHA records
// @route   POST /api/abha/sync
// @access  Private
exports.syncABHARecords = async (req, res, next) => {
  try {
    const abhaRecord = await ABHARecord.findOne({ userId: req.user._id });
    if (!abhaRecord) {
      return next(errorResponse('ABHA account not linked', 404));
    }

    // Fetch latest records from ABHA service (mock for now)
    const latestRecords = await fetchHealthRecords(abhaRecord.abhaNumber);

    // Add new records
    for (const record of latestRecords) {
      const exists = abhaRecord.healthRecords.some(r => r.recordId === record.recordId);
      if (!exists) {
        abhaRecord.healthRecords.push(record);
      }
    }

    abhaRecord.lastSyncedAt = new Date();
    await abhaRecord.save();

    res.status(200).json(successResponse({
      newRecords: latestRecords.length,
      lastSyncedAt: abhaRecord.lastSyncedAt
    }, 'Records synced successfully'));
  } catch (error) {
    next(error);
  }
};
