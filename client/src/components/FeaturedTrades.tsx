import { Link } from "wouter";
import { TRADES, STOCK_IMAGES } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Hammer, 
  Paintbrush, 
  Wrench, 
  Shovel, 
  Construction, 
  Lightbulb, 
  HardHat, 
  Trees, 
  Snowflake, 
  Store 
} from "lucide-react";

// Map trade values to icons
const tradeIcons: Record<string, React.ReactNode> = {
  carpentry: <Hammer className="h-6 w-6" />,
  electrical: <Lightbulb className="h-6 w-6" />,
  plumbing: <Wrench className="h-6 w-6" />,
  painting: <Paintbrush className="h-6 w-6" />,
  roofing: <HardHat className="h-6 w-6" />,
  landscaping: <Trees className="h-6 w-6" />,
  masonry: <Construction className="h-6 w-6" />,
  flooring: <Shovel className="h-6 w-6" />,
  hvac: <Snowflake className="h-6 w-6" />,
  general_contractor: <Store className="h-6 w-6" />,
  other: <Construction className="h-6 w-6" />
};

// Map trade values to background images
const tradeBackgrounds: Record<string, string> = {
  carpentry: STOCK_IMAGES.tradesmen[0],
  electrical: STOCK_IMAGES.tradesmen[1],
  plumbing: STOCK_IMAGES.tradesmen[2], 
  painting: STOCK_IMAGES.tradesmen[3],
  roofing: STOCK_IMAGES.construction[0],
  landscaping: STOCK_IMAGES.construction[1],
  masonry: STOCK_IMAGES.construction[2],
  flooring: STOCK_IMAGES.projects[0],
  hvac: STOCK_IMAGES.projects[1],
  general_contractor: STOCK_IMAGES.projects[2]
};

const FeaturedTrades = () => {
  // Show only the first 8 trades
  const displayedTrades = TRADES.slice(0, 8);

  return (
    <section className="bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Explore Trades</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find skilled professionals across various trades to help with your home improvement and construction projects.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedTrades.map((trade) => (
            <Link key={trade.value} href={`/search?trade=${trade.value}`}>
              <Card className="overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-md">
                <div 
                  className="h-32 bg-cover bg-center" 
                  style={{ 
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${tradeBackgrounds[trade.value] || STOCK_IMAGES.tradeCarpentry}?auto=format&fit=crop&w=600&q=80)`
                  }}
                >
                  <div className="h-full w-full flex items-center justify-center text-white">
                    <h3 className="text-xl font-bold">{trade.label}</h3>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                      {tradeIcons[trade.value]}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Find professional {trade.label.toLowerCase()} services</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/search">
            <span className="text-primary font-medium hover:underline">
              View all trades and find professionals
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTrades;
