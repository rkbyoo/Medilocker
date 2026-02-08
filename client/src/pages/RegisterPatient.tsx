import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { DesktopLayout } from '@/components/layout';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { patientsApi } from '@/api';
import type { Patient } from '@/types';
import { staggerContainer, staggerItem } from '@/lib/animations';

const RegisterPatient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: '',
    phoneNumber: '',
    guardianPhone: '',
    address: '',
    maritalStatus: 'Single',
    spouseName: '',
    caste: '',
    religion: '',
    nationality: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    allergies: [],
    chronicConditions: []
  });

  const [allergiesText, setAllergiesText] = useState('');
  const [conditionsText, setConditionsText] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    try {
      const response = await patientsApi.createPatient({
        ...formData as any,
        allergies: allergiesText.split(',').map(a => a.trim()).filter(Boolean),
        chronicConditions: conditionsText.split(',').map(c => c.trim()).filter(Boolean)
      });

      if (response.success && response.data) {
        const patientNumber = response.data.patientNumber || response.data.id;
        toast.success(`Patient registered successfully! Patient ID: ${patientNumber}`);

        // Navigate to existing patient page with patient number to book appointment
        setTimeout(() => {
          navigate(`/receptionist/existing-patient?patientId=${patientNumber}`);
        }, 1500);
      } else {
        toast.error(response.error || 'Failed to register patient');
      }
    } catch (error) {
      toast.error('An error occurred while registering the patient');
    } finally {
      setIsRegistering(false);
    }
  };

  const updateField = (field: keyof Patient, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DesktopLayout title="Register New Patient">
      <div className="h-full p-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <Card className="w-full h-full max-w-7xl mx-auto shadow-md border flex flex-col">
            <CardHeader className="border-b bg-muted/30 flex-shrink-0 py-4">
              <CardTitle className="font-heading text-xl font-semibold">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-8 overflow-hidden">
              <form onSubmit={handleSubmit} className="h-full flex flex-col">
              <div className="flex-1 grid grid-cols-3 gap-x-10 gap-y-4 overflow-hidden px-2">
                {/* Column 1 - Basic Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-medium">Full Name *</Label>
                    <Input
                      id="name"
                      className="text-base h-10"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dob" className="text-base font-medium">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      className="text-base h-10"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateField('dateOfBirth', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-base font-medium">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => updateField('gender', value)}>
                      <SelectTrigger className="text-base h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male" className="text-base">Male</SelectItem>
                        <SelectItem value="Female" className="text-base">Female</SelectItem>
                        <SelectItem value="Other" className="text-base">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup" className="text-base font-medium">Blood Group *</Label>
                    <Select value={formData.bloodGroup} onValueChange={(value) => updateField('bloodGroup', value)}>
                      <SelectTrigger className="text-base h-10">
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+" className="text-base">A+</SelectItem>
                        <SelectItem value="A-" className="text-base">A-</SelectItem>
                        <SelectItem value="B+" className="text-base">B+</SelectItem>
                        <SelectItem value="B-" className="text-base">B-</SelectItem>
                        <SelectItem value="AB+" className="text-base">AB+</SelectItem>
                        <SelectItem value="AB-" className="text-base">AB-</SelectItem>
                        <SelectItem value="O+" className="text-base">O+</SelectItem>
                        <SelectItem value="O-" className="text-base">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base font-medium">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      className="text-base h-10"
                      value={formData.phoneNumber}
                      onChange={(e) => updateField('phoneNumber', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guardianPhone" className="text-base font-medium">Guardian Phone *</Label>
                    <Input
                      id="guardianPhone"
                      type="tel"
                      className="text-base h-10"
                      value={formData.guardianPhone}
                      onChange={(e) => updateField('guardianPhone', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Column 2 - Personal Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus" className="text-base font-medium">Marital Status *</Label>
                    <Select value={formData.maritalStatus} onValueChange={(value) => updateField('maritalStatus', value)}>
                      <SelectTrigger className="text-base h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single" className="text-base">Single</SelectItem>
                        <SelectItem value="Married" className="text-base">Married</SelectItem>
                        <SelectItem value="Divorced" className="text-base">Divorced</SelectItem>
                        <SelectItem value="Widowed" className="text-base">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.maritalStatus === 'Married' && (
                    <div className="space-y-2">
                      <Label htmlFor="spouseName" className="text-base font-medium">Spouse Name</Label>
                      <Input
                        id="spouseName"
                        className="text-base h-10"
                        value={formData.spouseName}
                        onChange={(e) => updateField('spouseName', e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="nationality" className="text-base font-medium">Nationality *</Label>
                    <Select
                      value={formData.nationality}
                      onValueChange={(value) => updateField('nationality', value)}
                      required
                    >
                      <SelectTrigger className="text-base h-10">
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Indian" className="text-base">Indian</SelectItem>
                        <SelectItem value="Others" className="text-base">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="religion" className="text-base font-medium">Religion</Label>
                    <Select
                      value={formData.religion}
                      onValueChange={(value) => updateField('religion', value)}
                    >
                      <SelectTrigger className="text-base h-10">
                        <SelectValue placeholder="Select religion" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hindu" className="text-base">Hindu</SelectItem>
                        <SelectItem value="Christianity" className="text-base">Christianity</SelectItem>
                        <SelectItem value="Muslim" className="text-base">Muslim</SelectItem>
                        <SelectItem value="Others" className="text-base">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caste" className="text-base font-medium">Caste</Label>
                    <Select
                      value={formData.caste}
                      onValueChange={(value) => updateField('caste', value)}
                    >
                      <SelectTrigger className="text-base h-10">
                        <SelectValue placeholder="Select caste" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General" className="text-base">General</SelectItem>
                        <SelectItem value="STP" className="text-base">STP</SelectItem>
                        <SelectItem value="STH" className="text-base">STH</SelectItem>
                        <SelectItem value="OBC" className="text-base">OBC</SelectItem>
                        <SelectItem value="Other" className="text-base">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyName" className="text-base font-medium">Emergency Contact Name *</Label>
                    <Input
                      id="emergencyName"
                      className="text-base h-10"
                      value={formData.emergencyContactName}
                      onChange={(e) => updateField('emergencyContactName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyNumber" className="text-base font-medium">Emergency Contact Number *</Label>
                    <Input
                      id="emergencyNumber"
                      type="tel"
                      className="text-base h-10"
                      value={formData.emergencyContactNumber}
                      onChange={(e) => updateField('emergencyContactNumber', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Column 3 - Additional Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-base font-medium">Address *</Label>
                    <Textarea
                      id="address"
                      className="text-base resize-none"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies" className="text-base font-medium">Allergies</Label>
                    <Textarea
                      id="allergies"
                      className="text-base resize-none"
                      value={allergiesText}
                      onChange={(e) => setAllergiesText(e.target.value)}
                      placeholder="e.g., Penicillin, Peanuts, Latex"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conditions" className="text-base font-medium">Chronic Conditions</Label>
                    <Textarea
                      id="conditions"
                      className="text-base resize-none"
                      value={conditionsText}
                      onChange={(e) => setConditionsText(e.target.value)}
                      placeholder="e.g., Diabetes, Hypertension, Asthma"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-6 pt-6 border-t flex-shrink-0">
                <AnimatedButton 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/receptionist')} 
                  className="flex-1 h-11"
                  disabled={isRegistering}
                >
                  Cancel
                </AnimatedButton>
                <AnimatedButton 
                  type="submit" 
                  className="flex-1 h-11"
                  loading={isRegistering}
                  loadingText="Registering..."
                  icon={<Save className="w-5 h-5" />}
                >
                  Register Patient
                </AnimatedButton>
              </div>
            </form>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </DesktopLayout>
  );
};

export default RegisterPatient;
