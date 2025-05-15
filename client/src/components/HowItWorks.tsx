import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  MessageSquare, 
  FileText, 
  CreditCard, 
  Star, 
  CheckCircle 
} from "lucide-react";
import { STOCK_IMAGES } from "@/lib/constants";

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Find Qualified Tradesmen",
      description: "Search our directory of verified tradesmen by trade, location, and reviews."
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Communicate Directly",
      description: "Message tradesmen directly to discuss your project requirements and get quotes."
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Create & Sign Contracts",
      description: "Use our digital contract system to formalize agreements with clear terms."
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Make Secure Payments",
      description: "Pay for milestones through our secure payment system with protection for both parties."
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Track Project Progress",
      description: "Monitor progress with milestone tracking to ensure your project stays on schedule."
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Leave & Read Reviews",
      description: "Share your experience and help others find quality tradesmen through honest reviews."
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How TradeLink Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform makes it easy to connect with professional tradesmen, manage your projects,
            and ensure quality work with secure payment protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <Card key={index} className="border-border">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonial / Call to action section */}
        <div className="relative rounded-xl overflow-hidden">
          <img 
            src={`${STOCK_IMAGES.construction[3]}?auto=format&fit=crop&w=1200&q=80`} 
            alt="Construction professionals" 
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-xl text-white">
                <h2 className="text-3xl font-bold mb-4">Ready to start your project?</h2>
                <p className="text-white/90 mb-6">
                  Whether you're looking for a tradesman or offering your services, 
                  TradeLink provides the tools you need for successful projects.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" variant="secondary" asChild>
                    <Link href="/search">Find Tradesmen</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20 hover:text-white" asChild>
                    <Link href="/register">Join as a Tradesman</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
