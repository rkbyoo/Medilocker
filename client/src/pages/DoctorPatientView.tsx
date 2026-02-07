/**
 * Doctor Patient View Page
 * Read-only view of patient details for tomorrow's appointments
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { patientsApi } from '@/api';
import { useAuth } from '@/contexts';
import PatientInfoCard from '@/components/common/PatientInfoCard';
import type { Patient } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

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
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="font-medium text-lg mt-4">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground font-medium mb-4">Patient not found</p>
          <Button onClick={() => navigate('/doctor')} className="font-medium">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-primary to-secondary shadow-lg flex-shrink-0 backdrop-blur-sm">
        <div className="w-full px-4 py-3 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/doctor')}
            className="text-white hover:bg-white/20 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-medium text-primary-foreground">Patient Details</h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-2">
            <CardContent className="p-6">
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
      </main>
    </div>
  );
};

export default DoctorPatientView;

