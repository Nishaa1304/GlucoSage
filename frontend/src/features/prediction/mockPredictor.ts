export interface GlucoseReading {
  time: string;
  value: number;
  zone: 'normal' | 'moderate' | 'high';
}

export interface PredictionData {
  current: number;
  trend: GlucoseReading[];
  prediction: {
    peakTime: string;
    peakValue: number;
    message: string;
  };
}

export interface WhatIfScenario {
  type: 'sweet' | 'walk' | 'skip-meal' | 'medication';
  label: string;
}

const generateMockTrend = (): GlucoseReading[] => {
  const times = ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  const baseValues = [105, 115, 165, 190, 145, 125, 140, 120];

  return times.map((time, index) => {
    const value = baseValues[index];
    let zone: 'normal' | 'moderate' | 'high' = 'normal';

    if (value > 180) zone = 'high';
    else if (value > 140) zone = 'moderate';

    return { time, value, zone };
  });
};

export const getCurrentPrediction = async (): Promise<PredictionData> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    current: 125,
    trend: generateMockTrend(),
    prediction: {
      peakTime: '2:30 PM',
      peakValue: 190,
      message: 'You may reach 190 mg/dL at 2:30 PM after lunch.',
    },
  };
};

export const calculateWhatIf = async (scenario: string): Promise<PredictionData> => {
  await new Promise(resolve => setTimeout(resolve, 600));

  const baseTrend = generateMockTrend();

  switch (scenario) {
    case 'sweet':
      return {
        current: 125,
        trend: baseTrend.map(r => ({
          ...r,
          value: r.value + 25,
          zone: r.value + 25 > 180 ? 'high' : r.value + 25 > 140 ? 'moderate' : 'normal',
        })),
        prediction: {
          peakTime: '2:45 PM',
          peakValue: 215,
          message: 'Adding a sweet may push your sugar to 215 mg/dL.',
        },
      };

    case 'walk':
      return {
        current: 125,
        trend: baseTrend.map(r => ({
          ...r,
          value: Math.max(90, r.value - 20),
          zone: r.value - 20 > 180 ? 'high' : r.value - 20 > 140 ? 'moderate' : 'normal',
        })),
        prediction: {
          peakTime: '2:15 PM',
          peakValue: 170,
          message: 'A 15-minute walk could keep you at 170 mg/dL.',
        },
      };

    default:
      return getCurrentPrediction();
  }
};

export const whatIfScenarios: WhatIfScenario[] = [
  { type: 'sweet', label: 'What if I eat 1 sweet?' },
  { type: 'walk', label: 'What if I walk 15 minutes?' },
];
