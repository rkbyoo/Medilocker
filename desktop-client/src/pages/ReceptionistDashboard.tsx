import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, ClipboardList, LogOut } from 'lucide-react';
import { authApi } from '@/api';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authApi.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-r from-primary to-secondary shadow-lg backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-foreground">Receptionist Dashboard</h1>
          <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:bg-white/20">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            What would you like to do?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary hover:scale-105 bg-gradient-to-br from-card to-primary/5"
              onClick={() => navigate('/receptionist/register-patient')}
            >
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mb-4 shadow-md">
                  <UserPlus className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">Register New Patient</CardTitle>
                <CardDescription className="text-base">
                  Register a new patient who doesn't have an NFC card
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md" size="lg">
                  Start Registration
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-secondary hover:scale-105 bg-gradient-to-br from-card to-secondary/5"
              onClick={() => navigate('/receptionist/existing-patient')}
            >
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/70 rounded-full flex items-center justify-center mb-4 shadow-md">
                  <ClipboardList className="w-8 h-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-2xl">Existing Patient</CardTitle>
                <CardDescription className="text-base">
                  Handle existing patient with NFC card or patient ID
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="default" className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 shadow-md" size="lg">
                  Lookup Patient
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReceptionistDashboard;
