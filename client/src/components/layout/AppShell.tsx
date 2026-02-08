/**
 * AppShell Component
 * Unified layout wrapper providing consistent header and content area
 * Refined Healthcare Design System
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts';
import { fadeInDown } from '@/lib/animations';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  headerActions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  onBack,
  headerActions,
  className = '',
  contentClassName = '',
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`w-screen h-screen bg-background flex flex-col overflow-hidden ${className}`}>
      {/* Header */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={fadeInDown}
        className="border-b bg-card flex-shrink-0"
      >
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            
            <div>
              {title && (
                <h1 className="font-heading text-xl font-semibold text-foreground">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {subtitle}
                </p>
              )}
              {user && !subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  Welcome back, {user.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {headerActions}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className={`flex-1 overflow-hidden ${contentClassName}`}>
        {children}
      </main>
    </div>
  );
};

export default AppShell;
