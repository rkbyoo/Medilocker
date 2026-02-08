/**
 * Doctor Patient View Page
 * Read-only view of patient details for tomorrow's appointments
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { patientsApi } from '@/api';
import { useAuth } from '@/contexts';
import PatientInfoCard from '@/components/common/PatientInfoCard';
import type { Patient } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { DesktopLayout } from '@/components/layout';

const DoctorPatientView = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) {
        toast.error('Patient ID is required');
        navigate('/doctor');
        return;
      }

      setLoading(true);
      try {
        const foundPatient = await patientsApi.getPatientById(patientId);
        if (!foundPatient) {
          toast.error('Patient not found');
          navigate('/doctor');
          return;
        }
        setPatient(foundPatient);
      } catch (error) {
        console.error('Error loading patient:', error);
        toast.error('Error loading patient data');
        navigate('/doctor');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId, navigate]);

  if (loading) {
    return (
      <DesktopLayout title="Patient Details">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <LoadingSpinner />
            <p className="font-medium text-base mt-4">Loading patient data...</p>
          </div>
        </div>
      </DesktopLayout>
    );
  }

  if (!patient) {
    return (
      <DesktopLayout title="Patient Details">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-base text-muted-foreground font-medium mb-4">Patient not found</p>
            <Button onClick={() => navigate('/doctor')} className="font-medium">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </DesktopLayout>
    );
  }

  return (
    <DesktopLayout title="Patient Details">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-sm border">
          <CardContent className="p-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                <span className="font-medium">Note:</span> This is a scheduled appointment for tomorrow. 
                Consultation can only be added on the appointment date.
              </p>
            </div>
            <PatientInfoCard patient={patient} variant="detailed" showExpandableDetails={true} />
          </CardContent>
        </Card>
      </div>
    </DesktopLayout>
  );
};

export default DoctorPatientView;
