import { useState, useEffect, useCallback } from 'react';
import type { NFCStatus, NFCData } from '@/types/electron';

interface UseNFCReturn {
  uid: string | null;
  isConnected: boolean;
  error: string | null;
  port: string | null;
  lastReadAt: number | null;
  reconnect: () => Promise<void>;
}

export function useNFC(): UseNFCReturn {
  const [status, setStatus] = useState<NFCStatus>({
    connected: false,
    port: null,
    error: null
  });
  const [lastCard, setLastCard] = useState<NFCData | null>(null);

  useEffect(() => {
    // Check if electron API is available
    if (!window.electronAPI?.nfc) {
      console.warn('[NFC] Electron NFC API not available');
      return;
    }

    const nfc = window.electronAPI.nfc;

    // Get initial status
    nfc.getStatus().then((initialStatus) => {
      setStatus(initialStatus);
    });

    // Listen for card detections
    nfc.onCardDetected((data) => {
      console.log('[NFC] Card detected in renderer:', data.uid);
      setLastCard(data);
    });

    // Listen for status changes
    nfc.onStatusChange((newStatus) => {
      console.log('[NFC] Status changed:', newStatus);
      setStatus(newStatus);
    });

    // Cleanup
    return () => {
      nfc.removeAllListeners();
    };
  }, []);

  const reconnect = useCallback(async () => {
    if (!window.electronAPI?.nfc) {
      console.warn('[NFC] Electron NFC API not available');
      return;
    }

    try {
      const newStatus = await window.electronAPI.nfc.reconnect();
      setStatus(newStatus);
    } catch (error) {
      console.error('[NFC] Reconnect failed:', error);
    }
  }, []);

  return {
    uid: lastCard?.uid ?? null,
    isConnected: status.connected,
    error: status.error,
    port: status.port,
    lastReadAt: lastCard?.timestamp ?? null,
    reconnect
  };
}
