import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  Filter, 
  Search, 
  X, 
  ChevronDown, 
  ClipboardList,
  Clock,
  Check
} from "lucide-react";
import { TRADES, SEO_DESCRIPTIONS } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { DatePicker } from "@/components/ui/date-picker";

const ProjectListings = () => {
  const [_, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState({
    query: "",
    trade: "",
    location: "",
    budget: [0, 5000],
    datePosted: null,
    sortBy: "recent"
  });
  const [activeFilters, setActiveFilters] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (searchParams.trade) count++;
    if (searchParams.location) count++;
    if (searchParams.budget[0] > 0 || searchParams.budget[1] < 5000) count++;
    if (searchParams.datePosted) count++;
    setActiveFilters(count);
  }, [searchParams]);

  // Fetch projects data
  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/client-projects", searchParams],
    queryFn: async () => {
      // For now, just simulate some project data similar to Field Nation
      // Later this would come from the API with real filtering
      
      try {
        const featuredProjects = await fetch("/api/featured-projects").then(res => res.json());
        
        // Generate additional projects to make the list more substantial
        const additionalProjects = Array(12).fill(0).map((_, index) => {
          const id = 100 + index;
          const randomTrade = TRADES[Math.floor(Math.random() * TRADES.length)].value;
          const locations = ["Port of Spain", "San Fernando", "Arima", "Chaguanas", "Point Fortin"];
          const randomLocation = locations[Math.floor(Math.random() * locations.length)];
          const randomBudget = Math.floor(Math.random() * 4000) + 1000;
          
          return {
            id,
            title: [
              "Commercial Electrical Installation", 
              "Office Renovation Project",
              "Residential Plumbing Repair",
              "Exterior House Painting",
              "Roof Replacement and Repair",
              "Kitchen Cabinet Installation",
              "HVAC System Maintenance",
              "Bathroom Remodeling Project",
              "Drywall Installation and Finishing",
              "Landscaping and Garden Design"
            ][Math.floor(Math.random() * 10)],
            description: "Looking for a professional tradesman to complete this project with attention to detail and quality workmanship.",
            trade: randomTrade,
            location: randomLocation,
            budget: `$${randomBudget} - $${randomBudget + 500}`,
            budgetType: Math.random() > 0.5 ? "fixed" : "hourly",
            deadline: new Date(Date.now() + (Math.floor(Math.random() * 30) + 1) * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - (Math.floor(Math.random() * 14) + 1) * 24 * 60 * 60 * 1000).toISOString(),
            status: "open",
            clientId: Math.floor(Math.random() * 10) + 1,
            applicationCount: Math.floor(Math.random() * 10),
            skills: ["Professional experience", "Quality workmanship", "Attention to detail"],
            client: {
              fullName: `Client ${id}`,
              location: randomLocation,
              rating: (Math.random() * 2 + 3).toFixed(1),
              projectsPosted: Math.floor(Math.random() * 20)
            }
          };
        });
        
        const allProjects = [...featuredProjects, ...additionalProjects];
        
        // Apply filters
        let filtered = allProjects;
        
        if (searchParams.query) {
          const query = searchParams.query.toLowerCase();
          filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(query) || 
            p.description.toLowerCase().includes(query)
          );
        }
        
        if (searchParams.trade) {
          filtered = filtered.filter(p => p.trade === searchParams.trade);
        }
        
        if (searchParams.location) {
          filtered = filtered.filter(p => p.location?.toLowerCase().includes(searchParams.location.toLowerCase()));
        }
        
        // Sort projects
        switch (searchParams.sortBy) {
          case "recent":
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case "deadline":
            filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
            break;
          case "budget-high":
            filtered.sort((a, b) => {
              const extractValue = (str: string) => {
                const match = str.match(/\$(\d+)/);
                return match ? parseInt(match[1]) : 0;
              };
              return extractValue(b.budget) - extractValue(a.budget);
            });
            break;
          case "budget-low":
            filtered.sort((a, b) => {
              const extractValue = (str: string) => {
                const match = str.match(/\$(\d+)/);
                return match ? parseInt(match[1]) : 0;
              };
              return extractValue(a.budget) - extractValue(b.budget);
            });
            break;
        }
        
        return filtered;
      } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
      }
    }
  });

  const handleFilterChange = (key: string, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setSearchParams({
      query: "",
      trade: "",
      location: "",
      budget: [0, 5000],
      datePosted: null,
      sortBy: "recent"
    });
  };

  const handlePostProject = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in or register to post a project",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    if (user?.role !== "client") {
      toast({
        title: "Client Account Required",
        description: "You need a client account to post projects",
        variant: "destructive"
      });
      return;
    }
    
    navigate("/create-client-project");
  };

  const handleApply = (projectId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in or register to apply for projects",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    if (user?.role !== "tradesman") {
      toast({
        title: "Tradesman Account Required",
        description: "You need a tradesman account to apply for projects",
        variant: "destructive"
      });
      return;
    }
    
    navigate(`/project-details/${projectId}`);
  };

  const handleViewDetails = (projectId: number) => {
    navigate(`/project-details/${projectId}`);
  };

  const renderDesktopFilters = () => (
    <div className="w-full lg:w-1/4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {activeFilters > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="trade-filter" className="text-sm font-medium block mb-2">
            Trade Category
          </label>
          <Select 
            value={searchParams.trade} 
            onValueChange={(value) => handleFilterChange("trade", value)}
          >
            <SelectTrigger id="trade-filter">
              <SelectValue placeholder="All trades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All trades</SelectItem>
              {TRADES.map((trade) => (
                <SelectItem key={trade.value} value={trade.value}>
                  {trade.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="location-filter" className="text-sm font-medium block mb-2">
            Location
          </label>
          <div className="flex space-x-2">
            <Input
              id="location-filter"
              placeholder="Enter location"
              value={searchParams.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium block mb-2">
            Budget Range
          </label>
          <div className="px-2">
            <Slider
              defaultValue={searchParams.budget}
              min={0}
              max={5000}
              step={100}
              value={searchParams.budget}
              onValueChange={(value) => handleFilterChange("budget", value)}
              className="my-5"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${searchParams.budget[0]}</span>
              <span>${searchParams.budget[1]}</span>
            </div>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium block mb-2">
            Date Posted
          </label>
          <DatePicker
            date={searchParams.datePosted}
            setDate={(date) => handleFilterChange("datePosted", date)}
          />
        </div>
        
        <div>
          <label htmlFor="sort-by" className="text-sm font-medium block mb-2">
            Sort By
          </label>
          <Select 
            value={searchParams.sortBy} 
            onValueChange={(value) => handleFilterChange("sortBy", value)}
          >
            <SelectTrigger id="sort-by">
              <SelectValue placeholder="Most recent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most recent</SelectItem>
              <SelectItem value="deadline">Closest deadline</SelectItem>
              <SelectItem value="budget-high">Budget: High to low</SelectItem>
              <SelectItem value="budget-low">Budget: Low to high</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderMobileFilters = () => (
    <div className="w-full mb-6 flex items-center justify-between">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
            {activeFilters > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {activeFilters}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] sm:max-w-none">
          <SheetHeader className="mb-4">
            <SheetTitle>Filter Projects</SheetTitle>
            <SheetDescription>
              Narrow down projects based on your preferences
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 overflow-y-auto flex-1 pb-20">
            <Accordion type="single" collapsible className="w-full" defaultValue="trade">
              <AccordionItem value="trade">
                <AccordionTrigger>Trade Category</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2">
                    {TRADES.map((trade) => (
                      <div 
                        key={trade.value} 
                        className={`flex items-center space-x-2 rounded-md border p-2 cursor-pointer ${
                          searchParams.trade === trade.value ? 'border-primary bg-primary/10' : ''
                        }`}
                        onClick={() => handleFilterChange("trade", searchParams.trade === trade.value ? "" : trade.value)}
                      >
                        <Checkbox 
                          checked={searchParams.trade === trade.value}
                          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <label className="text-sm cursor-pointer flex-1">{trade.label}</label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="location">
                <AccordionTrigger>Location</AccordionTrigger>
                <AccordionContent>
                  <Input
                    placeholder="Enter location"
                    value={searchParams.location}
                    onChange={(e) => handleFilterChange("location", e.target.value)}
                  />
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="budget">
                <AccordionTrigger>Budget Range</AccordionTrigger>
                <AccordionContent>
                  <div className="px-2">
                    <Slider
                      defaultValue={searchParams.budget}
                      min={0}
                      max={5000}
                      step={100}
                      value={searchParams.budget}
                      onValueChange={(value) => handleFilterChange("budget", value)}
                      className="my-5"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${searchParams.budget[0]}</span>
                      <span>${searchParams.budget[1]}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="date">
                <AccordionTrigger>Date Posted</AccordionTrigger>
                <AccordionContent>
                  <DatePicker
                    date={searchParams.datePosted}
                    setDate={(date) => handleFilterChange("datePosted", date)}
                  />
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="sort">
                <AccordionTrigger>Sort By</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {[
                      { value: "recent", label: "Most recent" },
                      { value: "deadline", label: "Closest deadline" },
                      { value: "budget-high", label: "Budget: High to low" },
                      { value: "budget-low", label: "Budget: Low to high" }
                    ].map((option) => (
                      <div 
                        key={option.value} 
                        className={`flex items-center space-x-2 rounded-md border p-2 cursor-pointer ${
                          searchParams.sortBy === option.value ? 'border-primary bg-primary/10' : ''
                        }`}
                        onClick={() => handleFilterChange("sortBy", option.value)}
                      >
                        <div className="h-4 w-4 rounded-full border flex items-center justify-center">
                          {searchParams.sortBy === option.value && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <label className="text-sm cursor-pointer flex-1">{option.label}</label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
            <div className="flex space-x-2 w-full">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={clearFilters}
              >
                Clear All
              </Button>
              <SheetClose asChild>
                <Button className="flex-1">
                  View Results ({projects?.length || 0})
                </Button>
              </SheetClose>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      <div className="flex items-center space-x-2">
        <Select 
          value={searchParams.sortBy} 
          onValueChange={(value) => handleFilterChange("sortBy", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most recent</SelectItem>
            <SelectItem value="deadline">Closest deadline</SelectItem>
            <SelectItem value="budget-high">Budget: High to low</SelectItem>
            <SelectItem value="budget-low">Budget: Low to high</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-10 px-4">
      <Helmet>
        <title>Project Marketplace | Find Work | TnT Tradesmen</title>
        <meta
          name="description"
          content={SEO_DESCRIPTIONS.projects}
        />
      </Helmet>
      
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Project Marketplace</h1>
            <p className="mt-2 text-muted-foreground">
              Browse available projects and find work that matches your skills
            </p>
          </div>
          
          <Button onClick={handlePostProject}>
            <ClipboardList className="h-4 w-4 mr-2" />
            Post a Project
          </Button>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="w-full rounded-lg border bg-card p-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects by keyword..."
                className="w-full pl-8"
                value={searchParams.query}
                onChange={(e) => handleFilterChange("query", e.target.value)}
              />
            </div>
          </div>
          
          {activeFilters > 0 && (
            <div className="flex flex-wrap gap-2">
              {searchParams.trade && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span>{TRADES.find(t => t.value === searchParams.trade)?.label || searchParams.trade}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange("trade", "")}
                  />
                </Badge>
              )}
              
              {searchParams.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{searchParams.location}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange("location", "")}
                  />
                </Badge>
              )}
              
              {(searchParams.budget[0] > 0 || searchParams.budget[1] < 5000) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>${searchParams.budget[0]} - ${searchParams.budget[1]}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange("budget", [0, 5000])}
                  />
                </Badge>
              )}
              
              {searchParams.datePosted && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>After {searchParams.datePosted.toLocaleDateString()}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange("datePosted", null)}
                  />
                </Badge>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-7 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
        
        <div className="w-full h-px bg-border" />
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - Desktop */}
          {!isMobile && renderDesktopFilters()}
          
          {/* Projects Grid */}
          <div className="w-full lg:w-3/4">
            {/* Mobile Filters */}
            {isMobile && renderMobileFilters()}
            
            {isLoading ? (
              <div className="flex flex-col space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full h-32 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{projects.length} projects found</span>
                  {!isMobile && (
                    <span>
                      Sort by: 
                      <Select 
                        value={searchParams.sortBy} 
                        onValueChange={(value) => handleFilterChange("sortBy", value)}
                      >
                        <SelectTrigger className="border-none h-auto p-0 pl-2 pr-1 font-medium text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Most recent</SelectItem>
                          <SelectItem value="deadline">Closest deadline</SelectItem>
                          <SelectItem value="budget-high">Budget: High to low</SelectItem>
                          <SelectItem value="budget-low">Budget: Low to high</SelectItem>
                        </SelectContent>
                      </Select>
                    </span>
                  )}
                </div>
                
                <div className="grid gap-4">
                  {projects.map((project) => {
                    const tradeName = TRADES.find(t => t.value === project.trade)?.label || "General Work";
                    const daysAgo = Math.floor((new Date().getTime() - new Date(project.createdAt).getTime()) / (1000 * 3600 * 24));
                    const daysToDeadline = Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                    
                    return (
                      <Card key={project.id} className="overflow-hidden">
                        <CardHeader className="p-4 pb-0">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline">{tradeName}</Badge>
                            <Badge variant="secondary" className="font-normal">
                              {daysToDeadline} days left
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">
                            <span 
                              className="cursor-pointer hover:text-primary transition-colors"
                              onClick={() => handleViewDetails(project.id)}
                            >
                              {project.title}
                            </span>
                          </CardTitle>
                          <CardDescription className="line-clamp-2 mt-1">
                            {project.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 text-sm">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{project.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>{project.budget}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{daysAgo === 0 ? 'Today' : `${daysAgo} days ago`}</span>
                            </div>
                          </div>
                          
                          {project.skills && project.skills.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {project.skills.map((skill, i) => (
                                <div key={i} className="flex items-center text-xs px-2 py-1 rounded-full bg-muted">
                                  <Check className="h-3 w-3 mr-1 text-primary" />
                                  {skill}
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between items-center">
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <span>{project.applicationCount} applications</span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(project.id)}
                            >
                              View Details
                            </Button>
                            {user?.role !== "client" && (
                              <Button 
                                size="sm"
                                onClick={() => handleApply(project.id)}
                              >
                                Apply
                              </Button>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No projects found</h3>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your filters or search term
                </p>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectListings;