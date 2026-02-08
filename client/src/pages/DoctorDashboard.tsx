/**
 * Doctor Dashboard
 * Desktop application style with sidebar navigation
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DesktopLayout } from "@/components/layout";
import { Clock, User, Calendar } from "lucide-react";
import { toast } from "sonner";
import { authApi, appointmentsApi } from "@/api";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { staggerContainer, staggerItem } from "@/lib/animations";

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = authApi.getCurrentUser();

  const { data: todaysAppointments = [], isLoading: isLoadingToday } = useQuery({
    queryKey: ["appointments", "today", currentUser?.id],
    queryFn: () => appointmentsApi.getTodaysAppointments(currentUser?.id || ""),
    enabled: !!currentUser?.id,
  });

  const { data: tomorrowsAppointments = [], isLoading: isLoadingTomorrow } = useQuery({
    queryKey: ["appointments", "tomorrow", currentUser?.id],
    queryFn: () => appointmentsApi.getTomorrowsAppointments(currentUser?.id || ""),
    enabled: !!currentUser?.id,
  });

  const { data: recentPatients = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: ["appointments", "completed", currentUser?.id],
    queryFn: () => appointmentsApi.getCompletedAppointments(currentUser?.id || "", 5),
    enabled: !!currentUser?.id,
  });

  const formatTime = appointmentsApi.formatAppointmentTime;

  const columns = [
    {
      title: `Today's Appointments (${todaysAppointments.length})`,
      icon: Clock,
      appointments: todaysAppointments,
      isLoading: isLoadingToday,
      emptyText: "No appointments today",
      onClick: (apt: any) => {
        if (apt.patientNumber) {
          navigate(`/doctor/consultation/${apt.patientNumber}`);
        } else {
          toast.error("Patient number not available");
        }
      },
    },
    {
      title: `Tomorrow's Appointments (${tomorrowsAppointments.length})`,
      icon: Calendar,
      appointments: tomorrowsAppointments,
      isLoading: isLoadingTomorrow,
      emptyText: "No appointments tomorrow",
      onClick: (apt: any) => {
        if (apt.patientNumber) {
          navigate(`/doctor/patient/${apt.patientNumber}`);
        } else {
          toast.error("Patient number not available");
        }
      },
    },
    {
      title: "Recently Visited",
      icon: User,
      appointments: recentPatients,
      isLoading: isLoadingRecent,
      emptyText: "No recent visits",
      onClick: (apt: any) => {
        if (apt.visit_id) {
          navigate(`/doctor/visit/${apt.visit_id}`);
        } else {
          toast.error("Visit not found");
        }
      },
      showCompleted: true,
    },
  ];

  return (
    <DesktopLayout title="Dashboard">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="h-full"
      >
        <div className="grid grid-cols-3 gap-4 h-full">
          {columns.map((column) => (
            <motion.div key={column.title} variants={staggerItem} className="h-full">
              <Card className="h-full flex flex-col">
                <CardHeader className="py-3 border-b bg-muted/50">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <column.icon className="w-4 h-4 text-primary" />
                    {column.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 overflow-auto p-3 space-y-2 scrollbar-thin">
                  {column.isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : column.appointments.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      {column.emptyText}
                    </div>
                  ) : (
                    column.appointments.map((apt: any, index: number) => (
                      <div
                        key={apt.id || index}
                        className="p-3 border rounded-md cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                        onClick={() => column.onClick(apt)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm">{apt.patientName}</span>
                          {'showCompleted' in column ? (
                            <Badge variant="secondary" className="text-xs">Completed</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">{formatTime(apt.dateTime)}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {'showCompleted' in column 
                            ? `Last Visit: ${formatTime(apt.dateTime)}`
                            : `Reason: ${apt.reason || "N/A"}`
                          }
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DesktopLayout>
  );
};

export default DoctorDashboard;
