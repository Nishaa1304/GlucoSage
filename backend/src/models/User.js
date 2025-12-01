const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  age: {
    type: Number,
    required: [true, 'Please provide age'],
    min: [1, 'Age must be positive'],
    max: [120, 'Age must be realistic']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: false
  },
  userType: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true,
    default: 'patient'
  },
  language: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en'
  },
  phoneNumber: {
    type: String,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
  },
  diagnosisType: {
    type: String,
    enum: ['Type 1 Diabetes', 'Type 2 Diabetes', 'Pre-Diabetes', 'Gestational Diabetes', 'None'],
    default: 'None'
  },
  targetGlucoseRange: {
    min: { type: Number, default: 70 },
    max: { type: Number, default: 140 }
  },
  abhaLinked: {
    type: Boolean,
    default: false
  },
  abhaNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  abhaAddress: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date
  }],
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  return user;
};

module.exports = mongoose.model('User', userSchema);
