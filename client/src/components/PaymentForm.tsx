import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
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
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

interface Milestone {
  id: number;
  title: string;
  amount: number;
  description?: string;
  status: string;
}

interface PaymentFormProps {
  milestone: Milestone;
  contractId: number;
  onSuccess?: () => void;
}

// Wrapper component for Stripe Elements
const PaymentForm = ({ milestone, contractId, onSuccess }: PaymentFormProps) => {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const createPaymentIntent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiRequest("POST", "/api/create-payment-intent", {
          milestoneId: milestone.id,
        });
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err.message || "Failed to initialize payment. Please try again.");
        toast({
          title: "Payment Error",
          description: err.message || "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (milestone.id) {
      createPaymentIntent();
    }
  }, [milestone.id, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center p-4">
            <AlertCircle className="h-10 w-10 text-destructive mb-4" />
            <p className="text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentFormContent 
        milestone={milestone} 
        contractId={contractId}
        onSuccess={onSuccess}
      />
    </Elements>
  );
};

// Inner component with Stripe hooks
const PaymentFormContent = ({ 
  milestone, 
  contractId,
  onSuccess 
}: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Confirm the payment
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/payments?success=true",
        },
        redirect: "if_required",
      });

      if (submitError) {
        setPaymentError(submitError.message || "Payment failed. Please try again.");
        toast({
          title: "Payment Failed",
          description: submitError.message || "Payment failed. Please try again.",
          variant: "destructive",
        });
      } else if (paymentIntent) {
        // If payment succeeded, update the payment record
        await apiRequest("POST", "/api/payment-complete", {
          paymentId: milestone.id,
          stripePaymentId: paymentIntent.id,
        });

        setIsComplete(true);
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully!",
        });

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ["/api/user/payments"] });
        queryClient.invalidateQueries({ queryKey: [`/api/contracts/${contractId}`] });

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      setPaymentError(error.message || "An unexpected error occurred");
      toast({
        title: "Payment Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment for Milestone: {milestone.title}</CardTitle>
        <CardDescription>
          Complete your payment securely with credit card
        </CardDescription>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="pt-6">
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Milestone Amount:</span>
            <span className="font-bold">${milestone.amount.toFixed(2)}</span>
          </div>
          
          {milestone.description && (
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              {milestone.description}
            </p>
          )}
        </div>
        
        {isComplete ? (
          <div className="flex flex-col items-center justify-center text-center p-6">
            <CheckCircle className="h-12 w-12 text-success mb-4" />
            <h3 className="text-lg font-medium mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground">
              Your payment has been processed successfully. The milestone has been marked as paid.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <PaymentElement 
              className="mb-6" 
              options={{
                layout: {
                  type: 'tabs', 
                  defaultCollapsed: false
                }
              }}
            />
            
            {paymentError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
                {paymentError}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isProcessing || !stripe || !elements}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $${milestone.amount.toFixed(2)}`
              )}
            </Button>
          </form>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col items-start pt-0">
        <p className="text-xs text-muted-foreground">
          Your payment is secure and encrypted. By completing this payment, you agree to the terms of service.
        </p>
      </CardFooter>
    </Card>
  );
};

export default PaymentForm;
