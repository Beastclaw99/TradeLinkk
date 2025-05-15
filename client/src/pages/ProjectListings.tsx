import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TRADES, SEO_DESCRIPTIONS, tradeEnum } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, PlusIcon, FilterIcon, Calendar, DollarSign, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProjectListing {
  id: number;
  title: string;
  description: string;
  clientId: number;
  budget: string | null;
  location: string | null;
  trade: keyof typeof tradeEnum.enumValues;
  createdAt: string;
  deadline: string | null;
  status: "open" | "assigned" | "completed";
  applicationCount: number;
  client: {
    fullName: string;
    avatarUrl: string | null;
  };
}

const ProjectListings = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("open");

  // Fetch project listings
  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/project-listings", statusFilter, selectedTrade, searchQuery],
    queryFn: async () => {
      // In a real implementation, we would use these parameters in the API call
      // For now, just show dummy data or data from the response
      return fetch("/api/featured-projects").then(res => res.json());
    }
  });

  // Format project data for display
  const formatProjects = (projectData: any[]): ProjectListing[] => {
    // If we don't have real client project listings yet, adapt featured projects
    return projectData.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      clientId: project.tradesmanId, // Using tradesmanId as clientId for now
      budget: project.budget || "$1,000 - $5,000",
      location: project.location || "Port of Spain, Trinidad",
      trade: "carpentry", // Default for now
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
      status: "open",
      applicationCount: Math.floor(Math.random() * 10),
      client: {
        fullName: "Client Name",
        avatarUrl: null
      }
    }));
  };

  const formattedProjects = projects ? formatProjects(projects) : [];

  const handleCreateProject = () => {
    if (localStorage.getItem("userId")) {
      navigate("/create-client-project");
    } else {
      toast({
        title: "Authentication Required",
        description: "Please log in or register to post a project",
        variant: "destructive"
      });
      navigate("/login");
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Helmet>
        <title>Project Listings | Find Work | TnT Tradesmen</title>
        <meta 
          name="description" 
          content={SEO_DESCRIPTIONS.projects || "Browse project listings and find work opportunities for tradesmen in Trinidad and Tobago."} 
        />
      </Helmet>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Project Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Browse projects posted by clients or post your own project
          </p>
        </div>

        <Button onClick={handleCreateProject} className="flex items-center gap-2">
          <PlusIcon size={16} />
          Post a Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
          <Card className="overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium text-lg">Filters</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Type</label>
                <Select value={selectedTrade} onValueChange={setSelectedTrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trade category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {TRADES.map(trade => (
                      <SelectItem key={trade.value} value={trade.value}>
                        {trade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Project Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open Projects</SelectItem>
                    <SelectItem value="assigned">Assigned Projects</SelectItem>
                    <SelectItem value="completed">Completed Projects</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="port-of-spain">Port of Spain</SelectItem>
                    <SelectItem value="san-fernando">San Fernando</SelectItem>
                    <SelectItem value="arima">Arima</SelectItem>
                    <SelectItem value="chaguanas">Chaguanas</SelectItem>
                    <SelectItem value="point-fortin">Point Fortin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Budget Range</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Budget</SelectItem>
                    <SelectItem value="under-1000">Under $1,000</SelectItem>
                    <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                    <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                    <SelectItem value="10000-plus">$10,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Listings */}
        <div className="lg:col-span-3 space-y-6 order-1 lg:order-2">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search projects..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="newest">
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="budget-high">Budget: High to Low</SelectItem>
                <SelectItem value="budget-low">Budget: Low to High</SelectItem>
                <SelectItem value="deadline">Deadline: Soonest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : formattedProjects.length === 0 ? (
            <Card className="py-16">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <SearchIcon size={24} className="text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search criteria</p>
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setSelectedTrade("");
                  setStatusFilter("open");
                }}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {formattedProjects.map((project) => (
                <Link key={project.id} href={`/project-details/${project.id}`}>
                  <Card className="cursor-pointer transition-all hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-grow">
                          <div className="flex flex-wrap gap-2 mb-1">
                            <Badge variant="outline" className="font-normal text-xs">
                              {TRADES.find(t => t.value === project.trade)?.label || "General"}
                            </Badge>
                            <Badge variant={project.status === "open" ? "default" : project.status === "assigned" ? "secondary" : "outline"} className="font-normal text-xs">
                              {project.status === "open" ? "Open" : project.status === "assigned" ? "Assigned" : "Completed"}
                            </Badge>
                          </div>

                          <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                            {project.title}
                          </h3>

                          <p className="text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 text-sm mt-3">
                            <div className="flex items-center gap-2">
                              <DollarSign size={16} className="text-muted-foreground" />
                              <span>{project.budget || "Not specified"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={16} className="text-muted-foreground" />
                              <span>{project.location || "Remote"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-muted-foreground" />
                              <span>
                                {project.deadline ? new Date(project.deadline).toLocaleDateString() : "Flexible"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-6 py-3 bg-muted/30 border-t flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Posted {new Date(project.createdAt).toLocaleDateString()} by {project.client.fullName}
                      </div>
                      <div className="text-sm font-medium">
                        {project.applicationCount} application{project.applicationCount !== 1 ? "s" : ""}
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectListings;