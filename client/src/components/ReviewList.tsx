import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StarIcon } from "lucide-react";
import { formatDistance } from "date-fns";

interface ReviewClient {
  id: number;
  username: string;
  fullName: string;
  avatarUrl?: string;
}

interface Review {
  id: number;
  tradesmanId: number;
  clientId: number;
  projectId?: number;
  rating: number;
  comment: string;
  createdAt: string;
  client: ReviewClient;
}

interface ReviewData {
  reviews: Review[];
  averageRating: number;
}

interface ReviewListProps {
  tradesmanId: number;
  limit?: number;
  showAverage?: boolean;
}

const ReviewList = ({ tradesmanId, limit, showAverage = true }: ReviewListProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const { data, isLoading, error } = useQuery<ReviewData>({
    queryKey: [`/api/tradesman/${tradesmanId}/reviews`],
  });
  
  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              rating >= star 
                ? "text-yellow-400 fill-yellow-400" 
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {showAverage && (
          <div className="flex items-center space-x-2 mb-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
        )}
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full my-1" />
              <Skeleton className="h-4 w-full my-1" />
              <Skeleton className="h-4 w-2/3 my-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Error loading reviews. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }
  
  const { reviews, averageRating } = data;
  
  // If there are no reviews
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No reviews yet. Be the first to leave a review!</p>
        </CardContent>
      </Card>
    );
  }
  
  // Determine which reviews to display based on limit and expanded state
  const displayedReviews = expanded || !limit ? reviews : reviews.slice(0, limit);
  
  return (
    <div className="space-y-6">
      {showAverage && (
        <div className="flex items-center space-x-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">out of 5</span>
          </div>
          <div>
            {renderStars(averageRating)}
            <p className="text-sm text-muted-foreground mt-1">
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {displayedReviews.map((review) => (
          <Card key={review.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={review.client.avatarUrl} alt={review.client.fullName} />
                    <AvatarFallback>{review.client.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{review.client.fullName}</CardTitle>
                    <CardDescription>
                      {formatDistance(new Date(review.createdAt), new Date(), { addSuffix: true })}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center">
                  {renderStars(review.rating)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p>{review.comment}</p>
              {review.projectId && (
                <Badge variant="outline" className="mt-3">
                  Verified Project
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {limit && reviews.length > limit && !expanded && (
        <div className="text-center mt-6">
          <Button 
            variant="outline" 
            onClick={() => setExpanded(true)}
          >
            Show All {reviews.length} Reviews
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
