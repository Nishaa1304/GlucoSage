import { useState, useCallback } from 'react';
import { startListening, stopListening, speak, parseVoiceCommand } from '../features/voice/voiceHooks';

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startVoiceRecognition = useCallback(async () => {
    try {
      setIsListening(true);
      setError(null);
      
      const result = await startListening();
      setTranscript(result);
      setIsListening(false);
      
      return parseVoiceCommand(result);
    } catch (err) {
      setError('Failed to recognize voice');
      setIsListening(false);
      return null;
    }
  }, []);

  const stopVoiceRecognition = useCallback(() => {
    stopListening();
    setIsListening(false);
  }, []);

  const speakText = useCallback((text: string, lang: string = 'en-US') => {
    speak(text, lang);
  }, []);

  return {
    isListening,
    transcript,
    error,
    startVoiceRecognition,
    stopVoiceRecognition,
    speakText,
  };
};
