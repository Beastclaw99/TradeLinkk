import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { TRADES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import ProfileCompleteness from "@/components/ProfileCompleteness";

// Validation schema
const tradeProfileSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters").max(100, "Business name must be at most 100 characters"),
  trade: z.string().min(1, "Please select a trade"),
  experience: z.coerce.number().int().min(0, "Experience must be at least 0 years").max(100, "Experience must be at most 100 years"),
  hourlyRate: z.coerce.number().int().min(0, "Hourly rate must be at least 0").max(1000, "Hourly rate must be at most 1000").optional(),
  licenseNumber: z.string().optional(),
  insuranceInfo: z.string().optional(),
  qualifications: z.string().optional(),
  availability: z.string().optional(),
});

type TradeProfileFormValues = z.infer<typeof tradeProfileSchema>;

const EditProfile = () => {
  const { user, tradesmanProfile, updateTradesmanProfile, refreshUserData } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize form
  const form = useForm<TradeProfileFormValues>({
    resolver: zodResolver(tradeProfileSchema),
    defaultValues: {
      businessName: "",
      trade: "",
      experience: 0,
      hourlyRate: undefined,
      licenseNumber: "",
      insuranceInfo: "",
      qualifications: "",
      availability: "",
    },
  });
  
  // Load tradesman profile data into the form
  useEffect(() => {
    if (tradesmanProfile) {
      form.reset({
        businessName: tradesmanProfile.businessName,
        trade: tradesmanProfile.trade,
        experience: tradesmanProfile.experience,
        hourlyRate: tradesmanProfile.hourlyRate,
        licenseNumber: tradesmanProfile.licenseNumber || "",
        insuranceInfo: tradesmanProfile.insuranceInfo || "",
        qualifications: tradesmanProfile.qualifications || "",
        availability: tradesmanProfile.availability || "",
      });
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [tradesmanProfile, form]);
  
  // Form submission handler
  const onSubmit = async (values: TradeProfileFormValues) => {
    if (!user || !tradesmanProfile) {
      toast({
        title: "Error",
        description: "Profile information not found",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update tradesman profile
      await updateTradesmanProfile(values);
      
      toast({
        title: "Profile updated",
        description: "Your tradesman profile has been updated successfully",
      });
      
      // Refresh user data to get updated profile
      await refreshUserData();
      
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If the user doesn't have a tradesman profile, redirect them
  if (!isLoading && user?.role !== "tradesman") {
    navigate("/create-profile");
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Edit Tradesman Profile | TradeLink</title>
        <meta name="description" content="Edit your professional tradesman profile on TradeLink" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Edit Tradesman Profile</h1>
          <p className="text-muted-foreground mb-8">
            Update your professional profile information
          </p>
          
          {tradesmanProfile && (
            <div className="mb-8">
              <ProfileCompleteness profile={tradesmanProfile} />
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Update your trade business details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Smith Carpentry Services" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be displayed prominently on your profile
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="trade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Trade *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your primary trade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TRADES.map((trade) => (
                              <SelectItem key={trade.value} value={trade.value}>
                                {trade.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the main trade that best describes your services
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience *</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormDescription>
                            How many years you've been working in this trade
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate (USD)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              placeholder="0" 
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Your typical hourly rate (leave empty if you prefer to quote per project)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., LIC-12345" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your professional or trade license number, if applicable
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="insuranceInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Insurance Information</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Insured with HomeGuard" {...field} />
                          </FormControl>
                          <FormDescription>
                            Information about your business insurance
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="qualifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualifications</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g., Certified Master Carpenter, Journeyman Electrician..."
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          List your certifications, credentials, and specialized training
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Weekdays 8am-5pm" {...field} />
                        </FormControl>
                        <FormDescription>
                          When you're typically available for work
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/profile")}>
                Cancel
              </Button>
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving Changes..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="mt-8 flex justify-between">
            <Button variant="outline" asChild>
              <a href="/profile">Back to Profile</a>
            </Button>
            <Button variant="default" asChild>
              <a href="/projects">Manage Projects</a>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
