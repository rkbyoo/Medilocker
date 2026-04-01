import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Search, Nfc, Calendar, User, Wifi, WifiOff } from 'lucide-react';
import { patientsApi, appointmentsApi, usersApi } from '@/api';
import { useAuth } from '@/contexts';
import PatientInfoCard from '@/components/common/PatientInfoCard';
import { ResizablePanels, Panel } from '@/components/ui/resizable-panels';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import type { Patient } from '@/types';
import type { SerialPortInfo } from '@/types/electron.d';

const ExistingPatient = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [patientId, setPatientId] = useState('');
  const [showNFCDialog, setShowNFCDialog] = useState(false);
  const [nfcConnected, setNfcConnected] = useState(false);
  const [nfcScanning, setNfcScanning] = useState(false);
  const [availablePorts, setAvailablePorts] = useState<SerialPortInfo[]>([]);
  const [selectedPort, setSelectedPort] = useState<string>('');
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

  // NFC Reader Setup - Only active on this page
  useEffect(() => {
    const isElectron = window.electronAPI !== undefined;
    if (!isElectron) return;

    let mounted = true;

    // Auto-connect on mount
    const initNFC = async () => {
      try {
        // Wait a bit to ensure any previous disconnection is complete
        await new Promise(resolve => setTimeout(resolve, 600));
        
        if (!mounted) return;

        const ports = await window.electronAPI.nfc.listPorts();
        const arduinoPort = ports.find(p => 
          p.vendorId === '2341' || 
          p.vendorId === '1A86' ||
          p.manufacturer?.toLowerCase().includes('arduino')
        );
        
        if (arduinoPort && mounted) {
          await window.electronAPI.nfc.connect(arduinoPort.path);
        }
      } catch (error) {
        console.error('Failed to auto-connect NFC:', error);
      }
    };

    initNFC();

    // Listen for NFC card detection
    const unsubscribeCard = window.electronAPI.nfc.onCardDetected(async (uid: string) => {
      console.log('NFC Card UID received:', uid);
      toast.info(`NFC Card detected: ${uid}`);
      
      // Auto-search patient by NFC UID
      setPatientId(uid);
      
      setIsSearching(true);
      try {
        const patient = await patientsApi.getPatientById(uid);
        if (patient) {
          setFoundPatient(patient);
          toast.success('Patient found via NFC!');
        } else {
          setFoundPatient(null);
          toast.error('No patient found with this NFC card. Please register first.');
        }
      } catch (error) {
        toast.error('Error searching for patient');
      } finally {
        setIsSearching(false);
      }
    });

    // Listen for connection status
    const unsubscribeConnected = window.electronAPI.nfc.onConnected((port: string) => {
      setNfcConnected(true);
      toast.success(`NFC Reader connected on ${port}`);
    });

    const unsubscribeDisconnected = window.electronAPI.nfc.onDisconnected(() => {
      setNfcConnected(false);
      toast.info('NFC Reader disconnected');
    });

    const unsubscribeError = window.electronAPI.nfc.onError((error: string) => {
      toast.error(`NFC Reader error: ${error}`);
    });

    // Cleanup: Disconnect NFC when leaving this page
    return () => {
      mounted = false;
      unsubscribeCard();
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeError();
      
      // Disconnect NFC reader when component unmounts
      if (isElectron) {
        window.electronAPI.nfc.disconnect()
          .then(() => console.log('NFC disconnected on unmount'))
          .catch(err => console.error('Error disconnecting NFC on unmount:', err));
      }
    };
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

  const handleOpenNFCDialog = async () => {
    const isElectron = window.electronAPI !== undefined;
    
    if (!isElectron) {
      toast.error('NFC scanning is only available in the desktop app');
      return;
    }

    setShowNFCDialog(true);
    setNfcScanning(true);

    // List available ports
    try {
      const ports = await window.electronAPI.nfc.listPorts();
      setAvailablePorts(ports);
      
      if (ports.length === 0) {
        toast.warning('No serial ports found. Please connect your Arduino NFC reader.');
      } else if (ports.length === 1) {
        // Auto-select if only one port
        setSelectedPort(ports[0].path);
      }
    } catch (error) {
      toast.error('Failed to list serial ports');
    }
  };

  const handleConnectNFC = async () => {
    if (!selectedPort) {
      toast.error('Please select a serial port');
      return;
    }

    try {
      // First disconnect if already connected
      if (nfcConnected) {
        await window.electronAPI.nfc.disconnect();
        // Wait for port to be released
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      const result = await window.electronAPI.nfc.connect(selectedPort);
      if (result.success) {
        setNfcScanning(true);
        toast.success('Waiting for NFC card...');
      } else {
        toast.error(result.error || 'Failed to connect to NFC reader');
      }
    } catch (error) {
      toast.error('Error connecting to NFC reader');
    }
  };

  const handleDisconnectNFC = async () => {
    try {
      await window.electronAPI.nfc.disconnect();
      setNfcScanning(false);
      setNfcConnected(false);
      setShowNFCDialog(false);
      toast.info('NFC reader disconnected');
    } catch (error) {
      console.error('Error disconnecting NFC reader:', error);
      toast.error('Error disconnecting NFC reader');
    }
  };



  return (
    <div className="w-screen h-screen bg-background flex flex-col overflow-hidden">
      <header className="border-b bg-gradient-to-r from-primary to-secondary shadow-lg flex-shrink-0 backdrop-blur-sm">
        <div className="w-full px-8 py-4 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/receptionist')} className="mr-4 text-primary-foreground hover:bg-white/20 font-medium">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-medium text-primary-foreground">Existing Patient Lookup</h1>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
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
                          Search by: <strong>10-digit Patient ID</strong> (e.g., 1234567890), NFC Card UID
                          {/* , Patient Name, or Phone Number */}
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-sm uppercase">
                        <span className="bg-card px-3 text-muted-foreground font-medium">Or Scan NFC Card</span>
                      </div>
                    </div>

                    {/* NFC Scanning Animation */}
                    <div className="w-full rounded-lg h-44 flex items-center justify-center bg-gradient-to-br from-secondary/10 to-secondary/5 relative overflow-hidden">
                      {/* Connection Indicator - Top Right */}
                      {window.electronAPI && (
                        <div className="absolute top-3 right-3 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
                          <div className={`w-2 h-2 rounded-full ${nfcConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-xs font-medium text-foreground">
                            {nfcConnected ? 'NFC Reader Connected' : 'Disconnected'}
                          </span>
                        </div>
                      )}
                      
                      {window.electronAPI ? (
                        <div className="flex flex-col items-center gap-3 px-4">
                          {/* Scanning Animation - Rotated WiFi Icon */}
                          <div className="relative">
                            {nfcConnected ? (
                              <div className="rotate-90">
                                <Wifi className="w-16 h-16 text-secondary animate-pulse" />
                              </div>
                            ) : (
                              <div className="rotate-90">
                                <WifiOff className="w-16 h-16 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          
                          {/* Status Text */}
                          <div className="text-center space-y-1.5">
                            <p className={`text-base font-medium ${nfcConnected ? 'text-secondary' : 'text-muted-foreground'}`}>
                              {nfcConnected ? 'Scan Your NFC Card' : 'NFC Reader Not Connected'}
                            </p>
                            
                            {/* Instruction text when connected */}
                            {nfcConnected && (
                              <p className="text-xs text-muted-foreground max-w-sm px-4">
                                Place your NFC card near the reader to automatically search for patient
                              </p>
                            )}
                            
                            {!nfcConnected && (
                              <Button
                                variant="link"
                                size="sm"
                                onClick={handleOpenNFCDialog}
                                className="text-xs text-primary hover:text-primary/80 h-auto p-0 mt-1"
                              >
                                Click to connect
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground px-4">
                          <Nfc className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">NFC available in desktop app only</p>
                        </div>
                      )}
                    </div>
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
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-lg font-medium">
                <Nfc className="w-6 h-6 text-secondary" />
                NFC Card Scanner
                {nfcConnected && <Wifi className="w-5 h-5 text-green-500 ml-auto" />}
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4 pt-4">
                {!window.electronAPI ? (
                  // Not in Electron
                  <>
                    <p className="text-center font-medium text-foreground text-base">Desktop App Required</p>
                    <p className="text-center text-base">
                      NFC card scanning is only available in the desktop application.
                      Please use the Electron app to access this feature.
                    </p>
                  </>
                ) : nfcScanning ? (
                  // Scanning mode
                  <>
                    <div className="flex items-center justify-center py-8">
                      <div className="relative">
                        <Nfc className="w-24 h-24 text-secondary animate-pulse" />
                        <div className="absolute inset-0 bg-secondary/20 rounded-full animate-ping" />
                      </div>
                    </div>
                    <p className="text-center font-medium text-foreground text-base">
                      {nfcConnected ? 'Ready to Scan' : 'Connecting...'}
                    </p>
                    <p className="text-center text-base">
                      {nfcConnected 
                        ? 'Place your NFC card near the reader'
                        : 'Initializing NFC reader...'}
                    </p>
                  </>
                ) : (
                  // Port selection mode
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium mb-2 block">Select Arduino Port</Label>
                        <Select value={selectedPort} onValueChange={setSelectedPort}>
                          <SelectTrigger className="text-base h-11">
                            <SelectValue placeholder={availablePorts.length === 0 ? "No ports found" : "Select a port"} />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePorts.map(port => (
                              <SelectItem key={port.path} value={port.path} className="text-base">
                                {port.path} {port.manufacturer && `(${port.manufacturer})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {availablePorts.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          Make sure your Arduino is connected via USB and drivers are installed.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              {nfcScanning ? (
                <>
                  <AlertDialogCancel onClick={handleDisconnectNFC} className="text-base font-medium h-11">
                    Cancel
                  </AlertDialogCancel>
                </>
              ) : (
                <>
                  <AlertDialogCancel className="text-base font-medium h-11">Close</AlertDialogCancel>
                  {window.electronAPI && availablePorts.length > 0 && (
                    <AlertDialogAction onClick={handleConnectNFC} className="text-base font-medium h-11">
                      Connect & Scan
                    </AlertDialogAction>
                  )}
                </>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default ExistingPatient; 
