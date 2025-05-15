import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

// Message schema
const messageSchema = z.object({
  content: z.string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message is too long (max 1000 characters)"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface MessageFormProps {
  receiverId: string;
  className?: string;
}

const MessageForm = ({ receiverId, className = "" }: MessageFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });
  
  const onSubmit = async (values: MessageFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to send messages",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const messageData = {
        receiverId: parseInt(receiverId),
        content: values.content,
      };
      
      await apiRequest("POST", "/api/messages", messageData);
      
      // Reset the form
      form.reset();
      
      // Invalidate the query to refresh the message list
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${receiverId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={`p-4 border-t ${className}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-2">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Textarea
                    placeholder="Type your message..."
                    className="min-h-[60px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            size="icon" 
            className="h-[60px] w-[60px]"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default MessageForm;
