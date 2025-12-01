import { useState, useCallback } from 'react';
import { FoodAnalysisResult } from '../features/foodScan/mockFoodAI';
import axios from 'axios';

// DEMO MODE - Uses exact image matching for perfect results (99% accuracy, single item only)
const AI_API_URL = 'http://localhost:5001/api/v1/food/detect/demo';

export const useFoodScan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanFood = useCallback(async (imageData: string) => {
    try {
      setIsScanning(true);
      setError(null);
      
      console.log('🔍 Starting food scan...');
      console.log('📡 API URL:', AI_API_URL);
      
      // Convert base64 to blob
      const base64Data = imageData.split(',')[1];
      const blob = await fetch(imageData).then(r => r.blob());
      
      console.log('📦 Image blob created:', blob.size, 'bytes', 'type:', blob.type);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', blob, 'food.jpg');
      
      console.log('📤 Sending request to DEMO API (99% accuracy for exact image match)...');
      console.log('💡 TIP: Upload images from ai-models/demo-images/ folder for guaranteed detection');
      
      // Call Spoonacular API
      const response = await axios.post(AI_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });
      
      console.log('✅ API Response received:', response.data);
      
      if (response.data.success && response.data.detections && response.data.detections.length > 0) {
        // Transform API response to match FoodAnalysisResult format
        const detections = response.data.detections;
        
        // Calculate totals from all detected items
        const totalNutrition = detections.reduce((acc: any, det: any) => {
          const nutrition = det.nutrition || {};
          return {
            carbs: acc.carbs + (nutrition.carbohydrates || 0),
            protein: acc.protein + (nutrition.protein || 0),
            fat: acc.fat + (nutrition.fat || 0),
            calories: acc.calories + (nutrition.calories || 0),
          };
        }, { carbs: 0, protein: 0, fat: 0, calories: 0 });
        
        // Determine glycemic load based on carbs
        let glycemicLoad: 'Low' | 'Medium' | 'High' = 'Low';
        if (totalNutrition.carbs > 60) glycemicLoad = 'High';
        else if (totalNutrition.carbs > 30) glycemicLoad = 'Medium';
        
        const analysisResult: FoodAnalysisResult = {
          detectedItems: detections.map((det: any) => ({
            name: det.item.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            quantity: det.estimated_weight || 150,
            unit: 'g',
            confidence: Math.round((det.confidence || 0.85) * 100),
          })),
          nutrition: {
            carbs: Math.round(totalNutrition.carbs),
            protein: Math.round(totalNutrition.protein),
            fat: Math.round(totalNutrition.fat),
            calories: Math.round(totalNutrition.calories),
            glycemicLoad,
          },
          sugarImpact: {
            prediction: glycemicLoad === 'High' ? 'Moderate spike expected' : 
                       glycemicLoad === 'Medium' ? 'Small spike expected' : 'Minimal impact',
            peakTime: '1-2 hours',
            expectedRange: glycemicLoad === 'High' ? '140-180 mg/dL' : 
                          glycemicLoad === 'Medium' ? '120-140 mg/dL' : '100-120 mg/dL',
          },
          advice: [
            `✅ ${detections.length} food item(s) detected via Demo Database (99% accuracy)`,
            totalNutrition.carbs > 50 ? 'Consider reducing portion size or adding protein' : 'Good portion size',
            totalNutrition.protein < 15 ? 'Add more protein for balanced meal' : 'Good protein content',
            'Drink water before and after meal',
            glycemicLoad === 'High' ? 'Take a 10-minute walk after eating to manage blood sugar' : 'Monitor blood sugar 2 hours after eating',
          ],
        };
        
        setResult(analysisResult);
        setIsScanning(false);
        return analysisResult;
      } else {
        // Fallback to mock data if API returns no detections
        throw new Error('No food detected in image');
      }
    } catch (err: any) {
      console.error('❌ Food scan error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      
      const errorMsg = err.response?.data?.error || err.message || 'Failed to analyze food image';
      setError(errorMsg);
      setIsScanning(false);
      
      // Return basic result with error message
      const fallbackResult: FoodAnalysisResult = {
        detectedItems: [{ name: 'Unknown Food', quantity: 150, unit: 'g', confidence: 50 }],
        nutrition: { carbs: 30, protein: 10, fat: 5, calories: 200, glycemicLoad: 'Medium' },
        sugarImpact: { prediction: 'Unable to analyze', peakTime: 'N/A', expectedRange: 'N/A' },
        advice: [
          `❌ ${errorMsg}`,
          err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK' 
            ? '🔧 AI API Server is not running. Please start it with: python ai-models/api_server.py'
            : err.response?.status === 400 
            ? '📷 This image is not in the demo database. Please upload an image from ai-models/demo-images/' 
            : '⚠️ API Server Error - Check terminal logs',
          '💡 Demo mode: Only pre-configured images from demo-images/ folder will be detected',
          '📂 Available demo foods: Chicken Biryani, Idli with Sambar, Veg Thali, North Indian Thali',
        ],
      };
      setResult(fallbackResult);
      return fallbackResult;
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isScanning,
    result,
    error,
    scanFood,
    clearResult,
  };
};
