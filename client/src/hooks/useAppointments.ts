/**
 * useAppointments Hook
 * Business logic hook for appointment management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '@/api';
import { QUERY_KEYS } from '@/config/constants';
import { useAuth } from '@/contexts';
import type { Appointment, AppointmentFormData, ApiResponse } from '@/types';
import { toast } from 'sonner';

export const useAppointments = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get all appointments
  const {
    data: appointments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.APPOINTMENTS.LIST,
    queryFn: () => appointmentsApi.getAllAppointments(),
    enabled: !!user,
  });

  // Get appointments by doctor
  const useDoctorAppointments = (doctorId?: string) => {
    return useQuery({
      queryKey: QUERY_KEYS.APPOINTMENTS.BY_DOCTOR(doctorId || ''),
      queryFn: () => appointmentsApi.getAppointmentsByDoctorId(doctorId || ''),
      enabled: !!doctorId,
    });
  };

  // Get today's appointments
  const useTodaysAppointments = (doctorId?: string) => {
    return useQuery({
      queryKey: QUERY_KEYS.APPOINTMENTS.TODAY(doctorId || ''),
      queryFn: () => appointmentsApi.getTodaysAppointments(doctorId || ''),
      enabled: !!doctorId,
    });
  };

  // Get recent appointments
  const useRecentAppointments = (doctorId?: string, limit = 5) => {
    return useQuery({
      queryKey: QUERY_KEYS.APPOINTMENTS.RECENT(doctorId || ''),
      queryFn: () => appointmentsApi.getCompletedAppointments(doctorId || '', limit),
      enabled: !!doctorId,
    });
  };

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: (data: AppointmentFormData) => 
      Promise.resolve(appointmentsApi.createAppointment(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS.LIST });
      toast.success('Appointment created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create appointment');
    },
  });

  // Update appointment mutation
  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AppointmentFormData> }) =>
      Promise.resolve(appointmentsApi.updateAppointment(id, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS.LIST });
      toast.success('Appointment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update appointment');
    },
  });

  // Cancel appointment mutation
  const cancelAppointmentMutation = useMutation({
    mutationFn: (id: string) => 
      Promise.resolve(appointmentsApi.updateAppointment(id, { status: 'cancelled' })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.APPOINTMENTS.LIST });
      toast.success('Appointment cancelled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel appointment');
    },
  });

  return {
    // Data
    appointments,
    isLoading,
    error,
    
    // Specialized queries
    useDoctorAppointments,
    useTodaysAppointments,
    useRecentAppointments,
    
    // Mutations
    createAppointment: createAppointmentMutation.mutate,
    updateAppointment: updateAppointmentMutation.mutate,
    cancelAppointment: cancelAppointmentMutation.mutate,
    
    // Mutation states
    isCreating: createAppointmentMutation.isPending,
    isUpdating: updateAppointmentMutation.isPending,
    isCancelling: cancelAppointmentMutation.isPending,
  };
};