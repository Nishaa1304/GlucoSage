import { useState, useCallback, useEffect } from 'react';
import { getCurrentPrediction, calculateWhatIf, PredictionData } from '../features/prediction/mockPredictor';

export const usePrediction = () => {
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPrediction = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getCurrentPrediction();
      setPredictionData(data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load prediction');
      setIsLoading(false);
    }
  }, []);

  const runWhatIfScenario = useCallback(async (scenario: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await calculateWhatIf(scenario);
      setPredictionData(data);
      setIsLoading(false);
      
      return data;
    } catch (err) {
      setError('Failed to calculate scenario');
      setIsLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    loadPrediction();
  }, [loadPrediction]);

  return {
    predictionData,
    isLoading,
    error,
    loadPrediction,
    runWhatIfScenario,
  };
};
