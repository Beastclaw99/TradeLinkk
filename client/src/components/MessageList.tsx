import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface MessageData {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  status: "read" | "unread";
  createdAt: string;
}

interface ConversationData {
  messages: MessageData[];
  currentUser: {
    id: number;
    fullName: string;
    avatarUrl?: string;
  };
  otherUser: {
    id: number;
    fullName: string;
    avatarUrl?: string;
    role: string;
  };
  tradesmanProfile?: {
    id: number;
    businessName: string;
    trade: string;
  };
}

interface MessageListProps {
  userId: string;
  className?: string;
}

const MessageList = ({ userId, className = "" }: MessageListProps) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data, isLoading, error } = useQuery<ConversationData>({
    queryKey: [`/api/messages/${userId}`],
    enabled: !!userId && !!user,
    refetchInterval: 15000 // Refresh every 15 seconds
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.messages]);
  
  if (isLoading) {
    return (
      <div className={`space-y-4 p-4 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex max-w-[80%] ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className={`mx-2 ${i % 2 === 0 ? 'ml-2' : 'mr-2'}`}>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-16 w-40" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className={`p-4 text-center text-muted-foreground ${className}`}>
        Error loading messages. Please try again.
      </div>
    );
  }
  
  if (data.messages.length === 0) {
    return (
      <div className={`p-4 text-center text-muted-foreground ${className}`}>
        No messages yet. Start the conversation!
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 p-4 overflow-y-auto ${className}`}>
      {/* User info for small screens */}
      <div className="md:hidden flex items-center space-x-3 p-3 mb-4 bg-muted/30 rounded-lg">
        <Avatar>
          <AvatarImage src={data.otherUser.avatarUrl} alt={data.otherUser.fullName} />
          <AvatarFallback>{data.otherUser.fullName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{data.otherUser.fullName}</div>
          {data.tradesmanProfile && (
            <div className="text-sm text-muted-foreground flex items-center">
              <span>{data.tradesmanProfile.businessName}</span>
              <Badge variant="outline" className="ml-2 text-xs capitalize">
                {data.tradesmanProfile.trade.replace('_', ' ')}
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      {data.messages.map((message) => {
        const isCurrentUser = message.senderId === user?.id;
        const messageUser = isCurrentUser ? data.currentUser : data.otherUser;
        
        return (
          <div 
            key={message.id} 
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={messageUser.avatarUrl} alt={messageUser.fullName} />
                <AvatarFallback>{messageUser.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className={`mx-2 ${isCurrentUser ? 'mr-2 items-end' : 'ml-2 items-start'}`}>
                <div 
                  className={`px-4 py-2 rounded-lg ${
                    isCurrentUser 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  <p>{message.content}</p>
                </div>
                <div 
                  className={`flex text-xs text-muted-foreground mt-1 ${
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Invisible div to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
