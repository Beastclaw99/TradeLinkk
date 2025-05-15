import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/lib/auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileCompleteness from "@/components/ProfileCompleteness";
import { 
  BriefcaseIcon, 
  FileText, 
  MessageSquare, 
  CreditCard, 
  StarIcon, 
  ChevronRight,
  Loader2
} from "lucide-react";

interface Contract {
  id: number;
  title: string;
  status: string;
  startDate?: string;
  endDate?: string;
  totalAmount?: number;
  client: {
    fullName: string;
    avatarUrl?: string;
  };
  tradesman: {
    businessName: string;
  };
  tradesmanUser: {
    fullName: string;
    avatarUrl?: string;
  };
}

interface Message {
  otherUser: {
    id: number;
    fullName: string;
    avatarUrl?: string;
  };
  tradesmanProfile?: {
    businessName: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
}

const Dashboard = () => {
  const { user, tradesmanProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get contracts
  const { data: contracts, isLoading: contractsLoading } = useQuery<Contract[]>({
    queryKey: ["/api/user/contracts"],
    enabled: !!user,
  });
  
  // Get conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations"],
    enabled: !!user,
  });
  
  // Count contract status totals
  const contractCounts = {
    active: contracts?.filter(c => c.status === 'signed').length || 0,
    pending: contracts?.filter(c => c.status === 'draft' || c.status === 'sent').length || 0,
    completed: contracts?.filter(c => c.status === 'completed').length || 0
  };
  
