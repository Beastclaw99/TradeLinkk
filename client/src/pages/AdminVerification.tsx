import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  Loader2,
  User,
  Building,
  Briefcase,
  FileText,
} from "lucide-react";

interface Profile {
  id: number;
  userId: number;
  businessName: string;
  trade: string;
  licenseNumber: string | null;
  insuranceInfo: string | null;
  qualifications: string | null;
  experience: number;
  verificationStatus: "pending" | "verified" | "rejected";
  verificationDate: string | null;
  verificationDocuments: string | null;
  verificationNotes: string | null;
}

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
}

interface PendingVerification {
  profile: Profile;
  user: User;
}

export default function AdminVerification() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Record<number, string>>({});

  // Only allow admin users to view this page
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground text-center mb-6">
              You need admin privileges to access this page.
            </p>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch pending verifications
  const { data, isLoading, error } = useQuery<PendingVerification[]>({
    queryKey: ["/api/verification/pending"],
  });

  // Update verification status mutation
  const updateVerificationMutation = useMutation({
    mutationFn: ({ profileId, status, notes }: { profileId: number; status: "verified" | "rejected"; notes: string }) => {
      return apiRequest("POST", `/api/verification/${profileId}`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/verification/pending"] });
      toast({
        title: "Status Updated",
        description: "The verification status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update verification status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle verification approval/rejection
  const handleVerification = (profileId: number, status: "verified" | "rejected") => {
    updateVerificationMutation.mutate({
      profileId,
      status,
      notes: notes[profileId] || "",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Error Loading Verifications</h2>
            <p className="text-muted-foreground text-center mb-6">
              We couldn't load the pending verifications. Please try again later.
            </p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/verification/pending"] })}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Verification Management | TradeLink</title>
        <meta name="description" content="Manage tradesman verifications" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate("/")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-6">Verification Management</h1>
        
        {data && data.length > 0 ? (
          <div className="grid gap-6">
            {data.map((item) => (
              <Card key={item.profile.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{item.profile.businessName}</CardTitle>
                      <CardDescription>
                        {item.user.fullName} - {item.user.email}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Pending Verification
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-2">
                        <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Tradesman</p>
                          <p>{item.user.fullName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Building className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Business</p>
                          <p>{item.profile.businessName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Trade & Experience</p>
                          <p className="capitalize">{item.profile.trade} - {item.profile.experience} years</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {item.profile.licenseNumber && (
                        <div className="flex items-start gap-2">
                          <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">License Number</p>
                            <p>{item.profile.licenseNumber}</p>
                          </div>
                        </div>
                      )}
                      
                      {item.profile.insuranceInfo && (
                        <div className="flex items-start gap-2">
                          <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Insurance Info</p>
                            <p>{item.profile.insuranceInfo}</p>
                          </div>
                        </div>
                      )}
                      
                      {item.profile.verificationDocuments && (
                        <div className="flex items-start gap-2">
                          <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Submitted Documents</p>
                            <p>{item.profile.verificationDocuments}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-2">
                      Verification Notes
                    </label>
                    <Textarea
                      placeholder="Enter notes about verification decision..."
                      className="resize-none"
                      value={notes[item.profile.id] || ""}
                      onChange={(e) => setNotes({...notes, [item.profile.id]: e.target.value})}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                    onClick={() => handleVerification(item.profile.id, "rejected")}
                    disabled={updateVerificationMutation.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                    onClick={() => handleVerification(item.profile.id, "verified")}
                    disabled={updateVerificationMutation.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verify
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">No Pending Verifications</h2>
              <p className="text-muted-foreground text-center">
                There are no tradesman profiles pending verification at this time.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}