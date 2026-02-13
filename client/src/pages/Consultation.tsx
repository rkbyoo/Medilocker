/**
 * Consultation Page
 * Clinical workspace with inline medication table and voice input
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { DesktopLayout } from '@/components/layout';
import { ResizablePanels, Panel } from '@/components/ui/resizable-panels';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { VoiceDictationModal } from '@/components/ui/VoiceDictationModal';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

import { toast } from 'sonner';
import { patientsApi, authApi, visitsApi, appointmentsApi } from '@/api';
import type { Patient } from '@/types';
import type { Visit } from '@/api/visits';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const Consultation = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [scheduleFollowUp, setScheduleFollowUp] = useState(false);
  
  // Voice Dictation Modal state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  
  // Medications state
  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMedication, setNewMedication] = useState<Medication>({
    id: '',
    name: '',
    dosage: '',
    frequency: '',
    duration: ''
  });

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
    advice: '',
    nextVisit: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }

      const currentUser = authApi.getCurrentUser();
      if (!currentUser || !currentUser.user_id) {
        toast.error('Doctor information not available. Please log in again.');
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

        const patientIdentifier = foundPatient.patientNumber || foundPatient.id;
        const visits = await visitsApi.getVisitsByPatientId(patientIdentifier);
        setMedicalRecords(visits);

        const todayAppointments = await appointmentsApi.getTodaysAppointments(currentUser.user_id);
        const matchingAppointment = todayAppointments.find(
          apt => apt.patientNumber === foundPatient.patientNumber || 
                 apt.patientId === foundPatient.patientNumber ||
                 apt.patientId === (foundPatient as any).patientId ||
                 apt.patientId === foundPatient.id
        );
        if (matchingAppointment) {
          const aptId = (matchingAppointment as any).appointment_id || matchingAppointment.id;
          setAppointmentId(aptId);
        }
      } catch (error) {
        console.error('Error loading patient data:', error);
        toast.error('Error loading patient data');
        navigate('/doctor');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId, navigate]);

  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.dosage) {
      toast.error('Please enter medication name and dosage');
      return;
    }
    setMedications([...medications, { ...newMedication, id: Date.now().toString() }]);
    setNewMedication({ id: '', name: '', dosage: '', frequency: '', duration: '' });
  };

  const handleRemoveMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const handleUpdateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const handleSaveConsultation = async () => {
    if (!consultationData.diagnosis) {
      toast.error('Please fill in diagnosis');
      return;
    }

    if (!patient) {
      toast.error('Patient information is missing');
      return;
    }

    const currentUser = authApi.getCurrentUser();
    if (!currentUser || !currentUser.user_id) {
      toast.error('Doctor information not available. Please log in again.');
      return;
    }

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.user_id)) {
      toast.error('Invalid doctor ID. Please log in again.');
      return;
    }

    setIsSaving(true);
    try {
      const patientIdentifier = patient.patientNumber || patient.id;
      const medicationsText = medications
        .filter(med => med.name)
        .map(med => `${med.name} ${med.dosage} ${med.frequency} for ${med.duration}`)
        .join('\n');
      
      const response = await visitsApi.createVisit({
        patient_id: patientIdentifier,
        doctor_id: currentUser.user_id,
        appointment_id: appointmentId || undefined,
        visit_date: new Date().toISOString(),
        visit_type: appointmentId ? 'scheduled' : 'walk_in',
        diagnosis: consultationData.diagnosis,
        notes: medicationsText,
        advice: consultationData.advice,
        next_visit_date: scheduleFollowUp ? consultationData.nextVisit : undefined,
      });

      if (response.success) {
        toast.success('Consultation saved successfully!');
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return '--';
    return Math.floor((new Date().getTime() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  if (loading) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1246e2] mx-auto mb-4"></div>
          <p className="font-medium text-lg">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-500 font-medium mb-4">Patient not found</p>
          <Button onClick={() => navigate('/doctor')} className="font-medium">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Header content
  const headerContent = (
    <div className="flex items-center justify-between w-full">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Consultation</h2>
        <p className="text-sm text-slate-500">
          Today, <span className="font-medium text-slate-700">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active Visit
        </span>
      </div>
    </div>
  );

  return (
    <DesktopLayout header={headerContent}>
      <div className="h-full w-full">
        <ResizablePanels defaultSizes={[35, 65]} minSizes={[30, 30]} className="h-full w-full">
          {/* Left Panel - Patient Profile */}
          <Panel className="flex flex-col border-r border-gray-200 bg-white h-full overflow-hidden">
            {/* Patient Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <div className="size-16 rounded-full bg-blue-50 text-[#1246e2] flex items-center justify-center text-xl font-bold ring-4 ring-gray-50 shadow-sm">
                    {getInitials(patient.name)}
                  </div>
                  <span className="absolute bottom-0 right-0 size-4 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex flex-col pt-1">
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    {patient.name} ({getAge(patient.dateOfBirth)}{patient.gender?.[0] || ''})
                  </h2>
                  <p className="text-slate-500 text-xs font-medium mt-1">
                    ID: {patient.patientNumber || patient.id}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      Blood: {patient.bloodGroup || '--'}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      Last Visit: 12 days ago
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Critical Alerts */}
              {(patient.allergies?.length > 0 || patient.chronicConditions?.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {patient.allergies?.map((allergy, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-red-50 border border-red-100">
                      <MaterialIcon name="warning" size={16} className="text-red-600" />
                      <span className="text-xs font-semibold text-red-700">Allergy: {allergy}</span>
                    </div>
                  ))}
                  {patient.chronicConditions?.map((condition, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-orange-50 border border-orange-100">
                      <MaterialIcon name="monitor_heart" size={16} className="text-orange-600" />
                      <span className="text-xs font-semibold text-orange-700">Chronic: {condition}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medical History Timeline */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Recent History</h3>
              <div className="relative pl-4 border-l-2 border-gray-200 space-y-8">
                {medicalRecords.length === 0 ? (
                  <p className="text-sm text-slate-500">No previous medical records</p>
                ) : (
                  medicalRecords.slice(0, 3).map((visit, index) => (
                    <div key={visit.visit_id} className="relative group">
                      <div className={`absolute -left-[21px] top-1 size-3 bg-white border-2 rounded-full transition-transform ${
                        index === 0 ? 'border-[#1246e2] group-hover:scale-110' : 'border-gray-300 group-hover:border-[#1246e2]'
                      }`}></div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                          <span className={`text-xs font-semibold ${index === 0 ? 'text-[#1246e2]' : 'text-slate-500'}`}>
                            {new Date(visit.visit_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 bg-white px-1.5 py-0.5 rounded border border-gray-100">
                            {visit.doctor_name}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">{visit.diagnosis || 'Consultation'}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {visit.notes || 'No notes available'}
                        </p>
                        <button className="text-[11px] font-semibold text-[#1246e2] mt-1 hover:underline">
                          View Report
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Panel>

          {/* Right Panel - Consultation Workspace */}
          <Panel className="flex flex-col h-full bg-white overflow-hidden">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-white"
            >
              {/* Diagnosis Section */}
              <motion.section variants={staggerItem}>
                <div className="flex justify-between items-end mb-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <MaterialIcon name="diagnosis" size={16} /> Diagnosis & Findings
                  </h4>
                  <button
                    onClick={() => setIsVoiceModalOpen(true)}
                    disabled={!speechSupported}
                    className="text-xs font-semibold text-[#1246e2] border border-[#1246e2] hover:bg-[#1246e2] hover:text-white px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 group"
                  >
                    <MaterialIcon name="mic" size={16} className="group-hover:animate-pulse" />
                    <span>Voice Input</span>
                  </button>
                </div>
                <div className="relative">
                  <Textarea
                    placeholder="Enter detailed diagnosis here or use voice input..."
                    value={consultationData.diagnosis}
                    onChange={(e) => setConsultationData(prev => ({ ...prev, diagnosis: e.target.value }))}
                    className="min-h-[120px] resize-y bg-gray-50/50 leading-relaxed"
                  />
                </div>
              </motion.section>

              {/* Medications Table */}
              <motion.section variants={staggerItem}>
                <div className="flex justify-between items-end mb-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <MaterialIcon name="pill" size={16} /> Medications
                  </h4>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wide w-[35%]">Drug Name</th>
                        <th className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Dosage</th>
                        <th className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Freq</th>
                        <th className="px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wide">Duration</th>
                        <th className="px-4 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {medications.filter(med => med.name).map((medication) => (
                        <tr key={medication.id} className="group hover:bg-gray-50/50">
                          <td className="px-4 py-2">
                            <Input
                              value={medication.name}
                              onChange={(e) => handleUpdateMedication(medication.id, 'name', e.target.value)}
                              className="w-full border-none bg-transparent p-0 text-sm font-medium text-slate-900 focus:ring-0"
                              placeholder="e.g. Paracetamol"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              value={medication.dosage}
                              onChange={(e) => handleUpdateMedication(medication.id, 'dosage', e.target.value)}
                              className="w-full border-none bg-transparent p-0 text-sm text-slate-600 focus:ring-0"
                              placeholder="500mg"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              value={medication.frequency}
                              onChange={(e) => handleUpdateMedication(medication.id, 'frequency', e.target.value)}
                              className="w-full border-none bg-transparent p-0 text-sm text-slate-600 focus:ring-0"
                              placeholder="BID"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              value={medication.duration}
                              onChange={(e) => handleUpdateMedication(medication.id, 'duration', e.target.value)}
                              className="w-full border-none bg-transparent p-0 text-sm text-slate-600 focus:ring-0"
                              placeholder="3 Days"
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={() => handleRemoveMedication(medication.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                              title="Remove"
                            >
                              <MaterialIcon name="delete" size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {/* Add New Row */}
                      <tr className="bg-blue-50/30">
                        <td className="px-4 py-2">
                          <Input
                            value={newMedication.name}
                            onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                            className="w-full rounded border-gray-200 bg-white px-2 py-1 text-sm font-medium text-slate-900 shadow-sm"
                            placeholder="e.g. Amoxicillin"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            value={newMedication.dosage}
                            onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                            className="w-full rounded border-gray-200 bg-white px-2 py-1 text-sm text-slate-600 shadow-sm"
                            placeholder="500mg"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            value={newMedication.frequency}
                            onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                            className="w-full rounded border-gray-200 bg-white px-2 py-1 text-sm text-slate-600 shadow-sm"
                            placeholder="TID"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            value={newMedication.duration}
                            onChange={(e) => setNewMedication({ ...newMedication, duration: e.target.value })}
                            className="w-full rounded border-gray-200 bg-white px-2 py-1 text-sm text-slate-600 shadow-sm"
                            placeholder="7 Days"
                          />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={handleAddMedication}
                            className="flex items-center justify-center size-8 rounded-full bg-[#1246e2] text-white hover:bg-blue-700 transition-colors shadow-sm mx-auto"
                          >
                            <MaterialIcon name="add" size={20} />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.section>

              {/* Advice Section */}
              <motion.section variants={staggerItem}>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MaterialIcon name="notes" size={16} /> Advice & Notes
                </h4>
                <Textarea
                  placeholder="Enter advice for patient..."
                  value={consultationData.advice}
                  onChange={(e) => setConsultationData(prev => ({ ...prev, advice: e.target.value }))}
                  className="min-h-[80px] bg-gray-50/50"
                />
              </motion.section>

              {/* Follow-up Section */}
              <motion.section variants={staggerItem}>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MaterialIcon name="event_upcoming" size={16} /> Follow-up
                </h4>
                <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="schedule-followup"
                      checked={scheduleFollowUp}
                      onChange={(e) => setScheduleFollowUp(e.target.checked)}
                      className="size-4 rounded border-gray-300 text-[#1246e2] focus:ring-[#1246e2] cursor-pointer"
                    />
                    <label htmlFor="schedule-followup" className="ml-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
                      Schedule Follow-up
                    </label>
                  </div>
                  <div className="h-8 border-l border-gray-300"></div>
                  <div className="relative">
                    <Input
                      type="date"
                      value={consultationData.nextVisit}
                      onChange={(e) => setConsultationData(prev => ({ ...prev, nextVisit: e.target.value }))}
                      disabled={!scheduleFollowUp}
                      className="block w-full text-sm disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>
                </div>
              </motion.section>
            </motion.div>
          </Panel>
        </ResizablePanels>

        {/* Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 right-0 left-[260px] bg-white border-t border-gray-200 p-4 flex items-center justify-end z-50">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/doctor')}
              className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:bg-slate-50 text-sm font-semibold"
            >
              Save as Draft
            </Button>
            <Button
              onClick={handleSaveConsultation}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1246e2] text-white hover:bg-blue-700 shadow-md shadow-blue-200 text-sm font-bold"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <MaterialIcon name="print" size={18} />
                  Save & Print
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Voice Dictation Modal */}
        <VoiceDictationModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onInsert={(text) => {
            setConsultationData(prev => ({
              ...prev,
              diagnosis: prev.diagnosis + (prev.diagnosis ? ' ' : '') + text
            }));
          }}
          initialText={consultationData.diagnosis}
          fieldName="Diagnosis & Findings"
        />
      </div>
    </DesktopLayout>
  );
};

export default Consultation;