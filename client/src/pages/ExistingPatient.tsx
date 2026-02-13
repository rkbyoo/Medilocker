/**
 * Patient Lookup & Appointment Booking
 * Professional interface for searching patients and scheduling appointments
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { DesktopLayout } from '@/components/layout';
import { toast } from 'sonner';
import { patientsApi, appointmentsApi, usersApi } from '@/api';
import { useAuth } from '@/contexts';
import { ResizablePanels, Panel } from '@/components/ui/resizable-panels';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import type { Patient } from '@/types';
import { staggerContainer, staggerItem } from '@/lib/animations';

const ExistingPatient = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [patientId, setPatientId] = useState('');
  const [showNFCDialog, setShowNFCDialog] = useState(false);
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [doctors, setDoctors] = useState<Array<{ user_id: string; full_name: string }>>([]);
  const [appointmentData, setAppointmentData] = useState({
    department: '',
    doctor: '',
    reason: '',
    dateTime: '',
    visitType: 'in-person'
  });

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      const doctorsList = await usersApi.getDoctors();
      setDoctors(doctorsList);
      if (doctorsList.length > 0) {
        setAppointmentData(prev => ({ ...prev, doctor: doctorsList[0].user_id }));
      }
    };
    fetchDoctors();
  }, []);

  // Auto-search if patientId is provided in query params
  useEffect(() => {
    const patientIdParam = searchParams.get('patientId');
    if (patientIdParam) {
      setPatientId(patientIdParam);
      handleSearchById(patientIdParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearchById = async (id: string) => {
    setIsSearching(true);
    try {
      const patient = await patientsApi.getPatientById(id);
      if (patient) {
        setFoundPatient(patient);
        toast.success('Patient found!');
      } else {
        setFoundPatient(null);
        toast.error('Patient not found. Please check the ID.');
      }
    } catch (error) {
      toast.error('Error searching for patient');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!patientId) {
      toast.error('Please enter a patient ID');
      return;
    }
    await handleSearchById(patientId);
  };

  const handleScheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!foundPatient) return;

    if (!appointmentData.doctor) {
      toast.error('Please select a doctor');
      return;
    }

    setIsScheduling(true);
    try {
      const selectedDoctor = doctors.find(d => d.user_id === appointmentData.doctor);
      const patientIdentifier = foundPatient.patientNumber || foundPatient.id;

      const response = await appointmentsApi.createAppointment({
        patientId: patientIdentifier,
        patientName: foundPatient.name,
        doctorId: appointmentData.doctor,
        doctorName: selectedDoctor?.full_name || '',
        department: appointmentData.department,
        reason: appointmentData.reason,
        dateTime: appointmentData.dateTime
      });

      if (response.success) {
        toast.success('Appointment scheduled successfully!');
        setTimeout(() => {
          navigate('/receptionist');
        }, 1500);
      } else {
        toast.error(response.error || 'Failed to schedule appointment');
      }
    } catch (error) {
      toast.error('Error scheduling appointment');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleNewSearch = () => {
    setFoundPatient(null);
    setPatientId('');
    setAppointmentData({
      department: '',
      doctor: doctors.length > 0 ? doctors[0].user_id : '',
      reason: '',
      dateTime: '',
      visitType: 'in-person'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Header content
  const headerContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="relative flex-1">
          <MaterialIcon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by Patient ID, Name, or NFC Scan"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full h-10 pl-10 pr-4 bg-slate-50 border-slate-200 text-sm"
          />
        </div>
        <button
          onClick={() => setShowNFCDialog(true)}
          className="flex items-center gap-2 px-4 h-10 bg-[#1246e2] text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          <MaterialIcon name="contactless" size={20} />
          <span>Scan Card</span>
        </button>
      </div>
      <div className="flex items-center gap-3 ml-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 relative">
          <MaterialIcon name="notifications" size={24} />
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-6 w-px bg-slate-200 mx-2"></div>
        <div className="text-sm font-medium text-slate-600">{currentDate}</div>
      </div>
    </div>
  );

  return (
    <DesktopLayout header={headerContent}>
      <div className="h-full flex flex-col">
        {isSearching && !foundPatient ? (
          // Loading State
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1246e2] mx-auto mb-4"></div>
              <p className="font-medium text-lg text-slate-700">Searching for patient...</p>
            </div>
          </div>
        ) : !foundPatient ? (
          // Search Interface
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex-1 flex items-center justify-center p-6"
          >
            <motion.div variants={staggerItem} className="w-full max-w-2xl">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#1246e2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MaterialIcon name="person_search" size={32} className="text-[#1246e2]" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Patient Lookup</h2>
                  <p className="text-slate-500">Enter patient ID or scan NFC card to find patient</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <MaterialIcon name="search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Enter Patient ID, Name, or Phone Number"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full h-12 pl-12 pr-4 text-base"
                    />
                  </div>

                  <Button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full h-12 bg-[#1246e2] hover:bg-blue-700 text-white font-bold text-base"
                  >
                    {isSearching ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <MaterialIcon name="search" size={20} className="mr-2" />
                        Search Patient
                      </>
                    )}
                  </Button>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-3 text-slate-500 font-medium">Or</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowNFCDialog(true)}
                    variant="outline"
                    className="w-full h-16 border-2 border-dashed border-slate-300 hover:border-[#1246e2] hover:bg-blue-50"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <MaterialIcon name="nfc" size={24} className="text-[#1246e2]" />
                      <span className="font-medium">Scan NFC Card</span>
                    </div>
                  </Button>
                </div>

                <p className="text-sm text-slate-500 text-center mt-6">
                  Search by: <strong>Patient ID</strong>, <strong>Name</strong>, or <strong>Phone Number</strong>
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          // Patient Found - Show Profile and Appointment Booking
          <ResizablePanels defaultSizes={[35, 65]} minSizes={[30, 40]} className="flex-1">
            {/* Left Panel - Patient Profile */}
            <Panel className="flex flex-col border-r border-slate-200 bg-white overflow-y-auto">
              {/* Patient Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="size-20 rounded-full bg-blue-50 text-[#1246e2] flex items-center justify-center text-2xl font-bold border-2 border-white shadow-sm">
                      {getInitials(foundPatient.name)}
                    </div>
                    <div className="absolute bottom-0 right-0 size-5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex flex-col pt-1">
                    <h1 className="text-xl font-bold text-slate-900 leading-tight">{foundPatient.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        #{foundPatient.patientNumber || foundPatient.id}
                      </span>
                      <button className="text-slate-400 hover:text-[#1246e2]">
                        <MaterialIcon name="content_copy" size={16} />
                      </button>
                    </div>
                    <span className="text-xs font-bold text-green-600 mt-2 uppercase tracking-wide">Verified Patient</span>
                  </div>
                </div>
              </div>

              {/* Patient Details Grid */}
              <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 border-b border-slate-100">
                <div className="p-4 bg-white">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Age / Sex</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {foundPatient.dateOfBirth ? Math.floor((new Date().getTime() - new Date(foundPatient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : '--'} / {foundPatient.gender || '--'}
                  </span>
                </div>
                <div className="p-4 bg-white">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Blood Type</span>
                  <span className="text-sm font-semibold text-slate-900">{foundPatient.bloodGroup || '--'}</span>
                </div>
                <div className="p-4 bg-white border-t-0">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Phone</span>
                  <span className="text-sm font-semibold text-slate-900">{foundPatient.phoneNumber || '--'}</span>
                </div>
                <div className="p-4 bg-white border-t-0">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Emergency</span>
                  <span className="text-sm font-semibold text-slate-900">{foundPatient.emergencyContactNumber || '--'}</span>
                </div>
              </div>

              {/* Critical Alerts */}
              {(foundPatient.allergies?.length > 0 || foundPatient.chronicConditions?.length > 0) && (
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <MaterialIcon name="warning" size={18} className="text-red-500" />
                    Critical Alerts
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {foundPatient.allergies?.map((allergy, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded bg-red-50 border border-red-100">
                        <MaterialIcon name="coronavirus" size={16} className="text-red-600" />
                        <span className="text-xs font-bold text-red-700">Allergy: {allergy}</span>
                      </div>
                    ))}
                    {foundPatient.chronicConditions?.map((condition, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded bg-orange-50 border border-orange-100">
                        <MaterialIcon name="water_drop" size={16} className="text-orange-600" />
                        <span className="text-xs font-bold text-orange-700">{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Visits */}
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Visits</h3>
                  <button className="text-xs text-[#1246e2] font-bold hover:underline">Full History</button>
                </div>
                <div className="space-y-4">
                  <div className="relative pl-5 border-l-2 border-slate-100">
                    <div className="absolute -left-[7px] top-1 size-3 rounded-full bg-slate-200 border-2 border-white"></div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-slate-900">General Checkup</span>
                      <span className="text-[11px] text-slate-500">Oct 12</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">Dr. Smith • Follow-up</p>
                  </div>
                  <div className="relative pl-5 border-l-2 border-slate-100">
                    <div className="absolute -left-[7px] top-1 size-3 rounded-full bg-slate-200 border-2 border-white"></div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-slate-900">Lab Work</span>
                      <span className="text-[11px] text-slate-500">Sep 28</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">Nurse Station • Blood Test</p>
                  </div>
                </div>
              </div>

              {/* New Search Button */}
              <div className="p-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={handleNewSearch}
                  className="w-full"
                >
                  <MaterialIcon name="search" size={18} className="mr-2" />
                  New Search
                </Button>
              </div>
            </Panel>

            {/* Right Panel - Appointment Booking */}
            <Panel className="flex flex-col bg-slate-50 overflow-y-auto">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="p-8 max-w-3xl mx-auto w-full"
              >
                <motion.div variants={staggerItem} className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Schedule Appointment</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    New booking for <span className="font-semibold text-slate-700">{foundPatient.name}</span>
                  </p>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <form onSubmit={handleScheduleAppointment} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-8 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-1">
                          <Label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                            Department *
                          </Label>
                          <Select
                            value={appointmentData.department}
                            onValueChange={(value) => setAppointmentData(prev => ({ ...prev, department: value }))}
                          >
                            <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-200">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="General Medicine">General Medicine</SelectItem>
                              <SelectItem value="Cardiology">Cardiology</SelectItem>
                              <SelectItem value="Pulmonology">Pulmonology</SelectItem>
                              <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                              <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                              <SelectItem value="Dermatology">Dermatology</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-1">
                          <Label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                            Attending Doctor *
                          </Label>
                          <Select
                            value={appointmentData.doctor}
                            onValueChange={(value) => setAppointmentData(prev => ({ ...prev, doctor: value }))}
                          >
                            <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-200">
                              <SelectValue placeholder={doctors.length === 0 ? "Loading doctors..." : "Select doctor"} />
                            </SelectTrigger>
                            <SelectContent>
                              {doctors.map(doctor => (
                                <SelectItem key={doctor.user_id} value={doctor.user_id}>
                                  {doctor.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-1">
                          <Label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                            Date *
                          </Label>
                          <Input
                            type="date"
                            value={appointmentData.dateTime.split('T')[0] || ''}
                            onChange={(e) => setAppointmentData(prev => ({ 
                              ...prev, 
                              dateTime: e.target.value + 'T' + (prev.dateTime.split('T')[1] || '09:00')
                            }))}
                            className="w-full h-11 bg-slate-50 border-slate-200"
                            required
                          />
                        </div>

                        <div className="col-span-1">
                          <Label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                            Preferred Time *
                          </Label>
                          <Input
                            type="time"
                            value={appointmentData.dateTime.split('T')[1] || ''}
                            onChange={(e) => setAppointmentData(prev => ({ 
                              ...prev, 
                              dateTime: (prev.dateTime.split('T')[0] || new Date().toISOString().split('T')[0]) + 'T' + e.target.value
                            }))}
                            className="w-full h-11 bg-slate-50 border-slate-200"
                            required
                          />
                        </div>

                        <div className="col-span-2">
                          <Label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                            Visit Type
                          </Label>
                          <div className="flex gap-4">
                            <label className={`flex-1 flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              appointmentData.visitType === 'in-person' 
                                ? 'border-[#1246e2] bg-blue-50' 
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}>
                              <input
                                type="radio"
                                name="visitType"
                                value="in-person"
                                checked={appointmentData.visitType === 'in-person'}
                                onChange={(e) => setAppointmentData(prev => ({ ...prev, visitType: e.target.value }))}
                                className="text-[#1246e2]"
                              />
                              <span className={`text-sm font-bold ${appointmentData.visitType === 'in-person' ? 'text-slate-900' : 'text-slate-700'}`}>
                                In-Person Visit
                              </span>
                            </label>
                            <label className={`flex-1 flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              appointmentData.visitType === 'teleconsultation' 
                                ? 'border-[#1246e2] bg-blue-50' 
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}>
                              <input
                                type="radio"
                                name="visitType"
                                value="teleconsultation"
                                checked={appointmentData.visitType === 'teleconsultation'}
                                onChange={(e) => setAppointmentData(prev => ({ ...prev, visitType: e.target.value }))}
                                className="text-[#1246e2]"
                              />
                              <span className={`text-sm font-bold ${appointmentData.visitType === 'teleconsultation' ? 'text-slate-900' : 'text-slate-700'}`}>
                                Teleconsultation
                              </span>
                            </label>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <Label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                            Reason for Appointment *
                          </Label>
                          <textarea
                            value={appointmentData.reason}
                            onChange={(e) => setAppointmentData(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="Enter chief complaint or symptoms..."
                            rows={4}
                            required
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1246e2] focus:border-[#1246e2] resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-500">
                        <MaterialIcon name="info" size={18} />
                        <span className="text-[11px] font-medium uppercase tracking-wider">SMS confirmation will be sent</span>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate('/receptionist')}
                          className="px-6 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isScheduling}
                          className="px-8 py-2.5 bg-[#1246e2] text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                        >
                          {isScheduling ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Scheduling...
                            </>
                          ) : (
                            <>
                              <MaterialIcon name="check_circle" size={18} />
                              Confirm Booking
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            </Panel>
          </ResizablePanels>
        )}

        {/* NFC Dialog */}
        <AlertDialog open={showNFCDialog} onOpenChange={setShowNFCDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-lg font-medium">
                <MaterialIcon name="nfc" size={24} className="text-[#1246e2]" />
                NFC Card Scanner
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4 pt-4">
                <div className="flex items-center justify-center py-8">
                  <div className="relative">
                    <MaterialIcon name="nfc" size={96} className="text-[#1246e2] animate-pulse" />
                    <div className="absolute inset-0 bg-[#1246e2]/20 rounded-full animate-ping" />
                  </div>
                </div>
                <p className="text-center font-medium text-foreground text-base">Hardware Integration Pending</p>
                <p className="text-center text-base font-medium">
                  NFC card scanning hardware is currently under testing and will be available soon.
                  Please use manual ID entry for now.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction className="text-base font-medium h-11">Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DesktopLayout>
  );
};

export default ExistingPatient;