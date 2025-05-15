import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Home, Menu, Sun, Moon, Search, MessageSquare, LogOut, User, BriefcaseIcon, FileText, CreditCard } from "lucide-react";

const Navbar = () => {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get unread message count
  const { data: unreadMessageData } = useQuery({
    queryKey: ["/api/unread-message-count"],
    enabled: isAuthenticated,
    refetchInterval: 30000 // Check every 30 seconds
  });

  const unreadCount = unreadMessageData?.count || 0;

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const navLinks = isAuthenticated
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/search", label: "Find Tradesmen" },
        { href: "/project-listings", label: "Project Marketplace" },
        ...(user?.role === "tradesman" 
          ? [{ href: "/projects", label: "My Projects" }] 
          : []
        ),
        ...(user?.role === "client" 
          ? [{ href: "/create-client-project", label: "Post a Project" }] 
          : []
        ),
        { href: "/contracts", label: "Contracts" },
        { href: "/payments", label: "Payments" },
      ]
    : [
        { href: "/search", label: "Find Tradesmen" },
        { href: "/project-listings", label: "Project Marketplace" },
        { href: "/register", label: "Register" },
        { href: "/login", label: "Login" },
      ];

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <BriefcaseIcon className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">TradeLink</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="icon" asChild aria-label="Search">
            <Link href="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          {isAuthenticated && (
            <Button 
              variant="ghost" 
              size="icon" 
              asChild 
              aria-label="Messages"
              className="relative"
            >
              <Link href="/messages">
                <MessageSquare className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            </Button>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl || ""} alt={user?.fullName || ""} />
                    <AvatarFallback>{user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium">{user?.fullName || user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer w-full">
                    <BriefcaseIcon className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contracts" className="cursor-pointer w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Contracts</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/payments" className="cursor-pointer w-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Payments</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-4">
          {isAuthenticated && (
            <Button 
              variant="ghost" 
              size="icon" 
              asChild 
              aria-label="Messages"
              className="relative"
            >
              <Link href="/messages">
                <MessageSquare className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            </Button>
          )}
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>TradeLink</SheetTitle>
                <SheetDescription>
                  {isAuthenticated 
                    ? `Welcome, ${user?.fullName || user?.username}`
                    : "Connecting you with quality tradesmen"
                  }
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                {isAuthenticated && (
                  <div className="flex items-center mb-6 pb-6 border-b">
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarImage src={user?.avatarUrl || ""} alt={user?.fullName || ""} />
                      <AvatarFallback>{user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user?.fullName || user?.username}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                )}
                
                <nav className="flex flex-col space-y-4">
                  <Link href="/" className="flex items-center py-2 text-base">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center py-2 text-base ${
                        location === link.href ? "text-primary font-medium" : ""
                      }`}
                    >
                      {link.label === "Dashboard" && <BriefcaseIcon className="mr-2 h-4 w-4" />}
                      {link.label === "Find Tradesmen" && <Search className="mr-2 h-4 w-4" />}
                      {link.label === "My Projects" && <FileText className="mr-2 h-4 w-4" />}
                      {link.label === "Contracts" && <FileText className="mr-2 h-4 w-4" />}
                      {link.label === "Payments" && <CreditCard className="mr-2 h-4 w-4" />}
                      {link.label}
                    </Link>
                  ))}
                  {isAuthenticated && (
                    <>
                      <Link href="/profile" className="flex items-center py-2 text-base">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center py-2 text-base text-left w-full"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </button>
                    </>
                  )}
                </nav>
                
                <div className="mt-8 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleTheme}
                    className="w-full"
                  >
                    {theme === "light" ? (
                      <> 
                        <Moon className="mr-2 h-4 w-4" />
                        Switch to dark mode
                      </>
                    ) : (
                      <>
                        <Sun className="mr-2 h-4 w-4" />
                        Switch to light mode
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
