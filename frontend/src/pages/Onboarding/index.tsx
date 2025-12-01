import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { LANGUAGES, PERMISSIONS } from '../../utils/constants';
import { getTranslations } from '../../i18n/translations';
import { setVoiceLanguage } from '../../features/voice/voiceHooks';

const Onboarding = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [step, setStep] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');
  const t = getTranslations(selectedLanguage);
  
  // User profile data
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [abhaNumber, setAbhaNumber] = useState('');
  const [abhaAddress, setAbhaAddress] = useState('');
  const [skipAbha, setSkipAbha] = useState(false);
  
  // Permissions
  const [permissionsGranted, setPermissionsGranted] = useState({
    microphone: false,
    camera: false,
  });

  const requestPermission = async (type: 'microphone' | 'camera') => {
    try {
      if (type === 'microphone') {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } else if (type === 'camera') {
        await navigator.mediaDevices.getUserMedia({ video: true });
      }
      setPermissionsGranted(prev => ({ ...prev, [type]: true }));
    } catch (error) {
      console.error(`Failed to get ${type} permission:`, error);
      alert(`Unable to access ${type}. Please grant permission in your browser settings.`);
    }
  };

  const handleLanguageNext = () => {
    if (selectedLanguage) {
      setStep(2);
    }
  };

  const handleProfileNext = () => {
    if (name.trim() && age && parseInt(age) > 0 && parseInt(age) < 150) {
      setStep(3);
    } else {
      alert('Please fill in all required fields with valid information');
    }
  };

  const handleAbhaNext = () => {
    setStep(4);
  };

  const handleGetStarted = () => {
    if (permissionsGranted.microphone && permissionsGranted.camera) {
      const userData = {
        name: name.trim(),
        age: parseInt(age),
        gender,
        userType: 'patient' as const,
        language: selectedLanguage,
        ...(abhaNumber && !skipAbha && { abhaNumber }),
        ...(abhaAddress && !skipAbha && { abhaAddress }),
      };
      
      setUser(userData);
      setVoiceLanguage(selectedLanguage);
      navigate('/home');
    } else {
      alert('Please grant all permissions to continue');
    }
  };

  const canProceed = permissionsGranted.microphone && permissionsGranted.camera;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="text-center pt-8 pb-6 px-6">
        <h1 className="text-3xl font-bold text-gray-900">{t.onboarding.welcome}</h1>
        <p className="text-gray-600 mt-2">{t.onboarding.subtitle}</p>
        
        {/* Progress indicator */}
        <div className="flex justify-center mt-6 gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 w-12 rounded-full transition-all ${
                s <= step ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {/* Step 1: Language Selection */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t.onboarding.chooseLanguage}</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code as 'en' | 'hi')}
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
            <p className="text-sm text-gray-500 mb-6 text-center">{t.onboarding.moreLanguagesSoon}</p>
            
            <button
              onClick={handleLanguageNext}
              className="w-full btn-primary py-4 text-lg"
            >
              {t.next}
            </button>
          </div>
        )}

        {/* Step 2: Profile Information */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {selectedLanguage === 'hi' ? 'अपनी जानकारी दें' : 'Tell us about yourself'}
            </h2>
            
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedLanguage === 'hi' ? 'आपका नाम' : 'Your Name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={selectedLanguage === 'hi' ? 'अपना नाम दर्ज करें' : 'Enter your name'}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-600 focus:outline-none text-lg"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedLanguage === 'hi' ? 'आपकी उम्र' : 'Your Age'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder={selectedLanguage === 'hi' ? 'अपनी उम्र दर्ज करें' : 'Enter your age'}
                  min="1"
                  max="150"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-600 focus:outline-none text-lg"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedLanguage === 'hi' ? 'लिंग' : 'Gender'} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'male', label: selectedLanguage === 'hi' ? 'पुरुष' : 'Male', icon: '👨' },
                    { value: 'female', label: selectedLanguage === 'hi' ? 'महिला' : 'Female', icon: '👩' },
                    { value: 'other', label: selectedLanguage === 'hi' ? 'अन्य' : 'Other', icon: '🧑' },
                  ].map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGender(g.value as 'male' | 'female' | 'other')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        gender === g.value
                          ? 'border-primary-600 bg-primary-50 shadow-md'
                          : 'border-gray-300 bg-white hover:border-primary-400'
                      }`}
                    >
                      <div className="text-3xl mb-1">{g.icon}</div>
                      <div className="text-sm font-semibold">{g.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 px-6 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                {t.back}
              </button>
              <button
                onClick={handleProfileNext}
                className="flex-1 btn-primary py-4 text-lg"
              >
                {t.next}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: ABHA Account (Optional) */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">
              {selectedLanguage === 'hi' ? 'ABHA खाता जोड़ें' : 'Link ABHA Account'}
            </h2>
            <p className="text-gray-600 mb-6">
              {selectedLanguage === 'hi' 
                ? '(वैकल्पिक) अपने स्वास्थ्य रिकॉर्ड को सिंक करने के लिए'
                : '(Optional) To sync your health records'}
            </p>
            
            {!skipAbha ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.abha.abhaNumber}
                  </label>
                  <input
                    type="text"
                    value={abhaNumber}
                    onChange={(e) => setAbhaNumber(e.target.value)}
                    placeholder={selectedLanguage === 'hi' ? '14 अंकों का ABHA नंबर' : '14-digit ABHA number'}
                    maxLength={14}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-600 focus:outline-none text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.abha.abhaAddress}
                  </label>
                  <input
                    type="text"
                    value={abhaAddress}
                    onChange={(e) => setAbhaAddress(e.target.value)}
                    placeholder={selectedLanguage === 'hi' ? 'yourname@abdm' : 'yourname@abdm'}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-600 focus:outline-none text-lg"
                  />
                </div>

                <button
                  onClick={() => setSkipAbha(true)}
                  className="w-full text-primary-600 py-2 text-sm font-medium hover:underline"
                >
                  {selectedLanguage === 'hi' ? 'अभी छोड़ें, बाद में जोड़ें' : 'Skip for now, add later'}
                </button>
              </div>
            ) : (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">ℹ️</div>
                <p className="text-gray-700 mb-4">
                  {selectedLanguage === 'hi'
                    ? 'आप बाद में सेटिंग्स से ABHA खाता जोड़ सकते हैं'
                    : 'You can add your ABHA account later from settings'}
                </p>
                <button
                  onClick={() => setSkipAbha(false)}
                  className="text-primary-600 font-medium hover:underline"
                >
                  {selectedLanguage === 'hi' ? 'अभी जोड़ें' : 'Add now'}
                </button>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 px-6 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                {t.back}
              </button>
              <button
                onClick={handleAbhaNext}
                className="flex-1 btn-primary py-4 text-lg"
              >
                {t.next}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Permissions */}
        {step === 4 && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t.onboarding.grantPermissions}</h2>
            <div className="space-y-4 mb-6">
              {PERMISSIONS.map((permission) => {
                const isGranted = permissionsGranted[permission.id as 'microphone' | 'camera'];
                const permLabel = permission.id === 'microphone' ? t.onboarding.microphoneAccess : t.onboarding.cameraAccess;
                
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
                          <h3 className="font-semibold text-lg">{permLabel}</h3>
                          <p className="text-sm text-gray-600">
                            {selectedLanguage === 'hi' 
                              ? 'आवाज़ और भोजन स्कैनिंग के लिए आवश्यक'
                              : 'Required for voice and food scanning'}
                          </p>
                        </div>
                      </div>
                      
                      {!isGranted ? (
                        <button
                          onClick={() => requestPermission(permission.id as 'microphone' | 'camera')}
                          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          {t.onboarding.grant}
                        </button>
                      ) : (
                        <div className="text-green-600 font-semibold">{t.onboarding.granted}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-4 px-6 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                {t.back}
              </button>
              <button
                onClick={handleGetStarted}
                disabled={!canProceed}
                className="flex-1 btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.onboarding.getStarted}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
