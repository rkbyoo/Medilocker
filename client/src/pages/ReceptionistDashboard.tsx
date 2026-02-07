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
    <div className="w-screen h-screen bg-background overflow-hidden flex flex-col">
      <header className="border-b bg-gradient-to-r from-primary to-secondary shadow-lg backdrop-blur-sm flex-shrink-0">
        <div className="w-full px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-medium text-primary-foreground">Receptionist Dashboard</h1>
          <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:bg-white/20 text-base font-medium">
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 px-8 py-8 overflow-hidden flex items-center justify-center">
        <div className="w-full max-w-7xl">
          <h2 className="text-3xl font-medium mb-12 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            What would you like to do?
          </h2>

          <div className="grid grid-cols-2 gap-12 max-w-5xl mx-auto">
            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary hover:scale-105 bg-gradient-to-br from-card to-primary/5 h-80"
              onClick={() => navigate('/receptionist/register-patient')}
            >
              <CardHeader className="pb-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mb-6 shadow-lg mx-auto">
                  <UserPlus className="w-10 h-10 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl font-medium">Register New Patient</CardTitle>
                <CardDescription className="text-base font-medium mt-3">
                  Register a new patient who doesn't have an NFC card
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-6">
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md font-medium text-base" size="lg">
                  Start Registration
                </Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-secondary hover:scale-105 bg-gradient-to-br from-card to-secondary/5 h-80"
              onClick={() => navigate('/receptionist/existing-patient')}
            >
              <CardHeader className="pb-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary/70 rounded-full flex items-center justify-center mb-6 shadow-lg mx-auto">
                  <ClipboardList className="w-10 h-10 text-secondary-foreground" />
                </div>
                <CardTitle className="text-2xl font-medium">Existing Patient</CardTitle>
                <CardDescription className="text-base font-medium mt-3">
                  Handle existing patient with NFC card or patient ID
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-6">
                <Button variant="default" className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 shadow-md font-medium text-base" size="lg">
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
