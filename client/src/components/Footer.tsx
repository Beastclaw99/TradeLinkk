import { Link } from "wouter";
import { BriefcaseIcon, FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1 - Logo & About */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <BriefcaseIcon className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">TradeLink</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Connecting skilled tradesmen with clients who need quality work. TradeLink makes it easy to find, hire, and pay for professional trade services.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <LinkedinIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2 - Services */}
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/search?trade=carpentry" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Carpentry
                </Link>
              </li>
              <li>
                <Link href="/search?trade=electrical" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Electrical
                </Link>
              </li>
              <li>
                <Link href="/search?trade=plumbing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Plumbing
                </Link>
              </li>
              <li>
                <Link href="/search?trade=painting" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Painting
                </Link>
              </li>
              <li>
                <Link href="/search?trade=roofing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Roofing
                </Link>
              </li>
              <li>
                <Link href="/search?trade=landscaping" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Landscaping
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Resources */}
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Find Tradesmen
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Tradesman Guide
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Client Guide
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Payment Process
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contract Templates
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Company */}
          <div className="col-span-1">
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} TradeLink. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
