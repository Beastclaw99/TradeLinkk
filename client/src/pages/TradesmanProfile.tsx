import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useRoute } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/lib/auth";
import { TRADES, STOCK_IMAGES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";
import ProjectCard from "@/components/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Briefcase,
  Info,
  Star,
  MessageSquare,
  FileText,
  Loader2,
  AlertTriangle,
  Calendar,
  DollarSign,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ProjectImage {
  id: number;
  imageUrl: string;
  caption?: string;
  isMainImage: boolean;
}

interface Project {
  id: number;
  title: string;
  description: string;
  location?: string;
  completionDate?: string;
  budget?: string;
  featured: boolean;
  tradesmanId: number;
  mainImage?: ProjectImage;
}

interface ProfileData {
  profile: {
    id: number;
    userId: number;
    businessName: string;
    trade: string;
    experience: number;
    hourlyRate?: number;
    licenseNumber?: string;
    insuranceInfo?: string;
    qualifications?: string;
    completenessScore: number;
    availability?: string;
  };
  user: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    bio?: string;
    avatarUrl?: string;
  };
  reviews: any[];
  averageRating: number;
  projects: Project[];
}

const TradesmanProfile = () => {
  const [match, params] = useRoute("/tradesman/:id");
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Extract the query param for project id if present
  const queryParams = new URLSearchParams(window.location.search);
  const projectIdParam = queryParams.get("project");
  
  const tradesmanId = params?.id ? parseInt(params.id) : 0;
  
  // Fetch tradesman profile data
  const { data, isLoading, error } = useQuery<ProfileData>({
    queryKey: [`/api/tradesman-profiles/${tradesmanId}`],
    enabled: !!tradesmanId,
  });
  
  // Set selected project from URL param if present
  useEffect(() => {
    if (data?.projects && projectIdParam) {
      const project = data.projects.find(p => p.id.toString() === projectIdParam);
      if (project) {
        setSelectedProject(project);
      }
    }
  }, [data?.projects, projectIdParam]);
  
  // Handle previous/next image in project modal
  const handlePrevImage = () => {
    if (!selectedProject?.mainImage) return;
    
    const projectImages = data?.projects
      .find(p => p.id === selectedProject.id)
      ?.mainImage;
      
    if (!projectImages) return;
    
    setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : 0));
  };
  
  const handleNextImage = () => {
    if (!selectedProject?.mainImage) return;
    
    const projectImages = data?.projects
      .find(p => p.id === selectedProject.id)
      ?.mainImage;
      
    if (!projectImages) return;
    
    setCurrentImageIndex(prev => (prev < 0 ? 0 : prev));
  };
  
  // Get tradesman trade display name
  const tradeName = data?.profile.trade 
    ? TRADES.find(t => t.value === data.profile.trade)?.label || data.profile.trade
    : "";
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Error Loading Profile</h2>
            <p className="text-muted-foreground text-center mb-6">
              We couldn't load this tradesman's profile. Please try again later.
            </p>
            <Button asChild>
              <Link href="/search">Back to Search</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const { profile, user: tradesmanUser, projects, averageRating } = data;
  
  return (
    <>
      <Helmet>
        <title>{profile.businessName} | TradeLink</title>
        <meta 
          name="description" 
          content={`${profile.businessName} - Professional ${tradeName} services with ${profile.experience} years of experience.`}
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        {/* Profile header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="relative h-48 bg-muted">
                  {/* Cover image - using either first project image or placeholder */}
                  {projects[0]?.mainImage ? (
                    <img 
                      src={projects[0].mainImage.imageUrl} 
                      alt={profile.businessName} 
                      className="w-full h-full object-cover opacity-50"
                    />
                  ) : (
                    <img 
                      src={`${STOCK_IMAGES.construction[0]}?auto=format&fit=crop&w=1200&q=80`}
                      alt="Tradesman background"
                      className="w-full h-full object-cover opacity-50"
                    />
                  )}
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
                  
                  {/* Profile content positioned over the cover image */}
                  <div className="absolute bottom-0 left-0 w-full p-6 flex items-end">
                    <Avatar className="h-24 w-24 border-4 border-background">
                      <AvatarImage src={tradesmanUser.avatarUrl} alt={tradesmanUser.fullName} />
                      <AvatarFallback className="text-2xl">{tradesmanUser.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="ml-4 text-white">
                      <h1 className="font-bold text-2xl">{profile.businessName}</h1>
                      <div className="flex items-center mt-1">
                        <Badge className="mr-2 capitalize">{tradeName}</Badge>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="font-medium">{averageRating.toFixed(1)}</span>
                          <span className="text-sm text-white/70 ml-1">
                            ({data.reviews.length} {data.reviews.length === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Experience</p>
                          <p>{profile.experience} years</p>
                        </div>
                      </div>
                      
                      {profile.hourlyRate && (
                        <div className="flex items-start gap-2">
                          <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Hourly Rate</p>
                            <p>${profile.hourlyRate}/hour</p>
                          </div>
                        </div>
                      )}
                      
                      {tradesmanUser.location && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p>{tradesmanUser.location}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {profile.availability && (
                        <div className="flex items-start gap-2">
                          <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Availability</p>
                            <p>{profile.availability}</p>
                          </div>
                        </div>
                      )}
                      
                      {tradesmanUser.phone && (
                        <div className="flex items-start gap-2">
                          <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p>{tradesmanUser.phone}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-2">
                        <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p>{tradesmanUser.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {tradesmanUser.bio && (
                    <div className="mt-6">
                      <h3 className="font-medium mb-2">About</h3>
                      <p className="text-muted-foreground">{tradesmanUser.bio}</p>
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t">
                    {isAuthenticated ? (
                      <>
                        <Button asChild>
                          <Link href={`/messages/${tradesmanUser.id}`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message
                          </Link>
                        </Button>
                        
                        <Button variant="outline" onClick={() => setReviewDialogOpen(true)}>
                          <Star className="mr-2 h-4 w-4" />
                          Write Review
                        </Button>
                        
                        {user?.role === 'client' && (
                          <Button variant="secondary" asChild>
                            <Link href={`/create-contract?tradesmanId=${profile.id}`}>
                              <FileText className="mr-2 h-4 w-4" />
                              Request Contract
                            </Link>
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button asChild>
                        <Link href={`/login?redirect=/tradesman/${profile.id}`}>
                          Sign in to Contact
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.licenseNumber && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">License Number</h3>
                      <p>{profile.licenseNumber}</p>
                    </div>
                  )}
                  
                  {profile.insuranceInfo && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Insurance</h3>
                      <p>{profile.insuranceInfo}</p>
                    </div>
                  )}
                  
                  {profile.qualifications && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Qualifications</h3>
                      <p>{profile.qualifications}</p>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Services</h3>
                    <div className="mt-2">
                      <Badge className="mr-2 mb-2 capitalize">{tradeName}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Tabs for projects and reviews */}
        <Tabs defaultValue="projects" className="mt-8">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="mt-6">
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    mainImage={project.mainImage}
                    businessName={profile.businessName}
                    trade={profile.trade}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-bold mb-2">No Projects Yet</h2>
                  <p className="text-muted-foreground text-center mb-2">
                    This tradesman hasn't added any projects to their portfolio yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <ReviewList tradesmanId={profile.id} />
          </TabsContent>
        </Tabs>
        
        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
              <DialogDescription>
                Share your experience working with {profile.businessName}
              </DialogDescription>
            </DialogHeader>
            <ReviewForm 
              tradesmanId={profile.id} 
              onSuccess={() => setReviewDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
        
        {/* Project Detail Dialog */}
        {selectedProject && (
          <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>{selectedProject.title}</DialogTitle>
                <DialogDescription>
                  {selectedProject.location && `${selectedProject.location} • `}
                  {selectedProject.completionDate && `Completed: ${selectedProject.completionDate}`}
                </DialogDescription>
              </DialogHeader>
              
              <div className="relative h-[300px] bg-muted">
                {selectedProject.mainImage ? (
                  <img
                    src={selectedProject.mainImage.imageUrl}
                    alt={selectedProject.mainImage.caption || selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                )}
                
                {/* Navigation buttons for multiple images would go here */}
                {false && ( // Disabled until we implement multi-image support
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background/90"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background/90"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </div>
              
              <ScrollArea className="flex-grow p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p className="text-muted-foreground">{selectedProject.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    {selectedProject.budget && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Budget</h4>
                        <p>{selectedProject.budget}</p>
                      </div>
                    )}
                    
                    {selectedProject.completionDate && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Completed</h4>
                        <p>{selectedProject.completionDate}</p>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
              
              <div className="flex justify-between items-center p-4 border-t">
                <Badge variant={selectedProject.featured ? "default" : "outline"}>
                  {selectedProject.featured ? "Featured Project" : "Project"}
                </Badge>
                <Button onClick={() => setSelectedProject(null)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
};

export default TradesmanProfile;
