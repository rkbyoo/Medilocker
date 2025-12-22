/**
 * View Visit Page
 * Read-only view of a past consultation/visit
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResizablePanels, Panel } from '@/components/ui/resizable-panels';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  FileText,
  User,
  Clock,
  Stethoscope,
  Pill,
  MessageSquare,
} from 'lucide-react';
import { patientsApi, visitsApi } from '@/api';
import { useAuth } from '@/contexts';
import PatientInfoCard from '@/components/common/PatientInfoCard';
import type { Patient } from '@/types';
import type { Visit } from '@/api/visits';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const ViewVisit = () => {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisit = async () => {
      if (!visitId) {
        toast.error('Visit ID is required');
        navigate('/doctor');
        return;
      }

      setLoading(true);
      try {
        // Fetch visit details
        const visitData = await visitsApi.getVisitById(visitId);
        if (!visitData) {
          toast.error('Visit not found');
          navigate('/doctor');
          return;
        }

        setVisit(visitData);

        // Fetch patient details
        const patientUuid = visitData.patient_id;
        const patientData = await patientsApi.getPatientById(patientUuid);
        if (patientData) {
          setPatient(patientData);
        }
      } catch (error) {
        console.error('Error loading visit:', error);
        toast.error('Error loading visit details');
        navigate('/doctor');
      } finally {
        setLoading(false);
      }
    };

    fetchVisit();
  }, [visitId, navigate]);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="font-medium text-lg mt-4">Loading visit details...</p>
        </div>
      </div>
    );
  }

  if (!visit || !patient) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground font-medium mb-4">Visit not found</p>
          <Button onClick={() => navigate('/doctor')} className="font-medium">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

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
          <h1 className="text-xl font-medium text-primary-foreground">Past Consultation</h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <ResizablePanels defaultSizes={[40, 60]} minSizes={[25, 25]} className="h-full">
          {/* Left Panel - Patient Info */}
          <Panel className="p-4">
            <div className="h-full overflow-auto">
              <PatientInfoCard patient={patient} variant="detailed" />
            </div>
          </Panel>

          {/* Right Panel - Visit Details */}
          <Panel className="p-4">
            <Card className="h-full shadow-lg border-2 bg-gradient-to-br from-card to-secondary/5 flex flex-col">
              <CardHeader className="bg-gradient-to-r from-secondary/10 to-secondary/5 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 font-medium">
                  <FileText className="w-5 h-5 text-secondary" />
                  Visit Details
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 overflow-auto p-6 space-y-6">
                {/* Visit Info Header */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Visit Date</p>
                      <p className="font-medium">{formatDateTime(visit.visit_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Doctor</p>
                      <p className="font-medium">{visit.doctor_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={visit.visit_type === 'scheduled' ? 'default' : 'secondary'}>
                      {visit.visit_type === 'scheduled' ? 'Scheduled' : visit.visit_type === 'walk_in' ? 'Walk-in' : visit.visit_type === 'follow_up' ? 'Follow-up' : 'Emergency'}
                    </Badge>
                  </div>
                  {visit.appointment_id && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Appointment</p>
                        <p className="font-medium text-sm">Scheduled Visit</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Diagnosis */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">Diagnosis</h3>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {visit.diagnosis || 'No diagnosis recorded'}
                    </p>
                  </div>
                </div>

                {/* Notes (Medications) */}
                {visit.notes && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Pill className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">Medications & Notes</h3>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <p className="text-base leading-relaxed whitespace-pre-wrap">
                        {visit.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Advice */}
                {visit.advice && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">Advice</h3>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <p className="text-base leading-relaxed whitespace-pre-wrap">
                        {visit.advice}
                      </p>
                    </div>
                  </div>
                )}

                {/* Next Visit Date */}
                {visit.next_visit_date && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">Next Visit</h3>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <p className="text-base font-medium">
                        {new Date(visit.next_visit_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Prescriptions */}
                {visit.prescriptions && visit.prescriptions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Pill className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">Prescriptions</h3>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 border space-y-2">
                      {visit.prescriptions.map((prescription: any, index: number) => (
                        <div key={index} className="border-b last:border-b-0 pb-2 last:pb-0">
                          <p className="font-medium">{prescription.medication_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {prescription.dosage} - {prescription.frequency}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reports */}
                {visit.reports && visit.reports.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">Reports</h3>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 border space-y-2">
                      {visit.reports.map((report: any, index: number) => (
                        <div key={index} className="border-b last:border-b-0 pb-2 last:pb-0">
                          <p className="font-medium">{report.report_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {report.report_date ? new Date(report.report_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Panel>
        </ResizablePanels>
      </main>
    </div>
  );
};

export default ViewVisit;

