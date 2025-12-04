import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Calendar,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  Activity,
  AlertCircle,
  UserRoundSearch,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { patientsApi } from "@/api";
import type { Patient } from "@/types";

interface Props {
  patient: Patient;
  variant?: "compact" | "detailed";
  showExpandableDetails?: boolean;
}

const PatientInfoCard = ({ patient, variant = "detailed", showExpandableDetails = true }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const calculateAge = patientsApi.calculateAge;

  return (
    <Card className={`bg-white border rounded-xl shadow-sm w-full ${showExpandableDetails ? 'h-full' : 'h-fit max-h-full'} overflow-hidden flex flex-col`}>

      {/* Header */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center gap-4">
          {/* Smaller Profile Picture */}
          <div className="w-16 h-16 rounded-full bg-white border shadow-sm flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-primary" />
          </div>
          
          {/* Basic Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{patient.name}</h2>
            <p className="text-sm text-muted-foreground mb-2">ID: {patient.id}</p>
            
            {/* Key Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">{calculateAge(patient.dateOfBirth)} years</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium">{patient.gender}</span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-3 h-3 text-gray-400" />
                <span className="font-medium">{patient.phoneNumber}</span>
                {patient.bloodGroup && (
                  <>
                    <span className="text-gray-400">•</span>
                    <Badge variant="outline" className="text-xs font-semibold">{patient.bloodGroup}</Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Content */}
      <CardContent className={`px-6 ${showExpandableDetails ? 'py-6 space-y-6 flex-1 overflow-auto' : 'py-4 space-y-4 overflow-hidden'}`}>

        {/* Basic Section */}
        <SectionTitle title="Patient Information" />

        <DetailsGrid>
          <Detail label="Date of Birth" value={new Date(patient.dateOfBirth).toLocaleDateString()} icon={<Calendar />} />
          <Detail label="Address" value={patient.address} icon={<MapPin />} fullWidth />
        </DetailsGrid>

        {/* Additional Details */}
        {variant === "detailed" && (
          <>
            {showExpandableDetails ? (
              <Collapsible open={expanded} onOpenChange={setExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between px-0 text-sm font-medium">
                    View Additional Details
                    {expanded ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="pt-4 space-y-6">
                  <SectionTitle title="Personal Profile" />

                  <DetailsGrid>
                    <Detail label="Guardian Phone" value={patient.guardianPhone} icon={<UserRoundSearch />} />
                    <Detail label="Marital Status" value={patient.maritalStatus} />
                    {patient.spouseName && <Detail label="Spouse Name" value={patient.spouseName} />}
                    <Detail label="Nationality" value={patient.nationality} />
                    <Detail label="Religion" value={patient.religion} />
                    <Detail label="Caste" value={patient.caste} />

                    <Detail
                      label="Emergency Contact"
                      value={`${patient.emergencyContactName} (${patient.emergencyContactNumber})`}
                      icon={<Phone />}
                      fullWidth
                    />
                  </DetailsGrid>

                  {/* Allergies */}
                  {patient.allergies.length > 0 && (
                    <>
                      <SectionTitle title="Allergies" />
                      <BadgeBlock icon={<AlertCircle className="text-red-500" />}>
                        {patient.allergies.map((a, i) => (
                          <Badge key={i} variant="destructive">{a}</Badge>
                        ))}
                      </BadgeBlock>
                    </>
                  )}

                  {/* Chronic Conditions */}
                  {patient.chronicConditions.length > 0 && (
                    <>
                      <SectionTitle title="Chronic Conditions" />
                      <BadgeBlock icon={<Activity className="text-blue-600" />}>
                        {patient.chronicConditions.map((c, i) => (
                          <Badge key={i} variant="secondary">{c}</Badge>
                        ))}
                      </BadgeBlock>
                    </>
                  )}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              // Show compact details without collapsible when showExpandableDetails is false
              <div className="space-y-4">
                <SectionTitle title="Personal Profile" />

                <DetailsGrid>
                  <Detail label="Guardian Phone" value={patient.guardianPhone} icon={<UserRoundSearch />} />
                  <Detail label="Marital Status" value={patient.maritalStatus} />
                  {patient.spouseName && <Detail label="Spouse Name" value={patient.spouseName} />}
                  <Detail label="Nationality" value={patient.nationality} />
                  
                  <Detail
                    label="Emergency Contact"
                    value={`${patient.emergencyContactName} (${patient.emergencyContactNumber})`}
                    icon={<Phone />}
                    fullWidth
                  />
                </DetailsGrid>

                {/* Allergies - Compact display */}
                {patient.allergies.length > 0 && (
                  <div className="space-y-2">
                    <SectionTitle title="Allergies" />
                    <BadgeBlock icon={<AlertCircle className="text-red-500" />}>
                      {patient.allergies.slice(0, 3).map((a, i) => (
                        <Badge key={i} variant="destructive" className="text-xs">{a}</Badge>
                      ))}
                      {patient.allergies.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{patient.allergies.length - 3} more</Badge>
                      )}
                    </BadgeBlock>
                  </div>
                )}

                {/* Chronic Conditions - Compact display */}
                {patient.chronicConditions.length > 0 && (
                  <div className="space-y-2">
                    <SectionTitle title="Chronic Conditions" />
                    <BadgeBlock icon={<Activity className="text-blue-600" />}>
                      {patient.chronicConditions.slice(0, 3).map((c, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                      {patient.chronicConditions.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{patient.chronicConditions.length - 3} more</Badge>
                      )}
                    </BadgeBlock>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientInfoCard;



/* ------------------- Sub Components ------------------- */

const DetailsGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
    {children}
  </div>
);

const Detail = ({
  label,
  value,
  icon,
  fullWidth = false,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}) => (
  <div className={`flex items-start gap-2 ${fullWidth ? "md:col-span-2" : ""}`}>
    {icon && <span className="text-gray-400 mt-[2px]">{icon}</span>}
    <span className="text-sm text-gray-500 w-24">{label}</span>
    <span className="text-sm font-medium text-gray-900 flex-1 leading-tight">{value}</span>
  </div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold border-b pb-1">
    {title}
  </p>
);

const BadgeBlock = ({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <div className="flex flex-wrap items-center gap-2">
    {icon}
    {children}
  </div>
);
