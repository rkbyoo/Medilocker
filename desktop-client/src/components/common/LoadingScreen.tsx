/**
 * Loading Screen Component
 * Shows a loading screen while the app initializes
 */

import React from 'react';
import { Loader2, Stethoscope } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <Stethoscope className="w-10 h-10 text-primary-foreground" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Medical Management System
          </h1>
          <p className="text-muted-foreground">Loading application...</p>
        </div>
        
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Please wait</span>
        </div>
      </div>
    </div>
  );
};