/**
 * Receptionist Dashboard
 * Desktop application style with sidebar navigation
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DesktopLayout } from '@/components/layout';
import { staggerContainer, staggerItem } from '@/lib/animations';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Register New Patient',
      description: 'Create a new patient record',
      icon: UserPlus,
      path: '/receptionist/register-patient',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Find Patient',
      description: 'Search and manage existing patients',
      icon: ClipboardList,
      path: '/receptionist/existing-patient',
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
    },
  ];

  return (
    <DesktopLayout title="Dashboard">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-1">Welcome to Hospital Management System</h3>
          <p className="text-sm text-muted-foreground">Select an action to get started</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <motion.div key={action.path} variants={staggerItem} custom={index}>
              <Card 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(action.path)}
              >
                <CardHeader className="pb-3">
                  <div className={`w-10 h-10 ${action.bgColor} rounded-md flex items-center justify-center mb-3`}>
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <CardTitle className="text-base font-semibold">{action.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DesktopLayout>
  );
};

export default ReceptionistDashboard;
