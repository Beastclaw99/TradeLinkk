import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { API_ROUTES, PAGE_ROUTES } from "@/lib/constants";

// Schema for payment form validation
const wiPaySchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Valid email is required"),
  description: z.string().optional(),
});

type WiPayFormValues = z.infer<typeof wiPaySchema>;

interface WiPayFormProps {
  paymentId: number;
  amount: number;
  title: string;
  description?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export const WiPayForm = ({
  paymentId,
  amount,
  title,
  description = "",
  onSuccess,
  onError
}: WiPayFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Initialize form with default values
  const form = useForm<WiPayFormValues>({
    resolver: zodResolver(wiPaySchema),
    defaultValues: {
      name: "",
      email: "",
      description: description,
    },
  });
  
  const onSubmit = async (values: WiPayFormValues) => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", API_ROUTES.PAYMENTS.PROCESS_WIPAY, {
        paymentId,
        name: values.name,
        email: values.email,
        amount,
        description: values.description || title,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Error processing payment");
      }
      
      toast({
        title: "Payment Started",
        description: "You'll be redirected to WiPay to complete your payment",
      });
      
      // Either call success callback or redirect to payment URL
      if (onSuccess) {
        onSuccess(data.url);
      } else {
        window.location.href = data.url;
      }
      
    } catch (error) {
      console.error("WiPay payment error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
        <CardDescription>
          Complete your payment for {title}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 p-4 bg-muted/50 rounded-md">
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">${amount.toFixed(2)} TTD</span>
          </div>
          {description && (
            <div className="text-sm text-muted-foreground">
              {description}
            </div>
          )}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Name that will appear on the payment
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
                    <Input type="email" placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    We'll send the receipt to this email
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Payment description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay with WiPay</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start">
        <p className="text-xs text-muted-foreground mb-2">
          By proceeding, you'll be redirected to WiPay to complete your payment securely.
        </p>
        <div className="text-xs text-muted-foreground">
          <Link href={PAGE_ROUTES.PAYMENTS}>
            <a className="text-primary hover:underline">Cancel and return to payments</a>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};