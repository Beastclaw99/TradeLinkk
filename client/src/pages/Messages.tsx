import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { API_ROUTES, PAGE_ROUTES, messageStatusEnum } from "@/lib/constants";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquare, UserRound, User2 } from "lucide-react";

import MessageForm from "@/components/MessageForm";
import MessageList from "@/components/MessageList";

const Messages = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const params = useParams();
  
  // Check if we're on a specific contact's thread
  const contactId = params?.contactId;
  
  // Get user contacts (people they've messaged or who have messaged them)
  const {
    data: contacts,
    isLoading: contactsLoading,
    isError: contactsError,
  } = useQuery({
    queryKey: [API_ROUTES.MESSAGES.CONTACTS],
    queryFn: async () => {
      const response = await fetch(API_ROUTES.MESSAGES.CONTACTS);
      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }
      return response.json();
    },
    enabled: !!user,
  });

  // If there's a contactId and it's our first contact, mark it as selected
  useEffect(() => {
    if (contacts?.length > 0 && !contactId) {
      setLocation(PAGE_ROUTES.MESSAGE_THREAD(contacts[0].id));
    }
  }, [contacts, contactId, setLocation]);

  if (!user) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p>Please log in to view messages</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
        {/* Contacts list */}
        <Card className="md:max-h-[calc(100vh-200px)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Contacts
            </CardTitle>
          </CardHeader>

          <Separator />

          <CardContent className="p-0">
            {contactsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : contactsError ? (
              <div className="p-4 text-center text-destructive">
                Error loading contacts
              </div>
            ) : !contacts?.length ? (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="py-2">
                  {contacts.map((contact) => (
                    <ContactItem
                      key={contact.id}
                      contact={contact}
                      isActive={contactId === contact.id.toString()}
                      currentUserId={user.id}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Message thread */}
        <Card className="flex flex-col md:h-[calc(100vh-200px)]">
          {contactId ? (
            <>
              <MessageList userId={contactId} className="flex-grow overflow-hidden" />
              <Separator />
              <CardFooter className="p-4">
                <MessageForm receiverId={contactId} />
              </CardFooter>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center h-full py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {contacts?.length
                  ? "Select a contact to view messages"
                  : "No conversations yet. Start a new conversation by contacting a tradesman."}
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

const ContactItem = ({ contact, isActive, currentUserId }) => {
  const [, setLocation] = useLocation();

  // Calculate correct display name
  const isTradesmanContact = contact.tradesmanProfile;
  const displayName = isTradesmanContact
    ? contact.tradesmanProfile.businessName
    : contact.fullName;

  // Calculate role badge
  const roleText = isTradesmanContact ? "Tradesman" : "Client";
  const roleBadge = (
    <Badge variant={isTradesmanContact ? "secondary" : "outline"} className="ml-2">
      {roleText}
    </Badge>
  );

  // Check if there are unread messages
  const hasUnread = 
    contact.unreadCount > 0 && 
    contact.lastMessage?.senderId.toString() !== currentUserId.toString();

  // Format the date
  const formattedDate = contact.lastMessage?.createdAt
    ? new Date(contact.lastMessage.createdAt).toLocaleDateString()
    : "";

  return (
    <div
      className={`flex items-center gap-3 p-3 hover:bg-muted cursor-pointer transition-colors ${
        isActive ? "bg-muted" : ""
      }`}
      onClick={() => setLocation(`/messages/${contact.id}`)}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={contact.avatarUrl} alt={displayName} />
        <AvatarFallback>
          {isTradesmanContact ? (
            <User2 className="h-5 w-5" />
          ) : (
            <UserRound className="h-5 w-5" />
          )}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center">
          <span className="font-medium truncate">{displayName}</span>
          {hasUnread && (
            <Badge variant="default" className="ml-2 px-1 py-0 h-5 min-w-5">
              {contact.unreadCount}
            </Badge>
          )}
        </div>
        
        {contact.lastMessage && (
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground truncate w-[160px]">
              {contact.lastMessage.content}
            </p>
            <span className="text-xs text-muted-foreground">
              {formattedDate}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;