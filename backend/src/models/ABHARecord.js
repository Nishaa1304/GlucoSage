const mongoose = require('mongoose');

const abhaRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  abhaNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{2}-\d{4}-\d{4}-\d{4}$/, 'Invalid ABHA number format']
  },
  abhaAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  linkedDate: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  healthRecords: [{
    recordId: {
      type: String,
      required: true,
      unique: true
    },
    type: {
      type: String,
      enum: ['glucose', 'prescription', 'lab', 'vitals', 'consultation', 'imaging'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    value: String,
    details: String,
    doctor: {
      name: String,
      specialty: String,
      hospital: String
    },
    documents: [{
      filename: String,
      url: String,
      type: String
    }],
    isShared: {
      type: Boolean,
      default: false
    },
    sharedWith: [{
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      sharedDate: Date
    }]
  }],
  consentStatus: {
    type: String,
    enum: ['pending', 'granted', 'revoked'],
    default: 'granted'
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to add new health record
abhaRecordSchema.methods.addHealthRecord = function(recordData) {
  this.healthRecords.push({
    ...recordData,
    recordId: `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  });
  this.lastSyncedAt = Date.now();
  return this.save();
};

// Method to share record with doctor
abhaRecordSchema.methods.shareRecordWithDoctor = function(recordId, doctorId) {
  const record = this.healthRecords.id(recordId);
  if (record) {
    record.isShared = true;
    record.sharedWith.push({
      doctorId,
      sharedDate: new Date()
    });
    return this.save();
  }
  return null;
};

module.exports = mongoose.model('ABHARecord', abhaRecordSchema);
