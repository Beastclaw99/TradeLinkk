import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StarIcon, ChevronRight } from "lucide-react";
import { STOCK_IMAGES } from "@/lib/constants";

interface TradesmanInfo {
  profile: {
    id: number;
    businessName: string;
    trade: string;
  };
  user: {
    fullName: string;
    location?: string;
  };
}

interface ProjectData {
  id: number;
  title: string;
  description: string;
  location?: string;
  completionDate?: string;
  budget?: string;
  mainImage?: {
    imageUrl: string;
    caption?: string;
  };
  profile: TradesmanInfo["profile"];
  user: TradesmanInfo["user"];
}

const FeaturedProjects = () => {
  const { data: projects, isLoading, error } = useQuery<ProjectData[]>({
    queryKey: ["/api/featured-projects?limit=6"]
  });
  
  // Fallback to display if no projects are returned
  const [emptyDisplay, setEmptyDisplay] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if projects loaded but are empty
    if (!isLoading && (!projects || projects.length === 0)) {
      setEmptyDisplay(true);
    } else {
      setEmptyDisplay(false);
    }
  }, [isLoading, projects]);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Projects</h2>
            <p className="text-muted-foreground max-w-2xl">
              Explore some of the best work from our community of professional tradesmen.
            </p>
          </div>
          <Button variant="outline" className="mt-4 md:mt-0" asChild>
            <Link href="/search">
              Find More Projects <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-5">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex justify-between items-center mt-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error || emptyDisplay ? (
          // Fallback content with stock images when API fails or returns empty
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {STOCK_IMAGES.projects.map((src, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={`${src}?auto=format&fit=crop&w=600&q=80`} 
                    alt="Project showcase" 
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">Home Improvement Project</h3>
                    <Badge variant="outline">Showcase</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    Professional work by our qualified tradesmen. Explore our platform to find similar quality services.
                  </p>
                  <div className="flex justify-between items-center mt-6">
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground">Quality craftsmanship</span>
                    </div>
                    <Button size="sm" variant="link" asChild>
                      <Link href="/search">
                        Find Tradesmen
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects?.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  {project.mainImage ? (
                    <img 
                      src={project.mainImage.imageUrl} 
                      alt={project.mainImage.caption || project.title} 
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    // Fallback to stock image if no project image is available
                    <img 
                      src={`${STOCK_IMAGES.projects[0]}?auto=format&fit=crop&w=600&q=80`} 
                      alt={project.title} 
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  )}
                  {project.trade && (
                    <Badge className="absolute top-2 right-2">{project.profile.trade.replace('_', ' ')}</Badge>
                  )}
                </div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg line-clamp-1">{project.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {project.description}
                  </p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {project.location && (
                      <span className="mr-3">{project.location}</span>
                    )}
                    {project.budget && (
                      <span>Budget: {project.budget}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                    <div className="flex items-center">
                      <span className="font-medium text-sm">{project.profile.businessName}</span>
                    </div>
                    <Button size="sm" variant="link" asChild>
                      <Link href={`/tradesman/${project.profile.id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProjects;
