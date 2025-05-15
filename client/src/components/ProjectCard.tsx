import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign } from "lucide-react";
import { STOCK_IMAGES } from "@/lib/constants";

interface ProjectCardProps {
  project: {
    id: number;
    title: string;
    description: string;
    location?: string;
    completionDate?: string;
    budget?: string;
    featured: boolean;
    tradesmanId: number;
  };
  mainImage?: {
    id: number;
    imageUrl: string;
    caption?: string;
    isMainImage: boolean;
  } | null;
  businessName?: string;
  trade?: string;
  isEditable?: boolean;
  onEditClick?: (id: number) => void;
  onDeleteClick?: (id: number) => void;
}

const ProjectCard = ({
  project,
  mainImage,
  businessName,
  trade,
  isEditable = false,
  onEditClick,
  onDeleteClick
}: ProjectCardProps) => {
  return (
    <Card className="overflow-hidden h-full transition-transform hover:shadow-md">
      {/* Project image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {mainImage ? (
          <img
            src={mainImage.imageUrl}
            alt={mainImage.caption || project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={`${STOCK_IMAGES.projects[1]}?auto=format&fit=crop&w=600&q=80`}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Featured badge */}
        {project.featured && (
          <Badge className="absolute top-2 right-2">Featured</Badge>
        )}
      </div>
      
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg line-clamp-1">{project.title}</h3>
          {trade && (
            <Badge variant="outline" className="capitalize">
              {trade.replace('_', ' ')}
            </Badge>
          )}
        </div>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {project.description}
        </p>
        
        <div className="space-y-2 text-sm">
          {project.location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{project.location}</span>
            </div>
          )}
          
          {project.completionDate && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Completed: {project.completionDate}</span>
            </div>
          )}
          
          {project.budget && (
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Budget: {project.budget}</span>
            </div>
          )}
        </div>
        
        {businessName && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center">
              <span className="text-sm font-medium">{businessName}</span>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-5 py-4 bg-muted/20 border-t">
        {isEditable ? (
          <div className="flex justify-between w-full">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEditClick && onEditClick(project.id)}
            >
              Edit Project
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onDeleteClick && onDeleteClick(project.id)}
            >
              Delete
            </Button>
          </div>
        ) : (
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/tradesman/${project.tradesmanId}`}>
                View Tradesman
              </Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link href={`/tradesman/${project.tradesmanId}?project=${project.id}`}>
                View Details
              </Link>
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
