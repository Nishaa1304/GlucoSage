import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { getGreeting } from '../../utils/formatters';
import { SAMPLE_VOICE_COMMANDS } from '../../utils/constants';
import { getTranslations } from '../../i18n/translations';
import MicButton from '../../components/MicButton';
import BottomNav from '../../components/BottomNav';
import { setVoiceLanguage } from '../../features/voice/voiceHooks';

const Home = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [transcript, setTranscript] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentGlucose, setCurrentGlucose] = useState(0);
  const [glucoseTrend, setGlucoseTrend] = useState<'rising' | 'falling' | 'stable'>('stable');
  const [predictedGlucose, setPredictedGlucose] = useState(0);
  const [dayIndex, setDayIndex] = useState(0);
  const t = getTranslations(user?.language || 'en');

  // Daily scenarios for demo (changes every 3 minutes)
  const dailyScenarios = [
    {
      day: 'Monday',
      baseGlucose: 105,
      recommendation: 'Eat grilled paneer with brown rice and vegetables for lunch to maintain balance',
      status: 'normal'
    },
    {
      day: 'Tuesday',
      baseGlucose: 135,
      recommendation: 'High level detected! Opt for a light salad with chickpeas or tofu for lunch',
      status: 'high'
    },
    {
      day: 'Wednesday',
      baseGlucose: 85,
      recommendation: 'Slightly low - include whole grain roti with dal for lunch',
      status: 'low'
    },
    {
      day: 'Thursday',
      baseGlucose: 110,
      recommendation: 'Perfect range! Have paneer tikka with quinoa for balanced lunch',
      status: 'normal'
    },
    {
      day: 'Friday',
      baseGlucose: 145,
      recommendation: 'Elevated level - choose steamed vegetables with tofu or green beans with paneer for lunch',
      status: 'high'
    },
    {
      day: 'Saturday',
      baseGlucose: 95,
      recommendation: 'Good fasting level - enjoy idli with sambar for a healthy lunch',
      status: 'normal'
    },
    {
      day: 'Sunday',
      baseGlucose: 120,
      recommendation: 'Slightly elevated - try moong dal khichdi with curd for lunch',
      status: 'normal'
    }
  ];

  // Change day every 3 minutes (180 seconds)
  useEffect(() => {
    const dayInterval = setInterval(() => {
      setDayIndex(prev => (prev + 1) % dailyScenarios.length);
    }, 180000); // 3 minutes

    return () => clearInterval(dayInterval);
  }, []);

  // Simulate real-time glucose monitoring
  useEffect(() => {
    // Set initial glucose based on current day scenario
    const scenario = dailyScenarios[dayIndex];
    setCurrentGlucose(scenario.baseGlucose);
    setPredictedGlucose(scenario.baseGlucose + Math.floor(Math.random() * 10) - 5);

    // Update glucose every 10 seconds with realistic variations
    const interval = setInterval(() => {
      setCurrentGlucose(prev => {
        const change = Math.floor(Math.random() * 6) - 3; // -3 to +3 mg/dL change
        const newValue = Math.max(80, Math.min(180, prev + change));
        
        // Determine trend
        if (change > 0) setGlucoseTrend('rising');
        else if (change < 0) setGlucoseTrend('falling');
        else setGlucoseTrend('stable');
        
        // Predict next reading (simple linear extrapolation)
        setPredictedGlucose(Math.max(80, Math.min(180, newValue + change * 2)));
        
        return newValue;
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [dayIndex]);

  const toggleLanguage = () => {
    if (!user) return;
    const newLang = user.language === 'en' ? 'hi' : 'en';
    setUser({ ...user, language: newLang });
    setVoiceLanguage(newLang);
    
    const newT = getTranslations(newLang);
    const message = newLang === 'hi' 
      ? newT.voiceResponses.languageChangedToHindi
      : newT.voiceResponses.languageChangedToEnglish;
    
    import('../../features/voice/voiceHooks').then(({ speak }) => {
      speak(message, newLang === 'hi' ? 'hi-IN' : 'en-US');
    });
  };

  const handleVoiceCommand = async (receivedTranscript: string) => {
    setTranscript(receivedTranscript);
    setIsProcessing(true);
    
    const { parseVoiceCommand, speak } = await import('../../features/voice/voiceHooks');
    const lang = user?.language === 'hi' ? 'hi-IN' : 'en-US';
    const command = parseVoiceCommand(receivedTranscript, lang);
    
    console.log('Voice command received:', receivedTranscript, 'Intent:', command.intent);
    
    if (command) {
      switch (command.intent) {
        case 'scan':
          speak(t.voiceResponses.openingScanner, lang);
          setTimeout(() => {
            navigate('/scan');
            setIsProcessing(false);
          }, 1000);
          break;
        case 'prediction':
          speak(t.voiceResponses.showingPredictions, lang);
          setTimeout(() => {
            navigate('/prediction');
            setIsProcessing(false);
          }, 1000);
          break;
        case 'abha':
          speak(t.voiceResponses.openingRecords, lang);
          setTimeout(() => {
            navigate('/abha');
            setIsProcessing(false);
          }, 1000);
          break;
        case 'medicine':
          const medicineName = receivedTranscript.toLowerCase().includes('morning') ? 'morning medicine' : 'medicine';
          const response = lang === 'hi-IN' 
            ? `${medicineName} लॉग किया गया। आपकी दवा का समय याद रखा गया है।`
            : `${medicineName} logged successfully. I've recorded your medication time.`;
          speak(response, lang);
          
          // Show a visual confirmation
          const notification = document.createElement('div');
          notification.className = 'fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-slideDown';
          notification.innerHTML = `✅ ${medicineName} logged at ${new Date().toLocaleTimeString()}`;
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.remove();
            setIsProcessing(false);
          }, 3000);
          break;
        case 'query':
        case 'unknown':
        default:
          // For any other sentence, acknowledge it
          const ackMsg = `${t.voiceResponses.iHeard} ${receivedTranscript}`;
          speak(ackMsg, lang);
          console.log('General query:', receivedTranscript);
          setTimeout(() => setIsProcessing(false), 2000);
      }
    }
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden" style={{ backgroundImage: 'url(/background.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      
      {/* Header with glassmorphism */}
      <div className="relative z-10 glass-card border-0 bg-white/80 backdrop-blur-xl text-gray-800 p-3 shadow-xl animate-slideDown">
        <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo without box - larger size */}
            <img 
              src="/glucosage_logo.png" 
              alt="GlucoSage" 
              className="w-20 h-20 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h1 className="text-3xl md:text-4xl font-bold drop-shadow-sm animate-fadeIn">
              {getGreeting(user?.language)}, {user?.name} ji!
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="bg-gray-800/20 hover:bg-gray-800/30 backdrop-blur-md px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 border border-gray-800/20"
            >
              <span className="text-lg">🌐</span>
              <span className="text-sm">{user?.language === 'en' ? 'हिंदी' : 'English'}</span>
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Main Content with max-width */}
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Daily Recommendation Banner */}
        <div className={`relative overflow-hidden rounded-xl p-4 mt-4 shadow-2xl animate-fadeIn border-2 transition-all duration-500 ${
          dailyScenarios[dayIndex].status === 'high' ? 'bg-gradient-to-r from-red-500/30 to-orange-500/30 border-red-400/60 shadow-red-500/50' :
          dailyScenarios[dayIndex].status === 'low' ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-blue-400/60 shadow-blue-500/50' :
          'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-green-400/60 shadow-green-500/50'
        }`} style={{ animationDelay: '0.1s' }}>
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {dailyScenarios[dayIndex].status === 'high' ? '⚠️' : 
                   dailyScenarios[dayIndex].status === 'low' ? '📉' : '✨'}
                </span>
                <p className="text-xs font-bold text-white/95">
                  {dailyScenarios[dayIndex].day}'s Insight
                </p>
              </div>
              <span className="text-xs bg-white/30 px-2 py-1 rounded-full backdrop-blur-sm text-white font-bold">
                Today
              </span>
            </div>
            <p className="text-base font-bold text-white drop-shadow-lg leading-relaxed">
              💡 {dailyScenarios[dayIndex].recommendation}
            </p>
            
            {/* Time until next update */}
            <div className="flex items-center gap-2 mt-2 text-xs text-white/80">
              <div className="w-1 h-1 bg-white/80 rounded-full animate-pulse"></div>
              <p>Next: {dailyScenarios[(dayIndex + 1) % dailyScenarios.length].day}</p>
            </div>
          </div>
        </div>

        {/* Real-time Glucose Monitoring Card */}
        <div className="relative bg-white rounded-xl p-5 mt-4 shadow-2xl shadow-purple-500/30 border-2 border-purple-300 animate-fadeIn hover:shadow-purple-500/50 hover:scale-[1.02] transition-all duration-300" style={{ animationDelay: '0.2s' }}>
          
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🩸</span>
              <div>
                <p className="text-xs font-semibold text-gray-600">Real-Time Glucose</p>
                <p className="text-2xl font-bold text-gray-800 drop-shadow-sm flex items-baseline gap-2">
                  {currentGlucose}
                  <span className="text-sm font-normal text-gray-500">mg/dL</span>
                </p>
              </div>
            </div>
            
            {/* Trend indicator */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg ${
              glucoseTrend === 'rising' ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-2 border-red-400 shadow-red-400/50' :
              glucoseTrend === 'falling' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-2 border-blue-400 shadow-blue-400/50' :
              'bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-2 border-green-400 shadow-green-400/50'
            }`}>
              {glucoseTrend === 'rising' ? '↗️' : glucoseTrend === 'falling' ? '↘️' : '→'}
              {glucoseTrend === 'rising' ? 'Rising' : glucoseTrend === 'falling' ? 'Falling' : 'Stable'}
            </div>
          </div>

          {/* Prediction & Stats Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-2.5 border-2 border-cyan-300 shadow-lg shadow-cyan-300/40 hover:shadow-cyan-400/60 transition-all">
              <p className="text-xs text-gray-600 font-semibold mb-0.5">Predicted (15m)</p>
              <p className="text-lg font-bold text-cyan-700">{predictedGlucose} mg/dL</p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-2.5 border-2 border-emerald-300 shadow-lg shadow-emerald-300/40 hover:shadow-emerald-400/60 transition-all">
              <p className="text-xs text-gray-600 font-semibold mb-0.5">Target Range</p>
              <p className="text-lg font-bold text-emerald-700">80-140</p>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-2.5 border-2 border-amber-300 shadow-lg shadow-amber-300/40 hover:shadow-amber-400/60 transition-all">
              <p className="text-xs text-gray-600 font-semibold mb-0.5">Variability</p>
              <p className="text-lg font-bold text-amber-700">±{Math.abs(predictedGlucose - currentGlucose)}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2.5 border-2 border-purple-300 shadow-lg shadow-purple-300/40 hover:shadow-purple-400/60 transition-all">
              <p className="text-xs text-gray-600 font-semibold mb-0.5">Status</p>
              <p className="text-lg font-bold text-purple-700">
                {currentGlucose < 70 ? 'Low' : currentGlucose > 140 ? 'High' : 'Normal'}
              </p>
            </div>
          </div>

          {/* Time since last reading */}
          <div className="flex items-center gap-2 text-xs text-gray-600 mt-2.5 bg-purple-50 px-3 py-1.5 rounded-full w-fit">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50"></div>
            <p className="font-semibold">Live • Updates every 10s</p>
          </div>
        </div>

        {/* Mic Button Section */}
        <div className="mb-8 mt-8">
          {/* Transcript Display */}
          {transcript && (
            <div className="mb-6 animate-fadeIn">
              <div className={`glass-card-solid backdrop-blur-xl rounded-2xl p-6 shadow-glow border-2 transform hover:scale-102 transition-all duration-300 ${
                isProcessing 
                  ? 'from-aqua-50/90 to-blue-50/90 border-aqua-300/50 shadow-glow-aqua' 
                  : 'from-mint-50/90 to-green-50/90 border-mint-300/50 shadow-glow-mint'
              }`}>
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{isProcessing ? '⏳' : '✅'}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-600 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-aqua-500 rounded-full animate-pulse shadow-glow-sm"></span>
                      {t.home.youSaid}
                    </p>
                    <p className="text-xl font-bold text-gray-900 leading-relaxed drop-shadow-sm">
                      "{transcript}"
                    </p>
                    {isProcessing && (
                      <p className="text-sm text-aqua-600 mt-3 animate-pulse font-medium flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-aqua-500 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-aqua-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-1.5 bg-aqua-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        {t.home.processing}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setTranscript('');
                      setIsProcessing(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-xl hover:scale-125 transition-transform duration-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-center mb-6">
            <MicButton onListen={handleVoiceCommand} size="large" />
          </div>
          
          <p className="text-center text-gray-700 text-lg font-medium drop-shadow-sm animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            {t.home.trySaying}
          </p>
        </div>

        {/* Sample Voice Commands with glassmorphism */}
        <div className="space-y-3 mb-8">
          {SAMPLE_VOICE_COMMANDS[user?.language || 'en'].map((command, index) => (
            <div
              key={index}
              className="glass-card-solid backdrop-blur-md rounded-2xl p-5 shadow-glow-sm border border-aqua-200/30 hover:border-aqua-400/50 hover:shadow-glow-aqua transition-all duration-300 cursor-pointer group transform hover:scale-102 animate-fadeIn"
              onClick={() => handleVoiceCommand(command)}
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">💬</span>
                <p className="text-gray-700 font-medium group-hover:text-gradient-health transition-all">"{command}"</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions with glow effects */}
        <div className="grid grid-cols-2 gap-5">
          <button
            onClick={() => navigate('/scan')}
            className="glass-card-solid backdrop-blur-md rounded-2xl p-8 shadow-glow-sm hover:shadow-glow-aqua border-2 border-aqua-200/30 hover:border-aqua-400/50 transition-all duration-300 transform hover:scale-105 group animate-fadeIn"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">🍽</div>
            <div className="font-bold text-gray-800 text-lg">Scan Food</div>
            <div className="text-sm text-gray-600 mt-2">Analyze your meal</div>
            <div className="mt-3 w-full h-1 bg-gradient-to-r from-aqua-400 to-mint-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-glow-sm"></div>
          </button>

          <button
            onClick={() => navigate('/prediction')}
            className="glass-card-solid backdrop-blur-md rounded-2xl p-8 shadow-glow-sm hover:shadow-glow-glucose border-2 border-glucose-200/30 hover:border-glucose-400/50 transition-all duration-300 transform hover:scale-105 group animate-fadeIn"
            style={{ animationDelay: '0.6s' }}
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">📊</div>
            <div className="font-bold text-gray-800 text-lg">View Trends</div>
            <div className="text-sm text-gray-600 mt-2">Check predictions</div>
            <div className="mt-3 w-full h-1 bg-gradient-to-r from-glucose-400 to-medical-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-glow-sm"></div>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
