import { Link } from "wouter";
import { STOCK_IMAGES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ChevronRight, Search, MessageSquare, FileText, CreditCard } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 bg-grid-primary/10 bg-[size:24px_24px] opacity-20"></div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Connect with skilled tradesmen for your projects
            </h1>
            <p className="text-xl text-muted-foreground">
              Find, hire, and work with professional tradesmen. Manage contracts, track progress, and make secure payments all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" asChild>
                <Link href="/search">
                  Find Tradesmen <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register">Join as a Tradesman</Link>
              </Button>
            </div>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-border">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Easy Search</h3>
                  <p className="text-sm text-muted-foreground">Find the right tradesman for any job</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Direct Communication</h3>
                  <p className="text-sm text-muted-foreground">Message tradesmen securely</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Digital Contracts</h3>
                  <p className="text-sm text-muted-foreground">Create and sign contracts online</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Secure Payments</h3>
                  <p className="text-sm text-muted-foreground">Pay per milestone with protection</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Image grid */}
          <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2">
              <div className="relative overflow-hidden">
                <img 
                  src={`${STOCK_IMAGES.tradesmen[0]}?auto=format&fit=crop&w=600&q=80`} 
                  alt="Carpenter working on wooden furniture" 
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="relative overflow-hidden">
                <img 
                  src={`${STOCK_IMAGES.tradesmen[1]}?auto=format&fit=crop&w=600&q=80`} 
                  alt="Electrician installing lighting" 
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="relative overflow-hidden">
                <img 
                  src={`${STOCK_IMAGES.projects[0]}?auto=format&fit=crop&w=600&q=80`} 
                  alt="Modern kitchen renovation" 
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="relative overflow-hidden">
                <img 
                  src={`${STOCK_IMAGES.construction[0]}?auto=format&fit=crop&w=600&q=80`} 
                  alt="Construction work in progress" 
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
