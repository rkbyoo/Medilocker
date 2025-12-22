/**
 * Simple Login Page
 * Basic version without complex dependencies
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { authApi } from '@/api';
import { Stethoscope } from 'lucide-react';

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
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-0 overflow-hidden">
      <Card className="w-full max-w-lg shadow-lg border-2 mx-4">
        <CardHeader className="space-y-3 text-center bg-gradient-to-r from-accent to-accent/50">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-md">
            <Stethoscope className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Medical Management System
          </CardTitle>
          <CardDescription>Sign in to access your dashboard</CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex items-center gap-4">
              <label htmlFor="email" className="text-sm font-medium w-24 text-right flex-shrink-0">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 focus:border-primary flex-1"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="password" className="text-sm font-medium w-24 text-right flex-shrink-0">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-2 focus:border-primary flex-1"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gradient-to-br from-muted to-muted/50 rounded-lg space-y-3 border">
            <p className="text-sm font-medium text-muted-foreground">Demo Credentials:</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => fillDemoCredentials('receptionist')}
              >
                Receptionist
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => fillDemoCredentials('doctor')}
              >
                Doctor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginSimple;