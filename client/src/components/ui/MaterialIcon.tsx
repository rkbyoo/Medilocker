import React from 'react';
import { cn } from '@/lib/utils';

interface MaterialIconProps {
  /** Icon name from Material Symbols (e.g., 'dashboard', 'person_add', 'local_hospital') */
  name: string;
  /** Use filled variant */
  filled?: boolean;
  /** Icon size in pixels */
  size?: 14 | 16 | 18 | 20 | 24 | 32 | 48 | 96;
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Title for accessibility */
  title?: string;
}

/**
 * MaterialIcon Component
 * 
 * Wrapper for Google Material Symbols Outlined icons.
 * 
 * @example
 * <MaterialIcon name="dashboard" size={20} />
 * <MaterialIcon name="person_add" filled size={24} className="text-primary" />
 * <MaterialIcon name="local_hospital" size={32} filled />
 */
export const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  filled = false,
  size = 24,
  className,
  onClick,
  title,
}) => {
  return (
    <span
      className={cn(
        'material-symbols-outlined',
        `text-[${size}px]`,
        filled && 'fill-1',
        onClick && 'cursor-pointer',
        className
      )}
      style={{ fontSize: `${size}px` }}
      onClick={onClick}
      title={title}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {name}
    </span>
  );
};

export default MaterialIcon;
