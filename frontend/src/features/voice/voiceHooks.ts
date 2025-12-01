export interface VoiceCommand {
  text: string;
  intent: 'scan' | 'prediction' | 'abha' | 'query' | 'medicine' | 'unknown';
}

// Check if browser supports Web Speech API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: any = null;
let currentLanguage: string = 'en-US';

export const setVoiceLanguage = (lang: 'en' | 'hi'): void => {
  currentLanguage = lang === 'hi' ? 'hi-IN' : 'en-US';
  console.log('Voice language set to:', currentLanguage);
};

export const getCurrentLanguage = (): string => {
  return currentLanguage;
};

export const startListening = async (language?: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported, using fallback');
      // Fallback for unsupported browsers
      setTimeout(() => {
        const mockCommands = [
          'What will my sugar be after lunch?',
          'Scan my food',
          'Show my health records',
          'Log my morning medicine',
          'What if I eat a sweet?',
        ];
        const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
        speak(`You said: ${randomCommand}`, language || currentLanguage);
        resolve(randomCommand);
      }, 2000);
      return;
    }

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true; // Enable continuous listening
      recognition.interimResults = true; // Show interim results while speaking
      recognition.lang = language || currentLanguage;
      recognition.maxAlternatives = 1;

      let finalTranscript = '';
      let silenceTimer: any = null;
      let hasReceivedSpeech = false;

      const SILENCE_DURATION = 1000; // 1 second of silence to stop

      recognition.onstart = () => {
        console.log('Voice recognition started in language:', recognition.lang);
        const listeningMsg = recognition.lang === 'hi-IN' ? 'सुन रहा हूं...' : 'Listening...';
        speak(listeningMsg, recognition.lang);
      };

      recognition.onresult = (event: any) => {
        // Clear silence timer as we received speech
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          silenceTimer = null;
        }

        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            hasReceivedSpeech = true;
          } else {
            interimTranscript += transcript;
          }
        }

        console.log('Interim:', interimTranscript, 'Final so far:', finalTranscript);

        // Start silence timer after receiving some speech
        if (hasReceivedSpeech) {
          silenceTimer = setTimeout(() => {
            console.log('Silence detected, stopping...');
            recognition.stop();
          }, SILENCE_DURATION);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        if (silenceTimer) {
          clearTimeout(silenceTimer);
        }

        // Ignore 'no-speech' error if we already have a transcript
        if (event.error === 'no-speech' && finalTranscript.trim()) {
          const trimmedTranscript = finalTranscript.trim();
          console.log('Got transcript despite no-speech error:', trimmedTranscript);
          const youSaidMsg = recognition.lang === 'hi-IN' ? `आपने कहा: ${trimmedTranscript}` : `You said: ${trimmedTranscript}`;
          speak(youSaidMsg, recognition.lang);
          resolve(trimmedTranscript);
          return;
        }

        const errorMsg = recognition.lang === 'hi-IN' 
          ? 'क्षमा करें, मैं समझ नहीं पाया। कृपया फिर से कोशिश करें।'
          : 'Sorry, I could not understand. Please try again.';
        speak(errorMsg, recognition.lang);
        reject(new Error(event.error));
      };

      recognition.onend = () => {
        console.log('Voice recognition ended');
        
        if (silenceTimer) {
          clearTimeout(silenceTimer);
        }

        const trimmedTranscript = finalTranscript.trim();
        
        if (trimmedTranscript) {
          console.log('Final recognized text:', trimmedTranscript);
          const youSaidMsg = recognition.lang === 'hi-IN' ? `आपने कहा: ${trimmedTranscript}` : `You said: ${trimmedTranscript}`;
          speak(youSaidMsg, recognition.lang);
          resolve(trimmedTranscript);
        } else if (!hasReceivedSpeech) {
          const noSpeechMsg = recognition.lang === 'hi-IN'
            ? 'कोई आवाज़ नहीं सुनी। कृपया फिर से कोशिश करें।'
            : 'No speech detected. Please try again.';
          speak(noSpeechMsg, recognition.lang);
          reject(new Error('No speech detected'));
        }
      };

      recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      reject(error);
    }
  });
};

export const stopListening = (): void => {
  if (recognition) {
    recognition.stop();
    recognition = null;
    console.log('Voice recognition stopped');
  }
};

export const speak = (text: string, lang: string = 'en-US'): void => {
  if (!window.speechSynthesis) {
    console.warn('Text-to-Speech not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // Slightly slower for better clarity
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onstart = () => {
    console.log('Speaking:', text);
  };

  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event);
  };

  window.speechSynthesis.speak(utterance);
};

export const parseVoiceCommand = (text: string, lang: string = 'en-US'): VoiceCommand => {
  const lowerText = text.toLowerCase();

  // English keywords
  const scanKeywords = ['scan', 'food', 'plate', 'meal', 'eat', 'eating', 'खाना', 'भोजन', 'स्कैन'];
  const predictionKeywords = ['predict', 'sugar', 'glucose', 'level', 'what if', 'trend', 'शुगर', 'ग्लूकोज', 'स्तर', 'भविष्यवाणी'];
  const abhaKeywords = ['record', 'abha', 'health', 'report', 'history', 'रिकॉर्ड', 'स्वास्थ्य', 'रिपोर्ट'];
  const medicineKeywords = ['medicine', 'medication', 'tablet', 'pill', 'dose', 'log', 'took', 'take', 'दवा', 'दवाई', 'गोली'];
  const queryKeywords = ['show', 'what', 'how', 'tell', 'दिखाओ', 'क्या', 'कैसे', 'बताओ'];

  // Check for medicine logging intent
  if (medicineKeywords.some(keyword => lowerText.includes(keyword))) {
    return { text, intent: 'medicine' };
  }

  // Check for scan intent
  if (scanKeywords.some(keyword => lowerText.includes(keyword))) {
    return { text, intent: 'scan' };
  }

  // Check for prediction intent
  if (predictionKeywords.some(keyword => lowerText.includes(keyword))) {
    return { text, intent: 'prediction' };
  }

  // Check for ABHA/records intent
  if (abhaKeywords.some(keyword => lowerText.includes(keyword))) {
    return { text, intent: 'abha' };
  }

  // Check for query intent
  if (queryKeywords.some(keyword => lowerText.includes(keyword))) {
    return { text, intent: 'query' };
  }

  // Return the text as a query even if no specific intent is matched
  return { text, intent: 'query' };
};
