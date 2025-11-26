export interface PatientSummary {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  avgSugar: number;
  highAlerts: number;
  riskyMeal: string;
  lastReading: {
    value: number;
    time: string;
  };
}

const mockPatients: PatientSummary[] = [
  {
    id: '1',
    name: 'Meera Sharma',
    age: 62,
    diagnosis: 'Type 2 Diabetes',
    avgSugar: 145,
    highAlerts: 3,
    riskyMeal: 'Lunch',
    lastReading: {
      value: 165,
      time: '2 hours ago',
    },
  },
  {
    id: '2',
    name: 'Rajesh Patel',
    age: 58,
    diagnosis: 'Pre-Diabetes',
    avgSugar: 128,
    highAlerts: 1,
    riskyMeal: 'Dinner',
    lastReading: {
      value: 142,
      time: '4 hours ago',
    },
  },
  {
    id: '3',
    name: 'Sunita Desai',
    age: 65,
    diagnosis: 'Type 2 Diabetes',
    avgSugar: 168,
    highAlerts: 5,
    riskyMeal: 'Breakfast',
    lastReading: {
      value: 195,
      time: '1 hour ago',
    },
  },
  {
    id: '4',
    name: 'Anil Kumar',
    age: 70,
    diagnosis: 'Type 2 Diabetes',
    avgSugar: 152,
    highAlerts: 2,
    riskyMeal: 'Lunch',
    lastReading: {
      value: 178,
      time: '3 hours ago',
    },
  },
];

export const getAllPatients = async (): Promise<PatientSummary[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockPatients;
};

export const getPatientDetail = async (patientId: string): Promise<PatientSummary | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockPatients.find(p => p.id === patientId) || null;
};

export const getHighRiskPatients = async (): Promise<PatientSummary[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockPatients.filter(p => p.highAlerts >= 3);
};
