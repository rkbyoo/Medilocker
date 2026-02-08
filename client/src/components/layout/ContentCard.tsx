/**
 * ContentCard Component
 * Refined card component with subtle styling and hover effects
 * Refined Healthcare Design System
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { cardHover } from '@/lib/animations';

interface ContentCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  className = '',
  headerClassName = '',
  contentClassName = '',
  hover = false,
  onClick,
}) => {
  const CardWrapper = hover ? motion.div : 'div';
  const wrapperProps = hover
    ? {
        initial: 'rest',
        whileHover: 'hover',
        variants: cardHover,
      }
    : {};

  return (
    <CardWrapper
      {...wrapperProps}
      onClick={onClick}
      className={cn(
        'bg-card border rounded-lg shadow-sm overflow-hidden',
        hover && 'cursor-pointer',
        onClick && !hover && 'cursor-pointer',
        className
      )}
    >
      {(title || icon) && (
        <div className={cn('px-6 py-4 border-b bg-muted/30', headerClassName)}>
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex-shrink-0 text-primary">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className={cn('p-6', contentClassName)}>
        {children}
      </div>
    </CardWrapper>
  );
};

export default ContentCard;
