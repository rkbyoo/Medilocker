/**
 * Doctor Dashboard
 * Clinical overview with Material Design
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DesktopLayout } from "@/components/layout";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Badge } from "@/components/ui/badge";
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

  const getStatusBadge = (apt: any) => {
    const status = apt.status || 'Scheduled';
    switch (status) {
      case 'In Progress':
        return (
          <span className="bg-[#1246e2]/10 text-[#1246e2] text-[10px] font-bold px-2 py-0.5 rounded border border-[#1246e2]/20 uppercase">
            In Progress
          </span>
        );
      case 'Checked In':
        return (
          <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 uppercase">
            Checked In
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 uppercase">
            Scheduled
          </span>
        );
    }
  };

  // Header content
  const headerContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">Clinical Overview</h2>
        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 uppercase">
          On Service
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 relative">
          <MaterialIcon name="notifications" size={24} />
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
          <MaterialIcon name="settings" size={24} />
        </button>
      </div>
    </div>
  );

  return (
    <DesktopLayout header={headerContent}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="h-full p-6"
      >
        <div className="grid grid-cols-3 gap-6 h-full">
          {/* Column 1 - Today's Appointments */}
          <motion.div variants={staggerItem} className="flex flex-col gap-4 overflow-hidden">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="font-bold flex items-center gap-2 text-slate-800">
                <MaterialIcon name="today" size={16} className="text-[#1246e2]" />
                Today's Appointments
                <span className="bg-slate-200 text-slate-600 text-[11px] px-2 py-0.5 rounded-full ml-1">
                  {todaysAppointments.length}
                </span>
              </h3>
              <button className="text-[#1246e2] text-xs font-semibold hover:underline">View All</button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
              {isLoadingToday ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingSpinner />
                </div>
              ) : todaysAppointments.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500">
                  No appointments today
                </div>
              ) : (
                todaysAppointments.map((apt: any, index: number) => (
                  <div
                    key={apt.id || index}
                    className={`bg-white border rounded-lg p-3 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer ${
                      apt.status === 'In Progress' ? 'border-[#1246e2]/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => {
                      if (apt.patientNumber) {
                        navigate(`/doctor/consultation/${apt.patientNumber}`);
                      } else {
                        toast.error("Patient number not available");
                      }
                    }}
                  >
                    {apt.status === 'In Progress' && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#1246e2]"></div>
                    )}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${
                            apt.status === 'In Progress' ? 'text-[#1246e2]' : 'text-slate-400'
                          }`}>
                            {formatTime(apt.dateTime)}
                          </p>
                          <h4 className="text-base font-bold text-slate-900">{apt.patientName}</h4>
                        </div>
                        {getStatusBadge(apt)}
                      </div>
                      <p className="text-slate-600 text-[13px] leading-relaxed">
                        {apt.reason || "General Consultation"}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                        <div className="flex -space-x-2">
                          <div className="size-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {currentUser?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                        </div>
                        {apt.status === 'In Progress' ? (
                          <button className="bg-[#1246e2] hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-all">
                            <MaterialIcon name="play_arrow" size={14} />
                            Resume Consult
                          </button>
                        ) : apt.status === 'Checked In' ? (
                          <button className="bg-[#1246e2] hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded flex items-center gap-1.5">
                            <MaterialIcon name="medical_services" size={14} />
                            Start Consult
                          </button>
                        ) : (
                          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded flex items-center gap-1.5">
                            <MaterialIcon name="medical_services" size={14} />
                            Start Consult
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Column 2 - Tomorrow's Schedule */}
          <motion.div variants={staggerItem} className="flex flex-col gap-4 overflow-hidden bg-slate-200/40 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="font-bold flex items-center gap-2 text-slate-800">
                <MaterialIcon name="event" size={16} className="text-slate-500" />
                Tomorrow's Schedule
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
              {isLoadingTomorrow ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingSpinner />
                </div>
              ) : tomorrowsAppointments.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500">
                  No appointments tomorrow
                </div>
              ) : (
                tomorrowsAppointments.map((apt: any, index: number) => (
                  <div
                    key={apt.id || index}
                    className="bg-white border border-slate-200 p-2.5 rounded-lg flex items-center gap-3 shadow-sm hover:border-[#1246e2]/30 cursor-pointer transition-colors"
                    onClick={() => {
                      if (apt.patientNumber) {
                        navigate(`/doctor/patient/${apt.patientNumber}`);
                      } else {
                        toast.error("Patient number not available");
                      }
                    }}
                  >
                    <div className="flex flex-col items-center justify-center bg-slate-100 min-w-12 h-12 rounded">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {formatTime(apt.dateTime).split(' ')[0]}
                      </span>
                      <span className="text-sm font-bold text-slate-700">
                        {formatTime(apt.dateTime).split(' ')[1]}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <h5 className="font-bold text-sm text-slate-900">{apt.patientName}</h5>
                      <p className="text-xs text-slate-500 truncate">{apt.reason || "General Consultation"}</p>
                    </div>
                    <MaterialIcon name="chevron_right" size={20} className="text-slate-300 ml-auto" />
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Column 3 - Recently Seen */}
          <motion.div variants={staggerItem} className="flex flex-col gap-4 overflow-hidden">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="font-bold flex items-center gap-2 text-slate-800">
                <MaterialIcon name="history" size={16} className="text-green-500" />
                Recently Seen
              </h3>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <MaterialIcon name="filter_list" size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-2">
              {isLoadingRecent ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingSpinner />
                </div>
              ) : recentPatients.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500">
                  No recent visits
                </div>
              ) : (
                recentPatients.map((apt: any, index: number) => (
                  <div
                    key={apt.id || index}
                    className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer group shadow-sm"
                    onClick={() => {
                      if (apt.visit_id) {
                        navigate(`/doctor/visit/${apt.visit_id}`);
                      } else {
                        toast.error("Visit not found");
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {apt.status === 'Completed' ? (
                        <div className="size-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold text-xs">
                          <MaterialIcon name="check_circle" size={16} />
                        </div>
                      ) : (
                        <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                          {apt.patientName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 overflow-hidden">
                        <h6 className="font-bold text-slate-900 truncate">{apt.patientName}</h6>
                        <p className="text-[11px] text-slate-500">
                          Seen {formatTime(apt.dateTime)} • {apt.status || 'Completed'}
                        </p>
                      </div>
                    </div>
                    <div className={`flex gap-2 ${apt.status === 'Completed' ? 'opacity-0 group-hover:opacity-100' : ''} transition-opacity`}>
                      {apt.status === 'Pending' ? (
                        <>
                          <button className="flex-1 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 py-1.5 rounded border border-slate-200">
                            Open Chart
                          </button>
                          <button className="flex-1 text-[10px] font-bold bg-[#1246e2]/10 hover:bg-[#1246e2]/20 text-[#1246e2] py-1.5 rounded border border-[#1246e2]/20">
                            Finalize Note
                          </button>
                        </>
                      ) : (
                        <button className="w-full text-[10px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 py-1.5 rounded border border-slate-200">
                          Review Summary
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="shrink-0 mt-auto pt-4">
              <button className="w-full py-3 rounded-lg border-2 border-[#1246e2] text-[#1246e2] font-bold flex items-center justify-center gap-2 hover:bg-[#1246e2] hover:text-white transition-all shadow-sm">
                <MaterialIcon name="add" size={20} />
                Ad-hoc Consultation
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DesktopLayout>
  );
};

export default DoctorDashboard;
