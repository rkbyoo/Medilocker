import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { DesktopLayout } from '@/components/layout';
import { toast } from 'sonner';
import { ArrowLeft, Search, Nfc, Calendar, User } from 'lucide-react';
import { patientsApi, appointmentsApi, usersApi } from '@/api';
import { useAuth } from '@/contexts';
import PatientInfoCard from '@/components/common/PatientInfoCard';
import { ResizablePanels, Panel } from '@/components/ui/resizable-panels';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import type { Patient } from '@/types';
import { staggerContainer, staggerItem, scaleIn } from '@/lib/animations';

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
    dateTime: ''
  });

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      const doctorsList = await usersApi.getDoctors();
      setDoctors(doctorsList);
      // Set default doctor if available
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
      setIsSearching(true);
      // Auto-trigger search after a short delay
      const searchPatient = async () => {
        try {
          const patient = await patientsApi.getPatientById(patientIdParam);
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
      setTimeout(() => {
        searchPatient();
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearch = async () => {
    if (!patientId) {
      toast.error('Please enter a patient ID');
      return;
    }

    setIsSearching(true);
    try {
      const patient = await patientsApi.getPatientById(patientId);
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

      // Use patient_number if available, otherwise use patient_id
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
      dateTime: ''
    });
  };



  return (
    <DesktopLayout 
      title="Existing Patient Lookup" 
       
      
    >
      <div className="flex-1 overflow-hidden">
        {isSearching && !foundPatient ? (
          // Loading State
          <div className="h-full px-8 py-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="font-medium text-lg">Searching for patient...</p>
            </div>
          </div>
        ) : !foundPatient ? (
          // Search Interface
          <div className="h-full px-8 py-8 flex items-center justify-center">
            <div className="w-full max-w-4xl space-y-8">
              <Card className="bg-gradient-to-br from-card to-accent/5 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-medium">Patient Lookup</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-6">
                        <Label htmlFor="patientId" className="text-base font-medium w-40 text-right flex-shrink-0">
                          Patient ID
                        </Label>
                        <div className="flex-1 flex gap-4">
                          <Input
                            id="patientId"
                            placeholder="Enter 10-digit Patient ID, NFC Card UID, Name, or Phone"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="bg-background flex-1 text-base h-12"
                          />
                          <Button 
                            onClick={handleSearch} 
                            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md text-base font-medium h-12 px-6"
                            disabled={isSearching}
                          >
                            {isSearching ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Searching...
                              </>
                            ) : (
                              <>
                                <Search className="w-5 h-5 mr-2" />
                                Search
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="w-40 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          Search by: <strong>10-digit Patient ID</strong> (e.g., 1234567890), NFC Card UID, Patient Name, or Phone Number
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-sm uppercase">
                        <span className="bg-card px-3 text-muted-foreground font-medium">Or</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => setShowNFCDialog(true)}
                      variant="outline"
                      className="w-full border-2 border-dashed border-secondary hover:border-secondary hover:bg-secondary/10 h-24"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Nfc className="w-8 h-8 text-secondary" />
                        <span className="font-medium text-base">Scan NFC Card</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Patient Found - Show Profile and Appointment Booking
          <ResizablePanels defaultSizes={[40, 60]} minSizes={[30, 30]} className="h-full">
            <Panel className="p-6 space-y-6">
              {/* Patient Profile Section */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Patient Profile
                </h2>
                <Button variant="outline" onClick={handleNewSearch} className="text-base font-medium">
                  <Search className="w-4 h-4 mr-2" />
                  New Search
                </Button>
              </div>
              
              <PatientInfoCard patient={foundPatient} variant="detailed" showExpandableDetails={false} />
            </Panel>

            <Panel className="p-6">
              {/* Appointment Booking Form */}
              <Card className="h-full shadow-lg border-2 bg-gradient-to-br from-card to-accent/5 flex flex-col">
                <CardHeader className="bg-gradient-to-r from-accent to-accent/50 flex-shrink-0">
                  <CardTitle className="text-xl font-medium flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Schedule Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-6 flex flex-col">
                  <form onSubmit={handleScheduleAppointment} className="h-full flex flex-col">
                    <div className="space-y-6 flex-1">
                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-base font-medium">Department *</Label>
                        <Select value={appointmentData.department} onValueChange={(value) => setAppointmentData(prev => ({ ...prev, department: value }))}>
                          <SelectTrigger className="text-base h-12">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General Medicine" className="text-base">General Medicine</SelectItem>
                            <SelectItem value="Cardiology" className="text-base">Cardiology</SelectItem>
                            <SelectItem value="Pulmonology" className="text-base">Pulmonology</SelectItem>
                            <SelectItem value="Orthopedics" className="text-base">Orthopedics</SelectItem>
                            <SelectItem value="Pediatrics" className="text-base">Pediatrics</SelectItem>
                            <SelectItem value="Dermatology" className="text-base">Dermatology</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="doctor" className="text-base font-medium">Doctor *</Label>
                        <Select value={appointmentData.doctor} onValueChange={(value) => setAppointmentData(prev => ({ ...prev, doctor: value }))}>
                          <SelectTrigger className="text-base h-12">
                            <SelectValue placeholder={doctors.length === 0 ? "Loading doctors..." : "Select doctor"} />
                          </SelectTrigger>
                          <SelectContent>
                            {doctors.map(doctor => (
                              <SelectItem key={doctor.user_id} value={doctor.user_id} className="text-base">
                                {doctor.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reason" className="text-base font-medium">Reason for Visit *</Label>
                        <Input
                          id="reason"
                          placeholder="e.g., Follow-up consultation, New symptoms"
                          value={appointmentData.reason}
                          onChange={(e) => setAppointmentData(prev => ({ ...prev, reason: e.target.value }))}
                          required
                          className="text-base h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateTime" className="text-base font-medium">Date & Time *</Label>
                        <div className="max-w-md">
                          <Input
                            id="dateTime"
                            type="datetime-local"
                            value={appointmentData.dateTime}
                            onChange={(e) => setAppointmentData(prev => ({ ...prev, dateTime: e.target.value }))}
                            required
                            className="text-base h-12 w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6 mt-6 border-t flex-shrink-0">
                      <Button type="button" variant="outline" onClick={() => navigate('/receptionist')} className="flex-1 text-base font-medium h-12">
                        Back to Dashboard
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md text-base font-medium h-12"
                        disabled={isScheduling}
                      >
                        {isScheduling ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Scheduling...
                          </>
                        ) : (
                          <>
                            <Calendar className="w-5 h-5 mr-2" />
                            Schedule Appointment
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </Panel>
          </ResizablePanels>
        )}

        {/* NFC Dialog */}
        <AlertDialog open={showNFCDialog} onOpenChange={setShowNFCDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-lg font-medium">
                <Nfc className="w-6 h-6 text-secondary" />
                NFC Card Scanner
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4 pt-4">
                <div className="flex items-center justify-center py-8">
                  <div className="relative">
                    <Nfc className="w-24 h-24 text-secondary animate-pulse" />
                    <div className="absolute inset-0 bg-secondary/20 rounded-full animate-ping" />
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
