const mongoose = require('mongoose');

const foodLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  imageUrl: {
    type: String
  },
  detectedItems: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 1 }
  }],
  nutrition: {
    carbs: { type: Number, required: true },
    protein: { type: Number, required: true },
    fat: { type: Number, required: true },
    calories: { type: Number, required: true },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    glycemicLoad: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true
    }
  },
  sugarImpact: {
    prediction: { type: String },
    peakTime: { type: String },
    expectedRange: { type: String },
    actualPeakValue: { type: Number }
  },
  advice: [{
    type: String
  }],
  glucoseReadingBefore: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GlucoseReading'
  },
  glucoseReadingAfter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GlucoseReading'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  liked: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    enum: ['healthy', 'high-carb', 'low-carb', 'high-protein', 'vegetarian', 'vegan', 'gluten-free', 'spicy', 'home-cooked', 'restaurant']
  }]
}, {
  timestamps: true
});

// Index for efficient queries
foodLogSchema.index({ userId: 1, timestamp: -1 });
foodLogSchema.index({ userId: 1, mealType: 1 });

// Virtual to calculate total nutritional score
foodLogSchema.virtual('nutritionScore').get(function() {
  const { carbs, protein, fiber, glycemicLoad } = this.nutrition;
  let score = 50;
  
  // Higher protein and fiber = better score
  score += (protein * 2);
  score += (fiber * 3);
  
  // High glycemic load = lower score
  if (glycemicLoad === 'Low') score += 20;
  if (glycemicLoad === 'Medium') score += 10;
  
  // Too many carbs = lower score
  if (carbs > 60) score -= 10;
  
  return Math.min(100, Math.max(0, score));
});

module.exports = mongoose.model('FoodLog', foodLogSchema);
