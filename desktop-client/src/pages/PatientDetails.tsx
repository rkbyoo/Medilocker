import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Calendar } from 'lucide-react';
import { patientsApi, appointmentsApi } from '@/api';
import { dummyUsers } from '@/data/dummyData';
import PatientInfoCard from '@/components/common/PatientInfoCard';
import type { Patient } from '@/types';

const PatientDetails = () => {
    const navigate = useNavigate();
    const { patientId } = useParams<{ patientId: string }>();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);

    const [appointmentData, setAppointmentData] = useState({
        department: '',
        doctor: 'D001',
        reason: '',
        dateTime: ''
    });

    useEffect(() => {
        if (patientId) {
            const foundPatient = patientsApi.getPatientById(patientId);
            if (foundPatient) {
                setPatient(foundPatient);
            } else {
                toast.error('Patient not found');
                navigate('/existing-patient');
            }
        }
        setLoading(false);
    }, [patientId, navigate]);

    const handleScheduleAppointment = (e: React.FormEvent) => {
        e.preventDefault();

        if (!patient) return;

        const doctor = dummyUsers.find(u => u.id === appointmentData.doctor);

        const response = appointmentsApi.createAppointment({
            patientId: patient.id,
            patientName: patient.name,
            doctorId: appointmentData.doctor,
            doctorName: doctor?.name || '',
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
    };



    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading patient details...</p>
                </div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-muted-foreground">Patient not found</p>
                    <Button onClick={() => navigate('/existing-patient')} className="mt-4">
                        Back to Search
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-gradient-to-r from-primary to-secondary shadow-lg sticky top-0 z-10 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-4 flex items-center">
                    <Button variant="ghost" onClick={() => navigate('/existing-patient')} className="mr-4 text-primary-foreground hover:bg-white/20">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-primary-foreground">Patient Details</h1>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Patient Information */}
                    <PatientInfoCard patient={patient} />

                    {/* Appointment Booking Form */}
                    <Card className="shadow-lg border-2">
                        <CardHeader className="bg-gradient-to-r from-accent to-accent/50">
                            <CardTitle className="text-xl">Schedule Appointment</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleScheduleAppointment} className="space-y-4">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Label htmlFor="department" className="w-32 text-right font-medium">Department *</Label>
                                        <div className="flex-1">
                                            <Select value={appointmentData.department} onValueChange={(value) => setAppointmentData(prev => ({ ...prev, department: value }))}>
                                                <SelectTrigger>
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
                                        <Label htmlFor="doctor" className="w-32 text-right font-medium">Doctor *</Label>
                                        <div className="flex-1">
                                            <Select value={appointmentData.doctor} onValueChange={(value) => setAppointmentData(prev => ({ ...prev, doctor: value }))}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {dummyUsers.filter(u => u.role === 'doctor').map(doctor => (
                                                        <SelectItem key={doctor.id} value={doctor.id}>{doctor.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Label htmlFor="reason" className="w-32 text-right font-medium">Reason for Visit *</Label>
                                        <div className="flex-1">
                                            <Input
                                                id="reason"
                                                placeholder="e.g., Follow-up consultation, New symptoms"
                                                value={appointmentData.reason}
                                                onChange={(e) => setAppointmentData(prev => ({ ...prev, reason: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Label htmlFor="dateTime" className="w-32 text-right font-medium">Date & Time *</Label>
                                        <div className="flex-1">
                                            <Input
                                                id="dateTime"
                                                type="datetime-local"
                                                value={appointmentData.dateTime}
                                                onChange={(e) => setAppointmentData(prev => ({ ...prev, dateTime: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="outline" onClick={() => navigate('/existing-patient')} className="flex-1">
                                        Back to Search
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Schedule Appointment
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default PatientDetails;