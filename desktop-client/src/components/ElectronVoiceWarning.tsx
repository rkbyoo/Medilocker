import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, X } from 'lucide-react';

export const ElectronVoiceWarning = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Only show in Electron environment
  const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;
  
  if (!isElectron || !isVisible) {
    return null;
  }

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-orange-600">⚠️</span>
              <h3 className="font-medium text-orange-800">Voice Input Limitation</h3>
            </div>
            <p className="text-sm text-orange-700 mb-3">
              The desktop app has limited voice recognition support due to Electron's Web Speech API constraints. 
              Voice input may start and stop immediately.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
                onClick={() => {
                  window.open('http://localhost:5173', '_blank');
                }}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Open Web Version
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-orange-600 hover:bg-orange-100"
                onClick={() => setIsVisible(false)}
              >
                Dismiss
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-orange-600 hover:bg-orange-100 p-1"
            onClick={() => setIsVisible(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};