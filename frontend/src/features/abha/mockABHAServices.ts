export interface ABHARecord {
  id: string;
  name: string;
  age: number;
  abhaNumber: string;
  abhaAddress: string;
  linkedDate: string;
}

export interface HealthRecord {
  type: 'glucose' | 'prescription' | 'lab' | 'vitals';
  date: string;
  title: string;
  value?: string;
  details?: string;
  doctor?: string;
}

// No default mock profile - will be fetched from backend
const mockABHAProfile: ABHARecord | null = null;

// Generate mock glucose readings for the past 7 days
const generateMockGlucoseRecords = (): HealthRecord[] => {
  const records: HealthRecord[] = [];
  const today = new Date();
  
  // Last 7 days of glucose readings (fasting and post-meal)
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Fasting (morning)
    const fastingValue = 95 + Math.floor(Math.random() * 30); // 95-125 mg/dL
    records.push({
      type: 'glucose',
      date: dateStr,
      title: `Fasting Blood Sugar - ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`,
      value: `${fastingValue} mg/dL`,
      details: fastingValue < 100 ? 'Normal fasting level' : fastingValue < 126 ? 'Slightly elevated' : 'High - consult doctor',
    });
    
    // Post-meal (lunch)
    const postMealValue = 120 + Math.floor(Math.random() * 60); // 120-180 mg/dL
    records.push({
      type: 'glucose',
      date: dateStr,
      title: `Post-Meal (2hr) - ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`,
      value: `${postMealValue} mg/dL`,
      details: postMealValue < 140 ? 'Normal post-meal level' : postMealValue < 200 ? 'Slightly elevated' : 'High - consult doctor',
    });
  }
  
  // Add some additional health records
  records.push({
    type: 'prescription',
    date: new Date(today.setDate(today.getDate() - 10)).toISOString().split('T')[0],
    title: 'Metformin Prescription',
    value: '500mg twice daily',
    details: 'For blood sugar management',
    doctor: 'Dr. Rajesh Kumar',
  });
  
  records.push({
    type: 'lab',
    date: new Date(today.setDate(today.getDate() - 15)).toISOString().split('T')[0],
    title: 'HbA1c Test',
    value: '6.2%',
    details: 'Good control, continue current treatment',
    doctor: 'Dr. Priya Sharma',
  });
  
  records.push({
    type: 'vitals',
    date: new Date().toISOString().split('T')[0],
    title: 'Blood Pressure',
    value: '128/82 mmHg',
    details: 'Within normal range',
  });
  
  return records;
};

const mockHealthRecords: HealthRecord[] = generateMockGlucoseRecords();

export const linkABHA = async (abhaNumber: string): Promise<ABHARecord> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  // This should call the real API - return null for now
  return mockABHAProfile!;
};

export const getABHAProfile = async (): Promise<ABHARecord | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Will be fetched from real backend API
  return mockABHAProfile;
};

export const getHealthRecords = async (filter?: string): Promise<HealthRecord[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Will be fetched from real backend API
  if (filter) {
    return mockHealthRecords.filter(record =>
      record.type === filter || record.title.toLowerCase().includes(filter.toLowerCase())
    );
  }

  return mockHealthRecords;
};

export const queryHealthRecords = async (query: string): Promise<HealthRecord[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('sugar') || lowerQuery.includes('glucose')) {
    return mockHealthRecords.filter(r => r.type === 'glucose');
  }

  if (lowerQuery.includes('prescription') || lowerQuery.includes('medicine')) {
    return mockHealthRecords.filter(r => r.type === 'prescription');
  }

  if (lowerQuery.includes('lab') || lowerQuery.includes('test')) {
    return mockHealthRecords.filter(r => r.type === 'lab');
  }

  return mockHealthRecords.slice(0, 3);
};

export const shareRecordWithDoctor = async (recordIds: string[]): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};
