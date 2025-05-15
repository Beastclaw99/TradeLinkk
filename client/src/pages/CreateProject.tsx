import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import ImageUploader from "@/components/ImageUploader";
import { 
  Info,
  AlertTriangle, 
  ImageIcon 
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

// Validation schema
const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be at most 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000, "Description must be at most 1000 characters"),
  location: z.string().optional(),
  completionDate: z.string().optional(),
  budget: z.string().optional(),
  featured: z.boolean().default(false),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const CreateProject = () => {
  const { user, tradesmanProfile } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  // Initialize form
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      completionDate: "",
      budget: "",
      featured: false,
    },
  });
  
  // Form submission handler
  const onSubmit = async (values: ProjectFormValues) => {
    if (!user || !tradesmanProfile) {
      toast({
        title: "Error",
        description: "You must have a tradesman profile to create projects",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create project
      const response = await apiRequest("POST", "/api/projects", values);
      const data = await response.json();
      
      // Set project ID for image uploads
      setProjectId(data.id);
      
      toast({
        title: "Project created!",
        description: "Now you can add images to showcase your work.",
      });
      
      // Invalidate projects query
      queryClient.invalidateQueries({ 
        queryKey: [`/api/tradesman/${tradesmanProfile.id}/projects`] 
      });
      
      // After creating the project, allow for image uploads but don't navigate away yet
      
    } catch (error: any) {
      toast({
        title: "Error creating project",
        description: error.message || "There was an error creating your project. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  // Image upload handler
  const handleImageUpload = async (formData: FormData) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project must be created before uploading images",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await apiRequest("POST", `/api/projects/${projectId}/images`, formData, {
        headers: {
          // No Content-Type header needed as FormData sets it automatically
        }
      });
      
      const data = await response.json();
      
      // Add uploaded image to the list
      setUploadedImages(prev => [...prev, data.imageUrl]);
      
      return data;
      
    } catch (error: any) {
      toast({
        title: "Error uploading image",
        description: error.message || "There was an error uploading your image. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Handle success of image upload
  const handleImageUploadSuccess = () => {
    toast({
      title: "Image uploaded",
      description: "Your project image has been uploaded successfully.",
    });
  };
  
  // Handle project completion (after uploading images)
  const handleCompleteProject = () => {
    navigate("/projects");
  };
  
  // Redirect if user is not a tradesman
  if (user?.role !== "tradesman" || !tradesmanProfile) {
    navigate("/profile");
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>Add New Project | TradeLink</title>
        <meta name="description" content="Add a new project to your portfolio to showcase your work" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Add New Project</h1>
          <p className="text-muted-foreground mb-8">
            Showcase your work to attract potential clients
          </p>
          
          {!projectId ? (
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Enter information about your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Modern Kitchen Renovation" {...field} />
                          </FormControl>
                          <FormDescription>
                            A clear, descriptive title for your project
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the project, challenges, and solutions..."
                              className="resize-none min-h-[150px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Provide details about the work performed, materials used, and results achieved
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Chicago, IL" {...field} />
                            </FormControl>
                            <FormDescription>
                              Where the project was completed
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="completionDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Completion Date</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., June 2023" {...field} />
                            </FormControl>
                            <FormDescription>
                              When the project was completed
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Range</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., $5,000 - $10,000" {...field} />
                          </FormControl>
                          <FormDescription>
                            Approximate cost range for the project (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Featured Project</FormLabel>
                            <FormDescription>
                              Highlight this project on your profile and in search results
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate("/projects")}>
                  Cancel
                </Button>
                <Button 
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Project..." : "Create Project"}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Add Project Images</CardTitle>
                <CardDescription>
                  Upload photos of your work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Project created successfully!</AlertTitle>
                  <AlertDescription>
                    Now you can add images to showcase your work. The first image you upload will be set as the main image for this project.
                  </AlertDescription>
                </Alert>
                
                <ImageUploader 
                  onImageUpload={(formData) => handleImageUpload(formData)}
                  onSuccess={handleImageUploadSuccess}
                  fieldName="image"
                  caption={true}
                  infoText="Add high-quality photos that showcase your craftsmanship"
                />
                
                {uploadedImages.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Uploaded Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedImages.map((imageUrl, index) => (
                        <div key={index} className="relative h-32 rounded-md overflow-hidden">
                          <img 
                            src={imageUrl} 
                            alt={`Project image ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate("/projects")}>
                  Skip
                </Button>
                <Button onClick={handleCompleteProject}>
                  {uploadedImages.length === 0 ? "Skip Images" : "Complete Project"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateProject;
