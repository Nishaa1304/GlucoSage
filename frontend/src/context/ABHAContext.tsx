import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ABHARecord, HealthRecord, getHealthRecords } from '../features/abha/mockABHAServices';
import { abhaAPI } from '../services/api';

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
      // Fetch from real backend API
      const profileRes = await abhaAPI.getProfile();
      const recordsRes = await abhaAPI.getRecords();
      
      if (profileRes.data.success) {
        const abhaData = profileRes.data.data;
        setAbhaProfile({
          id: abhaData._id,
          name: abhaData.userId?.name || 'User',
          age: abhaData.userId?.age || 0,
          abhaNumber: abhaData.abhaNumber,
          abhaAddress: abhaData.abhaAddress,
          linkedDate: abhaData.linkedDate || abhaData.createdAt
        });
      }
      
      if (recordsRes.data.success) {
        setHealthRecords(recordsRes.data.data);
      }
    } catch (error: any) {
      // User doesn't have ABHA linked yet - use mock data for demo
      console.log('No ABHA account linked - using mock health records');
      setAbhaProfile(null);
      
      // Load mock health records for demo purposes
      const mockRecords = await getHealthRecords();
      setHealthRecords(mockRecords);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRecords = async () => {
    setIsLoading(true);
    try {
      const recordsRes = await abhaAPI.getRecords();
      if (recordsRes.data.success) {
        setHealthRecords(recordsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to refresh records - using mock data');
      // Fallback to mock data
      const mockRecords = await getHealthRecords();
      setHealthRecords(mockRecords);
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
