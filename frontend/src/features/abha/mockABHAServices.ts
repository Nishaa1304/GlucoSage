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

const mockABHAProfile: ABHARecord = {
  id: '1',
  name: 'Meera Sharma',
  age: 62,
  abhaNumber: '12-3456-7890-1234',
  abhaAddress: 'meera.sharma@abdm',
  linkedDate: '2024-11-15',
};

const mockHealthRecords: HealthRecord[] = [
  {
    type: 'glucose',
    date: '2024-11-26',
    title: 'Fasting Blood Sugar',
    value: '118 mg/dL',
    details: 'Within normal range',
  },
  {
    type: 'glucose',
    date: '2024-11-25',
    title: 'Post-Meal Blood Sugar',
    value: '165 mg/dL',
    details: 'Slightly elevated',
  },
  {
    type: 'prescription',
    date: '2024-11-20',
    title: 'Metformin 500mg',
    details: 'Take twice daily with meals',
    doctor: 'Dr. Rajesh Kumar',
  },
  {
    type: 'lab',
    date: '2024-11-18',
    title: 'HbA1c Test',
    value: '6.8%',
    details: 'Good control. Continue current plan.',
    doctor: 'Dr. Rajesh Kumar',
  },
  {
    type: 'vitals',
    date: '2024-11-26',
    title: 'Blood Pressure',
    value: '128/82 mmHg',
    details: 'Normal',
  },
  {
    type: 'prescription',
    date: '2024-11-15',
    title: 'Vitamin D3 Supplement',
    details: 'Once daily',
    doctor: 'Dr. Rajesh Kumar',
  },
];

export const linkABHA = async (abhaNumber: string): Promise<ABHARecord> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return mockABHAProfile;
};

export const getABHAProfile = async (): Promise<ABHARecord | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockABHAProfile;
};

export const getHealthRecords = async (filter?: string): Promise<HealthRecord[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));

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
