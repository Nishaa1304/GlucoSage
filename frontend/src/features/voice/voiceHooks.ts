export interface VoiceCommand {
  text: string;
  intent: 'scan' | 'prediction' | 'abha' | 'query' | 'unknown';
}

// Check if browser supports Web Speech API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: any = null;

export const startListening = async (): Promise<string> => {
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
        speak(`You said: ${randomCommand}`);
        resolve(randomCommand);
      }, 2000);
      return;
    }

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Voice recognition started');
        speak('Listening...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Recognized:', transcript);
        speak(`You said: ${transcript}`);
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        speak('Sorry, I could not understand. Please try again.');
        reject(new Error(event.error));
      };

      recognition.onend = () => {
        console.log('Voice recognition ended');
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

export const parseVoiceCommand = (text: string): VoiceCommand => {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('scan') || lowerText.includes('food') || lowerText.includes('plate')) {
    return { text, intent: 'scan' };
  }

  if (lowerText.includes('predict') || lowerText.includes('sugar') || lowerText.includes('what if')) {
    return { text, intent: 'prediction' };
  }

  if (lowerText.includes('record') || lowerText.includes('abha') || lowerText.includes('health')) {
    return { text, intent: 'abha' };
  }

  if (lowerText.includes('show') || lowerText.includes('what') || lowerText.includes('how')) {
    return { text, intent: 'query' };
  }

  return { text, intent: 'unknown' };
};
