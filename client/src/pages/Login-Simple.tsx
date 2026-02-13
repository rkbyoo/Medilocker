/**
 * Login Page
 * Professional medical staff portal - Reference UI design
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { toast } from 'sonner';
import { authApi } from '@/api';

const LoginSimple: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col font-['Public_Sans'] antialiased text-[#111318]">
      <div className="flex flex-1 w-full h-screen overflow-hidden">
        {/* Left Side: Hero Image Section */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 items-center justify-center overflow-hidden">
          {/* Background Image with Gradient Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/login.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#1246e2]/90 to-[#1246e2]/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[#1246e2]/40" />

          {/* Hero Content */}
          <div className="relative z-10 p-12 max-w-xl text-white flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-4 opacity-90">
              <MaterialIcon name="local_hospital" size={32} className="text-white" />
              <span className="text-lg font-bold tracking-wide uppercase">MedCore HMS</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white">
              Patient Care,
              <br />
              Secured.
            </h1>
            <p className="text-lg text-white/90 font-medium leading-relaxed max-w-md">
              Access the Hospital Management System securely. Unauthorized access is strictly
              prohibited and monitored.
            </p>
            <div className="mt-8 flex gap-4 text-sm text-white/70">
              <div className="flex items-center gap-1.5">
                <MaterialIcon name="verified_user" size={18} />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MaterialIcon name="lock" size={18} />
                <span>End-to-End Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative bg-[#f0f4f8]">
          {/* Floating White Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-[440px] bg-white p-8 md:p-10 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col gap-8"
          >
            {/* Header */}
            <div className="flex flex-col gap-1.5 text-center">
              <div className="mx-auto w-12 h-12 bg-[#1246e2]/10 rounded-full flex items-center justify-center mb-2 text-[#1246e2]">
                <MaterialIcon name="id_card" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Staff Portal</h2>
              <p className="text-[13px] text-gray-500 font-normal">
                Please sign in to access your dashboard.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              {/* Email Input */}
              <label className="flex flex-col gap-2 group">
                <span className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">
                  Hospital Email ID
                </span>
                <div className="relative flex items-center">
                  <MaterialIcon
                    name="mail"
                    size={20}
                    className="absolute left-4 text-gray-400"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@hospital.org"
                    required
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1246e2] focus:ring-1 focus:ring-[#1246e2] transition-all shadow-sm"
                  />
                </div>
              </label>

              {/* Password Input */}
              <label className="flex flex-col gap-2 group">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">
                    Password
                  </span>
                  <a
                    href="#"
                    className="text-[13px] text-[#1246e2] hover:text-blue-700 font-medium transition-colors"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative flex items-center">
                  <MaterialIcon
                    name="lock"
                    size={20}
                    className="absolute left-4 text-gray-400"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    disabled={isLoading}
                    className="w-full pl-11 pr-10 py-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1246e2] focus:ring-1 focus:ring-[#1246e2] transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                  >
                    <MaterialIcon
                      name={showPassword ? 'visibility_off' : 'visibility'}
                      size={20}
                    />
                  </button>
                </div>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full bg-[#1246e2] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md shadow-blue-500/20 text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-100" />
              <span className="flex-shrink-0 mx-4 text-xs text-gray-400 font-medium">
                FOR TESTING PURPOSES
              </span>
              <div className="flex-grow border-t border-gray-100" />
            </div>

            {/* Demo Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillDemoCredentials('receptionist')}
                className="w-full bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-600 font-semibold py-3 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
              >
                <MaterialIcon name="key" size={18} />
                Reception
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('doctor')}
                className="w-full bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-600 font-semibold py-3 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
              >
                <MaterialIcon name="stethoscope" size={18} />
                Doctor
              </button>
            </div>
          </motion.div>

          {/* Footer */}
          <div className="absolute bottom-6 w-full text-center px-6">
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
              Secure Connection • HIPAA Compliant • v2.0.4
            </p>
            <div className="mt-2 flex justify-center gap-4 text-[11px] text-gray-400">
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>
              <a href="#" className="hover:underline">
                Terms of Service
              </a>
              <a href="#" className="hover:underline">
                Help Center
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSimple;
