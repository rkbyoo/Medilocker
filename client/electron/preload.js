const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any IPC methods you need here
  platform: process.platform,
  versions: process.versions,
  
  // NFC API
  nfc: {
    onCardDetected: (callback) => {
      ipcRenderer.on('nfc:card', (_, data) => callback(data));
    },
    onStatusChange: (callback) => {
      ipcRenderer.on('nfc:status', (_, data) => callback(data));
    },
    getStatus: () => ipcRenderer.invoke('nfc:getStatus'),
    reconnect: () => ipcRenderer.invoke('nfc:reconnect'),
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners('nfc:card');
      ipcRenderer.removeAllListeners('nfc:status');
    }
  },
  
  // Example: File operations (if needed)
  // openFile: () => ipcRenderer.invoke('dialog:openFile'),
  // saveFile: (data) => ipcRenderer.invoke('dialog:saveFile', data),
  
  // Example: App controls
  // minimize: () => ipcRenderer.invoke('window:minimize'),
  // maximize: () => ipcRenderer.invoke('window:maximize'),
  // close: () => ipcRenderer.invoke('window:close'),
});