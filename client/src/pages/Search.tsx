import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Search as SearchIcon,
  Star,
  MapPin,
  Hammer,
  Clock,
  Briefcase,
} from "lucide-react";

import { tradeEnum } from "@/lib/constants";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrade, setSelectedTrade] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term to prevent too many API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Construct the query string
  const queryString = new URLSearchParams();
  if (debouncedSearchTerm) queryString.append("q", debouncedSearchTerm);
  if (selectedTrade) queryString.append("trade", selectedTrade);

  // Fetch search results
  const {
    data: searchResults,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["/api/search", debouncedSearchTerm, selectedTrade],
    queryFn: async () => {
      const response = await fetch(
        `/api/search?${queryString.toString()}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    enabled: !!(debouncedSearchTerm || selectedTrade),
  });

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Find a Tradesman</h1>
        <p className="text-muted-foreground">
          Search for skilled professionals in Trinidad and Tobago
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, business, or skill..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select
              value={selectedTrade}
              onValueChange={setSelectedTrade}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select trade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All trades</SelectItem>
                {Object.entries(tradeEnum.enumValues).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              type="submit"
              className="w-full md:w-auto"
              onClick={() => {
                // Trigger a search
              }}
            >
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tradesmen" className="mb-8">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="tradesmen">Tradesmen</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tradesmen">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <p className="text-destructive">
                    Error loading search results. Please try again.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : !searchResults?.tradesmen?.length ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    {debouncedSearchTerm || selectedTrade
                      ? "No tradesmen found matching your search criteria."
                      : "Enter a search term or select a trade to find tradesmen."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.tradesmen.map((tradesman) => (
                <TradesmanCard key={tradesman.id} tradesman={tradesman} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="projects">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <p className="text-destructive">
                    Error loading search results. Please try again.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : !searchResults?.projects?.length ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    {debouncedSearchTerm || selectedTrade
                      ? "No projects found matching your search criteria."
                      : "Enter a search term or select a trade to find projects."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const TradesmanCard = ({ tradesman }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={tradesman.avatarUrl} alt={tradesman.businessName} />
            <AvatarFallback>
              {tradesman.businessName?.substring(0, 2) || "TD"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{tradesman.businessName}</CardTitle>
            <CardDescription>{tradesman.trade}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{tradesman.user?.location || "Location not specified"}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{tradesman.experience} years experience</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Star className="mr-2 h-4 w-4 text-yellow-500" />
            <span>
              {tradesman.rating ? (
                <span>{tradesman.rating.toFixed(1)} ({tradesman.reviewCount} reviews)</span>
              ) : (
                "No ratings yet"
              )}
            </span>
          </div>
        </div>
        
        {tradesman.specialties && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Specialties:
            </h4>
            <div className="flex flex-wrap gap-1">
              {tradesman.specialties.split(",").map((specialty, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {specialty.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-muted/50">
        <Link href={`/tradesman/${tradesman.id}`}>
          <Button className="w-full">View Profile</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

const ProjectCard = ({ project }) => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {project.mainImage ? (
          <img
            src={project.mainImage.imageUrl}
            alt={project.mainImage.caption || project.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <Hammer className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
            <CardDescription>
              by {project.user.fullName} • {project.profile.trade}
            </CardDescription>
          </div>
          {project.featured && (
            <Badge className="bg-primary text-primary-foreground">Featured</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm line-clamp-2">
          {project.description}
        </p>
        
        <div className="flex flex-wrap gap-y-2 mt-3">
          {project.location && (
            <div className="flex items-center text-xs mr-4">
              <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{project.location}</span>
            </div>
          )}
          
          {project.completionDate && (
            <div className="flex items-center text-xs">
              <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{project.completionDate}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Link href={`/project/${project.id}`}>
          <Button variant="ghost" size="sm">
            View Project
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default Search;