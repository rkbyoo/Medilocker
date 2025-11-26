import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
import { patientsApi, medicalRecordsApi, authApi } from '@/api';
import PatientInfoCard from '@/components/common/PatientInfoCard';
import type { Patient, MedicalRecord } from '@/types';

const Consultation = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  const [isRecording, setIsRecording] = useState(false);


  const [consultationData, setConsultationData] = useState({
    diagnosis: '',
    medications: '',
    advice: '',
    nextVisit: ''
  });

  useEffect(() => {
    if (patientId) {
      const foundPatient = patientsApi.getPatientById(patientId);
      if (foundPatient) {
        setPatient(foundPatient);
        const records = medicalRecordsApi.getMedicalRecordsByPatientId(patientId);
        setMedicalRecords(records);
      }
    }
  }, [patientId]);



  const toggleRecord = (recordId: string) => {
    const newExpanded = new Set(expandedRecords);
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId);
    } else {
      newExpanded.add(recordId);
    }
    setExpandedRecords(newExpanded);
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info('Voice recording started (simulated)');
      // Simulate voice input after 2 seconds
      setTimeout(() => {
        setConsultationData(prev => ({
          ...prev,
          diagnosis: prev.diagnosis + ' Patient reports mild headache and fatigue for the past 3 days.'
        }));
        setIsRecording(false);
        toast.success('Voice input added to diagnosis');
      }, 2000);
    }
  };

  const handleSaveConsultation = () => {
    if (!consultationData.diagnosis || !consultationData.medications) {
      toast.error('Please fill in diagnosis and medications');
      return;
    }

    const currentUser = authApi.getCurrentUser();
    if (!currentUser || !patient) return;

    const response = medicalRecordsApi.createMedicalRecord({
      patientId: patient.id,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      diagnosis: consultationData.diagnosis,
      medications: consultationData.medications,
      advice: consultationData.advice,
      nextVisit: consultationData.nextVisit || undefined
    });

    if (response.success) {
      toast.success('Consultation saved successfully!');

      setTimeout(() => {
        navigate('/doctor');
      }, 1500);
    } else {
      toast.error(response.error || 'Failed to save consultation');
    }
  };

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-r from-primary to-secondary shadow-lg sticky top-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/doctor')} className="mr-4 text-primary-foreground hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary-foreground">Patient Consultation</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Left Panel - Patient Details & History */}
          <div className="space-y-6">
            {/* Essential Details */}
            <PatientInfoCard patient={patient} variant="detailed" />

            {/* Medical History */}
            <Card className="shadow-lg border-2 bg-gradient-to-br from-card to-secondary/5">
              <CardHeader className="bg-gradient-to-r from-secondary/10 to-secondary/5">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-secondary" />
                  Medical History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medicalRecords.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">No previous medical records</p>
                ) : (
                  <div className="space-y-3">
                    {medicalRecords.map((record) => (
                      <Card key={record.id} className="border-2 hover:border-secondary transition-colors">
                        <div
                          className="p-4 cursor-pointer hover:bg-secondary/5 transition-colors"
                          onClick={() => toggleRecord(record.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 text-left">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-gray-900">{new Date(record.date).toLocaleDateString()}</p>
                                <Badge variant="outline" className="text-xs">
                                  {new Date(record.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium">Dr.</span> {record.doctorName}
                                </p>
                                <p className="text-sm font-medium text-gray-800 line-clamp-2">
                                  <span className="text-muted-foreground">Diagnosis:</span> {record.diagnosis}
                                </p>
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              {expandedRecords.has(record.id) ?
                                <ChevronUp className="w-5 h-5 text-muted-foreground" /> :
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              }
                            </div>
                          </div>
                        </div>

                        {expandedRecords.has(record.id) && (
                          <div className="px-4 pb-4 space-y-4 border-t pt-4 bg-muted/30">
                            <div className="text-left">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Diagnosis</p>
                              <p className="text-sm text-gray-800 leading-relaxed">{record.diagnosis}</p>
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Medications</p>
                              <p className="text-sm text-gray-800 leading-relaxed">{record.medications}</p>
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Advice</p>
                              <p className="text-sm text-gray-800 leading-relaxed">{record.advice}</p>
                            </div>
                            {record.nextVisit && (
                              <div className="text-left">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Next Visit</p>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-primary" />
                                  <p className="text-sm font-medium text-gray-800">{new Date(record.nextVisit).toLocaleDateString()}</p>
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
          </div>

          {/* Right Panel - Current Consultation */}
          <div>
            <Card className="sticky top-24 shadow-lg border-2 bg-gradient-to-br from-card to-accent/5">
              <CardHeader className="bg-gradient-to-r from-accent to-accent/50">
                <CardTitle className="text-xl">Current Consultation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Diagnosis */}
                <div className="grid grid-cols-4 gap-4 items-start">
                  <div className="flex justify-between items-center col-span-4">
                    <Label htmlFor="diagnosis" className="text-sm font-medium">Diagnosis *</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={handleVoiceInput}
                      className={!isRecording ? "hover:bg-primary/10 hover:text-primary hover:border-primary" : ""}
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      {isRecording ? 'Recording...' : 'Voice Input'}
                    </Button>
                  </div>
                  <Textarea
                    id="diagnosis"
                    placeholder="Enter diagnosis..."
                    value={consultationData.diagnosis}
                    onChange={(e) => setConsultationData(prev => ({ ...prev, diagnosis: e.target.value }))}
                    rows={4}
                    className="resize-none border-2 focus:border-primary col-span-4"
                  />
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

                {/* Save Button */}
                <Button onClick={handleSaveConsultation} className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md" size="lg">
                  <Save className="w-4 h-4 mr-2" />
                  Save Consultation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Consultation;
