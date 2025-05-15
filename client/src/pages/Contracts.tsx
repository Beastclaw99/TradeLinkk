import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { API_ROUTES, PAGE_ROUTES, contractStatusEnum } from "@/lib/constants";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Plus,
  FileText,
  CalendarDays,
  DollarSign,
  UserRound,
  User2,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

// Status badge color mapping
const statusBadgeVariant = {
  draft: "outline",
  sent: "secondary",
  signed: "default",
  completed: "success",
  cancelled: "destructive",
};

// Status icon mapping
const statusIcon = {
  draft: <FileText className="h-4 w-4 mr-1" />,
  sent: <Clock className="h-4 w-4 mr-1" />,
  signed: <CheckCircle2 className="h-4 w-4 mr-1" />,
  completed: <CheckCircle2 className="h-4 w-4 mr-1" />,
  cancelled: <XCircle className="h-4 w-4 mr-1" />,
};

const Contracts = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("all");

  // Determine which endpoint to use based on user role
  const apiEndpoint =
    user?.role === "tradesman"
      ? API_ROUTES.CONTRACTS.TRADESMAN
      : API_ROUTES.CONTRACTS.CLIENT;

  // Fetch user's contracts
  const {
    data: contracts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [apiEndpoint],
    queryFn: async () => {
      const response = await fetch(apiEndpoint);
      if (!response.ok) {
        throw new Error("Failed to fetch contracts");
      }
      return response.json();
    },
    enabled: !!user,
  });

  // Filter contracts based on active tab
  const getFilteredContracts = () => {
    if (!contracts) return [];
    
    if (activeTab === "all") {
      return contracts;
    }
    
    return contracts.filter((contract) => contract.status === activeTab);
  };

  if (!user) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p>Please log in to view contracts</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
          <p className="text-muted-foreground">
            Manage your {user.role === "client" ? "projects" : "client"} contracts
          </p>
        </div>
        
        {user.role === "client" && (
          <Button
            onClick={() => setLocation(PAGE_ROUTES.CREATE_CONTRACT)}
            className="w-full md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Contract
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="sent">Pending</TabsTrigger>
              <TabsTrigger value="signed">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="p-6 text-center text-destructive">
              <AlertCircle className="mx-auto h-12 w-12 mb-2" />
              <p>Error loading contracts. Please try again.</p>
            </div>
          ) : !contracts?.length ? (
            <div className="p-6 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No contracts found</p>
              {user.role === "client" && (
                <Button
                  onClick={() => setLocation(PAGE_ROUTES.CREATE_CONTRACT)}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first contract
                </Button>
              )}
            </div>
          ) : !getFilteredContracts().length ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">
                No {activeTab !== "all" ? contractStatusEnum.enumValues[activeTab] : ""} contracts found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>{user?.role === "client" ? "Tradesman" : "Client"}</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredContracts().map((contract) => (
                    <ContractRow 
                      key={contract.id} 
                      contract={contract} 
                      userRole={user.role} 
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ContractRow = ({ contract, userRole }) => {
  const otherParty = userRole === "client" ? contract.tradesman : contract.client;
  const formattedAmount = new Intl.NumberFormat("en-TT", {
    style: "currency",
    currency: "TTD",
  }).format(contract.totalAmount || 0);
  
  const startDate = contract.startDate 
    ? new Date(contract.startDate).toLocaleDateString()
    : "Not set";
    
  const endDate = contract.endDate
    ? new Date(contract.endDate).toLocaleDateString()
    : "Not set";

  return (
    <TableRow>
      <TableCell className="font-medium">
        <Link href={PAGE_ROUTES.CONTRACT(contract.id)}>
          <a className="hover:underline">{contract.title}</a>
        </Link>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center">
          {userRole === "client" ? (
            <User2 className="h-4 w-4 mr-2 text-muted-foreground" />
          ) : (
            <UserRound className="h-4 w-4 mr-2 text-muted-foreground" />
          )}
          {otherParty?.fullName || otherParty?.businessName || "Unknown"}
        </div>
      </TableCell>
      
      <TableCell>
        <Badge 
          variant={statusBadgeVariant[contract.status] || "outline"}
          className="flex items-center w-fit"
        >
          {statusIcon[contract.status]}
          {contractStatusEnum.enumValues[contract.status]}
        </Badge>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center">
          <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">
            {startDate} - {endDate}
          </span>
        </div>
      </TableCell>
      
      <TableCell className="text-right font-medium">
        <div className="flex items-center justify-end">
          <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
          {formattedAmount}
        </div>
      </TableCell>
      
      <TableCell className="text-right">
        <Link href={PAGE_ROUTES.CONTRACT(contract.id)}>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
};

export default Contracts;