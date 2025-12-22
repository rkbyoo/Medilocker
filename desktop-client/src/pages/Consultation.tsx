import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResizablePanels, Panel } from '@/components/ui/resizable-panels';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

import { toast } from 'sonner';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Save,
  Mic,
  Calendar,
  FileText
} from 'lucide-react';
import { patientsApi, medicalRecordsApi, authApi, visitsApi, appointmentsApi } from '@/api';
import { useAuth } from '@/contexts';
import PatientInfoCard from '@/components/common/PatientInfoCard';
import type { Patient, MedicalRecord } from '@/types';
import type { Visit } from '@/api/visits';



const Consultation = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<Visit[]>([]);
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  // Speech recognition hook
  const {
    isListening,
    isSupported: speechSupported,
    interimTranscript,
    toggleListening
  } = useSpeechRecognition({
    onResult: (transcript, isInterim) => {
      if (!isInterim) {
        setConsultationData(prev => ({
          ...prev,
          diagnosis: prev.diagnosis + (prev.diagnosis && !prev.diagnosis.endsWith(' ') ? ' ' : '') + transcript
        }));
      }
    },
    onStart: () => {
      toast.success('🎤 Listening... Start speaking');
    },
    onEnd: () => {
      if (!isListening) {
        toast.info('✅ Voice input stopped');
      }
    },
    onError: (error) => {
      toast.error(error);
    }
  });


  const [consultationData, setConsultationData] = useState({
    diagnosis: '',
    medications: '',
    advice: '',
    nextVisit: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (patientId && user) {
        setLoading(true);
        try {
          // Fetch patient
          const foundPatient = await patientsApi.getPatientById(patientId);
          if (!foundPatient) {
            toast.error('Patient not found');
            navigate('/doctor');
            return;
          }
          setPatient(foundPatient);

          // Use patient_id (UUID) for API calls, fallback to id if patientId not available
          const patientUuid = (foundPatient as any).patientId || foundPatient.id;
          
          // Fetch patient's medical history (visits)
          const visits = await visitsApi.getVisitsByPatientId(patientUuid);
          setMedicalRecords(visits);

          // Find today's scheduled appointment for this patient and doctor
          // This will be used to link the visit to the appointment
          const todayAppointments = await appointmentsApi.getTodaysAppointments(user.user_id);
          const matchingAppointment = todayAppointments.find(
            apt => {
              // Match by patient_id (UUID), patient_number, or id
              return apt.patientId === patientUuid || 
                     apt.patientId === foundPatient.patientNumber || 
                     apt.patientId === foundPatient.id ||
                     (apt as any).patient_number === foundPatient.patientNumber;
            }
          );
          if (matchingAppointment) {
            // Use appointment_id (UUID) from backend, fallback to id
            const aptId = (matchingAppointment as any).appointment_id || matchingAppointment.id;
            setAppointmentId(aptId);
            console.log('Found matching appointment:', aptId);
          } else {
            console.log('No matching appointment found for patient:', patientUuid, foundPatient.patientNumber);
          }
        } catch (error) {
          console.error('Error loading patient data:', error);
          toast.error('Error loading patient data');
          navigate('/doctor');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId, user, navigate]);

  const toggleRecord = (recordId: string) => {
    const newExpanded = new Set(expandedRecords);
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId);
    } else {
      newExpanded.add(recordId);
    }
    setExpandedRecords(newExpanded);
  };

  const handleSaveConsultation = async () => {
    if (!consultationData.diagnosis || !consultationData.medications) {
      toast.error('Please fill in diagnosis and medications');
      return;
    }

    if (!user || !patient) return;

    setIsSaving(true);
    try {
      // Use patient_id (UUID) for API calls, fallback to id if patientId not available
      const patientUuid = (patient as any).patientId || patient.id;
      
      // Log for debugging
      if (appointmentId) {
        console.log('Creating visit with appointment_id:', appointmentId);
      } else {
        console.log('Creating visit without appointment_id (walk-in)');
      }
      
      // Create visit (this will also update appointment status if appointment_id is provided)
      const response = await visitsApi.createVisit({
        patient_id: patientUuid,
        doctor_id: user.user_id,
        appointment_id: appointmentId || undefined,
        visit_date: new Date().toISOString(), // Current date/time
        visit_type: appointmentId ? 'scheduled' : 'walk_in',
        diagnosis: consultationData.diagnosis,
        notes: consultationData.medications, // Store medications in notes for now
        advice: consultationData.advice,
        next_visit_date: consultationData.nextVisit || undefined,
      });

      if (response.success) {
        toast.success('Consultation saved successfully!');

        // Invalidate appointments queries to refresh the dashboard
        // Invalidate all appointment-related queries to ensure dashboard refreshes
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
        
        // Also invalidate visits/medical history for this patient
        const patientUuid = (patient as any).patientId || patient.id;
        queryClient.invalidateQueries({ queryKey: ['visits'] });

        setTimeout(() => {
          navigate('/doctor');
        }, 1500);
      } else {
        toast.error(response.error || 'Failed to save consultation');
      }
    } catch (error) {
      console.error('Error saving consultation:', error);
      toast.error('Error saving consultation');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="font-medium text-lg">Loading patient data...</p>
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
      <header className="border-b bg-gradient-to-r from-primary to-secondary shadow-lg flex-shrink-0 backdrop-blur-sm">
        <div className="w-full px-4 py-3 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/doctor')} className="mr-4 text-primary-foreground hover:bg-white/20 font-medium">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-medium text-primary-foreground">Patient Consultation</h1>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <ResizablePanels defaultSizes={[40, 60]} minSizes={[25, 25]} className="h-full">
          <Panel>
            {/* Nested vertical panels for Patient Profile and Medical History */}
            <ResizablePanels direction="vertical" defaultSizes={[45, 55]} minSizes={[30, 30]} className="h-full">
              <Panel className="p-4">
                {/* Patient Profile Section */}
                <div className="h-full overflow-auto">
                  <PatientInfoCard patient={patient} variant="detailed" />
                </div>
              </Panel>

              <Panel className="p-4">
                {/* Medical History Section */}
                <Card className="h-full shadow-lg border-2 bg-gradient-to-br from-card to-secondary/5 flex flex-col">
                  <CardHeader className="bg-gradient-to-r from-secondary/10 to-secondary/5 flex-shrink-0">
                    <CardTitle className="flex items-center gap-2 font-medium">
                      <FileText className="w-5 h-5 text-secondary" />
                      Medical History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-auto p-4">
                    {medicalRecords.length === 0 ? (
                      <p className="text-muted-foreground text-center py-6">No previous medical records</p>
                    ) : (
                      <div className="space-y-3">
                        {medicalRecords.map((visit) => (
                          <Card key={visit.visit_id} className="border-2 hover:border-secondary transition-colors">
                            <div
                              className="p-4 cursor-pointer hover:bg-secondary/5 transition-colors"
                              onClick={() => toggleRecord(visit.visit_id)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1 text-left">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium text-gray-900">{new Date(visit.visit_date).toLocaleDateString()}</p>
                                    <Badge variant="outline" className="text-xs">
                                      {new Date(visit.visit_date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </Badge>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-medium">Dr.</span> {visit.doctor_name}
                                    </p>
                                    <p className="text-sm font-medium text-gray-800 line-clamp-2">
                                      <span className="text-muted-foreground">Diagnosis:</span> {visit.diagnosis || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                                <div className="ml-4 flex-shrink-0">
                                  {expandedRecords.has(visit.visit_id) ?
                                    <ChevronUp className="w-5 h-5 text-muted-foreground" /> :
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                  }
                                </div>
                              </div>
                            </div>

                            {expandedRecords.has(visit.visit_id) && (
                              <div className="px-4 pb-4 space-y-4 border-t pt-4 bg-muted/30">
                                <div className="text-left">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Diagnosis</p>
                                  <p className="text-sm text-gray-800 leading-relaxed">{visit.diagnosis || 'N/A'}</p>
                                </div>
                                {visit.notes && (
                                  <div className="text-left">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notes</p>
                                    <p className="text-sm text-gray-800 leading-relaxed">{visit.notes}</p>
                                  </div>
                                )}
                                {visit.advice && (
                                  <div className="text-left">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Advice</p>
                                    <p className="text-sm text-gray-800 leading-relaxed">{visit.advice}</p>
                                  </div>
                                )}
                                {visit.prescriptions && visit.prescriptions.length > 0 && (
                                  <div className="text-left">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Prescriptions</p>
                                    {visit.prescriptions.map((prescription) => (
                                      <p key={prescription.prescription_id} className="text-sm text-gray-800 leading-relaxed">
                                        {prescription.prescription_text || 'N/A'}
                                      </p>
                                    ))}
                                  </div>
                                )}
                                {visit.next_visit_date && (
                                  <div className="text-left">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Next Visit</p>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-primary" />
                                      <p className="text-sm font-medium text-gray-800">{new Date(visit.next_visit_date).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Panel>
            </ResizablePanels>
          </Panel>

          <Panel className="p-4">
            <Card className="h-full shadow-lg border-2 bg-gradient-to-br from-card to-accent/5 flex flex-col">
              <CardHeader className="bg-gradient-to-r from-accent to-accent/50 flex-shrink-0">
                <CardTitle className="text-lg font-medium">Current Consultation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 overflow-auto">
                {!speechSupported && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                    <p className="font-medium">Voice input not available</p>
                    <p>Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari for voice input functionality.</p>
                  </div>
                )}
                {/* Diagnosis */}
                <div className="grid grid-cols-4 gap-4 items-start mt-6">
                  <div className="flex justify-between items-center col-span-4">
                    <Label htmlFor="diagnosis" className="text-sm font-medium">Diagnosis *</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant={isListening ? "destructive" : "outline"}
                      onClick={toggleListening}
                      disabled={!speechSupported}
                      className={`${!isListening ? "hover:bg-primary/10 hover:text-primary hover:border-primary" : ""} ${isListening ? "animate-pulse" : ""}`}
                    >
                      <Mic className={`w-4 h-4 mr-2 ${isListening ? "text-white" : ""}`} />
                      {isListening ? 'Stop Recording' : 'Voice Input'}
                    </Button>
                  </div>
                  <div className="col-span-4 relative">
                    <Textarea
                      id="diagnosis"
                      placeholder={isListening ? "🎤 Listening... Speak now" : "Enter diagnosis or use voice input..."}
                      value={consultationData.diagnosis + (interimTranscript ? ` ${interimTranscript}` : '')}
                      onChange={(e) => {
                        // Only update if not currently showing interim text
                        if (!interimTranscript) {
                          setConsultationData(prev => ({ ...prev, diagnosis: e.target.value }));
                        }
                      }}
                      rows={4}
                      className={`resize-none border-2 focus:border-primary w-full transition-all duration-200 ${isListening ? "border-green-400 bg-green-50 shadow-lg" : ""
                        } ${interimTranscript ? "text-gray-600" : ""}`}
                    />
                    {isListening && (
                      <div className="absolute top-2 right-2 flex items-center gap-2 text-green-600 text-xs font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="animate-pulse">🎤 Recording</span>
                      </div>
                    )}
                    {interimTranscript && (
                      <div className="absolute bottom-2 left-2 text-xs text-gray-500 italic">
                        Speaking: "{interimTranscript}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Medications */}
                <div className="grid grid-cols-4 gap-4 items-start">
                  <Label htmlFor="medications" className="text-right pt-2">Medications *</Label>
                  <Textarea
                    id="medications"
                    placeholder="Enter prescribed medications with dosage..."
                    value={consultationData.medications}
                    onChange={(e) => setConsultationData(prev => ({ ...prev, medications: e.target.value }))}
                    rows={4}
                    className="resize-y border-2 focus:border-primary col-span-3 min-h-[100px]"
                  />
                </div>

                {/* Advice */}
                <div className="grid grid-cols-4 gap-4 items-start">
                  <Label htmlFor="advice" className="text-right pt-2">Advice</Label>
                  <Textarea
                    id="advice"
                    placeholder="Enter medical advice and instructions..."
                    value={consultationData.advice}
                    onChange={(e) => setConsultationData(prev => ({ ...prev, advice: e.target.value }))}
                    rows={3}
                    className="resize-y border-2 focus:border-primary col-span-3 min-h-[80px]"
                  />
                </div>

                {/* Next Visit */}
                <div className="grid grid-cols-4 gap-4 items-center">
                  <Label htmlFor="nextVisit" className="text-right flex items-center justify-end gap-2">
                    <Calendar className="w-4 h-4" />
                    Next Visit Date
                  </Label>
                  <Input
                    id="nextVisit"
                    type="date"
                    value={consultationData.nextVisit}
                    onChange={(e) => setConsultationData(prev => ({ ...prev, nextVisit: e.target.value }))}
                    className="border-2 focus:border-primary col-span-3"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => navigate('/doctor')}
                    variant="outline"
                    className="flex-1 font-medium"
                    size="default"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Check Another Patient
                  </Button>
                  <Button
                    onClick={handleSaveConsultation}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md font-medium"
                    size="default"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Consultation
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Panel>
        </ResizablePanels>
      </main>
    </div>
  );
};

export default Consultation;
