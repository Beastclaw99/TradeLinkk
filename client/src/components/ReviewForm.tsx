import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { Textarea } from "@/components/ui/textarea";
import { RATINGS } from "@/lib/constants";
import { StarIcon } from "lucide-react";

// Form schema
const formSchema = z.object({
  tradesmanId: z.number({
    required_error: "Tradesman ID is required",
  }),
  projectId: z.number().optional(),
  rating: z.number({
    required_error: "Rating is required",
  }).min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string({
    required_error: "Comment is required",
  }).min(10, "Comment must be at least 10 characters").max(500, "Comment must be at most 500 characters"),
});

type ReviewFormValues = z.infer<typeof formSchema>;

interface ReviewFormProps {
  tradesmanId: number;
  projectId?: number;
  onSuccess?: () => void;
}

const ReviewForm = ({ tradesmanId, projectId, onSuccess }: ReviewFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Initialize form with default values
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tradesmanId,
      projectId: projectId || undefined,
      rating: 0,
      comment: "",
    },
  });
  
  // Watch rating value for UI updates
  const watchedRating = form.watch("rating");
  
  // Function to render star rating input
  const renderStars = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => form.setValue("rating", star)}
            className="focus:outline-none"
          >
            <StarIcon
              className={`h-6 w-6 ${
                watchedRating >= star
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };
  
  // Handle form submission
  const onSubmit = async (values: ReviewFormValues) => {
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/reviews", values);
      
      // Show success message
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      
      // Reset form
      form.reset();
      
      // Invalidate reviews query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/tradesman/${tradesmanId}/reviews`] });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      toast({
        title: "Error submitting review",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex flex-col space-y-2">
                  {renderStars()}
                  <input
                    type="hidden"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>
                How would you rate your experience with this tradesman?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share details about your experience working with this tradesman..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your review will help others make informed decisions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </Form>
  );
};

export default ReviewForm;
