import type { ApiResponse } from '@/types';
import { getApiUrl, getAuthHeader } from '@/config/api';

export interface Visit {
  id: string;
  visit_id: string;
  patient_id: string;
  patient_number?: string;
  patient_name?: string;
  doctor_id: string;
  doctor_name: string;
  hospital_id: string;
  hospital_name?: string;
  appointment_id?: string;
  visit_date: string;
  visit_type: 'scheduled' | 'walk_in' | 'follow_up' | 'emergency';
  diagnosis?: string;
  notes?: string;
  advice?: string;
  next_visit_date?: string;
  prescriptions?: Array<{
    prescription_id: string;
    prescription_text?: string;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface CreateVisitData {
  patient_id: string;
  doctor_id: string;
  hospital_id?: string;
  appointment_id?: string;
  visit_date?: string;
  visit_type?: 'scheduled' | 'walk_in' | 'follow_up' | 'emergency';
  diagnosis?: string;
  notes?: string;
  advice?: string;
  next_visit_date?: string;
}

/**
 * Transform backend visit to frontend format
 */
const transformVisit = (visit: any): Visit => {
  return {
    id: visit.id || visit.visit_id,
    visit_id: visit.visit_id || visit.id,
    patient_id: visit.patient_id,
    patient_number: visit.patient_number,
    patient_name: visit.patient_name,
    doctor_id: visit.doctor_id,
    doctor_name: visit.doctor_name,
    hospital_id: visit.hospital_id,
    hospital_name: visit.hospital_name,
    appointment_id: visit.appointment_id,
    visit_date: visit.visit_date,
    visit_type: visit.visit_type,
    diagnosis: visit.diagnosis,
    notes: visit.notes,
    advice: visit.advice,
    next_visit_date: visit.next_visit_date,
    prescriptions: visit.prescriptions || [],
    created_at: visit.created_at,
    updated_at: visit.updated_at,
  };
};

/**
 * Create a new visit
 */
export const createVisit = async (data: CreateVisitData): Promise<ApiResponse<Visit>> => {
  try {
    const response = await fetch(getApiUrl('visits'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.message || result.error || 'Failed to create visit',
      };
    }

    return {
      success: true,
      data: transformVisit(result.data),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create visit';
    return { success: false, error: message };
  }
};

/**
 * Get visits by patient ID (medical history)
 */
export const getVisitsByPatientId = async (patientId: string, limit?: number): Promise<Visit[]> => {
  try {
    const url = limit 
      ? getApiUrl(`visits/patient/${patientId}/history?limit=${limit}`)
      : getApiUrl(`visits/patient/${patientId}/history`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return Array.isArray(data.data) ? data.data.map(transformVisit) : [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching patient visits:', error);
    return [];
  }
};

/**
 * Get visit by ID
 */
export const getVisitById = async (visitId: string): Promise<Visit | null> => {
  try {
    const response = await fetch(getApiUrl(`visits/${visitId}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return transformVisit(data.data);
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching visit:', error);
    return null;
  }
};

/**
 * Update visit
 */
export const updateVisit = async (visitId: string, data: Partial<CreateVisitData>): Promise<ApiResponse<Visit>> => {
  try {
    const response = await fetch(getApiUrl(`visits/${visitId}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return {
        success: false,
        error: result.message || result.error || 'Failed to update visit',
      };
    }

    return {
      success: true,
      data: transformVisit(result.data),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update visit';
    return { success: false, error: message };
  }
};

