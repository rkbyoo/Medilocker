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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-r from-primary to-secondary shadow-lg sticky top-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/receptionist')} className="mr-4 text-primary-foreground hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary-foreground">Register New Patient</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card className="max-w-4xl mx-auto shadow-lg border-2">
          <CardHeader className="bg-gradient-to-r from-accent to-accent/50">
            <CardTitle className="text-2xl">Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label htmlFor="name" className="text-right">Full Name *</Label>
                  <Input
                    id="name"
                    className="col-span-2"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label htmlFor="dob" className="text-right">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    className="col-span-2"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label htmlFor="gender" className="text-right">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => updateField('gender', value)}>
                    <SelectTrigger className="col-span-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label htmlFor="bloodGroup" className="text-right">Blood Group *</Label>
                  <Select value={formData.bloodGroup} onValueChange={(value) => updateField('bloodGroup', value)}>
                    <SelectTrigger className="col-span-2">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label htmlFor="phone" className="text-right">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    className="col-span-2"
                    value={formData.phoneNumber}
                    onChange={(e) => updateField('phoneNumber', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label htmlFor="guardianPhone" className="text-right">Guardian Phone *</Label>
                  <Input
                    id="guardianPhone"
                    type="tel"
                    className="col-span-2"
                    value={formData.guardianPhone}
                    onChange={(e) => updateField('guardianPhone', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label htmlFor="maritalStatus" className="text-right">Marital Status *</Label>
                  <Select value={formData.maritalStatus} onValueChange={(value) => updateField('maritalStatus', value)}>
                    <SelectTrigger className="col-span-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.maritalStatus === 'Married' && (
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <Label htmlFor="spouseName" className="text-right">Spouse Name</Label>
                    <Input
                      id="spouseName"
                      className="col-span-2"
                      value={formData.spouseName}
                      onChange={(e) => updateField('spouseName', e.target.value)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label htmlFor="nationality" className="text-right">Nationality *</Label>
                  <Input
                    id="nationality"
                    className="col-span-2"
                    value={formData.nationality}
                    onChange={(e) => updateField('nationality', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label htmlFor="religion" className="text-right">Religion</Label>
                  <Input
                    id="religion"
                    className="col-span-2"
                    value={formData.religion}
                    onChange={(e) => updateField('religion', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label htmlFor="caste" className="text-right">Caste</Label>
                  <Input
                    id="caste"
                    className="col-span-2"
                    value={formData.caste}
                    onChange={(e) => updateField('caste', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label htmlFor="emergencyName" className="text-right">Emergency Contact Name *</Label>
                  <Input
                    id="emergencyName"
                    className="col-span-2"
                    value={formData.emergencyContactName}
                    onChange={(e) => updateField('emergencyContactName', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label htmlFor="emergencyNumber" className="text-right">Emergency Contact Number *</Label>
                  <Input
                    id="emergencyNumber"
                    type="tel"
                    className="col-span-2"
                    value={formData.emergencyContactNumber}
                    onChange={(e) => updateField('emergencyContactNumber', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 items-start">
                <Label htmlFor="address" className="text-right pt-2">Address *</Label>
                <Textarea
                  id="address"
                  className="col-span-3"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-4 gap-4 items-start">
                <Label htmlFor="allergies" className="text-right pt-2">Allergies (comma-separated)</Label>
                <Textarea
                  id="allergies"
                  className="col-span-3"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="e.g., Penicillin, Peanuts, Latex"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-4 gap-4 items-start">
                <Label htmlFor="conditions" className="text-right pt-2">Chronic Conditions (comma-separated)</Label>
                <Textarea
                  id="conditions"
                  className="col-span-3"
                  value={conditionsText}
                  onChange={(e) => setConditionsText(e.target.value)}
                  placeholder="e.g., Diabetes, Hypertension, Asthma"
                  rows={2}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/receptionist')} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
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
