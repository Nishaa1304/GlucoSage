import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { getTranslations } from '../../i18n/translations';

interface MicButtonProps {
  onListen?: (transcript: string) => void;
  size?: 'small' | 'medium' | 'large';
}

const MicButton: React.FC<MicButtonProps> = ({ onListen, size = 'large' }) => {
  const [isListening, setIsListening] = useState(false);
  const { user } = useUser();
  const t = getTranslations(user?.language || 'en');

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-40 h-40 md:w-48 md:h-48',
  };

  const handleClick = async () => {
    if (isListening) {
      // Stop listening if already listening
      const { stopListening } = await import('../../features/voice/voiceHooks');
      stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);

    try {
      // Import the voice functions
      const { startListening } = await import('../../features/voice/voiceHooks');
      const lang = user?.language === 'hi' ? 'hi-IN' : 'en-US';
      const transcript = await startListening(lang);
      setIsListening(false);
      onListen?.(transcript);
    } catch (error) {
      console.error('Voice recognition failed:', error);
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Glow rings animation */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-glucose-400 to-medical-500 animate-ping opacity-20"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-glucose-400 to-medical-500 animate-pulse opacity-30"></div>
          </>
        )}
        
        <button
          onClick={handleClick}
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-aqua-500 via-primary-600 to-mint-500 text-white shadow-glow-lg hover:shadow-glow-aqua active:scale-95 transition-all duration-300 flex items-center justify-center relative overflow-hidden ${
            isListening ? 'animate-glow bg-gradient-to-br from-glucose-500 to-medical-600' : 'hover:scale-110'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Press to speak'}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 shimmer"></div>
          
          {isListening ? (
            <div className="flex flex-col items-center gap-2 z-10">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-8 bg-white rounded-full animate-pulse shadow-glow"></div>
                <div className="w-2 h-12 bg-white rounded-full animate-pulse shadow-glow" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-6 bg-white rounded-full animate-pulse shadow-glow" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <div className="text-xs font-semibold drop-shadow-lg">
                {user?.language === 'hi' ? 'टैप करें रोकने के लिए' : 'Tap to stop'}
              </div>
            </div>
          ) : (
            <svg
              className="w-12 h-12 md:w-16 md:h-16 z-10 drop-shadow-lg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )}
        </button>
      </div>
      
      <p className="text-sm text-white font-medium mt-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-glow-sm animate-fadeIn">
        {isListening 
          ? (user?.language === 'hi' ? '🎤 बोलते रहें... 1 सेकंड की चुप्पी के बाद बंद होगा' : '🎤 Keep speaking... Will stop after 1 sec silence')
          : t.home.tapToSpeak
        }
      </p>
    </div>
  );
};

export default MicButton;
