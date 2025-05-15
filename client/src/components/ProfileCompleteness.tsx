import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";

interface ProfileCompletenessProps {
  score: number;
  profile: any;
  className?: string;
}

export function ProfileCompleteness({ score, profile, className = "" }: ProfileCompletenessProps) {
  const [progress, setProgress] = useState(0);
  
  // Animate progress on mount
  useEffect(() => {
    const timer = setTimeout(() => setProgress(score), 100);
    return () => clearTimeout(timer);
  }, [score]);
  
  const missingFields = getMissingFields(profile);
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          Profile Completeness
          {score === 100 ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : score > 70 ? (
            <Clock className="h-5 w-5 text-warning" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          )}
        </CardTitle>
        <CardDescription>
          Your profile is {score}% complete
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={progress} className="h-2" />
          
          {score < 100 && missingFields.length > 0 && (
            <div className="text-sm">
              <p className="font-medium mb-2">Complete your profile by adding:</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {missingFields.map((field, i) => (
                  <li key={i}>{field}</li>
                ))}
              </ul>
            </div>
          )}
          
          {score === 100 && (
            <div className="text-sm text-success">
              Great job! Your profile is complete.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to identify missing profile fields
function getMissingFields(profile: any): string[] {
  const missingFields: string[] = [];
  
  if (!profile) {
    return ["Create your tradesman profile"];
  }
  
  if (!profile.businessName || profile.businessName.trim() === "") {
    missingFields.push("Business name");
  }
  
  if (!profile.bio || profile.bio.trim() === "") {
    missingFields.push("Bio or description");
  }
  
  if (!profile.address || profile.address.trim() === "") {
    missingFields.push("Business address");
  }
  
  if (!profile.phone || profile.phone.trim() === "") {
    missingFields.push("Contact number");
  }
  
  if (!profile.hourlyRate) {
    missingFields.push("Hourly rate");
  }
  
  if (!profile.yearsOfExperience) {
    missingFields.push("Years of experience");
  }
  
  if (!profile.qualifications || profile.qualifications.trim() === "") {
    missingFields.push("Qualifications");
  }
  
  if (!profile.availability || profile.availability.trim() === "") {
    missingFields.push("Availability");
  }
  
  return missingFields;
}