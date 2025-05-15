import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { API_ROUTES, PAGE_ROUTES } from "@/lib/constants";
import { WiPayForm } from "@/components/WiPayForm";

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
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";

export default function Checkout() {
  const [match, params] = useRoute("/checkout/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const paymentId = match ? parseInt(params?.id || "0") : 0;

  // Fetch payment details
  const {
    data: payment,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [`${API_ROUTES.PAYMENTS.GET_PAYMENT(paymentId)}`],
    queryFn: async () => {
      const response = await fetch(API_ROUTES.PAYMENTS.GET_PAYMENT(paymentId));
      if (!response.ok) {
        throw new Error("Failed to fetch payment details");
      }
      return response.json();
    },
    enabled: !!paymentId && !!user,
  });

  // Handle WiPay form submission success
  const handlePaymentSuccess = (url: string) => {
    // Redirect to WiPay checkout page
    window.location.href = url;
  };

  // Handle back to payments
  const handleBackToPayments = () => {
    setLocation(PAGE_ROUTES.PAYMENTS);
  };

  // Authentication guard
  if (!user) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to proceed with checkout</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation("/login")}>Log In</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-xl py-12">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToPayments}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold tracking-tight mb-2">Checkout</h1>
      <p className="text-muted-foreground mb-6">
        Complete your payment securely
      </p>

      <Card>
        {isLoading ? (
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">
              Loading payment details...
            </p>
          </CardContent>
        ) : isError ? (
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-4">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
            <Button
              variant="outline"
              onClick={handleBackToPayments}
              className="mt-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Payments
            </Button>
          </CardContent>
        ) : paymentSuccess ? (
          <CardContent className="py-8 text-center">
            <div className="mb-4 text-center">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Payment Processing</h3>
              <p className="text-muted-foreground mt-2">
                Your payment is being processed. You will be redirected to WiPay to complete your payment.
              </p>
            </div>
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle>{payment?.title || "Payment"}</CardTitle>
              <CardDescription>
                Please review and confirm your payment
              </CardDescription>
            </CardHeader>
            
            <Separator />
            
            <CardContent className="pt-6">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="text-xl font-semibold">
                    {new Intl.NumberFormat("en-TT", {
                      style: "currency",
                      currency: "TTD",
                    }).format(payment?.amount || 0)}
                  </span>
                </div>
                
                {payment?.milestone && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Milestone:</span>
                    <span>{payment.milestone.title}</span>
                  </div>
                )}
                
                {payment?.contract && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Contract:</span>
                    <span>{payment.contract.title}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tradesman:</span>
                  <span>{payment?.tradesmanName || "N/A"}</span>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <WiPayForm
                paymentId={payment?.id || 0}
                amount={payment?.amount || 0}
                title={payment?.title || "Payment"}
                description={payment?.description || ""}
                onSuccess={handlePaymentSuccess}
              />
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}