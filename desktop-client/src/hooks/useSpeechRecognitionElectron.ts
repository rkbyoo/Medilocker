import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type {
    ElectronAPI,
    SpeechRecognitionAPI,
    SpeechRecognitionEvent,
    SpeechRecognitionErrorEvent
} from '@/types/electron';

interface UseSpeechRecognitionOptions {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
    onResult?: (transcript: string, isInterim: boolean) => void;
    onError?: (error: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
}

// Helper function to detect Electron
const isElectron = (): boolean => {
    return !!(window.electronAPI?.isElectron || (window as any).electronAPI);
};

export const useSpeechRecognitionElectron = (options: UseSpeechRecognitionOptions = {}) => {
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
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        const initializeSpeechRecognition = async () => {
            const isElectronEnv = isElectron();

            console.log('Initializing speech recognition...', { isElectronEnv });

            // Check if speech recognition is supported
            let speechSupported = false;

            if (isElectronEnv && window.electronAPI?.speechRecognition) {
                speechSupported = window.electronAPI.speechRecognition.isSupported();
                console.log('Electron speech recognition supported:', speechSupported);
            } else {
                speechSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
                console.log('Browser speech recognition supported:', speechSupported);
            }

            if (!speechSupported) {
                setIsSupported(false);
                return;
            }

            // Create recognition instance
            let recognition: SpeechRecognitionAPI | null = null;

            if (isElectronEnv && window.electronAPI?.speechRecognition) {
                recognition = window.electronAPI.speechRecognition.createRecognition();
                console.log('Created Electron recognition instance:', !!recognition);
            } else {
                // For browsers, use the standard Web Speech API
                const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
                if (SpeechRecognition) {
                    recognition = new SpeechRecognition();
                    console.log('Created browser recognition instance:', !!recognition);
                } else {
                    console.log('No SpeechRecognition constructor found');
                }
            }

            if (!recognition) {
                setIsSupported(false);
                return;
            }

            // Configure recognition
            recognition.continuous = continuous;
            recognition.interimResults = interimResults;
            recognition.lang = lang;
            recognition.maxAlternatives = 1;

            // Event handlers
            recognition.onstart = () => {
                console.log('Speech recognition started - onstart fired');
                startTimeRef.current = Date.now();
                setIsListening(true);
                onStart?.();
            };

            recognition.onresult = (event) => {
                console.log('Speech recognition result received');
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
                    console.log('Final transcript:', finalTranscript.trim());
                    onResult?.(finalTranscript.trim(), false);
                    setInterimTranscript('');
                } else if (interimText.trim()) {
                    console.log('Interim transcript:', interimText.trim());
                    onResult?.(interimText.trim(), true);
                }
            };

            recognition.onerror = (event) => {
                console.log('Speech recognition error:', event.error);
                setIsListening(false);
                setInterimTranscript('');

                const errorMessage = getErrorMessage(event.error, isElectronEnv);

                // Handle permission errors - stop everything
                if (event.error === 'not-allowed' || event.error === 'audio-capture') {
                    isActiveRef.current = false;
                    toast.error(errorMessage);
                    onError?.(errorMessage);
                    return;
                }

                // For browsers, handle no-speech by restarting if still active
                if (event.error === 'no-speech' && isActiveRef.current && !isElectronEnv) {
                    // Don't show error for no-speech in browsers - it's normal
                    if (restartTimeoutRef.current) {
                        clearTimeout(restartTimeoutRef.current);
                    }

                    restartTimeoutRef.current = setTimeout(() => {
                        if (isActiveRef.current && recognitionRef.current) {
                            try {
                                recognitionRef.current.start();
                            } catch (e) {
                                console.log('Failed to restart after no-speech:', e);
                                isActiveRef.current = false;
                                setIsListening(false);
                            }
                        }
                    }, 500);
                } else if (event.error === 'aborted') {
                    // Aborted is normal when user stops - don't show error
                    isActiveRef.current = false;
                } else {
                    // For other errors, stop and show error
                    isActiveRef.current = false;
                    if (event.error !== 'no-speech') {
                        toast.error(errorMessage);
                    }
                    onError?.(errorMessage);
                }
            };

            recognition.onend = () => {
                console.log('Speech recognition ended');
                const sessionDuration = Date.now() - startTimeRef.current;
                setIsListening(false);
                setInterimTranscript('');

                // Handle immediate ends in Electron silently
                if (isElectronEnv && sessionDuration < 1000) {
                    console.log('Short session in Electron, stopping');
                    isActiveRef.current = false;
                    return;
                }

                // Show end message if session was meaningful
                if (sessionDuration > 500) {
                    onEnd?.();
                }

                // Auto-restart in browser if still active
                if (isActiveRef.current && !isElectronEnv) {
                    if (restartTimeoutRef.current) {
                        clearTimeout(restartTimeoutRef.current);
                    }

                    restartTimeoutRef.current = setTimeout(() => {
                        if (isActiveRef.current && recognitionRef.current) {
                            try {
                                recognitionRef.current.start();
                            } catch (error) {
                                console.log('Failed to restart recognition:', error);
                                isActiveRef.current = false;
                                setIsListening(false);
                            }
                        }
                    }, 300);
                } else if (isElectronEnv) {
                    // Reset state for Electron
                    isActiveRef.current = false;
                }
            };

            recognitionRef.current = recognition;
            setIsSupported(true);

            console.log('Speech recognition initialized successfully');
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
        console.log('startListening called', { isSupported, isListening, isActive: isActiveRef.current });

        if (!isSupported) {
            toast.error('🚫 Speech recognition not supported');
            return false;
        }

        // Prevent multiple simultaneous starts
        if (isListening || isActiveRef.current) {
            console.log('Already listening or active, returning false');
            return false;
        }

        const isElectronEnv = isElectron();

        // Test microphone access for browsers only
        if (!isElectronEnv) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(track => track.stop());
                console.log('Microphone access granted');
            } catch (micError) {
                console.log('Microphone access denied:', micError);
                toast.error('🚫 Microphone access required. Please allow microphone permissions.');
                return false;
            }
        }

        // Clear any existing timeouts
        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
        }

        // Stop any existing recognition
        try {
            recognitionRef.current?.stop();
        } catch (e) {
            console.log('Error stopping recognition:', e);
        }

        // Wait a moment for cleanup
        await new Promise(resolve => setTimeout(resolve, 100));

        // Set active state and provide immediate visual feedback
        isActiveRef.current = true;
        setInterimTranscript('');

        // Set listening state immediately for visual feedback
        setIsListening(true);

        try {
            console.log('Starting speech recognition...');
            recognitionRef.current?.start();
            return true;
        } catch (error) {
            console.log('Error starting recognition:', error);
            isActiveRef.current = false;
            setIsListening(false); // Reset visual state on error

            // Handle InvalidStateError (already started)
            if (error instanceof Error && error.name === 'InvalidStateError') {
                console.log('InvalidStateError - trying to stop and restart');
                try {
                    recognitionRef.current?.stop();
                    await new Promise(resolve => setTimeout(resolve, 500));

                    if (isActiveRef.current && recognitionRef.current) {
                        setIsListening(true); // Set visual state again
                        recognitionRef.current.start();
                        return true;
                    }
                } catch (stopError) {
                    console.log('Failed to restart after InvalidStateError:', stopError);
                    isActiveRef.current = false;
                    setIsListening(false);
                    toast.error('❌ Failed to start voice recognition');
                    return false;
                }
            } else {
                setIsListening(false);
                toast.error('❌ Failed to start voice recognition');
                return false;
            }
        }

        return false;
    }, [isSupported, isListening]);

    const stopListening = useCallback(() => {
        console.log('stopListening called');

        // Clear all states
        isActiveRef.current = false;
        setIsListening(false);
        setInterimTranscript('');

        // Clear any pending restart
        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = null;
        }

        try {
            recognitionRef.current?.stop();
        } catch (error) {
            console.log('Error stopping recognition:', error);
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

const getErrorMessage = (error: string, isElectronEnv: boolean): string => {
    switch (error) {
        case 'not-allowed':
            return isElectronEnv
                ? '🚫 Microphone access denied. Please restart the app to grant permissions.'
                : '🚫 Microphone access denied. Please allow microphone permissions.';
        case 'no-speech':
            return '🔇 No speech detected. Continuing to listen...';
        case 'audio-capture':
            return isElectronEnv
                ? '🎤 Microphone not accessible. Please check your microphone and restart the app.'
                : '🎤 Microphone not found. Please check your microphone connection.';
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