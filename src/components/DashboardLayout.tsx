import { useState } from "react";
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

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: TrendingUp, label: "Investment Plans", path: "/investment-plans" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const handleLogout = () => {
    navigate('/');
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
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold">InvestPro</span>
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
                  JD
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">John Doe</p>
                <p className="text-sm text-muted-foreground">john@example.com</p>
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
                    JD
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">John Doe</span>
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