/**
 * Receptionist Dashboard
 * Professional medical portal with Material Design
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { DesktopLayout } from '@/components/layout';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { useAuth } from '@/contexts';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get current date and time
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  // Get greeting based on time
  const hour = now.getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';

  // Recent activity data (mock data for now)
  const recentActivity = [
    { name: 'John Smith', id: 'PT-882145', activity: 'New Registration', status: 'Card Synced', statusColor: 'green' },
    { name: 'Sarah Connor', id: 'PT-992011', activity: 'Patient Lookup', status: 'Checked In', statusColor: 'blue' },
    { name: 'Michael Chang', id: 'PT-773402', activity: 'Insurance Update', status: 'Pending Docs', statusColor: 'orange' },
    { name: 'Emily Blunt', id: 'PT-123999', activity: 'Appointment Set', status: 'Card Synced', statusColor: 'green' },
    { name: 'Robert Downey', id: 'PT-445612', activity: 'New Registration', status: 'Card Synced', statusColor: 'green' },
  ];

  // Header content for the layout
  const headerContent = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-800">Receptionist Portal</h2>
        <div className="h-4 w-px bg-slate-300"></div>
        <div className="flex items-center gap-2 text-slate-500">
          <MaterialIcon name="calendar_today" size={18} />
          <span className="font-medium text-sm">{dayName}, {dateStr}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-slate-600">
          <MaterialIcon name="schedule" size={18} />
          <span className="font-bold text-sm">{timeStr}</span>
        </div>
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <MaterialIcon name="notifications" size={24} />
          <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white"></span>
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
        <div className="h-full flex flex-col space-y-6">
          {/* Welcome Section */}
          <motion.div variants={staggerItem}>
            <h3 className="text-xl font-bold text-slate-900">
              {greeting}, {user?.name?.split(' ')[0] || 'Receptionist'}
            </h3>
            <p className="text-slate-500 mt-1 text-sm">Ready for patient intake and scheduling.</p>
          </motion.div>

          {/* Action Cards */}
          <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Register New Patient Card */}
            <div 
              className="bg-white border border-slate-200 rounded p-6 flex flex-col items-center text-center shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => navigate('/receptionist/register-patient')}
            >
              <div className="size-16 rounded-full bg-blue-50 text-[#1246e2] flex items-center justify-center mb-4 group-hover:bg-[#1246e2] group-hover:text-white transition-colors">
                <MaterialIcon name="person_add" size={32} />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Register New Patient</h4>
              <p className="text-slate-500 mb-6 text-xs max-w-xs leading-relaxed">
                Input primary demographics, insurance details, and generate a new medical record ID.
              </p>
              <button className="w-full bg-[#1246e2] hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded flex items-center justify-center gap-2 transition-all text-sm">
                <MaterialIcon name="add" size={20} />
                Start Registration
              </button>
            </div>

            {/* Find Existing Patient Card */}
            <div 
              className="bg-white border border-slate-200 rounded p-6 flex flex-col items-center text-center shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => navigate('/receptionist/existing-patient')}
            >
              <div className="size-16 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors">
                <MaterialIcon name="search" size={32} />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Find Existing Patient</h4>
              <p className="text-slate-500 mb-6 text-xs max-w-xs leading-relaxed">
                Quick search by name, date of birth, or Hospital ID to view history or check-in.
              </p>
              <button className="w-full bg-white border border-slate-300 text-slate-700 font-bold py-2.5 px-6 rounded hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm">
                <MaterialIcon name="credit_card" size={20} />
                Open Search
              </button>
            </div>
          </motion.div>

          {/* Recent Activity Table */}
          <motion.div variants={staggerItem} className="flex-1 bg-white border border-slate-200 rounded shadow-sm overflow-hidden min-h-0">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MaterialIcon name="history" size={20} className="text-slate-400" />
                <h4 className="text-sm font-bold text-slate-800">Recent Activity</h4>
              </div>
              <button className="text-[#1246e2] text-[11px] font-bold uppercase tracking-wider hover:underline">
                View History
              </button>
            </div>
            <div className="overflow-auto h-[calc(100%-57px)]">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-6 py-3">Patient Name</th>
                    <th className="px-6 py-3">Patient ID</th>
                    <th className="px-6 py-3">Activity</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentActivity.map((item, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/receptionist/existing-patient?patientId=${item.id}`)}
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 text-sm">{item.name}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-sm">{item.id}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{item.activity}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter
                          ${item.statusColor === 'green' ? 'bg-green-50 text-green-700' : ''}
                          ${item.statusColor === 'blue' ? 'bg-blue-50 text-blue-700' : ''}
                          ${item.statusColor === 'orange' ? 'bg-orange-50 text-orange-700' : ''}
                        `}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          className="text-slate-400 hover:text-[#1246e2] transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/receptionist/existing-patient?patientId=${item.id}`);
                          }}
                        >
                          <MaterialIcon name="more_horiz" size={24} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
              Showing latest 5 receptionist activities.
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DesktopLayout>
  );
};

export default ReceptionistDashboard;
