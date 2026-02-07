/**
 * Appointment Card Component
 * Reusable card for displaying appointment information
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatTime } from '@/utils/formatters';
import { Clock, User, Calendar } from 'lucide-react';
import type { Appointment } from '@/types';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: (appointment: Appointment) => void;
  showActions?: boolean;
  variant?: 'default' | 'today' | 'recent';
}

const variantStyles = {
  default: {
    card: 'hover:bg-accent/50',
    border: 'hover:border-accent',
    text: 'group-hover:text-accent-foreground',
  },
  today: {
    card: 'hover:bg-primary/10',
    border: 'hover:border-primary',
    text: 'group-hover:text-primary',
  },
  recent: {
    card: 'hover:bg-secondary/10',
    border: 'hover:border-secondary',
    text: 'group-hover:text-secondary',
  },
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onClick,
  showActions = false,
  variant = 'default',
}) => {
  const styles = variantStyles[variant];

  const handleClick = () => {
    onClick?.(appointment);
  };

  const getStatusBadge = () => {
    const statusConfig = {
      scheduled: { variant: 'outline' as const, label: 'Scheduled' },
      completed: { variant: 'secondary' as const, label: 'Completed' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' },
    };

    const config = statusConfig[appointment.status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card 
      className={`border-2 cursor-pointer transition-all hover:shadow-md group ${styles.card} ${styles.border}`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className={`font-semibold text-lg transition-colors ${styles.text}`}>
              {appointment.patientName}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <User className="w-3 h-3" />
              {appointment.department}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge()}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatTime(appointment.dateTime)}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">Reason: </span>
            {appointment.reason}
          </p>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Dr. {appointment.doctorName}</span>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2 mt-4 pt-3 border-t">
            <Button size="sm" variant="outline" className="flex-1">
              View Details
            </Button>
            {appointment.status === 'scheduled' && (
              <Button size="sm" variant="outline" className="flex-1">
                Reschedule
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};