import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

interface SpeechRecognitionAPI extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognitionAPI, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognitionAPI, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognitionAPI, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognitionAPI, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: 'no-speech' | 'aborted' | 'audio-capture' | 'network' | 'not-allowed' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
  message: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  readonly isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognitionAPI;
    };
    webkitSpeechRecognition: {
      new(): SpeechRecognitionAPI;
    };
  }
}

interface UseSpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  onResult?: (transcript: string, isInterim: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}) => {
  const {
    continuous = true,
    interimResults = true,
    lang = 'en-US',
    onResult,
    onError,
    onStart,
    onEnd
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  const recognitionRef = useRef<SpeechRecognitionAPI | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    const initializeSpeechRecognition = () => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = lang;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          onStart?.();
        };

        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimText = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimText += transcript;
            }
          }

          setInterimTranscript(interimText);

          if (finalTranscript.trim()) {
            onResult?.(finalTranscript.trim(), false);
            setInterimTranscript('');
          } else if (interimText.trim()) {
            onResult?.(interimText.trim(), true);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setInterimTranscript('');

          const errorMessage = getErrorMessage(event.error);
          onError?.(errorMessage);

          // Handle specific errors
          if (event.error === 'not-allowed' || event.error === 'audio-capture') {
            isRecordingRef.current = false;
          } else if (event.error === 'no-speech' && isRecordingRef.current) {
            // Auto-restart on no-speech if still recording
            setTimeout(() => {
              if (isRecordingRef.current && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (e) {
                  console.log('Auto-restart failed:', e);
                }
              }
            }, 100);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript('');
          onEnd?.();
          
          // Auto-restart if still recording
          if (isRecordingRef.current) {
            restartTimeoutRef.current = setTimeout(() => {
              if (isRecordingRef.current && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (error) {
                  console.log('Auto-restart failed:', error);
                  isRecordingRef.current = false;
                }
              }
            }, 100);
          }
        };

        recognitionRef.current = recognition;
        setIsSupported(true);
      } else {
        setIsSupported(false);
      }
    };

    initializeSpeechRecognition();

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [continuous, interimResults, lang, onResult, onError, onStart, onEnd]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      toast.error('🚫 Speech recognition not supported in this browser');
      return false;
    }

    if (!isListening) {
      isRecordingRef.current = true;
      setInterimTranscript('');
      
      try {
        recognitionRef.current?.start();
        return true;
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        isRecordingRef.current = false;
        toast.error('❌ Failed to start voice recognition');
        return false;
      }
    }
    return false;
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    isRecordingRef.current = false;
    setIsListening(false);
    setInterimTranscript('');
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    try {
      recognitionRef.current?.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening || isRecordingRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening
  };
};

const getErrorMessage = (error: string): string => {
  switch (error) {
    case 'not-allowed':
      return '🚫 Microphone access denied. Please allow microphone permissions.';
    case 'no-speech':
      return '🔇 No speech detected. Continuing to listen...';
    case 'audio-capture':
      return '🎤 Microphone not found. Please check your microphone connection.';
    case 'network':
      return '🌐 Network error. Please check your internet connection.';
    case 'service-not-allowed':
      return '🚫 Speech recognition service not allowed.';
    case 'bad-grammar':
      return '📝 Grammar error in speech recognition.';
    case 'language-not-supported':
      return '🌍 Language not supported.';
    default:
      return `❌ Speech recognition error: ${error}`;
  }
};