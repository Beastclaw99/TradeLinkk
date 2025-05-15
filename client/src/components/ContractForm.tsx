import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MilestoneInput {
  title: string;
  description: string;
  amount: string;
  dueDate: string;
}

// Contract form schema
const contractSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be at most 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000, "Description must be at most 1000 characters"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  totalAmount: z.string().optional(),
  tradesmanId: z.number(),
  clientId: z.number(),
});

// Milestone schema
const milestoneSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be at most 100 characters"),
  description: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  dueDate: z.string().optional(),
});

type ContractFormValues = z.infer<typeof contractSchema>;

interface ContractFormProps {
  tradesmanId?: number;
  clientId?: number;
  initialData?: Partial<ContractFormValues>;
  onSuccess?: (contractId: number) => void;
  editMode?: boolean;
  contractId?: number;
}

const ContractForm = ({ 
  tradesmanId,
  clientId,
  initialData,
  onSuccess,
  editMode = false,
  contractId
}: ContractFormProps) => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [milestones, setMilestones] = useState<MilestoneInput[]>([]);
  const [currentMilestone, setCurrentMilestone] = useState<MilestoneInput>({
    title: "",
    description: "",
    amount: "",
    dueDate: "",
  });

  // Initialize form with default values
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      startDate: initialData?.startDate || "",
      endDate: initialData?.endDate || "",
      totalAmount: initialData?.totalAmount?.toString() || "",
      tradesmanId: tradesmanId || initialData?.tradesmanId || 0,
      clientId: clientId || initialData?.clientId || (user?.role === "client" ? user.id : 0),
    },
  });

  // Handler for adding a milestone
  const handleAddMilestone = () => {
    try {
      // Validate the milestone data
      const validatedMilestone = milestoneSchema.parse(currentMilestone);
      
      // Add to milestones array
      setMilestones([...milestones, currentMilestone]);
      
      // Reset the form
      setCurrentMilestone({
        title: "",
        description: "",
        amount: "",
        dueDate: "",
      });
      
      toast({
        title: "Milestone added",
        description: "The milestone has been added to the contract",
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Invalid milestone data",
          description: firstError.message,
          variant: "destructive",
        });
      }
    }
  };

  // Handler for removing a milestone
  const handleRemoveMilestone = (index: number) => {
    const updatedMilestones = [...milestones];
    updatedMilestones.splice(index, 1);
    setMilestones(updatedMilestones);
  };

  // Form submission handler
  const onSubmit = async (values: ContractFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Process form values
      const contractData = {
        ...values,
        // Convert totalAmount to number if present
        totalAmount: values.totalAmount ? parseInt(values.totalAmount) : undefined,
      };
      
      let contract;
      
      if (editMode && contractId) {
        // Update existing contract
        const res = await apiRequest("PUT", `/api/contracts/${contractId}`, contractData);
        contract = await res.json();
      } else {
        // Create new contract
        const res = await apiRequest("POST", "/api/contracts", contractData);
        contract = await res.json();
        
        // Create milestones if any
        if (milestones.length > 0) {
          for (const milestone of milestones) {
            await apiRequest("POST", `/api/contracts/${contract.id}/milestones`, {
              ...milestone,
              contractId: contract.id,
              amount: parseInt(milestone.amount),
            });
          }
        }
      }
      
      // Show success message
      toast({
        title: editMode ? "Contract updated" : "Contract created",
        description: editMode 
          ? "The contract has been updated successfully" 
          : "The contract has been created successfully",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/user/contracts"] });
      
      // Call onSuccess callback or navigate away
      if (onSuccess) {
        onSuccess(contract.id);
      } else {
        navigate(`/contracts`);
      }
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Contract Details</h2>
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Kitchen Renovation Agreement" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear title describing the work to be done
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
                  <FormLabel>Contract Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed description of the work to be performed..."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Include all important details about the project scope
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount (USD)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormDescription>
                    The total contract value before taxes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Separator />
          
          {!editMode && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Payment Milestones</h2>
              <p className="text-sm text-muted-foreground">
                Break down the contract into payment milestones to track progress and payments
              </p>
              
              <Card>
                <CardHeader>
                  <CardTitle>Add Milestone</CardTitle>
                  <CardDescription>
                    Define the milestone details
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input 
                        placeholder="e.g., Initial Deposit"
                        value={currentMilestone.title}
                        onChange={(e) => setCurrentMilestone({
                          ...currentMilestone,
                          title: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount (USD)</label>
                      <Input 
                        type="number"
                        placeholder="0.00"
                        value={currentMilestone.amount}
                        onChange={(e) => setCurrentMilestone({
                          ...currentMilestone,
                          amount: e.target.value
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description (Optional)</label>
                    <Textarea 
                      placeholder="Description of what this milestone covers..."
                      value={currentMilestone.description}
                      onChange={(e) => setCurrentMilestone({
                        ...currentMilestone,
                        description: e.target.value
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date (Optional)</label>
                    <Input 
                      type="date"
                      value={currentMilestone.dueDate}
                      onChange={(e) => setCurrentMilestone({
                        ...currentMilestone,
                        dueDate: e.target.value
                      })}
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="button" 
                    onClick={handleAddMilestone}
                    disabled={!currentMilestone.title || !currentMilestone.amount}
                  >
                    Add Milestone
                  </Button>
                </CardFooter>
              </Card>
              
              {milestones.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-md font-medium">Added Milestones</h3>
                  <div className="space-y-3">
                    {milestones.map((milestone, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{milestone.title}</h4>
                              {milestone.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {milestone.description}
                                </p>
                              )}
                              <div className="flex items-center mt-2 space-x-4">
                                <span className="text-sm font-medium">
                                  ${milestone.amount}
                                </span>
                                {milestone.dueDate && (
                                  <span className="text-sm text-muted-foreground">
                                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleRemoveMilestone(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-4 mt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/contracts")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : (editMode ? "Update Contract" : "Create Contract")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default ContractForm;
