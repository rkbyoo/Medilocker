/**
 * Application Router
 * Simplified routing configuration
 */

import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Login from '@/pages/Login-Simple';
import ReceptionistDashboard from '@/pages/ReceptionistDashboard';
import RegisterPatient from '@/pages/RegisterPatient';
import ExistingPatient from '@/pages/ExistingPatient';
import PatientDetails from '@/pages/PatientDetails';
import DoctorDashboard from '@/pages/DoctorDashboard';
import Consultation from '@/pages/Consultation';
import NotFound from '@/pages/NotFound';

export const AppRouter: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/receptionist" element={<ReceptionistDashboard />} />
        <Route path="/receptionist/register-patient" element={<RegisterPatient />} />
        <Route path="/receptionist/existing-patient" element={<ExistingPatient />} />
        <Route path="/existing-patient" element={<ExistingPatient />} />
        <Route path="/patient-details/:patientId" element={<PatientDetails />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/consultation/:patientId" element={<Consultation />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
};