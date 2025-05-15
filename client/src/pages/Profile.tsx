import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { VALIDATION_PATTERNS } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import ProfileCompleteness from "@/components/ProfileCompleteness";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  User,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  AlertTriangle,
  Check
} from "lucide-react";

// Validation schema for user profile
const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name must be at most 100 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().refine(val => !val || VALIDATION_PATTERNS.phone.test(val), {
    message: "Invalid phone number format"
  }),
  location: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user, tradesmanProfile, updateUser, refreshUserData } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
      bio: user?.bio || "",
    },
  });
  
  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      await updateUser(values);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      // Refresh user data
      await refreshUserData();
      
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Your Profile | TradeLink</title>
        <meta name="description" content="Manage your TradeLink profile and account settings" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
            <p className="text-muted-foreground">
              Manage your account information and settings
            </p>
          </div>
          
          {user?.role === "tradesman" && (
            <div className="flex gap-3">
              {tradesmanProfile ? (
                <Button asChild>
                  <Link href="/edit-profile">Edit Tradesman Profile</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/create-profile">Create Tradesman Profile</Link>
                </Button>
              )}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal">
              <TabsList className="mb-6">
                <TabsTrigger value="personal">Personal Information</TabsTrigger>
                {tradesmanProfile && (
                  <TabsTrigger value="business">Business Information</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>
                      Update your personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormDescription>
                                Your full name as you'd like it to appear on your profile
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="example@email.com" {...field} />
                              </FormControl>
                              <FormDescription>
                                Your email address for account notifications
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone (optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="+1 123 456 7890" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Your contact phone number
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location (optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="City, State" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Your city and state for improved search results
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio (optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us a bit about yourself..."
                                  className="resize-none min-h-[120px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                A brief description about you and your interests
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end">
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {tradesmanProfile && (
                <TabsContent value="business">
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Information</CardTitle>
                      <CardDescription>
                        Your tradesman profile details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Business Name</h3>
                          <p className="font-medium">{tradesmanProfile.businessName}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Trade</h3>
                          <Badge className="capitalize">
                            {tradesmanProfile.trade.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Years of Experience</h3>
                          <p>{tradesmanProfile.experience} years</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Hourly Rate</h3>
                          <p>
                            {tradesmanProfile.hourlyRate 
                              ? `$${tradesmanProfile.hourlyRate}/hour` 
                              : "Not specified"
                            }
                          </p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">License Number</h3>
                          <p>{tradesmanProfile.licenseNumber || "Not specified"}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Insurance Info</h3>
                          <p>{tradesmanProfile.insuranceInfo || "Not specified"}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Qualifications</h3>
                        <p>{tradesmanProfile.qualifications || "Not specified"}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Availability</h3>
                        <p>{tradesmanProfile.availability || "Not specified"}</p>
                      </div>
                      
                      <Alert>
                        <AlertTitle className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          Profile Completeness: {tradesmanProfile.completenessScore}%
                        </AlertTitle>
                        <AlertDescription>
                          {tradesmanProfile.completenessScore < 100 
                            ? "Complete your profile to improve visibility in search results." 
                            : "Your profile is complete! This helps you rank higher in search results."
                          }
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                    <CardFooter>
                      <Button asChild>
                        <Link href="/edit-profile">Edit Business Profile</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user?.avatarUrl} alt={user?.fullName || ""} />
                    <AvatarFallback className="text-xl">
                      {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-xl font-bold">{user?.fullName}</h2>
                  <Badge className="mt-1 capitalize">{user?.role}</Badge>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user?.username}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  
                  {user?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user?.phone}</span>
                    </div>
                  )}
                  
                  {user?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user?.location}</span>
                    </div>
                  )}
                </div>
                
                {user?.bio && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium mb-2">About</h3>
                      <p className="text-sm text-muted-foreground">{user.bio}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {user?.role === "client" && (
              <Card>
                <CardHeader>
                  <CardTitle>Become a Tradesman</CardTitle>
                  <CardDescription>
                    Create a professional profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    Showcase your skills, get hired, and manage your contracts through our platform.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">✓</div>
                      <span className="text-sm">Professional portfolio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">✓</div>
                      <span className="text-sm">Digital contracts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">✓</div>
                      <span className="text-sm">Secure payments</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/create-profile">Create Tradesman Profile</Link>
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {user?.role === "tradesman" && !tradesmanProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Tradesman profile missing</AlertTitle>
                    <AlertDescription>
                      You need to create a tradesman profile to showcase your services and get hired.
                    </AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href="/create-profile">Create Tradesman Profile</Link>
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {tradesmanProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Completeness</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileCompleteness profile={tradesmanProfile} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
