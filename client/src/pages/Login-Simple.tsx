/**
 * Login Page
 * Split-screen desktop aesthetic
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { toast } from 'sonner';
import { authApi } from '@/api';
import { Stethoscope, Mail, Lock } from 'lucide-react';
import { fadeInUp, scaleIn, staggerContainer, staggerItem } from '@/lib/animations';

const LoginSimple: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });

      if (response.success && response.user) {
        toast.success(`Welcome back, ${response.user.name}!`);

        if (response.user.role === 'receptionist') {
          navigate('/receptionist');
        } else if (response.user.role === 'doctor') {
          navigate('/doctor');
        }
      } else {
        toast.error(response.error || 'Invalid email or password');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'receptionist' | 'doctor') => {
    const credentials = {
      receptionist: { email: 'sarah.johnson@hospital.com', password: 'password123' },
      doctor: { email: 'doctor.chen@hospital.com', password: 'password123' },
    };

    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  return (
    <div className="min-h-screen bg-[#e7edf5] flex items-center justify-center p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="w-full max-w-4xl"
      >
        <motion.div
          variants={scaleIn}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row"
        >
          {/* Visual Panel */}
          <div className="lg:w-1/2 w-full flex flex-col bg-white">
            <div
              className="h-2/3 min-h-[230px] bg-cover bg-center"
              style={{
                backgroundImage: "url('/login.jpg')",
              }}
            />
            <div className="flex-1 bg-[#1f3fae] text-white px-8 py-6 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/70">Hospital Access</p>
                <h2 className="text-2xl font-semibold mt-4 leading-tight">
                  Welcome back to Hospital Management
                </h2>
                <p className="text-sm text-white/80 mt-3">
                  Secure desktop console for clinical, reception, and operations teams.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-[2px] h-12 bg-white/70" />
                <p className="text-sm text-white/80">
                  Two-factor authentication protected • HIPAA compliant
                </p>
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div className="lg:w-1/2 w-full bg-white px-10 py-12">
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Hospital Management System</p>
                  <h1 className="text-xl font-semibold text-slate-900">Staff Sign-In</h1>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-4">
                Enter your corporate credentials to access the desktop console.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <motion.div variants={staggerItem} className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="firstname.lastname@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-9 h-11 border-slate-200 text-sm focus-visible:ring-blue-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={staggerItem} className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-9 h-11 border-slate-200 text-sm focus-visible:ring-blue-500"
                  />
                </div>
              </motion.div>

              <motion.div variants={staggerItem}>
                <AnimatedButton
                  type="submit"
                  className="w-full h-11 bg-[#1f4ed8] hover:bg-[#1a46c6]"
                  loading={isLoading}
                  loadingText="Signing in..."
                >
                  Sign In
                </AnimatedButton>
              </motion.div>
            </form>

            <motion.div variants={staggerItem} className="mt-10 border-t pt-6">
              <p className="text-xs text-slate-500 mb-3 text-center uppercase tracking-[0.3em]">
                Demo Access
              </p>
              <div className="flex gap-3">
                <AnimatedButton
                  variant="outline"
                  className="flex-1 h-10"
                  onClick={() => fillDemoCredentials('receptionist')}
                >
                  Reception Desk
                </AnimatedButton>
                <AnimatedButton
                  variant="outline"
                  className="flex-1 h-10"
                  onClick={() => fillDemoCredentials('doctor')}
                >
                  Doctor Portal
                </AnimatedButton>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginSimple;
