/**
 * Appointments List Component
 * Displays a list of appointments with loading and empty states
 */

import React from 'react';
import { LoadingSpinner } from '@/components/common';
import { AppointmentCard } from './AppointmentCard';
import { Calendar, Clock } from 'lucide-react';
import type { Appointment } from '@/types';

interface AppointmentsListProps {
  appointments: Appointment[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  onAppointmentClick?: (appointment: Appointment) => void;
  variant?: 'default' | 'today' | 'recent';
  showActions?: boolean;
}

export const AppointmentsList: React.FC<AppointmentsListProps> = ({
  appointments,
  isLoading = false,
  emptyMessage = 'No appointments found',
  emptyIcon: EmptyIcon = Calendar,
  onAppointmentClick,
  variant = 'default',
  showActions = false,
}) => {
  if (isLoading) {
    return <LoadingSpinner message="Loading appointments..." />;
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <EmptyIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onClick={onAppointmentClick}
          variant={variant}
          showActions={showActions}
        />
      ))}
    </div>
  );
};