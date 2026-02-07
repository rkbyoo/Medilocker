/**
 * usePatients Hook
 * Business logic hook for patient management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '@/api';
import { QUERY_KEYS } from '@/config/constants';
import type { Patient, PatientFormData } from '@/types';
import { toast } from 'sonner';

export const usePatients = () => {
  const queryClient = useQueryClient();

  // Get all patients
  const {
    data: patients = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.PATIENTS.LIST,
    queryFn: async () => await patientsApi.getAllPatients(),
  });

  // Get patient by ID
  const usePatientById = (id?: string) => {
    return useQuery({
      queryKey: QUERY_KEYS.PATIENTS.DETAIL(id || ''),
      queryFn: async () => await patientsApi.getPatientById(id || ''),
      enabled: !!id,
    });
  };

  // Create patient mutation
  const createPatientMutation = useMutation({
    mutationFn: async (data: PatientFormData) => 
      await patientsApi.createPatient(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PATIENTS.LIST });
      if (response.success) {
        toast.success('Patient registered successfully');
      } else {
        toast.error(response.error || 'Failed to register patient');
      }
      return response;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to register patient');
    },
  });

  // Update patient mutation
  const updatePatientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PatientFormData> }) =>
      Promise.resolve(patientsApi.updatePatient(id, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PATIENTS.LIST });
      toast.success('Patient updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update patient');
    },
  });

  // Search patients (client-side filtering from loaded patients)
  const searchPatients = (query: string) => {
    if (!query.trim()) return patients;
    
    const searchTerm = query.toLowerCase();
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(searchTerm) ||
      patient.id.includes(searchTerm) ||
      (patient.phoneNumber && patient.phoneNumber.includes(searchTerm))
    );
  };

  return {
    // Data
    patients,
    isLoading,
    error,
    
    // Specialized queries
    usePatientById,
    
    // Mutations
    createPatient: createPatientMutation.mutate,
    updatePatient: updatePatientMutation.mutate,
    
    // Mutation states
    isCreating: createPatientMutation.isPending,
    isUpdating: updatePatientMutation.isPending,
    
    // Utilities
    searchPatients,
  };
};