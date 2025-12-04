/**
 * Utility functions for Electron detection and handling
 */

export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && 
         (window as any).electronAPI !== undefined;
};

export const getElectronVersion = (): string | null => {
  if (isElectron()) {
    return (window as any).electronAPI?.versions?.electron || null;
  }
  return null;
};

export const getPlatform = (): string => {
  if (isElectron()) {
    return (window as any).electronAPI?.platform || 'unknown';
  }
  return navigator.platform;
};

export const logElectronInfo = (): void => {
  if (isElectron()) {
    console.log('Running in Electron');
    console.log('Platform:', getPlatform());
    console.log('Electron version:', getElectronVersion());
    console.log('Node version:', (window as any).electronAPI?.versions?.node);
    console.log('Chrome version:', (window as any).electronAPI?.versions?.chrome);
  } else {
    console.log('Running in browser');
    console.log('User agent:', navigator.userAgent);
  }
};