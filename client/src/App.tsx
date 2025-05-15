import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./lib/auth";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import CreateProfile from "@/pages/CreateProfile";
import EditProfile from "@/pages/EditProfile";
import Projects from "@/pages/Projects";
import CreateProject from "@/pages/CreateProject";
import Messages from "@/pages/Messages";
import Contracts from "@/pages/Contracts";
import CreateContract from "@/pages/CreateContract";
import Payments from "@/pages/Payments";
import PaymentStatus from "@/pages/PaymentStatus";
import Search from "@/pages/Search";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import TradesmanProfile from "@/pages/TradesmanProfile";
import ProtectedRoute from "@/components/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/tradesman/:id" component={TradesmanProfile} />
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        {() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/profile">
        {() => (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/create-profile">
        {() => (
          <ProtectedRoute>
            <CreateProfile />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/edit-profile">
        {() => (
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/projects">
        {() => (
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/create-project">
        {() => (
          <ProtectedRoute>
            <CreateProject />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/messages/:userId?">
        {(params) => (
          <ProtectedRoute>
            <Messages userId={params.userId} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/contracts">
        {() => (
          <ProtectedRoute>
            <Contracts />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/create-contract">
        {() => (
          <ProtectedRoute>
            <CreateContract />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/payments">
        {() => (
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/payment-status">
        {() => (
          <ProtectedRoute>
            <PaymentStatus />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/checkout/:id">
        {(params) => (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        )}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Router />
            </main>
            <Footer />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
