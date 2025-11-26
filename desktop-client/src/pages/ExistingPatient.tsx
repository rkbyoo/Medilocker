import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Search, Nfc } from 'lucide-react';
import { patientsApi } from '@/api';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';

const ExistingPatient = () => {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');
  const [showNFCDialog, setShowNFCDialog] = useState(false);

  const handleSearch = () => {
    if (!patientId) {
      toast.error('Please enter a patient ID');
      return;
    }

    const foundPatient = patientsApi.getPatientById(patientId);
    if (foundPatient) {
      toast.success('Patient found! Redirecting...');
      navigate(`/patient-details/${patientId}`);
    } else {
      toast.error('Patient not found. Please check the ID.');
    }
  };



  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-gradient-to-r from-primary to-secondary shadow-lg sticky top-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/receptionist')} className="mr-4 text-primary-foreground hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary-foreground">Existing Patient Lookup</h1>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Patient ID Search */}
          <Card className="bg-gradient-to-br from-card to-accent/5 shadow-lg">
            <CardHeader>
              <CardTitle>Patient Lookup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="patientId" className="text-sm font-medium w-32 text-right flex-shrink-0">
                      10-Digit Patient ID
                    </Label>
                    <div className="flex-1 flex gap-2">
                      <Input
                        id="patientId"
                        placeholder="Enter patient ID"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        maxLength={10}
                        className="bg-background flex-1"
                      />
                      <Button onClick={handleSearch} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 flex-shrink-0"></div>
                    <p className="text-sm text-muted-foreground flex-1">
                      Try: 1234567890, 2345678901, or 3456789012
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowNFCDialog(true)}
                  variant="outline"
                  className="w-full border-2 border-dashed border-secondary hover:border-secondary hover:bg-secondary/10 h-20"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Nfc className="w-6 h-6 text-secondary" />
                    <span className="font-semibold">Scan NFC Card</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* NFC Dialog */}
          <AlertDialog open={showNFCDialog} onOpenChange={setShowNFCDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Nfc className="w-5 h-5 text-secondary" />
                  NFC Card Scanner
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3 pt-4">
                  <div className="flex items-center justify-center py-8">
                    <div className="relative">
                      <Nfc className="w-24 h-24 text-secondary animate-pulse" />
                      <div className="absolute inset-0 bg-secondary/20 rounded-full animate-ping" />
                    </div>
                  </div>
                  <p className="text-center font-semibold text-foreground">Hardware Integration Pending</p>
                  <p className="text-center text-sm">
                    NFC card scanning hardware is currently under testing and will be available soon.
                    Please use manual ID entry for now.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction>Close</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>


        </div>
      </main>
    </div>
  );
};

export default ExistingPatient; 
