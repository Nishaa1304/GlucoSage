import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ABHARecord, HealthRecord, getABHAProfile, getHealthRecords } from '../features/abha/mockABHAServices';

interface ABHAContextType {
  abhaProfile: ABHARecord | null;
  healthRecords: HealthRecord[];
  isLinked: boolean;
  isLoading: boolean;
  loadABHAData: () => Promise<void>;
  refreshRecords: () => Promise<void>;
}

const ABHAContext = createContext<ABHAContextType | undefined>(undefined);

export const ABHAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [abhaProfile, setAbhaProfile] = useState<ABHARecord | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadABHAData = async () => {
    setIsLoading(true);
    try {
      const profile = await getABHAProfile();
      const records = await getHealthRecords();
      
      setAbhaProfile(profile);
      setHealthRecords(records);
    } catch (error) {
      console.error('Failed to load ABHA data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRecords = async () => {
    setIsLoading(true);
    try {
      const records = await getHealthRecords();
      setHealthRecords(records);
    } catch (error) {
      console.error('Failed to refresh records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadABHAData();
  }, []);

  return (
    <ABHAContext.Provider
      value={{
        abhaProfile,
        healthRecords,
        isLinked: !!abhaProfile,
        isLoading,
        loadABHAData,
        refreshRecords,
      }}
    >
      {children}
    </ABHAContext.Provider>
  );
};

export const useABHA = () => {
  const context = useContext(ABHAContext);
  if (context === undefined) {
    throw new Error('useABHA must be used within an ABHAProvider');
  }
  return context;
};
