import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar } from 'lucide-react';
import { patientsApi, appointmentsApi, usersApi } from '@/api';
import { useAuth } from '@/contexts';
import PatientInfoCard from '@/components/common/PatientInfoCard';
import type { Patient } from '@/types';
import { DesktopLayout } from '@/components/layout';

const PatientDetails = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { patientId } = useParams<{ patientId: string }>();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        const fetchPatient = async () => {
            if (patientId) {
                try {
                    const foundPatient = await patientsApi.getPatientById(patientId);
                    if (foundPatient) {
                        setPatient(foundPatient);
                    } else {
                        toast.error('Patient not found');
                        navigate('/receptionist/existing-patient');
                    }
                } catch (error) {
                    toast.error('Error loading patient');
                    navigate('/receptionist/existing-patient');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchPatient();
    }, [patientId, navigate]);

    const handleScheduleAppointment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!patient) return;

        if (!appointmentData.doctor) {
            toast.error('Please select a doctor');
            return;
        }

        setIsScheduling(true);
        try {
            const selectedDoctor = doctors.find(d => d.user_id === appointmentData.doctor);

            // Use patient_number if available, otherwise use patient_id
            const patientIdentifier = patient.patientNumber || patient.id;

            const response = await appointmentsApi.createAppointment({
                patientId: patientIdentifier,
                patientName: patient.name,
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



    if (loading) {
        return (
            <DesktopLayout title="Patient Details">
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="font-medium">Loading patient details...</p>
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
                        <p className="text-lg text-muted-foreground font-medium">Patient not found</p>
                        <Button onClick={() => navigate('/receptionist/existing-patient')} className="mt-4 font-medium">
                            Back to Search
                        </Button>
                    </div>
                </div>
            </DesktopLayout>
        );
    }

    return (
        <DesktopLayout title="Patient Details">
            <div className="w-full max-w-6xl mx-auto space-y-6">
                {/* Patient Information */}
                <PatientInfoCard patient={patient} />

                {/* Appointment Booking Form */}
                <Card className="shadow-sm border">
                    <CardHeader className="border-b bg-muted/50 py-3">
                        <CardTitle className="text-base font-semibold">Schedule Appointment</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form onSubmit={handleScheduleAppointment} className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Label htmlFor="department" className="w-32 text-right font-medium text-sm">Department *</Label>
                                    <div className="flex-1">
                                        <Select value={appointmentData.department} onValueChange={(value) => setAppointmentData(prev => ({ ...prev, department: value }))}>
                                            <SelectTrigger className="h-9">
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
                                </div>

                                <div className="flex items-center gap-4">
                                    <Label htmlFor="doctor" className="w-32 text-right font-medium text-sm">Doctor *</Label>
                                    <div className="flex-1">
                                        <Select value={appointmentData.doctor} onValueChange={(value) => setAppointmentData(prev => ({ ...prev, doctor: value }))}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue />
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
                                </div>

                                <div className="flex items-center gap-4">
                                    <Label htmlFor="reason" className="w-32 text-right font-medium text-sm">Reason for Visit *</Label>
                                    <div className="flex-1">
                                        <Input
                                            id="reason"
                                            placeholder="e.g., Follow-up consultation, New symptoms"
                                            value={appointmentData.reason}
                                            onChange={(e) => setAppointmentData(prev => ({ ...prev, reason: e.target.value }))}
                                            required
                                            className="h-9"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Label htmlFor="dateTime" className="w-32 text-right font-medium text-sm">Date & Time *</Label>
                                    <div className="flex-1">
                                        <Input
                                            id="dateTime"
                                            type="datetime-local"
                                            value={appointmentData.dateTime}
                                            onChange={(e) => setAppointmentData(prev => ({ ...prev, dateTime: e.target.value }))}
                                            required
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="outline" onClick={() => navigate('/receptionist/existing-patient')} className="flex-1 h-9">
                                    Back to Search
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="flex-1 h-9"
                                    disabled={isScheduling}
                                >
                                    {isScheduling ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Scheduling...
                                        </>
                                    ) : (
                                        <>
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Schedule Appointment
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DesktopLayout>
    );
};

export default PatientDetails;
