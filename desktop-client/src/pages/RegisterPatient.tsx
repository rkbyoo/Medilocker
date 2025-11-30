import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { patientsApi } from '@/api';
import type { Patient } from '@/types';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const response = patientsApi.createPatient({
      ...formData as any,
      allergies: allergiesText.split(',').map(a => a.trim()).filter(Boolean),
      chronicConditions: conditionsText.split(',').map(c => c.trim()).filter(Boolean)
    });

    if (response.success && response.data) {
      toast.success(`Patient registered successfully! ID: ${response.data.id}`);

      // Navigate back to dashboard
      setTimeout(() => {
        navigate('/receptionist');
      }, 2000);
    } else {
      toast.error(response.error || 'Failed to register patient');
    }
  };

  const updateField = (field: keyof Patient, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-screen h-screen bg-background flex flex-col overflow-hidden">
      <header className="border-b bg-gradient-to-r from-primary to-secondary shadow-lg flex-shrink-0 backdrop-blur-sm">
        <div className="w-full px-8 py-4 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/receptionist')} className="mr-4 text-primary-foreground hover:bg-white/20 font-medium">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-medium text-primary-foreground">Register New Patient</h1>
        </div>
      </header>

      <main className="flex-1 px-8 py-6 overflow-hidden">
        <Card className="w-full h-full max-w-7xl mx-auto shadow-lg border-2 flex flex-col">
          <CardHeader className="bg-gradient-to-r from-accent to-accent/50 flex-shrink-0">
            <CardTitle className="text-xl font-medium">Patient Information</CardTitle>
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
                    <Input
                      id="nationality"
                      className="text-base h-10"
                      value={formData.nationality}
                      onChange={(e) => updateField('nationality', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="religion" className="text-base font-medium">Religion</Label>
                    <Input
                      id="religion"
                      className="text-base h-10"
                      value={formData.religion}
                      onChange={(e) => updateField('religion', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caste" className="text-base font-medium">Caste</Label>
                    <Input
                      id="caste"
                      className="text-base h-10"
                      value={formData.caste}
                      onChange={(e) => updateField('caste', e.target.value)}
                    />
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
                <Button type="button" variant="outline" onClick={() => navigate('/receptionist')} className="flex-1 text-base font-medium h-11">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 text-base font-medium h-11">
                  <Save className="w-5 h-5 mr-2" />
                  Register Patient
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RegisterPatient;
