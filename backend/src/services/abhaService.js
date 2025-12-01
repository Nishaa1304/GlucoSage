// Mock ABHA Service
// In production, integrate with actual ABHA (Ayushman Bharat Health Account) APIs

/**
 * Link ABHA account
 * @param {string} abhaNumber - ABHA number
 * @param {string} abhaAddress - ABHA address
 * @returns {Promise<Object>} Verification result
 */
exports.linkABHAAccount = async (abhaNumber, abhaAddress) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock verification (in production, call actual ABHA API)
  const isValid = /^\d{2}-\d{4}-\d{4}-\d{4}$/.test(abhaNumber);

  if (!isValid) {
    return {
      success: false,
      error: 'Invalid ABHA number format'
    };
  }

  // Return mock initial records
  return {
    success: true,
    initialRecords: [
      {
        recordId: `REC-${Date.now()}-1`,
        type: 'glucose',
        title: 'Fasting Blood Sugar',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        value: '118 mg/dL',
        details: 'Within normal range'
      },
      {
        recordId: `REC-${Date.now()}-2`,
        type: 'prescription',
        title: 'Metformin 500mg',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        details: 'Take twice daily with meals',
        doctor: {
          name: 'Dr. Rajesh Kumar',
          specialty: 'Endocrinologist',
          hospital: 'Apollo Hospital'
        }
      }
    ]
  };
};

/**
 * Fetch health records from ABHA
 * @param {string} abhaNumber - ABHA number
 * @returns {Promise<Array>} Health records
 */
exports.fetchHealthRecords = async (abhaNumber) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock fetching new records
  const mockRecords = [
    {
      recordId: `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'lab',
      title: 'HbA1c Test',
      date: new Date(),
      value: '6.8%',
      details: 'Good control. Continue current plan.',
      doctor: {
        name: 'Dr. Priya Sharma',
        specialty: 'Diabetologist',
        hospital: 'Max Healthcare'
      }
    }
  ];

  return mockRecords;
};

/**
 * Share health record with healthcare provider
 * @param {string} abhaNumber - ABHA number
 * @param {string} recordId - Record ID
 * @param {string} providerId - Healthcare provider ID
 * @returns {Promise<Object>} Share result
 */
exports.shareHealthRecord = async (abhaNumber, recordId, providerId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    success: true,
    sharedAt: new Date(),
    consentId: `CONSENT-${Date.now()}`
  };
};

/**
 * Revoke consent for shared records
 * @param {string} consentId - Consent ID
 * @returns {Promise<Object>} Revoke result
 */
exports.revokeConsent = async (consentId) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    success: true,
    revokedAt: new Date()
  };
};
