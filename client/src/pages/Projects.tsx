import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import ProjectCard from "@/components/ProjectCard";
import { 
  AlertTriangle, 
  Briefcase, 
  ImageIcon, 
  PlusCircle,
  Loader2
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

const Projects = () => {
  const { user, tradesmanProfile } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  
  // Get projects for the tradesman
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: [`/api/tradesman/${tradesmanProfile?.id}/projects`],
    enabled: !!tradesmanProfile?.id,
  });
  
  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: number) => 
      apiRequest("DELETE", `/api/projects/${projectId}`),
    onSuccess: () => {
      toast({
        title: "Project deleted",
        description: "The project has been successfully deleted",
      });
      // Invalidate projects query to refresh the list
      queryClient.invalidateQueries({ 
        queryKey: [`/api/tradesman/${tradesmanProfile?.id}/projects`]
      });
      setProjectToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting project",
        description: error.message || "Failed to delete the project. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handler for project selection checkbox
  const toggleProjectSelection = (projectId: number) => {
    setSelectedProjects(prev => 
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };
  
  // Handler for project delete button
  const handleDeleteClick = (projectId: number) => {
    setProjectToDelete(projectId);
  };
  
  // Handler for confirming project deletion
  const confirmDelete = () => {
    if (projectToDelete !== null) {
      deleteProjectMutation.mutate(projectToDelete);
    }
  };
  
  // Redirect to create project page if user doesn't have a tradesman profile
  if (user?.role !== "tradesman" || !tradesmanProfile) {
    navigate("/profile");
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>Manage Projects | TradeLink</title>
        <meta name="description" content="Manage your project portfolio, showcase your work to potential clients" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Projects</h1>
            <p className="text-muted-foreground">
              Showcase your work to attract new clients
            </p>
          </div>
          
          <Button asChild>
            <Link href="/create-project">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Project
            </Link>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-bold mb-2">Error Loading Projects</h2>
              <p className="text-muted-foreground text-center mb-6">
                We encountered an issue loading your projects. Please try again later.
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="all">All Projects</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all">
              {projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      mainImage={project.mainImage}
                      isEditable={true}
                      onEditClick={(id) => navigate(`/edit-project/${id}`)}
                      onDeleteClick={handleDeleteClick}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-bold mb-2">No Projects Yet</h2>
                    <p className="text-muted-foreground text-center mb-6">
                      Add projects to your portfolio to showcase your work to potential clients.
                    </p>
                    <Button asChild>
                      <Link href="/create-project">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add First Project
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="featured">
              {projects && projects.filter(p => p.featured).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects
                    .filter(p => p.featured)
                    .map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        mainImage={project.mainImage}
                        isEditable={true}
                        onEditClick={(id) => navigate(`/edit-project/${id}`)}
                        onDeleteClick={handleDeleteClick}
                      />
                    ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-bold mb-2">No Featured Projects</h2>
                    <p className="text-muted-foreground text-center mb-6">
                      Mark projects as featured to make them more visible to potential clients.
                    </p>
                    <Button asChild>
                      <Link href="/create-project">Add Project</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={projectToDelete !== null} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project and its images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Projects;
