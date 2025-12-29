import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RegisterKid from "./pages/RegisterKid";
import RegisterParent from "./pages/RegisterParent";
import Dashboard from "./pages/Dashboard";
import CreateListing from "./pages/CreateListing";
import Discover from "./pages/Discover";
import Membership from "./pages/Membership";
import Rewards from "./pages/Rewards";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register-kid" element={<RegisterKid />} />
          <Route path="/register-parent" element={<RegisterParent />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/rewards" element={<Rewards />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