  return (
    <>
      <Helmet>
        <title>Dashboard | TradeLink</title>
        <meta name="description" content="View your TradeLink dashboard - manage contracts, messages, and profile." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.fullName}
          </p>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            {/* Profile overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Profile Overview</CardTitle>
                  <CardDescription>
                    Manage your personal information and visibility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                      <AvatarFallback>{user?.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-4 flex-1">
                      <div>
                        <h3 className="font-medium text-lg">{user?.fullName}</h3>
                        <p className="text-muted-foreground">{user?.email}</p>
                      </div>
                      
                      {user?.role === 'tradesman' && tradesmanProfile ? (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Profile Completeness</span>
                            <span className="text-sm font-medium">{tradesmanProfile.completenessScore}%</span>
                          </div>
                          <Progress value={tradesmanProfile.completenessScore} className="h-2" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Account Type</span>
                            <Badge>{user?.role === 'tradesman' ? 'Tradesman' : 'Client'}</Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" asChild>
                    <Link href="/profile">Manage Profile</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {user?.role === 'tradesman' && tradesmanProfile ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>
                      Your tradesman profile details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">{tradesmanProfile.businessName}</h3>
                        <Badge className="mt-1 capitalize">{tradesmanProfile.trade.replace('_', ' ')}</Badge>
                      </div>
                      
                      <div className="text-sm">
                        <div className="flex justify-between py-1 border-b">
                          <span className="text-muted-foreground">Experience</span>
                          <span>{tradesmanProfile.experience} years</span>
                        </div>
                        {tradesmanProfile.hourlyRate && (
                          <div className="flex justify-between py-1 border-b">
                            <span className="text-muted-foreground">Hourly Rate</span>
                            <span>${tradesmanProfile.hourlyRate}/hr</span>
                          </div>
                        )}
                        {tradesmanProfile.licenseNumber && (
                          <div className="flex justify-between py-1 border-b">
                            <span className="text-muted-foreground">License</span>
                            <span>{tradesmanProfile.licenseNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <Button variant="default" className="w-full" asChild>
                      <Link href="/projects">Manage Projects</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/edit-profile">Edit Profile</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ) : user?.role === 'client' ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Client Options</CardTitle>
                    <CardDescription>
                      Tools for managing your projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-2 rounded-lg border">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <BriefcaseIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Find Tradesmen</h3>
                          <p className="text-sm text-muted-foreground">Search for qualified professionals</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-2 rounded-lg border">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Manage Contracts</h3>
                          <p className="text-sm text-muted-foreground">Review and sign agreements</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-2 rounded-lg border">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Process Payments</h3>
                          <p className="text-sm text-muted-foreground">Pay for completed milestones</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href="/search">Find Tradesman</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Become a Tradesman</CardTitle>
                    <CardDescription>
                      Create a professional profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">
                      Create a tradesman profile to showcase your skills, receive job inquiries, and manage contracts through our platform.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">✓</div>
                        <span className="text-sm">Professional portfolio</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">✓</div>
                        <span className="text-sm">Digital contracts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">✓</div>
                        <span className="text-sm">Secure payments</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href="/create-profile">Create Tradesman Profile</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
            
            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Contracts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {contractsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      contractCounts.active
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Contracts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {contractsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      contractCounts.pending
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed Contracts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {contractsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      contractCounts.completed
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent activity */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your latest contracts and messages
                    </CardDescription>
                  </div>
                  <Link href="/contracts">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : contracts && contracts.length > 0 ? (
                  <div className="space-y-4">
                    {contracts.slice(0, 3).map((contract) => (
                      <Link key={contract.id} href={`/contracts/${contract.id}`}>
                        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={user?.role === 'client' 
                                ? contract.tradesmanUser.avatarUrl 
                                : contract.client.avatarUrl} 
                              alt={user?.role === 'client' 
                                ? contract.tradesmanUser.fullName 
                                : contract.client.fullName} 
                            />
                            <AvatarFallback>
                              {user?.role === 'client' 
                                ? contract.tradesmanUser.fullName.charAt(0) 
                                : contract.client.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-medium line-clamp-1">{contract.title}</h3>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground">
                                With {user?.role === 'client' 
                                  ? contract.tradesman.businessName 
                                  : contract.client.fullName}
                              </p>
                              <Badge variant={
                                contract.status === 'signed' ? 'default' : 
                                contract.status === 'completed' ? 'success' : 
                                'secondary'
                              }>
                                {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No contracts found</p>
                    <Button variant="outline" className="mt-4" asChild>
                      {user?.role === 'tradesman' ? (
                        <Link href="/create-contract">Create Contract</Link>
                      ) : (
                        <Link href="/search">Find Tradesmen</Link>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contracts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Your Contracts</CardTitle>
                    <CardDescription>
                      Manage your agreements with {user?.role === 'tradesman' ? 'clients' : 'tradesmen'}
                    </CardDescription>
                  </div>
                  {user?.role === 'tradesman' && (
                    <Button asChild>
                      <Link href="/create-contract">New Contract</Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 border-b last:border-0">
                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : contracts && contracts.length > 0 ? (
                  <div className="space-y-2">
                    {contracts.map((contract) => (
                      <Link key={contract.id} href={`/contracts/${contract.id}`}>
                        <div className="flex items-start gap-3 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={user?.role === 'client' 
                                ? contract.tradesmanUser.avatarUrl 
                                : contract.client.avatarUrl} 
                              alt={user?.role === 'client' 
                                ? contract.tradesmanUser.fullName 
                                : contract.client.fullName} 
                            />
                            <AvatarFallback>
                              {user?.role === 'client' 
                                ? contract.tradesmanUser.fullName.charAt(0) 
                                : contract.client.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium line-clamp-1">{contract.title}</h3>
                              <Badge variant={
                                contract.status === 'signed' ? 'default' : 
                                contract.status === 'completed' ? 'success' : 
                                'secondary'
                              }>
                                {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="flex justify-between mt-1">
                              <p className="text-sm text-muted-foreground">
                                With {user?.role === 'client' 
                                  ? contract.tradesman.businessName 
                                  : contract.client.fullName}
                              </p>
                              {contract.totalAmount && (
                                <p className="text-sm font-medium">
                                  ${contract.totalAmount.toLocaleString()}
                                </p>
                              )}
                            </div>
                            {(contract.startDate || contract.endDate) && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {contract.startDate && `Starts: ${new Date(contract.startDate).toLocaleDateString()}`}
                                {contract.startDate && contract.endDate && ' • '}
                                {contract.endDate && `Ends: ${new Date(contract.endDate).toLocaleDateString()}`}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No contracts found</p>
                    <Button variant="outline" className="mt-4" asChild>
                      {user?.role === 'tradesman' ? (
                        <Link href="/create-contract">Create Contract</Link>
                      ) : (
                        <Link href="/search">Find Tradesmen</Link>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/contracts">View All Contracts</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Messages</CardTitle>
                    <CardDescription>
                      Conversations with {user?.role === 'tradesman' ? 'clients' : 'tradesmen'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {conversationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 border-b last:border-0">
                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations && conversations.length > 0 ? (
                  <div className="space-y-2">
                    {conversations.map((conversation, index) => (
                      <Link key={index} href={`/messages/${conversation.otherUser.id}`}>
                        <div className="flex items-start gap-3 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={conversation.otherUser.avatarUrl} 
                              alt={conversation.otherUser.fullName} 
                            />
                            <AvatarFallback>
                              {conversation.otherUser.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="font-medium line-clamp-1">
                                {conversation.otherUser.fullName}
                              </h3>
                              {conversation.unreadCount > 0 && (
                                <Badge className="rounded-full px-2">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            {conversation.tradesmanProfile && (
                              <p className="text-xs text-muted-foreground">
                                {conversation.tradesmanProfile.businessName}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {conversation.lastMessage.content}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No messages found</p>
                    <Button variant="outline" className="mt-4" asChild>
                      {user?.role === 'tradesman' ? (
                        <Link href="/search?role=client">Find Clients</Link>
                      ) : (
                        <Link href="/search">Find Tradesmen</Link>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/messages">View All Messages</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Dashboard;
