import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { TRADES, SEO_DESCRIPTIONS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Briefcase,
  FileText,
  UserCheck,
  Award,
  Check,
  Send,
  AlertTriangle,
  Eye,
  User,
  MessageCircle,
  Calendar as CalendarIcon,
} from "lucide-react";

// Define schema for the apply form
const applyFormSchema = z.object({
  coverLetter: z.string().min(20, "Cover letter must be at least 20 characters"),
  price: z.string().optional(),
  availability: z.string().min(1, "Please specify your availability"),
  questionResponses: z.record(z.string()).optional(),
});

type ApplyFormValues = z.infer<typeof applyFormSchema>;

const ProjectDetails = () => {
  const params = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [applyOpen, setApplyOpen] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch project details
  const { data: project, isLoading } = useQuery({
    queryKey: [`/api/project-details/${params.id}`],
    queryFn: async () => {
      // For now, just use the featured projects endpoint to get some data
      const featuredProjects = await fetch("/api/featured-projects").then(res => res.json());
      const projectData = featuredProjects.find((p: any) => p.id === Number(params.id));
      
      // If we don't find the project, simulate a project with Field Nation-like details
      if (!projectData) {
        return {
          id: Number(params.id),
          title: "Commercial Electrical Installation",
          description: "Looking for a licensed electrician to install new electrical circuits and outlets in a commercial office space. Work includes installing 5 new 20-amp circuits, 15 duplex outlets, and updating the electrical panel with proper labeling. All materials will be provided on-site.",
          clientId: 2,
          budget: "$2,500 - $3,000",
          budgetType: "fixed",
          location: "Port of Spain, Trinidad",
          trade: "electrical",
          createdAt: new Date().toISOString(),
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: "open",
          workStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          workEndDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          skills: ["Electrical installation", "Commercial wiring", "Circuit installation", "Outlet installation"],
          materials: "provided",
          requireCertifications: true,
          certificationTypes: ["license", "insurance"],
          applicationCount: 5,
          client: {
            id: 2,
            fullName: "Trinidad Business Solutions",
            avatarUrl: null,
            location: "Port of Spain",
            rating: 4.8,
            projectsPosted: 15
          },
          questions: [
            "Do you have experience with commercial electrical installations?",
            "Are you available to work on weekends if needed?"
          ],
          attachments: [
            {
              name: "floor-plan.pdf",
              url: "#",
              type: "application/pdf",
              size: "2.3 MB"
            }
          ]
        };
      }
      
      return projectData;
    }
  });

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applyFormSchema),
    defaultValues: {
      coverLetter: "",
      price: "",
      availability: "",
      questionResponses: {}
    }
  });

  const { mutate: applyToProject, isPending } = useMutation({
    mutationFn: async (data: ApplyFormValues) => {
      return apiRequest("POST", `/api/projects/${params.id}/apply`, data);
    },
    onSuccess: () => {
      toast({
        title: "Application submitted successfully",
        description: "The client will review your application and get back to you",
      });
      setApplyOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/project-details/${params.id}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Application failed",
        description: error.message || "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ApplyFormValues) => {
    applyToProject(data);
  };

  const handleApply = () => {
    if (!localStorage.getItem("userId")) {
      toast({
        title: "Authentication Required",
        description: "Please log in or register to apply for this project",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    setApplyOpen(true);
  };

  const handleMessageClient = () => {
    if (!localStorage.getItem("userId")) {
      toast({
        title: "Authentication Required",
        description: "Please log in or register to message this client",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    navigate(`/messages/${project?.client?.id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/project-listings")}>Browse Projects</Button>
        </div>
      </div>
    );
  }

  // Format the trade name for display
  const tradeName = TRADES.find(t => t.value === project.trade)?.label || "General Work";

  return (
    <div className="container mx-auto py-10 px-4">
      <Helmet>
        <title>{project.title} | Project Details | TnT Tradesmen</title>
        <meta
          name="description"
          content={`View details and apply for ${project.title} in ${project.location}. ${project.description.slice(0, 100)}...`}
        />
      </Helmet>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="font-normal">
                {tradeName}
              </Badge>
              <Badge variant={project.status === "open" ? "default" : project.status === "assigned" ? "secondary" : "outline"} className="font-normal">
                {project.status === "open" ? "Open" : project.status === "assigned" ? "Assigned" : "Completed"}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold">{project.title}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="text-muted-foreground h-5 w-5" />
                <span className="text-sm font-medium">{project.budget}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground h-5 w-5" />
                <span className="text-sm font-medium">{project.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-5 w-5" />
                <span className="text-sm font-medium">
                  Posted {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full border-b rounded-none justify-start">
              <TabsTrigger value="details" className="rounded-none">Details</TabsTrigger>
              <TabsTrigger value="attachments" className="rounded-none">Attachments</TabsTrigger>
              <TabsTrigger value="activity" className="rounded-none">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="pt-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3">Project Description</h2>
                  <div className="prose max-w-none dark:prose-invert">
                    <p>{project.description}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-3">Timeline</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full p-2 bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Project Deadline</p>
                        <p className="font-medium">
                          {project.deadline 
                            ? new Date(project.deadline).toLocaleDateString() 
                            : "Flexible"
                          }
                        </p>
                      </div>
                    </div>

                    {project.workStartDate && (
                      <div className="flex items-center gap-3">
                        <div className="rounded-full p-2 bg-primary/10">
                          <CalendarIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Work Period</p>
                          <p className="font-medium">
                            {new Date(project.workStartDate).toLocaleDateString()} - 
                            {project.workEndDate 
                              ? ` ${new Date(project.workEndDate).toLocaleDateString()}` 
                              : " Ongoing"
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h2 className="text-xl font-semibold mb-3">Skills & Requirements</h2>
                  
                  {project.skills && project.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Required Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full p-2 bg-primary/10 mt-0.5">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Materials</p>
                        <p className="font-medium">
                          {project.materials === "included" 
                            ? "Materials included in price" 
                            : project.materials === "provided" 
                              ? "Materials provided by client"
                              : "Materials not included"
                          }
                        </p>
                      </div>
                    </div>

                    {project.requireCertifications && (
                      <div className="flex items-start gap-3">
                        <div className="rounded-full p-2 bg-primary/10 mt-0.5">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Required Certifications</p>
                          <div>
                            {project.certificationTypes?.map((cert: string, index: number) => (
                              <div key={index} className="flex items-center gap-1">
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="capitalize">
                                  {cert === "license" 
                                    ? "Trade License" 
                                    : cert === "insurance" 
                                      ? "Insurance" 
                                      : cert === "safety" 
                                        ? "Safety Training"
                                        : cert
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {project.questions && project.questions.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h2 className="text-xl font-semibold mb-3">Screening Questions</h2>
                      <div className="space-y-2">
                        {project.questions.map((question: string, index: number) => (
                          <div key={index} className="flex gap-2">
                            <span className="font-medium">{index + 1}.</span>
                            <p>{question}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="attachments" className="pt-6">
              {project.attachments && project.attachments.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-3">Project Attachments</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.attachments.map((attachment: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="rounded-full p-2 bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-grow">
                            <p className="font-medium truncate">{attachment.name}</p>
                            <p className="text-sm text-muted-foreground">{attachment.size}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No attachments available for this project</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="pt-6">
              <div className="py-10 text-center">
                <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Project activity will be shown here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Project Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={handleApply}>
                Apply for this Project
              </Button>
              <Button variant="outline" className="w-full" onClick={handleMessageClient}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Message Client
              </Button>
            </CardContent>
            <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {project.applicationCount} application{project.applicationCount !== 1 ? "s" : ""}
              </span>
              <span>Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "Flexible"}</span>
            </CardFooter>
          </Card>

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>About the Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {project.client?.avatarUrl ? (
                  <img 
                    src={project.client.avatarUrl} 
                    alt={project.client.fullName} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{project.client?.fullName}</p>
                  <p className="text-sm text-muted-foreground">{project.client?.location}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Member Since</p>
                  <p className="font-medium">May 2023</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Projects Posted</p>
                  <p className="font-medium">{project.client?.projectsPosted || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rating</p>
                  <p className="font-medium flex items-center">
                    {project.client?.rating || "New"} 
                    {project.client?.rating && <span className="text-yellow-500 ml-1">★</span>}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Similar Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Similar Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">More {tradeName} projects in {project.location}</p>
              
              <div className="text-center py-6">
                <Button variant="outline" onClick={() => navigate(`/project-listings?trade=${project.trade}`)}>
                  Browse Similar Projects
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Apply Dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Apply for Project: {project.title}</DialogTitle>
            <DialogDescription>
              Submit your application for this project. Be specific about your experience and how you can help.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="coverLetter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Letter</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Introduce yourself and explain why you're a good fit for this project. Highlight relevant experience and qualifications."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {project.budgetType === "fixed" && (
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Bid (TTD)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="Enter your price" {...field} />
                      </FormControl>
                      <FormDescription>
                        Client's budget: {project.budget}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Availability</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="When can you start? What days/hours are you available? How long will it take to complete the project?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {project.questions && project.questions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Screening Questions</h3>
                  
                  {project.questions.map((question: string, index: number) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name={`questionResponses.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <div className="flex gap-2">
                              <span>{index + 1}.</span>
                              <span>{question}</span>
                            </div>
                          </FormLabel>
                          <FormControl>
                            <Textarea placeholder="Your answer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              )}

              <div className="bg-muted p-4 rounded-md flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Important:</p>
                  <p>By submitting an application, you agree to the terms and conditions for work on our platform.</p>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setApplyOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetails;