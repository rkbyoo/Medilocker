/**
 * Patient Registration Form
 * Professional medical registration with sectioned layout
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { DesktopLayout } from '@/components/layout';
import { toast } from 'sonner';
import { patientsApi } from '@/api';
import type { Patient } from '@/types';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

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

  // Header content
  const headerContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/receptionist')}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <MaterialIcon name="arrow_back" size={24} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900">New Patient Registration</h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Registration Module</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:text-slate-900 transition-colors relative">
          <MaterialIcon name="notifications" size={24} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <MaterialIcon name="calendar_today" size={18} />
          {currentDate}
        </div>
      </div>
    </div>
  );

  return (
    <DesktopLayout header={headerContent}>
      <div className="h-full flex flex-col">
        {/* Scrollable Form Content */}
        <form id="register-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="w-full space-y-6 p-6 pb-24"
          >
            {/* Basic Information Section */}
            <motion.div variants={staggerItem} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                <div className="p-2 bg-[#1246e2]/10 rounded-lg text-[#1246e2]">
                  <MaterialIcon name="badge" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">Basic Information</h3>
                  <p className="text-xs text-slate-500">Primary patient identity details</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Jonathan Doe"
                    required
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                    required
                    className="h-9 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                    <Select value={formData.gender} onValueChange={(value) => updateField('gender', value)}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male" className="text-sm">Male</SelectItem>
                        <SelectItem value="Female" className="text-sm">Female</SelectItem>
                        <SelectItem value="Other" className="text-sm">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Blood Group</label>
                    <Select value={formData.bloodGroup} onValueChange={(value) => updateField('bloodGroup', value)}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+" className="text-sm">A+</SelectItem>
                        <SelectItem value="A-" className="text-sm">A-</SelectItem>
                        <SelectItem value="B+" className="text-sm">B+</SelectItem>
                        <SelectItem value="B-" className="text-sm">B-</SelectItem>
                        <SelectItem value="AB+" className="text-sm">AB+</SelectItem>
                        <SelectItem value="AB-" className="text-sm">AB-</SelectItem>
                        <SelectItem value="O+" className="text-sm">O+</SelectItem>
                        <SelectItem value="O-" className="text-sm">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact & Address Section */}
            <motion.div variants={staggerItem} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                <div className="p-2 bg-[#1246e2]/10 rounded-lg text-[#1246e2]">
                  <MaterialIcon name="contacts" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">Contact & Address</h3>
                  <p className="text-xs text-slate-500">Reachability and physical location</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => updateField('phoneNumber', e.target.value)}
                      placeholder="(555) 000-0000"
                      required
                      className="h-9 text-sm pl-9"
                    />
                    <MaterialIcon name="call" size={18} className="absolute left-2.5 top-2 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Guardian Phone</label>
                  <Input
                    type="tel"
                    value={formData.guardianPhone}
                    onChange={(e) => updateField('guardianPhone', e.target.value)}
                    placeholder="(555) 000-0000"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Marital Status</label>
                  <Select value={formData.maritalStatus} onValueChange={(value) => updateField('maritalStatus', value)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single" className="text-sm">Single</SelectItem>
                      <SelectItem value="Married" className="text-sm">Married</SelectItem>
                      <SelectItem value="Divorced" className="text-sm">Divorced</SelectItem>
                      <SelectItem value="Widowed" className="text-sm">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Residential Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="123 Street Name, Apt 4B"
                    required
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">City</label>
                  <Input
                    placeholder="City Name"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nationality</label>
                  <Select value={formData.nationality} onValueChange={(value) => updateField('nationality', value)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Indian" className="text-sm">Indian</SelectItem>
                      <SelectItem value="Others" className="text-sm">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>

            {/* Emergency & Medical Section */}
            <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Emergency Contact */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                  <div className="p-2 bg-[#1246e2]/10 rounded-lg text-[#1246e2]">
                    <MaterialIcon name="emergency" size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">Emergency</h3>
                    <p className="text-xs text-slate-500">Next of kin</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.emergencyContactName}
                      onChange={(e) => updateField('emergencyContactName', e.target.value)}
                      placeholder="Sarah Doe"
                      required
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Relationship</label>
                    <Select>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spouse" className="text-sm">Spouse</SelectItem>
                        <SelectItem value="Parent" className="text-sm">Parent</SelectItem>
                        <SelectItem value="Sibling" className="text-sm">Sibling</SelectItem>
                        <SelectItem value="Other" className="text-sm">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      value={formData.emergencyContactNumber}
                      onChange={(e) => updateField('emergencyContactNumber', e.target.value)}
                      placeholder="(555) 999-8888"
                      required
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Brief */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                  <div className="p-2 bg-[#1246e2]/10 rounded-lg text-[#1246e2]">
                    <MaterialIcon name="medical_services" size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">Medical Brief</h3>
                    <p className="text-xs text-slate-500">Warnings and history</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Allergies</label>
                      <Input
                        value={allergiesText}
                        onChange={(e) => setAllergiesText(e.target.value)}
                        placeholder="e.g., Penicillin, Peanuts (comma separated)"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chronic Conditions</label>
                      <Input
                        value={conditionsText}
                        onChange={(e) => setConditionsText(e.target.value)}
                        placeholder="e.g., Diabetes, Hypertension (comma separated)"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Additional Notes</label>
                    <textarea
                      className="w-full rounded-lg border border-slate-300 bg-white text-sm focus:border-[#1246e2] focus:ring-[#1246e2] shadow-sm min-h-[72px] p-2"
                      placeholder="Any additional medical information..."
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </form>

        {/* Fixed Bottom Action Bar */}
        <div className="h-20 flex items-center justify-between px-8 bg-white border-t border-slate-200 flex-shrink-0">
          <div className="hidden sm:flex items-center text-xs text-slate-500 gap-2">
            <MaterialIcon name="keyboard_command_key" size={16} />
            <span>Press <kbd className="font-sans font-bold bg-slate-100 px-1 rounded border border-slate-300">Enter</kbd> to save</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={() => navigate('/receptionist')}
              className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="register-form"
              disabled={isRegistering}
              className="px-6 py-2.5 rounded-lg bg-[#1246e2] hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MaterialIcon name="person_add" size={20} />
              {isRegistering ? 'Registering...' : 'Register Patient'}
            </button>
          </div>
        </div>
      </div>
    </DesktopLayout>
  );
};

export default RegisterPatient;
