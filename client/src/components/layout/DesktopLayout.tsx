/**
 * DesktopLayout Component
 * Professional desktop application layout with sidebar navigation
 * Hospital Management System
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  LogOut,
  Stethoscope,
  UserPlus,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
      active 
        ? 'bg-blue-600 text-white' 
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    )}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </button>
);

interface DesktopLayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  header?: React.ReactNode;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  children,
  title,
  actions,
  header
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isReceptionist = user?.role === 'receptionist';
  const isDoctor = user?.role === 'doctor';

  const receptionistNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/receptionist' },
    { icon: UserPlus, label: 'Register Patient', path: '/receptionist/register-patient' },
    { icon: Search, label: 'Find Patient', path: '/receptionist/existing-patient' },
  ];

  const doctorNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor' },
  ];

  const navItems = isReceptionist ? receptionistNavItems : doctorNavItems;

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-[260px] bg-slate-900 text-white flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-sm text-white">Hospital MS</h1>
              <p className="text-xs text-slate-400">Desktop App</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          {user && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white">{user.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {header ? (
          <header className="h-12 border-b bg-card flex items-center px-4 flex-shrink-0">
            {header}
          </header>
        ) : (title || actions) && (
          <header className="h-12 border-b bg-card flex items-center px-4 flex-shrink-0">
            {title && (
              <h2 className="font-semibold text-base">{title}</h2>
            )}
            {actions && (
              <div className="ml-auto">
                {actions}
              </div>
            )}
          </header>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DesktopLayout;
