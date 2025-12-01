const mongoose = require('mongoose');

const glucoseReadingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  value: {
    type: Number,
    required: [true, 'Glucose value is required'],
    min: [20, 'Glucose value too low'],
    max: [600, 'Glucose value too high']
  },
  unit: {
    type: String,
    enum: ['mg/dL', 'mmol/L'],
    default: 'mg/dL'
  },
  readingType: {
    type: String,
    enum: ['fasting', 'post-meal', 'random', 'before-meal', 'bedtime'],
    required: true
  },
  mealContext: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'none'],
    default: 'none'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  source: {
    type: String,
    enum: ['manual', 'cgm', 'predicted', 'glucometer'],
    default: 'manual'
  },
  foodLogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodLog'
  },
  symptoms: [{
    type: String,
    enum: ['normal', 'dizzy', 'tired', 'thirsty', 'hungry', 'headache', 'shaky']
  }],
  mood: {
    type: String,
    enum: ['good', 'okay', 'bad', 'stressed', 'anxious']
  },
  zone: {
    type: String,
    enum: ['normal', 'moderate', 'high', 'low'],
    default: function() {
      if (this.value < 70) return 'low';
      if (this.value <= 140) return 'normal';
      if (this.value <= 180) return 'moderate';
      return 'high';
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
glucoseReadingSchema.index({ userId: 1, timestamp: -1 });
glucoseReadingSchema.index({ userId: 1, zone: 1 });

// Virtual for getting time of day
glucoseReadingSchema.virtual('timeOfDay').get(function() {
  const hour = this.timestamp.getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
});

module.exports = mongoose.model('GlucoseReading', glucoseReadingSchema);
