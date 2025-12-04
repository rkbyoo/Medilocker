export interface ElectronAPI {
  platform: string;
  versions: NodeJS.ProcessVersions;
  isElectron: boolean;
  speechRecognition: {
    testMicrophone: () => Promise<{ success: boolean; message: string }>;
    isSupported: () => boolean;
    getAudioDevices: () => Promise<any[]>;
    createRecognition: () => SpeechRecognitionAPI | null;
  };
  // Legacy support
  testMicrophone: () => Promise<{ success: boolean; message: string }>;
  getMediaDevices: () => Promise<any[]>;
}

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
    electronAPI: ElectronAPI;
  }
}