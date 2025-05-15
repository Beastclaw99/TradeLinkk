import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { TRADES, SEO_DESCRIPTIONS } from "@/lib/constants";
import {
  AlertCircle,
  Calendar,
  DollarSign,
  Clock,
  Briefcase,
  Check,
  Upload,
  MapPin,
  Trash2,
  Plus,
  Info
} from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { DatePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define schema for client-submitted projects
const clientProjectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(30, "Description must be at least 30 characters").max(2000, "Description cannot exceed 2000 characters"),
  trade: z.string().min(1, "Please select a trade category"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  deadline: z.date().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budgetType: z.enum(["fixed", "hourly", "range"]),
  budget: z.string().min(1, "Please specify a budget").optional(),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
  skills: z.array(z.string()).optional(),
  questions: z.array(z.string()).optional(),
  materialProvided: z.boolean().optional(),
  isRemote: z.boolean().optional(),
  requireCertifications: z.boolean().optional(),
  certificationTypes: z.array(z.string()).optional(),
});

type ClientProjectFormValues = z.infer<typeof clientProjectSchema>;

const CreateClientProject = () => {
  const [_, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newQuestion, setNewQuestion] = useState("");

  // Redirect if not authenticated or not a client
  if (!isAuthenticated) {
    toast({
      title: "Authentication Required",
      description: "Please log in to post a project",
      variant: "destructive"
    });
    navigate("/login");
    return null;
  }

  if (user?.role !== "client") {
    toast({
      title: "Client Account Required",
      description: "You need a client account to post projects",
      variant: "destructive"
    });
    navigate("/dashboard");
    return null;
  }

  // Set up form with default values
  const form = useForm<ClientProjectFormValues>({
    resolver: zodResolver(clientProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      trade: "",
      location: user?.location || "",
      budgetType: "fixed",
      budget: "",
      budgetMin: "",
      budgetMax: "",
      skills: [],
      questions: [],
      materialProvided: false,
      isRemote: false,
      requireCertifications: false,
      certificationTypes: [],
    },
  });

  // Watch form values for conditional rendering
  const budgetType = form.watch("budgetType");
  const requireCertifications = form.watch("requireCertifications");
  const skills = form.watch("skills") || [];
  const questions = form.watch("questions") || [];

  const { mutate: createProject, isPending } = useMutation({
    mutationFn: async (data: ClientProjectFormValues) => {
      // Format budget based on budget type
      let formattedData = { ...data };
      if (data.budgetType === "fixed" || data.budgetType === "hourly") {
        // Keep budget as is
        delete formattedData.budgetMin;
        delete formattedData.budgetMax;
      } else if (data.budgetType === "range") {
        // Format budget as range
        formattedData.budget = `${data.budgetMin} - ${data.budgetMax}`;
        delete formattedData.budgetMin;
        delete formattedData.budgetMax;
      }

      return apiRequest("POST", "/api/client-projects", formattedData);
    },
    onSuccess: (response) => {
      toast({
        title: "Project Created",
        description: "Your project has been posted successfully",
      });
      // Upload files if any
      if (previewFiles.length > 0) {
        uploadProjectFiles(response.id);
      } else {
        navigate(`/project-details/${response.id}`);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Project",
        description: error.message || "There was an error posting your project.",
        variant: "destructive",
      });
    },
  });

  const uploadProjectFiles = async (projectId: number) => {
    // Create a form data object to upload files
    const formData = new FormData();
    formData.append("projectId", projectId.toString());
    
    // Append all files
    previewFiles.forEach(file => {
      formData.append("files", file);
    });
    
    try {
      await apiRequest("POST", "/api/project-attachments", formData);
      navigate(`/project-details/${projectId}`);
    } catch (error: any) {
      toast({
        title: "Error Uploading Files",
        description: error.message || "Your project was created, but there was an error uploading the attachments.",
        variant: "destructive",
      });
      navigate(`/project-details/${projectId}`);
    }
  };

  const onSubmit = (data: ClientProjectFormValues) => {
    // Validate budget
    if (data.budgetType === "fixed" || data.budgetType === "hourly") {
      if (!data.budget) {
        toast({
          title: "Budget Required",
          description: "Please enter a budget amount",
          variant: "destructive",
        });
        return;
      }
    } else if (data.budgetType === "range") {
      if (!data.budgetMin || !data.budgetMax) {
        toast({
          title: "Budget Range Required",
          description: "Please enter both minimum and maximum budget values",
          variant: "destructive",
        });
        return;
      }
    }
    
    createProject(data);
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    const updatedSkills = [...(skills || []), newSkill.trim()];
    form.setValue("skills", updatedSkills);
    setNewSkill("");
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    form.setValue("skills", updatedSkills);
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    
    const updatedQuestions = [...(questions || []), newQuestion.trim()];
    form.setValue("questions", updatedQuestions);
    setNewQuestion("");
  };

  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    form.setValue("questions", updatedQuestions);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newFiles = Array.from(files);
    setPreviewFiles(prev => [...prev, ...newFiles]);
    
    // Reset the input
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setPreviewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Helmet>
        <title>Post a Project | TnT Tradesmen</title>
        <meta name="description" content={SEO_DESCRIPTIONS.createProject} />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Post a Project</h1>
          <p className="mt-2 text-muted-foreground">
            Fill out the form below to post your project and find qualified tradesmen
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Project Information */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Provide the basic information about your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Kitchen Renovation in Port of Spain" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Choose a clear, specific title for your project.
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
                      <FormLabel>Project Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide details about the project, including specific requirements, materials, timeline expectations, etc." 
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        The more details you provide, the better matches you'll get.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="trade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trade Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a trade" />
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
                          Choose the most relevant category for your project.
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
                        <FormLabel>Project Location</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <div className="relative w-full">
                              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                placeholder="e.g., Port of Spain, Trinidad" 
                                className="pl-8"
                                {...field} 
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Enter the city or area where the work will be done.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="isRemote"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            This work can be done remotely
                          </FormLabel>
                          <FormDescription>
                            Check this if the tradesman doesn't need to be physically present.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>
                  Specify when the project needs to be completed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Deadline</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          When should applications close?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Start Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          When should work begin?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work End Date</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          When should work be completed?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Budget */}
            <Card>
              <CardHeader>
                <CardTitle>Project Budget</CardTitle>
                <CardDescription>
                  Specify your budget for this project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="budgetType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Price</SelectItem>
                          <SelectItem value="hourly">Hourly Rate</SelectItem>
                          <SelectItem value="range">Budget Range</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose how you want to structure the payment.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(budgetType === "fixed" || budgetType === "hourly") && (
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{budgetType === "fixed" ? "Fixed Budget (TTD)" : "Hourly Rate (TTD)"}</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <div className="relative w-full">
                              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type="number" 
                                min="0" 
                                placeholder={budgetType === "fixed" ? "e.g., 5000" : "e.g., 50"} 
                                className="pl-8"
                                {...field} 
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          {budgetType === "fixed"
                            ? "The total amount you're willing to pay for the complete project."
                            : "The hourly rate you're willing to pay."
                          }
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {budgetType === "range" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="budgetMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Budget (TTD)</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <div className="relative w-full">
                                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="number" 
                                  min="0" 
                                  placeholder="e.g., 3000" 
                                  className="pl-8"
                                  {...field} 
                                />
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budgetMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Budget (TTD)</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <div className="relative w-full">
                                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  type="number" 
                                  min="0" 
                                  placeholder="e.g., 5000" 
                                  className="pl-8"
                                  {...field} 
                                />
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="materialProvided"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Materials will be provided by me
                          </FormLabel>
                          <FormDescription>
                            Check this if you'll provide all necessary materials and the tradesman only needs to provide labor.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements & Qualifications</CardTitle>
                <CardDescription>
                  Specify the skills and qualifications needed for this project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex flex-col space-y-2 mb-4">
                    <FormLabel>Required Skills</FormLabel>
                    <FormDescription>
                      Add specific skills that a tradesman should have for this project.
                    </FormDescription>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <Input
                      placeholder="e.g., Experience with commercial projects"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddSkill}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="flex items-center gap-1 py-1.5 pl-2"
                        >
                          <Check className="h-3.5 w-3.5 text-primary mr-1" />
                          {skill}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSkill(index)}
                            className="h-5 w-5 p-0 ml-1 text-muted-foreground hover:text-foreground"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="requireCertifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Require certifications or qualifications
                          </FormLabel>
                          <FormDescription>
                            Check this if you require specific certifications for this project.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {requireCertifications && (
                  <div className="pl-7 space-y-4 border-l-2 border-primary/20">
                    <FormField
                      control={form.control}
                      name="certificationTypes"
                      render={({ field }) => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel>Required Certifications</FormLabel>
                            <FormDescription>
                              Select the certifications that are required for this project.
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              { id: "license", label: "Trade License" },
                              { id: "insurance", label: "Insurance" },
                              { id: "safety", label: "Safety Training" },
                              { id: "professional", label: "Professional Association" },
                            ].map((item) => (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      const updated = checked
                                        ? [...current, item.id]
                                        : current.filter((val) => val !== item.id);
                                      field.onChange(updated);
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-normal">
                                    {item.label}
                                  </FormLabel>
                                </div>
                              </FormItem>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Screening Questions */}
            <Card>
              <CardHeader>
                <CardTitle>Screening Questions</CardTitle>
                <CardDescription>
                  Add questions for applicants to answer when applying
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex flex-col space-y-2 mb-4">
                    <FormLabel>Questions for Applicants</FormLabel>
                    <FormDescription>
                      Add questions that you want applicants to answer when they apply to your project.
                    </FormDescription>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <Input
                      placeholder="e.g., Do you have experience with similar projects?"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddQuestion}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  
                  {questions.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {questions.map((question, index) => (
                        <div key={index} className="flex items-start space-x-2 p-3 rounded-md border">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-grow">
                            <p className="text-sm">{question}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveQuestion(index)}
                            className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project Files */}
            <Card>
              <CardHeader>
                <CardTitle>Project Files</CardTitle>
                <CardDescription>
                  Upload relevant files for your project (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, Word, Excel, Images (max. 10MB each)
                        </p>
                      </div>
                      <input 
                        id="file-upload" 
                        type="file" 
                        className="hidden" 
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  
                  {previewFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {previewFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-md border">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                              <FileIcon file={file} />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Section */}
            <div className="flex flex-col space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Before you post</AlertTitle>
                <AlertDescription>
                  Make sure your project details are clear and accurate. Once submitted, your project will be visible to all tradesmen.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/project-listings")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="min-w-[120px]"
                >
                  {isPending ? "Posting..." : "Post Project"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

// Helper component to determine icon for file type
const FileIcon = ({ file }: { file: File }) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'pdf') {
    return <FileText className="h-5 w-5 text-red-500" />;
  } else if (['doc', 'docx'].includes(extension || '')) {
    return <FileText className="h-5 w-5 text-blue-500" />;
  } else if (['xls', 'xlsx'].includes(extension || '')) {
    return <FileText className="h-5 w-5 text-green-500" />;
  } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
    return <FileText className="h-5 w-5 text-purple-500" />;
  }
  
  return <FileText className="h-5 w-5 text-muted-foreground" />;
};

export default CreateClientProject;