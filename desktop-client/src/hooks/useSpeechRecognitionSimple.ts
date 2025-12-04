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
  const isActiveRef = useRef(false);

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
          setIsListening(false);
          setInterimTranscript('');

          if (event.error === 'not-allowed' || event.error === 'audio-capture') {
            isActiveRef.current = false;
            toast.error('🚫 Microphone access denied. Please allow microphone permissions.');
            onError?.('Microphone access denied');
            return;
          }

          if (event.error === 'no-speech' && isActiveRef.current) {
            // Auto-restart on no-speech
            if (restartTimeoutRef.current) {
              clearTimeout(restartTimeoutRef.current);
            }
            
            restartTimeoutRef.current = setTimeout(() => {
              if (isActiveRef.current && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (e) {
                  isActiveRef.current = false;
                  setIsListening(false);
                }
              }
            }, 500);
          } else if (event.error === 'aborted') {
            isActiveRef.current = false;
          } else {
            isActiveRef.current = false;
            onError?.(event.error);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript('');

          if (isActiveRef.current) {
            // Auto-restart if still active
            if (restartTimeoutRef.current) {
              clearTimeout(restartTimeoutRef.current);
            }
            
            restartTimeoutRef.current = setTimeout(() => {
              if (isActiveRef.current && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (error) {
                  isActiveRef.current = false;
                  setIsListening(false);
                }
              }
            }, 300);
          } else {
            onEnd?.();
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
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [continuous, interimResults, lang, onResult, onError, onStart, onEnd]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      toast.error('🚫 Speech recognition not supported in this browser');
      return false;
    }

    if (isListening || isActiveRef.current) {
      return false;
    }

    // Test microphone access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (micError) {
      toast.error('🚫 Microphone access required. Please allow microphone permissions.');
      return false;
    }

    // Clear any existing timeouts
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    // Set active state
    isActiveRef.current = true;
    setInterimTranscript('');

    try {
      recognitionRef.current?.start();
      return true;
    } catch (error) {
      isActiveRef.current = false;
      
      if (error instanceof Error && error.name === 'InvalidStateError') {
        try {
          recognitionRef.current?.stop();
          setTimeout(() => {
            if (isActiveRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                isActiveRef.current = false;
                toast.error('❌ Failed to start voice recognition');
              }
            }
          }, 500);
          return true;
        } catch (stopError) {
          toast.error('❌ Failed to start voice recognition');
          return false;
        }
      } else {
        toast.error('❌ Failed to start voice recognition');
        return false;
      }
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    isActiveRef.current = false;
    setIsListening(false);
    setInterimTranscript('');

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    try {
      recognitionRef.current?.stop();
    } catch (error) {
      // Ignore errors on stop
    }
  }, []);

  const toggleListening = useCallback(async () => {
    if (isListening || isActiveRef.current) {
      stopListening();
    } else {
      await startListening();
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