import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LANGUAGES, PERMISSIONS } from '../../utils/constants';

const Onboarding = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [permissionsGranted, setPermissionsGranted] = useState({
    microphone: false,
    camera: false,
  });

  const handleContinue = () => {
    if (permissionsGranted.microphone && permissionsGranted.camera) {
      navigate('/home');
    } else {
      alert('Please grant all permissions to continue');
    }
  };

  const requestPermission = async (type: 'microphone' | 'camera') => {
    // Mock permission request
    setPermissionsGranted(prev => ({ ...prev, [type]: true }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to GlucoSage</h1>
        <p className="text-gray-600 mt-2">Let's set up your experience</p>
      </div>

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {/* Language Selection */}
        <div className="mb-8 animate-fadeIn">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Choose your language</h2>
          <div className="grid grid-cols-2 gap-4">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedLanguage === lang.code
                    ? 'border-primary-600 bg-primary-50 shadow-md'
                    : 'border-gray-300 bg-white hover:border-primary-400'
                }`}
              >
                <div className="text-4xl mb-2">{lang.code === 'en' ? '🇬🇧' : '🇮🇳'}</div>
                <div className="text-lg font-semibold">{lang.nativeName}</div>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3 text-center">More languages coming soon</p>
        </div>

        {/* Permissions */}
        <div className="mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Grant Permissions</h2>
          <div className="space-y-4">
            {PERMISSIONS.map((permission) => {
              const isGranted = permissionsGranted[permission.id as 'microphone' | 'camera'];
              
              return (
                <div
                  key={permission.id}
                  className={`p-6 rounded-xl border-2 ${
                    isGranted
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{permission.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{permission.label}</h3>
                        <p className="text-sm text-gray-600">Required for voice and food scanning</p>
                      </div>
                    </div>
                    
                    {!isGranted ? (
                      <button
                        onClick={() => requestPermission(permission.id as 'microphone' | 'camera')}
                        className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Grant
                      </button>
                    ) : (
                      <div className="text-green-600 font-semibold">✓ Granted</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!permissionsGranted.microphone || !permissionsGranted.camera}
          className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to GlucoSage
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
