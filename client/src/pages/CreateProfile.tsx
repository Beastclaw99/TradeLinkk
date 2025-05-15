import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
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
import { 
  AlertCircle, 
  CheckCircle 
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

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

const CreateProfile = () => {
  const { user, refreshUserData } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // Form submission handler
  const onSubmit = async (values: TradeProfileFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a profile",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create tradesman profile
      await apiRequest("POST", "/api/tradesman-profiles", values);
      
      toast({
        title: "Profile created!",
        description: "Your tradesman profile has been created successfully",
      });
      
      // Refresh user data to update role and get profile info
      await refreshUserData();
      
      // Redirect to dashboard
      navigate("/dashboard");
      
    } catch (error: any) {
      toast({
        title: "Error creating profile",
        description: error.message || "There was an error creating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If the user already has a tradesman profile, redirect them
  if (user?.role === "tradesman") {
    navigate("/edit-profile");
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>Create Tradesman Profile | TradeLink</title>
        <meta name="description" content="Create your professional tradesman profile on TradeLink and start getting hired" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Create Tradesman Profile</h1>
          <p className="text-muted-foreground mb-8">
            Set up your professional profile to showcase your skills and get hired
          </p>
          
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Creating a tradesman profile will convert your account from a client account to a tradesman account.
              You'll be able to showcase your services, receive job inquiries, create contracts, and process payments.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Enter details about your trade business
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
                  
                  <Alert className="bg-primary/10 text-primary border-primary">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Profile Completion Tips</AlertTitle>
                    <AlertDescription>
                      Complete as many fields as possible to improve your profile's visibility in search results.
                      After creating your profile, you can add project examples to showcase your work.
                    </AlertDescription>
                  </Alert>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Profile..." : "Create Profile"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CreateProfile;
