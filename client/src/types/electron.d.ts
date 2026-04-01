export interface SerialPortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  vendorId?: string;
  productId?: string;
}

export interface ElectronAPI {
  platform: string;
  versions: NodeJS.ProcessVersions;
  nfc: {
    listPorts: () => Promise<SerialPortInfo[]>;
    connect: (portPath: string) => Promise<{ success: boolean; error?: string }>;
    disconnect: () => Promise<{ success: boolean; error?: string }>;
    onCardDetected: (callback: (uid: string) => void) => () => void;
    onConnected: (callback: (port: string) => void) => () => void;
    onDisconnected: (callback: () => void) => () => void;
    onError: (callback: (error: string) => void) => () => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}