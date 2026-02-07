const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any IPC methods you need here
  platform: process.platform,
  versions: process.versions,
  
  // Example: File operations (if needed)
  // openFile: () => ipcRenderer.invoke('dialog:openFile'),
  // saveFile: (data) => ipcRenderer.invoke('dialog:saveFile', data),
  
  // Example: App controls
  // minimize: () => ipcRenderer.invoke('window:minimize'),
  // maximize: () => ipcRenderer.invoke('window:maximize'),
  // close: () => ipcRenderer.invoke('window:close'),
});