import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, requireAuth = true, adminOnly = false }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check authentication status (you can implement your own auth logic here)
    const checkAuth = () => {
      // For admin routes, check sessionStorage
      if (adminOnly) {
        const isAdminUser = sessionStorage.getItem('isAdmin') === 'true';
        setIsAdmin(isAdminUser);
        setIsAuthenticated(isAdminUser);
      } else {
        // For regular auth, implement your own logic here
        setIsAuthenticated(true); // Temporarily set to true
      }
      setLoading(false);
    };

    checkAuth();
  }, [adminOnly]);

  if (loading) {
    return null; // or a loading spinner
  }

  // Check admin routes first
  if (adminOnly) {
    if (!isAuthenticated || !isAdmin) {
      // Always redirect to admin login for admin routes if not authenticated or not admin
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    // If admin check passes, allow access to admin routes
    return <>{children}</>;
  }

  // Only check regular auth for non-admin routes
  if (requireAuth && !isAuthenticated) {
    // Redirect to login page if auth is required but user is not authenticated
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated && location.pathname === '/') {
    // Redirect authenticated users away from landing page to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Special case for admin login page
  if (location.pathname === '/admin/login' && isAdmin) {
    // Redirect to admin dashboard if already authenticated as admin
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
