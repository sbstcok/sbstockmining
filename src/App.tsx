import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from 'react';

// Pages
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import InvestmentPlans from "./pages/InvestmentPlans";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  const [isClient, setIsClient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check authentication on route change
    const clientToken = localStorage.getItem('clientToken');
    const adminToken = sessionStorage.getItem('adminToken');
    
    setIsClient(!!clientToken);
    setIsAdmin(!!adminToken && sessionStorage.getItem('isAdmin') === 'true');
  }, [location.pathname]);

  // Guard for admin routes
  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAdmin) {
      return <Navigate to="/admin/login" replace />;
    }
    return <>{children}</>;
  };

  // Guard for client routes
  const ClientRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isClient) {
      return <Navigate to="/onboarding" replace />;
    }
    return <>{children}</>;
  };

  // Guard for public routes (redirect if authenticated)
  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    if (isAdmin && location.pathname === '/admin/login') {
      return <Navigate to="/admin" replace />;
    }
    if (isClient && (location.pathname === '/onboarding' || location.pathname === '/')) {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  };
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          } 
        />
        <Route 
          path="/onboarding" 
          element={
            <PublicRoute>
              <Onboarding />
            </PublicRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ClientRoute>
              <Dashboard />
            </ClientRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ClientRoute>
              <Profile />
            </ClientRoute>
          } 
        />
        <Route 
          path="/investment-plans" 
          element={
            <ClientRoute>
              <InvestmentPlans />
            </ClientRoute>
          } 
        />
        <Route 
          path="/admin/login" 
          element={
            <PublicRoute>
              <AdminLogin />
            </PublicRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;