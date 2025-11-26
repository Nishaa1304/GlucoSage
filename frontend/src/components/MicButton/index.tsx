import { useState } from 'react';

interface MicButtonProps {
  onListen?: (transcript: string) => void;
  size?: 'small' | 'medium' | 'large';
}

const MicButton: React.FC<MicButtonProps> = ({ onListen, size = 'large' }) => {
  const [isListening, setIsListening] = useState(false);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-40 h-40 md:w-48 md:h-48',
  };

  const handleClick = async () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);

    try {
      // Import the voice functions
      const { startListening } = await import('../../features/voice/voiceHooks');
      const transcript = await startListening();
      setIsListening(false);
      onListen?.(transcript);
    } catch (error) {
      console.error('Voice recognition failed:', error);
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleClick}
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-2xl hover:shadow-3xl active:scale-95 transition-all duration-300 flex items-center justify-center relative ${
          isListening ? 'animate-pulse' : ''
        }`}
        aria-label={isListening ? 'Listening...' : 'Press to speak'}
      >
        {isListening ? (
          <div className="flex gap-1 items-center">
            <div className="w-2 h-8 bg-white rounded-full animate-pulse"></div>
            <div className="w-2 h-12 bg-white rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-6 bg-white rounded-full animate-pulse delay-150"></div>
          </div>
        ) : (
          <svg
            className="w-12 h-12 md:w-16 md:h-16"
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
      
      <p className="text-center text-gray-600 text-sm md:text-base font-medium">
        {isListening ? 'Listening...' : 'Tap to speak'}
      </p>
    </div>
  );
};

export default MicButton;
