const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any IPC methods you need here
  platform: process.platform,
  versions: process.versions,
  
  // NFC Reader API
  nfc: {
    listPorts: () => ipcRenderer.invoke('nfc:list-ports'),
    connect: (portPath) => ipcRenderer.invoke('nfc:connect', portPath),
    disconnect: () => ipcRenderer.invoke('nfc:disconnect'),
    onCardDetected: (callback) => {
      const subscription = (event, uid) => callback(uid);
      ipcRenderer.on('nfc:card-detected', subscription);
      return () => ipcRenderer.removeListener('nfc:card-detected', subscription);
    },
    onConnected: (callback) => {
      const subscription = (event, port) => callback(port);
      ipcRenderer.on('nfc:connected', subscription);
      return () => ipcRenderer.removeListener('nfc:connected', subscription);
    },
    onDisconnected: (callback) => {
      const subscription = () => callback();
      ipcRenderer.on('nfc:disconnected', subscription);
      return () => ipcRenderer.removeListener('nfc:disconnected', subscription);
    },
    onError: (callback) => {
      const subscription = (event, error) => callback(error);
      ipcRenderer.on('nfc:error', subscription);
      return () => ipcRenderer.removeListener('nfc:error', subscription);
    }
  }
});