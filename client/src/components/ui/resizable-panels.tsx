/**
 * Resizable Panels Component - Spotify-like resizable layout
 */

import React, { useState, useRef, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResizablePanelsProps {
  children: ReactNode[];
  defaultSizes?: number[];
  minSizes?: number[];
  className?: string;
  direction?: 'horizontal' | 'vertical';
}

interface PanelProps {
  children: ReactNode;
  className?: string;
  minSize?: number;
  defaultSize?: number;
}

export const ResizablePanels: React.FC<ResizablePanelsProps> = ({
  children,
  defaultSizes = [],
  minSizes = [],
  className = '',
  direction = 'horizontal'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState<number[]>(() => {
    if (defaultSizes.length === children.length) {
      return defaultSizes;
    }
    // Equal distribution if no default sizes provided
    const equalSize = 100 / children.length;
    return Array(children.length).fill(equalSize);
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState(-1);

  const handleMouseDown = useCallback((index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragIndex(index);
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, [direction]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || dragIndex === -1 || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    let percentage: number;
    if (direction === 'horizontal') {
      percentage = ((e.clientX - rect.left) / rect.width) * 100;
    } else {
      percentage = ((e.clientY - rect.top) / rect.height) * 100;
    }

    const minSize = minSizes[dragIndex] || 10;
    const nextMinSize = minSizes[dragIndex + 1] || 10;
    
    // Calculate the total size of the two panels being resized
    const totalSize = sizes[dragIndex] + sizes[dragIndex + 1];
    
    // Ensure minimum sizes are respected
    const newLeftSize = Math.max(minSize, Math.min(totalSize - nextMinSize, percentage));
    const newRightSize = totalSize - newLeftSize;

    setSizes(prev => {
      const newSizes = [...prev];
      newSizes[dragIndex] = newLeftSize;
      newSizes[dragIndex + 1] = newRightSize;
      return newSizes;
    });
  }, [isDragging, dragIndex, sizes, minSizes, direction]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragIndex(-1);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex w-full h-full',
        direction === 'vertical' && 'flex-col',
        className
      )}
    >
      {children.map((child, index) => (
        <React.Fragment key={index}>
          <div
            className="overflow-hidden"
            style={{
              [direction === 'horizontal' ? 'width' : 'height']: `${sizes[index]}%`,
              minWidth: direction === 'horizontal' ? `${minSizes[index] || 10}%` : undefined,
              minHeight: direction === 'vertical' ? `${minSizes[index] || 10}%` : undefined,
            }}
          >
            {child}
          </div>
          
          {/* Resize handle */}
          {index < children.length - 1 && (
            <div
              className={cn(
                'bg-border hover:bg-primary/20 transition-colors cursor-col-resize flex-shrink-0',
                direction === 'horizontal' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize',
                isDragging && dragIndex === index && 'bg-primary/40'
              )}
              onMouseDown={handleMouseDown(index)}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export const Panel: React.FC<PanelProps> = ({ children, className = '' }) => {
  return (
    <div className={cn('h-full overflow-auto', className)}>
      {children}
    </div>
  );
};