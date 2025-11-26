export interface ElectronAPI {
  platform: string;
  versions: NodeJS.ProcessVersions;
  // Add more methods as needed
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}