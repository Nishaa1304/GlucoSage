const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/helpers');

// @desc    Get all users
// @route   GET /api/users
// @access  Public (should be protected in production)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public (should be protected in production)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    next(error);
  }
};

// @desc    Link or Update ABHA ID for a user
// @route   PATCH /api/users/:id/abha
// @access  Public (should be protected in production)
exports.linkAbha = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { abhaNumber, abhaAddress } = req.body;

    // Validate input
    if (!abhaNumber && !abhaAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least ABHA Number or ABHA Address'
      });
    }

    // Validate ABHA Number format (if provided)
    if (abhaNumber) {
      const abhaNumberPattern = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
      if (!abhaNumberPattern.test(abhaNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ABHA Number format. Expected format: XXXX-XXXX-XXXX-XXXX'
        });
      }

      // Check if ABHA Number already exists for another user
      const existingUser = await User.findOne({ 
        abhaNumber, 
        _id: { $ne: userId } 
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'This ABHA Number is already linked to another user'
        });
      }
    }

    // Validate ABHA Address format (if provided)
    if (abhaAddress) {
      const abhaAddressPattern = /^[\w.-]+@abdm$/;
      if (!abhaAddressPattern.test(abhaAddress)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ABHA Address format. Expected format: username@abdm'
        });
      }

      // Check if ABHA Address already exists for another user
      const existingUser = await User.findOne({ 
        abhaAddress, 
        _id: { $ne: userId } 
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'This ABHA Address is already linked to another user'
        });
      }
    }

    // Update user with ABHA information
    const updateData = {
      abhaLinked: true
    };

    if (abhaNumber) {
      updateData.abhaNumber = abhaNumber;
    }

    if (abhaAddress) {
      updateData.abhaAddress = abhaAddress;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'ABHA information linked successfully',
      data: updatedUser
    });

  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `This ${field} is already linked to another user`
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    next(error);
  }
};

// @desc    Unlink ABHA from user
// @route   DELETE /api/users/:id/abha
// @access  Public (should be protected in production)
exports.unlinkAbha = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        abhaLinked: false,
        abhaNumber: null,
        abhaAddress: null
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'ABHA information unlinked successfully',
      data: updatedUser
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get users with ABHA linked
// @route   GET /api/users/abha/linked
// @access  Public (should be protected in production)
exports.getAbhaLinkedUsers = async (req, res, next) => {
  try {
    const users = await User.find({ abhaLinked: true }).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('doctorId', 'name email phoneNumber');

    res.status(200).json(successResponse(user, 'Profile fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ['name', 'age', 'gender', 'language', 'phoneNumber', 'diagnosisType', 'targetGlucoseRange', 'medications'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json(successResponse(user, 'Profile updated successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Update language preference
// @route   PUT /api/user/language
// @access  Private
exports.updateLanguage = async (req, res, next) => {
  try {
    const { language } = req.body;

    if (!['en', 'hi'].includes(language)) {
      return next(errorResponse('Invalid language', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { language },
      { new: true }
    );

    res.status(200).json(successResponse(user, 'Language updated successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/user/account
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};
