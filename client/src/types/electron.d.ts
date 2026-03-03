export interface NFCStatus {
  connected: boolean;
  port: string | null;
  error: string | null;
}

export interface NFCData {
  uid: string;
  timestamp: number;
}

export interface NFCServiceAPI {
  onCardDetected: (callback: (data: NFCData) => void) => void;
  onStatusChange: (callback: (status: NFCStatus) => void) => void;
  getStatus: () => Promise<NFCStatus>;
  reconnect: () => Promise<NFCStatus>;
  removeAllListeners: () => void;
}

export interface ElectronAPI {
  platform: string;
  versions: NodeJS.ProcessVersions;
  nfc: NFCServiceAPI;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
