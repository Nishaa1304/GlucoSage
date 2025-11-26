export const APP_NAME = 'GlucoSage';
export const TAGLINE = 'Your Voice. Your Food. Your Health.';

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
];

export const PERMISSIONS = [
  { id: 'microphone', label: 'Microphone Access', icon: '🎤', required: true },
  { id: 'camera', label: 'Camera Access', icon: '📷', required: true },
];

export const SAMPLE_VOICE_COMMANDS = [
  'What will my sugar be after lunch?',
  'Scan my food',
  'Show my health records',
  'Log my morning medicine',
];

export const NAVIGATION_ITEMS = [
  { id: 'scan', label: 'Scan Food', icon: '🍽', path: '/scan' },
  { id: 'prediction', label: 'Prediction', icon: '📊', path: '/prediction' },
  { id: 'abha', label: 'ABHA Records', icon: '📁', path: '/abha' },
];

export const GLUCOSE_ZONES = {
  normal: { min: 70, max: 140, color: '#10b981', label: 'Normal' },
  moderate: { min: 140, max: 180, color: '#f59e0b', label: 'Moderate' },
  high: { min: 180, max: 300, color: '#ef4444', label: 'High' },
};

export const USER_TYPES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
} as const;
