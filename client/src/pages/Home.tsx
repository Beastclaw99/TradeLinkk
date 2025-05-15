import { Helmet } from "react-helmet";
import HeroSection from "@/components/HeroSection";
import FeaturedTrades from "@/components/FeaturedTrades";
import FeaturedProjects from "@/components/FeaturedProjects";
import HowItWorks from "@/components/HowItWorks";
import { SEO_DESCRIPTIONS } from "@/lib/constants";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>TradeLink - Connect with Professional Tradesmen</title>
        <meta name="description" content={SEO_DESCRIPTIONS.home} />
        <meta property="og:title" content="TradeLink - Professional Trade Services" />
        <meta property="og:description" content={SEO_DESCRIPTIONS.home} />
        <meta property="og:type" content="website" />
      </Helmet>

      <main>
        <HeroSection />
        <FeaturedTrades />
        <FeaturedProjects />
        <HowItWorks />
      </main>
    </>
  );
};

export default Home;
