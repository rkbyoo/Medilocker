/**
 * Doctor Dashboard - Clean Professional Layout
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Clock, User, Calendar } from 'lucide-react';
import { authApi, appointmentsApi } from '@/api';
import type { Appointment } from '@/types';

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const currentUser = authApi.getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      const doctorAppointments = appointmentsApi.getAppointmentsByDoctorId(currentUser.id);
      setAppointments(doctorAppointments);
    }
  }, []);

  const handleLogout = () => {
    authApi.logout();
    navigate('/');
  };

  const formatTime = appointmentsApi.formatAppointmentTime;

  const todaysAppointments = currentUser 
    ? appointmentsApi.getTodaysAppointments(currentUser.id)
    : [];

  const recentPatients = currentUser
    ? appointmentsApi.getCompletedAppointments(currentUser.id, 5)
    : [];

  return (
    <div className="min-h-screen bg-background">
      
      {/* ---- Header ---- */}
      <header className="border-b bg-gradient-to-r from-primary to-secondary shadow-lg backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Doctor Dashboard</h1>
          <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/20">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* ---- Welcome Section ---- */}
      {currentUser && (
        <div className="container mx-auto px-6 py-5 flex items-center gap-3">
          <p className="text-lg font-medium text-gray-800">Welcome, {currentUser.name}</p>
          <Badge variant="secondary" className="text-[11px] px-2 py-0.5 rounded-md">
            Doctor
          </Badge>
        </div>
      )}

      {/* ---- Content ---- */}
      <main className="container mx-auto px-6 pb-12">
        
        <div className="grid lg:grid-cols-2 gap-6 max-w-7xl mx-auto">

          {/* ---- Today's Appointments ---- */}
          <Card className="shadow-sm border">
            <CardHeader className="bg-gray-100 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Clock className="w-5 h-5 text-primary" />
                Today's Appointments ({todaysAppointments.length})
              </CardTitle>
            </CardHeader>

            <CardContent className="py-5 space-y-3">
              {todaysAppointments.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No appointments scheduled today</p>
                </div>
              ) : (
                todaysAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 border rounded-md hover:bg-primary/10 hover:border-primary transition cursor-pointer space-y-2"
                    onClick={() => navigate(`/doctor/consultation/${apt.patientId}`)}
                  >
                    {/* header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{apt.patientName}</h3>
                      </div>
                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                        {formatTime(apt.dateTime)}
                      </Badge>
                    </div>

                    {/* aligned reason */}
                    <div className="text-left">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Reason:</span> {apt.reason}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>


          {/* ---- Recently Visited Patients ---- */}
          <Card className="shadow-sm border">
            <CardHeader className="bg-gray-100 border-b">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <User className="w-5 h-5 text-secondary" />
                Recently Visited Patients
              </CardTitle>
            </CardHeader>

            <CardContent className="py-5 space-y-3">
              {recentPatients.length === 0 ? (
                <div className="text-center py-6">
                  <User className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No recent patient visits</p>
                </div>
              ) : (
                recentPatients.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 border rounded-md hover:bg-secondary/10 hover:border-secondary transition cursor-pointer space-y-2"
                    onClick={() => navigate(`/doctor/consultation/${apt.patientId}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{apt.patientName}</h3>
                      </div>
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        Completed
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Last Visit:</span> {formatTime(apt.dateTime)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
