import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Home, 
  TrendingUp, 
  User, 
  LogOut, 
  Menu, 
  X,
  ChevronRight
} from "lucide-react";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";

interface UserData {
  fullName: string;
  email: string;
  totalInvestments: number;
  totalWithdrawals: number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const clientToken = localStorage.getItem('clientToken');
        const adminToken = sessionStorage.getItem('adminToken');
        
        // Verify if the user is properly authenticated
        if (!clientToken && !adminToken) {
          await auth.signOut();
          navigate('/', { replace: true });
          setLoading(false);
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load user data");
        }
      } else {
        // Clear all auth states when user is not authenticated
        localStorage.removeItem('clientToken');
        localStorage.removeItem('isClientLoggedIn');
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminAuth');
        sessionStorage.removeItem('isAdmin');
        setUserData(null);
        navigate('/', { replace: true });
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      setLoading(true); // Reset loading state when unmounting
    };
  }, [navigate]);

  const menuItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: TrendingUp, label: "Investment Plans", path: "/investment-plans" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const handleLogout = async () => {
    try {
      // Clear all auth states first
      localStorage.removeItem('clientToken');
      localStorage.removeItem('isClientLoggedIn');
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminAuth');
      sessionStorage.removeItem('isAdmin');
      
      // Sign out from Firebase
      await auth.signOut();
      
      // Clear component state
      setUserData(null);
      setSidebarOpen(false);
      
      // Show success message and navigate
      toast.success('Logged out successfully');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-50 w-70 bg-card border-r border-border transition-transform duration-300 lg:static lg:translate-x-0 lg:z-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3 h-20 w-20">
              <img src="/SBLOGO.png" alt="com logo" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-primary text-white">
                  {userData?.fullName?.split(' ').map(n => n[0]).join('') || '??'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{userData?.fullName || 'Loading...'}</p>
                <p className="text-sm text-muted-foreground">{userData?.email || 'Loading...'}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className={`w-full justify-start group ${
                  isActive(item.path) 
                    ? "bg-primary/10 text-primary hover:bg-primary/15" 
                    : "hover:bg-muted/50"
                }`}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
                {isActive(item.path) && (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </Button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-card border-b border-border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-primary text-white text-sm">
                    {userData?.fullName?.split(' ').map(n => n[0]).join('') || '??'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{userData?.fullName || 'Loading...'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;