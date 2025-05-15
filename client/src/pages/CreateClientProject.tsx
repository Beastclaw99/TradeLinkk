import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import ImageUploader from "@/components/ImageUploader";

// Define the schema for the form
const clientProjectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  trade: z.string().min(1, "Please select a trade category"),
  budgetType: z.enum(["fixed", "hourly", "range"]),
  budgetAmount: z.string().optional(),
  budgetRangeMin: z.string().optional(),
  budgetRangeMax: z.string().optional(),
  hourlyRate: z.string().optional(),
  estimatedHours: z.string().optional(),
  location: z.string().min(1, "Please provide a location"),
  deadline: z.date().optional(),
  skills: z.array(z.string()).optional(),
  materials: z.enum(["included", "excluded", "provided"]),
  requireCertifications: z.boolean().default(false),
  certificationTypes: z.array(z.string()).optional(),
  visibility: z.enum(["public", "private", "invite"]).default("public"),
});

type ClientProjectFormValues = z.infer<typeof clientProjectSchema>;

const CreateClientProject = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const form = useForm<ClientProjectFormValues>({
    resolver: zodResolver(clientProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      trade: "",
      budgetType: "fixed",
      budgetAmount: "",
      budgetRangeMin: "",
      budgetRangeMax: "",
      hourlyRate: "",
      estimatedHours: "",
      location: "",
      materials: "excluded",
      requireCertifications: false,
      certificationTypes: [],
      visibility: "public",
      skills: [],
    },
  });

  const { mutate: createProject, isPending } = useMutation({
    mutationFn: async (data: ClientProjectFormValues) => {
      // Add skills and uploaded images to the data
      const projectData = {
        ...data,
        skills,
        images: uploadedImages,
      };
      
      return apiRequest("POST", "/api/client-projects", projectData);
    },
    onSuccess: () => {
      toast({
        title: "Project created successfully",
        description: "Your project has been published to the marketplace",
      });
      navigate("/project-listings");
    },
    onError: (error: any) => {
      toast({
        title: "Error creating project",
        description: error.message || "There was an error creating your project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ClientProjectFormValues) => {
    createProject(data);
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleImageUpload = async (formData: FormData) => {
    try {
      const response = await apiRequest("POST", "/api/upload-image", formData);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const onImageSuccess = (data: any) => {
    setUploadedImages([...uploadedImages, data.imageUrl]);
  };

  const watchBudgetType = form.watch("budgetType");
  const watchRequireCertifications = form.watch("requireCertifications");

  return (
    <div className="container mx-auto py-10 px-4">
      <Helmet>
        <title>Post a Project | Find Tradesmen | TnT Tradesmen</title>
        <meta
          name="description"
          content="Post your project to find skilled tradesmen in Trinidad and Tobago."
        />
      </Helmet>

      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Post a Project</h1>
          <p className="text-muted-foreground mt-2">
            Describe your project to find the right tradesmen for the job
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Provide basic information about your project
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
                        A clear title helps tradesmen understand your project quickly
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
                          placeholder="Describe your project in detail, including specifics about what needs to be done..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include as much detail as possible about the project scope, requirements, and expectations
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
                      <FormLabel>Trade Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a trade category" />
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
                        Select the trade category most relevant to your project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Project Images (Optional)</FormLabel>
                  <div className="mt-2">
                    <ImageUploader
                      onImageUpload={handleImageUpload}
                      onSuccess={onImageSuccess}
                      fieldName="projectImages"
                      maxSizeMB={5}
                      multiple={true}
                      buttonText="Upload Project Images"
                      infoText="Upload photos of the project site or reference images"
                    />
                  </div>
                  {uploadedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {uploadedImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative w-24 h-24 rounded overflow-hidden"
                        >
                          <img
                            src={image}
                            alt={`Project image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                            onClick={() => {
                              setUploadedImages(
                                uploadedImages.filter((_, i) => i !== index)
                              );
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget & Timeline</CardTitle>
                <CardDescription>
                  Provide budget and timeline information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="budgetType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Budget Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="fixed" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Fixed Price
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="hourly" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Hourly Rate
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="range" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Budget Range
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchBudgetType === "fixed" && (
                  <FormField
                    control={form.control}
                    name="budgetAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fixed Budget (TTD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="e.g., 5000"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the total amount you're willing to pay for the entire project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {watchBudgetType === "hourly" && (
                  <>
                    <FormField
                      control={form.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate (TTD)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="e.g., 150"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the hourly rate you're willing to pay
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estimatedHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Hours</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="e.g., 40"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Estimated number of hours required for the project
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {watchBudgetType === "range" && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budgetRangeMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum (TTD)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="e.g., 3000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budgetRangeMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum (TTD)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="e.g., 7000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Port of Spain, Trinidad"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the location where the work will be performed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Project Deadline (Optional)</FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                      <FormDescription>
                        When do you need this project completed by?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills & Requirements</CardTitle>
                <CardDescription>
                  Specify required skills and qualifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <FormLabel>Required Skills</FormLabel>
                  <div className="flex items-center gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="e.g., Tiling, Grouting"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSkill}
                    >
                      Add
                    </Button>
                  </div>
                  <FormDescription>
                    Enter specific skills required for this project
                  </FormDescription>

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {skills.map((skill) => (
                        <div
                          key={skill}
                          className="bg-muted rounded-full px-3 py-1 text-sm flex items-center gap-2"
                        >
                          {skill}
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => removeSkill(skill)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="materials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Materials</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select materials option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="included">
                            Materials included in price
                          </SelectItem>
                          <SelectItem value="excluded">
                            Materials not included
                          </SelectItem>
                          <SelectItem value="provided">
                            Materials provided by client
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Specify if materials are included in the budget or not
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                        <FormLabel>Require certifications</FormLabel>
                        <FormDescription>
                          Require tradesman to have specific certifications
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {watchRequireCertifications && (
                  <FormField
                    control={form.control}
                    name="certificationTypes"
                    render={() => (
                      <FormItem>
                        <FormLabel>Required Certifications</FormLabel>
                        <div className="space-y-2">
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={form.getValues("certificationTypes")?.includes("license")}
                                onCheckedChange={(checked) => {
                                  const currentValues = form.getValues("certificationTypes") || [];
                                  const newValues = checked
                                    ? [...currentValues, "license"]
                                    : currentValues.filter((v) => v !== "license");
                                  form.setValue("certificationTypes", newValues);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Trade License
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={form.getValues("certificationTypes")?.includes("insurance")}
                                onCheckedChange={(checked) => {
                                  const currentValues = form.getValues("certificationTypes") || [];
                                  const newValues = checked
                                    ? [...currentValues, "insurance"]
                                    : currentValues.filter((v) => v !== "insurance");
                                  form.setValue("certificationTypes", newValues);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Insurance
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={form.getValues("certificationTypes")?.includes("safety")}
                                onCheckedChange={(checked) => {
                                  const currentValues = form.getValues("certificationTypes") || [];
                                  const newValues = checked
                                    ? [...currentValues, "safety"]
                                    : currentValues.filter((v) => v !== "safety");
                                  form.setValue("certificationTypes", newValues);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Safety Training
                            </FormLabel>
                          </FormItem>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visibility Settings</CardTitle>
                <CardDescription>
                  Control who can view and apply to your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="public" />
                            </FormControl>
                            <div>
                              <FormLabel className="font-normal">
                                Public
                              </FormLabel>
                              <FormDescription className="mt-0">
                                All tradesmen can view and apply
                              </FormDescription>
                            </div>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="private" />
                            </FormControl>
                            <div>
                              <FormLabel className="font-normal">
                                Private
                              </FormLabel>
                              <FormDescription className="mt-0">
                                Only visible by invitation
                              </FormDescription>
                            </div>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="invite" />
                            </FormControl>
                            <div>
                              <FormLabel className="font-normal">
                                Invite Only
                              </FormLabel>
                              <FormDescription className="mt-0">
                                Visible to all but only invited tradesmen can apply
                              </FormDescription>
                            </div>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/project-listings")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Posting Project..." : "Post Project"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateClientProject;