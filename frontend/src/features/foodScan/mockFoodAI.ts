export interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface NutritionInfo {
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
  glycemicLoad: 'Low' | 'Medium' | 'High';
  fiber: number;
}

export interface FoodAnalysisResult {
  detectedItems: FoodItem[];
  nutrition: NutritionInfo;
  sugarImpact: {
    prediction: string;
    peakTime: string;
    expectedRange: string;
  };
  advice: string[];
}

const mockFoodDatabase: Record<string, FoodAnalysisResult> = {
  'indian-breakfast': {
    detectedItems: [
      { name: 'Aloo Paratha', quantity: 2, unit: 'pieces' },
      { name: 'Curd', quantity: 1, unit: 'bowl' },
      { name: 'Pickle', quantity: 1, unit: 'tbsp' },
    ],
    nutrition: {
      carbs: 65,
      protein: 12,
      fat: 18,
      calories: 520,
      glycemicLoad: 'High',
      fiber: 4,
    },
    sugarImpact: {
      prediction: 'Likely spike',
      peakTime: '1 hour',
      expectedRange: '185-200 mg/dL',
    },
    advice: [
      'Reduce ghee next time',
      'Add salad for better balance',
      'Consider having only 1 paratha',
    ],
  },
  'rice-meal': {
    detectedItems: [
      { name: 'White Rice', quantity: 1.5, unit: 'cups' },
      { name: 'Dal', quantity: 1, unit: 'bowl' },
      { name: 'Mixed Vegetables', quantity: 1, unit: 'bowl' },
      { name: 'Roti', quantity: 1, unit: 'piece' },
    ],
    nutrition: {
      carbs: 78,
      protein: 15,
      fat: 10,
      calories: 480,
      glycemicLoad: 'High',
      fiber: 6,
    },
    sugarImpact: {
      prediction: 'High spike expected',
      peakTime: '1.5 hours',
      expectedRange: '190-210 mg/dL',
    },
    advice: [
      'Replace white rice with brown rice',
      'Eat vegetables first',
      'Add more protein to slow absorption',
    ],
  },
  'balanced-meal': {
    detectedItems: [
      { name: 'Grilled Chicken', quantity: 150, unit: 'grams' },
      { name: 'Quinoa', quantity: 1, unit: 'cup' },
      { name: 'Green Salad', quantity: 1, unit: 'plate' },
    ],
    nutrition: {
      carbs: 42,
      protein: 35,
      fat: 12,
      calories: 420,
      glycemicLoad: 'Low',
      fiber: 8,
    },
    sugarImpact: {
      prediction: 'Stable levels',
      peakTime: '2 hours',
      expectedRange: '120-140 mg/dL',
    },
    advice: [
      'Excellent meal choice!',
      'This combination promotes stable sugar levels',
      'Continue this balanced approach',
    ],
  },
};

export const analyzeFoodImage = async (imageData: string): Promise<FoodAnalysisResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Randomly select a meal type for demo
  const mealTypes = Object.keys(mockFoodDatabase);
  const randomMeal = mealTypes[Math.floor(Math.random() * mealTypes.length)];

  return mockFoodDatabase[randomMeal];
};

export const getFoodAnalysisById = (mealId: string): FoodAnalysisResult => {
  return mockFoodDatabase[mealId] || mockFoodDatabase['balanced-meal'];
};
