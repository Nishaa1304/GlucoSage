import { useState, useCallback } from 'react';
import { analyzeFoodImage, FoodAnalysisResult } from '../features/foodScan/mockFoodAI';

export const useFoodScan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanFood = useCallback(async (imageData: string) => {
    try {
      setIsScanning(true);
      setError(null);
      
      const analysisResult = await analyzeFoodImage(imageData);
      setResult(analysisResult);
      setIsScanning(false);
      
      return analysisResult;
    } catch (err) {
      setError('Failed to analyze food image');
      setIsScanning(false);
      return null;
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
