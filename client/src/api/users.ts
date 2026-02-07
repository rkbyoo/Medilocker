import type { ApiResponse } from '@/types';
import { getApiUrl, getAuthHeader } from '@/config/api';

export interface Doctor {
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
}

/**
 * Get all doctors (hospital staff with doctor role)
 */
export const getDoctors = async (): Promise<Doctor[]> => {
  try {
    const response = await fetch(getApiUrl('users/doctors'), {
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
    
    if (data.success && data.data?.doctors) {
      return data.data.doctors;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
};

