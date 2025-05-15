import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { API_ROUTES, PAGE_ROUTES, paymentStatusEnum } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, AlertTriangle, Loader2, ArrowLeft } from "lucide-react";

export default function PaymentStatus() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const paymentId = parseInt(searchParams.get("id") || "0");
  const status = searchParams.get("status") || "";
  
  // Status indicator icons and styles based on payment status
  const statusDetails = {
    pending: {
      icon: <Clock className="h-12 w-12 text-warning" />,
      variant: "warning",
      title: "Payment Pending",
      description: "Your payment is being processed. This may take a moment.",
      progress: 30,
    },
    processing: {
      icon: <Clock className="h-12 w-12 text-warning" />,
      variant: "warning",
      title: "Payment Processing",
      description: "Your payment is being processed. Please wait a moment.",
      progress: 60,
    },
    completed: {
      icon: <CheckCircle className="h-12 w-12 text-success" />,
      variant: "success",
      title: "Payment Successful",
      description: "Your payment has been successfully processed.",
      progress: 100,
    },
    failed: {
      icon: <XCircle className="h-12 w-12 text-destructive" />,
      variant: "destructive",
      title: "Payment Failed",
      description: "Sorry, your payment could not be processed. Please try again.",
      progress: 0,
    },
  };
  
  // Status colors for message and progress bar
  const statusColors = {
    pending: "text-warning",
    processing: "text-warning",
    completed: "text-success",
    failed: "text-destructive",
  };
  
  // Poll the API to check payment status
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [API_ROUTES.PAYMENTS.PAYMENT_STATUS(paymentId)],
    queryFn: async () => {
      if (!paymentId) return null;
      
      const response = await fetch(API_ROUTES.PAYMENTS.PAYMENT_STATUS(paymentId), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch payment status");
      }
      
      return response.json();
    },
    enabled: !!paymentId && !!user,
    refetchInterval: (data) => {
      // Stop polling if payment is completed or failed
      if (data?.status === "completed" || data?.status === "failed") {
        return false;
      }
      return 5000; // Poll every 5 seconds for pending or processing
    },
  });
  
  // Update URL with latest status (without page reload)
  useEffect(() => {
    if (data?.status && data.status !== status) {
      const url = new URL(window.location.href);
      url.searchParams.set("status", data.status);
      window.history.replaceState({}, "", url.toString());
    }
  }, [data, status]);
  
  // Decide what to display based on current status
  const currentStatus = data?.status || status || "pending";
  const statusInfo = statusDetails[currentStatus as keyof typeof statusDetails] || statusDetails.pending;
  
  // Handle back to payments
  const handleBackToPayments = () => {
    setLocation(PAGE_ROUTES.PAYMENTS);
  };
  
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
      
      <h1 className="text-3xl font-bold tracking-tight mb-2">Payment Status</h1>
      <p className="text-muted-foreground mb-6">
        Track the progress of your payment
      </p>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Payment Details</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Checking payment status...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-destructive font-medium mb-2">Error</p>
              <p className="text-muted-foreground text-center">
                {error instanceof Error ? error.message : "Failed to check payment status"}
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => refetch()}
              >
                Try Again
              </Button>
            </div>
          ) : !data ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertTriangle className="h-12 w-12 text-warning mb-4" />
              <p className="text-warning font-medium mb-2">Payment Not Found</p>
              <p className="text-muted-foreground text-center">
                We couldn't find details for this payment.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleBackToPayments}
              >
                View All Payments
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                {statusInfo.icon}
                <h2 className={`text-xl font-semibold mt-4 ${statusColors[currentStatus as keyof typeof statusColors]}`}>
                  {statusInfo.title}
                </h2>
                <p className="text-muted-foreground mt-2 max-w-md">
                  {statusInfo.description}
                </p>
                
                <div className="w-full max-w-md mt-6">
                  <Progress 
                    value={statusInfo.progress} 
                    className={`h-2 ${
                      currentStatus === 'completed' 
                        ? 'bg-muted/30 [&>div]:bg-success' 
                        : currentStatus === 'failed'
                          ? 'bg-muted/30 [&>div]:bg-destructive'
                          : 'bg-muted/30 [&>div]:bg-warning'
                    }`}
                  />
                </div>
              </div>
            
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("en-TT", {
                      style: "currency",
                      currency: "TTD",
                    }).format(data.amount || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment ID:</span>
                  <span className="font-medium">{data.paymentId}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`font-medium ${statusColors[currentStatus as keyof typeof statusColors]}`}>
                    {paymentStatusEnum.enumValues[currentStatus as keyof typeof paymentStatusEnum.enumValues] || "Unknown"}
                  </span>
                </div>
                
                {data.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Completed:</span>
                    <span className="font-medium">
                      {new Date(data.completedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center border-t pt-6">
          {currentStatus === "completed" ? (
            <Button onClick={handleBackToPayments}>
              Return to Payments
            </Button>
          ) : currentStatus === "failed" ? (
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBackToPayments}>
                Back to Payments
              </Button>
              <Button onClick={() => setLocation(`/checkout/${paymentId}`)}>
                Try Again
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => refetch()}>
              <span className="mr-2">Refresh Status</span>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}