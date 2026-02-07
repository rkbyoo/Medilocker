/**
 * Page Layout Component
 * Provides consistent layout structure for pages
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  showBackButton?: boolean;
  showLogout?: boolean;
  headerActions?: React.ReactNode;
  headerGradient?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  className,
  showBackButton = false,
  showLogout = true,
  headerActions,
  headerGradient = 'from-primary to-secondary',
}) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={cn(
        'border-b bg-gradient-to-r shadow-lg backdrop-blur-sm',
        `bg-gradient-to-r ${headerGradient}`
      )}>
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-primary-foreground hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div>
                {title && (
                  <h1 className="text-3xl font-bold text-primary-foreground">
                    {title}
                  </h1>
                )}
                {user && (
                  <p className="text-base text-primary-foreground/80 mt-1">
                    Welcome, {user.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {headerActions}
              {showLogout && (
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-primary-foreground hover:bg-white/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn('container mx-auto px-6 py-8', className)}>
        {children}
      </main>
    </div>
  );
};