/**
 * Doctor Dashboard - Clean Professional Layout
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Clock, User, Calendar } from "lucide-react";
import { toast } from "sonner";
import { authApi, appointmentsApi } from "@/api";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = authApi.getCurrentUser();

  // Fetch today's appointments
  const { data: todaysAppointments = [], isLoading: isLoadingToday } = useQuery(
    {
      queryKey: ["appointments", "today", currentUser?.id],
      queryFn: () =>
        appointmentsApi.getTodaysAppointments(currentUser?.id || ""),
      enabled: !!currentUser?.id,
    }
  );

  // Fetch tomorrow's appointments
  const { data: tomorrowsAppointments = [], isLoading: isLoadingTomorrow } =
    useQuery({
      queryKey: ["appointments", "tomorrow", currentUser?.id],
      queryFn: () =>
        appointmentsApi.getTomorrowsAppointments(currentUser?.id || ""),
      enabled: !!currentUser?.id,
    });

  // Fetch completed appointments (recent patients)
  const { data: recentPatients = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: ["appointments", "completed", currentUser?.id],
    queryFn: () =>
      appointmentsApi.getCompletedAppointments(currentUser?.id || "", 5),
    enabled: !!currentUser?.id,
  });

  const handleLogout = () => {
    authApi.logout();
    navigate("/");
  };

  const formatTime = appointmentsApi.formatAppointmentTime;

  return (
    <div className="w-screen h-screen bg-background flex flex-col overflow-hidden">
      {/* ---- Header ---- */}
      <header className="border-b bg-gradient-to-r from-primary to-secondary shadow-lg backdrop-blur-sm flex-shrink-0">
        <div className="w-full px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-medium text-white">Doctor Dashboard</h1>
            {currentUser && (
              <>
                <span className="text-white/70">•</span>
                <p className="text-sm font-medium text-white/90">
                  Welcome, {currentUser.name}
                </p>
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-0.5 rounded-md bg-white/20 text-white border-white/30"
                >
                  Doctor
                </Badge>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-white hover:bg-white/20 font-medium"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* ---- Content ---- */}
      <main className="flex-1 px-4 py-6 overflow-hidden">
        <div className="grid grid-cols-3 gap-4 h-full">
          {/* ---- Today's Appointments ---- */}
          <Card className="shadow-sm border h-full flex flex-col">
            <CardHeader className="bg-gray-100 border-b flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-gray-800 font-medium">
                <Clock className="w-5 h-5 text-primary" />
                Today's Appointments ({todaysAppointments.length})
              </CardTitle>
            </CardHeader>

            <CardContent className="py-4 space-y-3 flex-1 overflow-auto">
              {isLoadingToday ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingSpinner />
                </div>
              ) : todaysAppointments.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No appointments scheduled today
                  </p>
                </div>
              ) : (
                todaysAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 border rounded-md hover:bg-primary/10 hover:border-primary transition cursor-pointer space-y-2"
                    onClick={() => {
                      if (apt.patientNumber) {
                        navigate(`/doctor/consultation/${apt.patientNumber}`);
                      } else {
                        toast.error("Patient number not available");
                        console.error(
                          "Appointment missing patient number:",
                          apt
                        );
                      }
                    }}
                  >
                    {/* header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-base">
                          {apt.patientName}
                        </h3>
                      </div>
                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                        {formatTime(apt.dateTime)}
                      </Badge>
                    </div>

                    {/* aligned reason */}
                    <div className="text-left">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Reason:</span>{" "}
                        {apt.reason || "N/A"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* ---- Tomorrow's Appointments ---- */}
          <Card className="shadow-sm border h-full flex flex-col">
            <CardHeader className="bg-gray-100 border-b flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-gray-800 font-medium">
                <Calendar className="w-5 h-5 text-blue-600" />
                Tomorrow's Appointments ({tomorrowsAppointments.length})
              </CardTitle>
            </CardHeader>

            <CardContent className="py-4 space-y-3 flex-1 overflow-auto">
              {isLoadingTomorrow ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingSpinner />
                </div>
              ) : tomorrowsAppointments.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No appointments scheduled tomorrow
                  </p>
                </div>
              ) : (
                tomorrowsAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 border rounded-md hover:bg-blue-50 hover:border-blue-300 transition cursor-pointer space-y-2"
                    onClick={() => {
                      if (apt.patientNumber) {
                        navigate(`/doctor/patient/${apt.patientNumber}`);
                      } else {
                        toast.error("Patient number not available");
                        console.error(
                          "Appointment missing patient number:",
                          apt
                        );
                      }
                    }}
                  >
                    {/* header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-base">
                          {apt.patientName}
                        </h3>
                      </div>
                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                        {formatTime(apt.dateTime)}
                      </Badge>
                    </div>

                    {/* aligned reason */}
                    <div className="text-left">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Reason:</span>{" "}
                        {apt.reason || "N/A"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* ---- Recently Visited Patients ---- */}
          <Card className="shadow-sm border h-full flex flex-col">
            <CardHeader className="bg-gray-100 border-b flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-gray-800 font-medium">
                <User className="w-5 h-5 text-secondary" />
                Recently Visited Patients
              </CardTitle>
            </CardHeader>

            <CardContent className="py-4 space-y-3 flex-1 overflow-auto">
              {isLoadingRecent ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingSpinner />
                </div>
              ) : recentPatients.length === 0 ? (
                <div className="text-center py-6">
                  <User className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No recent patient visits
                  </p>
                </div>
              ) : (
                recentPatients.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 border rounded-md hover:bg-secondary/10 hover:border-secondary transition cursor-pointer space-y-2"
                    onClick={async () => {
                      // If appointment has a visit_id, navigate to view that visit
                      if (apt.visit_id) {
                        navigate(`/doctor/visit/${apt.visit_id}`);
                      } else {
                        // For completed appointments, there should be a visit
                        // Try to find the most recent visit for this patient
                        toast.error("Visit not found. Please contact support.");
                        console.error("Appointment has no visit_id:", apt);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-base">
                          {apt.patientName}
                        </h3>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-0.5"
                      >
                        Completed
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Last Visit:</span>{" "}
                      {formatTime(apt.dateTime)}
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
