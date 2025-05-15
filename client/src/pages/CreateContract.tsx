import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { API_ROUTES, PAGE_ROUTES } from "@/lib/constants";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, User2 } from "lucide-react";

import ContractForm from "@/components/ContractForm";

const CreateContract = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const params = useParams();
  
  // Optional tradesman ID from URL param (e.g., /create-contract?tradesman=123)
  const [selectedTradesmanId, setSelectedTradesmanId] = useState<number | null>(
    params?.tradesman ? parseInt(params.tradesman) : null
  );
  
  // Fetch available tradesmen
  const {
    data: tradesmen,
    isLoading: loadingTradesmen,
    isError: tradesmenError,
  } = useQuery({
    queryKey: [API_ROUTES.USERS.TRADESMEN],
    queryFn: async () => {
      const response = await fetch(API_ROUTES.USERS.TRADESMEN);
      if (!response.ok) {
        throw new Error("Failed to fetch tradesmen");
      }
      return response.json();
    },
    enabled: !!user && user.role === "client",
  });

  // Handle form submission success
  const handleSuccess = (contractId: number) => {
    setLocation(PAGE_ROUTES.CONTRACT(contractId));
  };

  // If user isn't logged in or isn't a client
  if (!user) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p>Please log in to create a contract</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (user.role !== "client") {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p>Only clients can create contracts</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setLocation(PAGE_ROUTES.CONTRACTS)}
            >
              View Your Contracts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation(PAGE_ROUTES.CONTRACTS)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contracts
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create Contract</h1>
          <p className="text-muted-foreground mb-6">
            Draft a new contract agreement with a tradesman
          </p>

          {!selectedTradesmanId ? (
            <Card>
              <CardHeader>
                <CardTitle>Select a Tradesman</CardTitle>
                <CardDescription>
                  First, choose who you'd like to create a contract with
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTradesmen ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : tradesmenError ? (
                  <div className="text-center py-8 text-destructive">
                    Error loading tradesmen. Please try again.
                  </div>
                ) : !tradesmen?.length ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No tradesmen found. Browse the marketplace to find tradesmen.
                    </p>
                    <Button
                      onClick={() => setLocation(PAGE_ROUTES.SEARCH)}
                      className="mt-4"
                    >
                      Find Tradesmen
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Select
                      onValueChange={(value) => setSelectedTradesmanId(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tradesman" />
                      </SelectTrigger>
                      <SelectContent>
                        {tradesmen.map((tradesman) => (
                          <SelectItem
                            key={tradesman.profile.id}
                            value={tradesman.profile.id.toString()}
                          >
                            {tradesman.profile.businessName} - {tradesman.profile.trade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              {tradesmen && selectedTradesmanId && (
                <ContractForm
                  tradesmanId={selectedTradesmanId}
                  clientId={user.id}
                  onSuccess={handleSuccess}
                />
              )}
            </Card>
          )}
        </div>

        {/* Sidebar - tradesman info if selected */}
        {selectedTradesmanId && tradesmen && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Selected Tradesman</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                {tradesmen.map(
                  (tradesman) =>
                    tradesman.profile.id === selectedTradesmanId && (
                      <div key={tradesman.profile.id} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-muted rounded-full p-2">
                            <User2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {tradesman.profile.businessName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {tradesman.profile.trade}
                            </p>
                          </div>
                        </div>
                        
                        {tradesman.profile.hourlyRate && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Rate:</span>{" "}
                            ${tradesman.profile.hourlyRate}/hr
                          </div>
                        )}
                        
                        {tradesman.profile.experience && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Experience:</span>{" "}
                            {tradesman.profile.experience} years
                          </div>
                        )}
                        
                        {tradesman.user.location && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Location:</span>{" "}
                            {tradesman.user.location}
                          </div>
                        )}
                      </div>
                    )
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedTradesmanId(null)}
                >
                  Change Tradesman
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateContract;