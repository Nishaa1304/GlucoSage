import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PredictionData } from '../features/prediction/mockPredictor';

interface PredictionContextType {
  currentPrediction: PredictionData | null;
  setCurrentPrediction: (data: PredictionData) => void;
  glucoseHistory: Array<{ date: string; value: number }>;
  addGlucoseReading: (reading: { date: string; value: number }) => void;
}

const PredictionContext = createContext<PredictionContextType | undefined>(undefined);

export const PredictionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPrediction, setCurrentPrediction] = useState<PredictionData | null>(null);
  const [glucoseHistory, setGlucoseHistory] = useState<Array<{ date: string; value: number }>>([]);

  const addGlucoseReading = (reading: { date: string; value: number }) => {
    setGlucoseHistory((prev) => [...prev, reading]);
  };

  return (
    <PredictionContext.Provider
      value={{
        currentPrediction,
        setCurrentPrediction,
        glucoseHistory,
        addGlucoseReading,
      }}
    >
      {children}
    </PredictionContext.Provider>
  );
};

export const usePredictionContext = () => {
  const context = useContext(PredictionContext);
  if (context === undefined) {
    throw new Error('usePredictionContext must be used within a PredictionProvider');
  }
  return context;
};
