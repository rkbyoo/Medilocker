const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any IPC methods you need here
  platform: process.platform,
  versions: process.versions,
  isElectron: true,
  
  // Enhanced speech recognition support
  speechRecognition: {
    // Test microphone access
    testMicrophone: async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        console.log('Microphone access granted in Electron');
        stream.getTracks().forEach(track => track.stop());
        return { success: true, message: 'Microphone access granted' };
      } catch (error) {
        console.error('Microphone access denied:', error);
        return { success: false, message: error.message };
      }
    },
    
    // Check if speech recognition is available
    isSupported: () => {
      return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    },
    
    // Get available audio input devices
    getAudioDevices: async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === 'audioinput');
      } catch (error) {
        console.error('Failed to enumerate devices:', error);
        return [];
      }
    },
    
    // Create speech recognition instance with Electron optimizations
    createRecognition: () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        return null;
      }
      
      const recognition = new SpeechRecognition();
      
      // Electron-optimized settings
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      return recognition;
    }
  },
  
  // Media permissions helper (legacy support)
  testMicrophone: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');
      stream.getTracks().forEach(track => track.stop());
      return { success: true, message: 'Microphone access granted' };
    } catch (error) {
      console.error('Microphone access denied:', error);
      return { success: false, message: error.message };
    }
  },
  
  // Check available media devices (legacy support)
  getMediaDevices: async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
      return [];
    }
  }
});