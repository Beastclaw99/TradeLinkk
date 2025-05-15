import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { API_ROUTES, PAGE_ROUTES, paymentStatusEnum } from "@/lib/constants";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  XCircle,
} from "lucide-react";

// Status badge configurations
const statusBadgeConfig = {
  pending: {
    icon: <Clock className="h-4 w-4" />,
    variant: "outline",
  },
  processing: {
    icon: <Clock className="h-4 w-4" />,
    variant: "secondary",
  },
  completed: {
    icon: <CheckCircle className="h-4 w-4" />,
    variant: "success",
  },
  failed: {
    icon: <XCircle className="h-4 w-4" />,
    variant: "destructive",
  },
};

export default function Payments() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");

  // Fetch payments based on user role and active tab
  const { data: payments, isLoading } = useQuery({
    queryKey: [
      activeTab === "sent"
        ? API_ROUTES.PAYMENTS.CLIENT_PAYMENTS(user?.id || 0)
        : API_ROUTES.PAYMENTS.TRADESMAN_PAYMENTS(user?.id || 0),
    ],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const endpoint =
        activeTab === "sent"
          ? API_ROUTES.PAYMENTS.CLIENT_PAYMENTS(user.id)
          : API_ROUTES.PAYMENTS.TRADESMAN_PAYMENTS(user.id);

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }
      return response.json();
    },
    enabled: !!user,
  });

  // Handle view payment details
  const handleViewPayment = (paymentId: number) => {
    setLocation(`${PAGE_ROUTES.PAYMENT_STATUS}?id=${paymentId}`);
  };

  // Handle payment checkout
  const handleMakePayment = (paymentId: number) => {
    setLocation(`/checkout/${paymentId}`);
  };

  if (!user) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p>Please log in to view payments</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Display status badge based on payment status
  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusBadgeConfig[status as keyof typeof statusBadgeConfig] || statusBadgeConfig.pending;
    
    return (
      <Badge 
        variant={config.variant as any} 
        className="flex items-center gap-1"
      >
        {config.icon}
        {paymentStatusEnum.enumValues[status as keyof typeof paymentStatusEnum.enumValues] || status}
      </Badge>
    );
  };

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your {user.role === "client" ? "payments to tradesmen" : "incoming payments"}
          </p>
        </div>
      </div>

      {user.role === "tradesman" ? (
        <Tabs 
          defaultValue="received" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "sent" | "received")}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="received">Received Payments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="received">
            <PaymentsTable 
              payments={payments} 
              isLoading={isLoading} 
              userRole={user.role}
              onViewPayment={handleViewPayment}
              onMakePayment={handleMakePayment}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Tabs 
          defaultValue="sent" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "sent" | "received")}
          className="w-full"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="sent">Your Payments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sent">
            <PaymentsTable 
              payments={payments} 
              isLoading={isLoading} 
              userRole={user.role}
              onViewPayment={handleViewPayment}
              onMakePayment={handleMakePayment}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// Component to display payments in a table
interface PaymentsTableProps {
  payments: any[];
  isLoading: boolean;
  userRole: "client" | "tradesman";
  onViewPayment: (paymentId: number) => void;
  onMakePayment: (paymentId: number) => void;
}

function PaymentsTable({
  payments,
  isLoading,
  userRole,
  onViewPayment,
  onMakePayment,
}: PaymentsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Payments Found</CardTitle>
          <CardDescription>
            {userRole === "client"
              ? "You haven't made any payments yet."
              : "You haven't received any payments yet."}
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="flex justify-center p-6">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              {userRole === "client"
                ? "Payments will appear here once you start paying for contracts or milestones."
                : "Payments from clients will appear here."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">
                  {payment.createdAt
                    ? new Date(payment.createdAt).toLocaleDateString()
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <div>
                    <p>{payment.title || "Payment"}</p>
                    {payment.contract && (
                      <p className="text-xs text-muted-foreground">
                        Contract: {payment.contract.title}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat("en-TT", {
                    style: "currency",
                    currency: "TTD",
                  }).format(payment.amount)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={payment.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewPayment(payment.id)}
                    >
                      View
                    </Button>
                    
                    {payment.status === "pending" && userRole === "client" && (
                      <Button
                        size="sm"
                        onClick={() => onMakePayment(payment.id)}
                      >
                        Pay
                      </Button>
                    )}
                    
                    {payment.invoiceUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a 
                          href={payment.invoiceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}