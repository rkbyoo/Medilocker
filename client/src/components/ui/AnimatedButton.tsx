/**
 * AnimatedButton Component
 * Enhanced button with press feedback and loading states
 * Refined Healthcare Design System
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { buttonPress } from '@/lib/animations';
import { Loader2 } from 'lucide-react';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  loadingText,
  className = '',
  icon,
  iconPosition = 'left',
}) => {
  const isDisabled = disabled || loading;

  return (
    <motion.div
      initial="rest"
      whileTap={!isDisabled ? 'pressed' : undefined}
      variants={buttonPress}
      className="inline-block"
    >
      <Button
        type={type}
        variant={variant}
        size={size}
        disabled={isDisabled}
        onClick={onClick}
        className={cn(
          'transition-colors duration-200',
          loading && 'cursor-not-allowed',
          className
        )}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="mr-2">{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <span className="ml-2">{icon}</span>
            )}
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default AnimatedButton;
