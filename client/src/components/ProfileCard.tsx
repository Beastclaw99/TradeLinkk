import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon, MapPin, Phone, Mail, ChevronRight } from "lucide-react";
import { TRADES, STOCK_IMAGES } from "@/lib/constants";

interface ProfileCardProps {
  profile: {
    id: number;
    businessName: string;
    trade: string;
    experience: number;
    hourlyRate?: number;
    completenessScore: number;
  };
  user: {
    id: number;
    fullName: string;
    username: string;
    location?: string;
    phone?: string;
    email: string;
    avatarUrl?: string;
  };
  averageRating?: number;
  featuredProject?: {
    id: number;
    title: string;
    featured: boolean;
  } | null;
  mainImage?: {
    id: number;
    imageUrl: string;
    caption?: string;
  } | null;
  isCompact?: boolean;
  isPreview?: boolean;
}

const ProfileCard = ({
  profile,
  user,
  averageRating = 0,
  featuredProject = null,
  mainImage = null,
  isCompact = false,
  isPreview = false,
}: ProfileCardProps) => {
  // Find the label for the trade
  const tradeName = TRADES.find(t => t.value === profile.trade)?.label || profile.trade;
  
  // Format the experience text
  const experienceText = profile.experience === 1 
    ? '1 year of experience' 
    : `${profile.experience} years of experience`;

  // Format hourly rate if it exists
  const hourlyRateText = profile.hourlyRate 
    ? `$${profile.hourlyRate}/hour` 
    : 'Rate upon request';

  return (
    <Card className={`overflow-hidden h-full transition-all ${isPreview ? 'border-dashed' : ''}`}>
      {/* Background image or featured project image */}
      <div className="relative h-32 md:h-40 bg-muted overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage.imageUrl}
            alt={mainImage.caption || `${profile.businessName} project`}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={`${STOCK_IMAGES.tradesmen[2]}?auto=format&fit=crop&w=600&q=80`}
            alt="Tradesman background"
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>
        
        {/* Profile image, positioned at the bottom of the background image */}
        <div className="absolute bottom-0 left-0 w-full px-6 pb-5 flex items-end">
          <Avatar className="h-16 w-16 border-4 border-background ring-2 ring-primary/20">
            <AvatarImage src={user.avatarUrl} alt={user.fullName} />
            <AvatarFallback>
              {user.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Rating badge (if not compact) */}
          {!isCompact && averageRating > 0 && (
            <Badge variant="secondary" className="ml-auto flex items-center gap-1">
              <StarIcon className="h-3 w-3 fill-current" />
              <span>{averageRating.toFixed(1)}</span>
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className={`${isCompact ? 'p-4' : 'p-6'}`}>
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg line-clamp-1">{profile.businessName}</h3>
              <p className="text-muted-foreground text-sm">{user.fullName}</p>
            </div>
            <Badge variant="outline" className="capitalize">
              {tradeName}
            </Badge>
          </div>
          
          {!isCompact && (
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary">{experienceText}</Badge>
              <Badge variant="secondary">{hourlyRateText}</Badge>
            </div>
          )}
        </div>
        
        {!isCompact && (
          <>
            {/* Contact information */}
            <div className="space-y-2 mb-4">
              {user.location && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
            </div>
            
            {/* Featured project highlight (if available) */}
            {featuredProject && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Featured Project</p>
                    <p className="font-medium">{featuredProject.title}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/tradesman/${profile.id}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      {!isPreview && (
        <CardFooter className={`${isCompact ? 'p-4 pt-0' : 'px-6 py-4'} flex justify-between border-t bg-muted/20`}>
          <div className="flex items-center">
            {isCompact ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <StarIcon className="h-3 w-3 fill-current" />
                <span>{averageRating.toFixed(1)}</span>
              </Badge>
            ) : (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{profile.completenessScore}%</span> Profile Completion
              </div>
            )}
          </div>
          <Button size="sm" asChild>
            <Link href={`/tradesman/${profile.id}`}>
              View Profile
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProfileCard;
