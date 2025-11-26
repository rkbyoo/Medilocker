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
    <Card className="bg-white border rounded-xl shadow-sm max-w-2xl mx-auto overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b bg-gray-50 text-center">
        <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white border shadow-sm flex items-center justify-center">
          <User className="w-10 h-10 text-primary" />
        </div>

        <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
        <p className="text-sm text-muted-foreground">{patient.id}</p>

        <div className="flex justify-center gap-2 mt-2">
          <Badge variant="secondary">
            {calculateAge(patient.dateOfBirth)} yrs • {patient.gender}
          </Badge>
          {patient.bloodGroup && <Badge variant="outline" className="font-semibold">{patient.bloodGroup}</Badge>}
        </div>
      </div>


      {/* Content */}
      <CardContent className="px-6 py-6 space-y-6">

        {/* Basic Section */}
        <SectionTitle title="Patient Information" />

        <DetailsGrid>
          <Detail label="Phone" value={patient.phoneNumber} icon={<Phone />} />
          <Detail label="DOB" value={new Date(patient.dateOfBirth).toLocaleDateString()} icon={<Calendar />} />
          <Detail label="Address" value={patient.address} icon={<MapPin />} fullWidth />
        </DetailsGrid>

        {/* Expandable */}
        {variant === "detailed" && showExpandableDetails && (
          <>
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
