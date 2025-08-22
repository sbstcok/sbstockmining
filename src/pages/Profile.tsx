import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Globe, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const Profile = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    country: "",
    totalInvestments: 0,
    totalWithdrawals: 0,
    createdAt: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            fullName: data.fullName || "",
            email: data.email || "",
            country: data.country || "",
            totalInvestments: data.totalInvestments || 0,
            totalWithdrawals: data.totalWithdrawals || 0,
            createdAt: data.createdAt || ""
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handlePasswordChange = () => {
    toast.success("Password changed successfully!");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information and security</p>
          </motion.div>

          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center space-y-0 pb-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-gradient-primary text-white text-lg">
                      {userData.fullName?.split(' ').map(name => name[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </div>
                </div>
                {/* Removed edit button as editing is not allowed */}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Full Name
                    </Label>
                    <Input 
                      id="fullName" 
                      value={userData.fullName}
                      disabled={true}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Address
                    </Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={userData.email}
                      disabled={true}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="country" className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Country of Origin
                    </Label>
                    <Input 
                      id="country" 
                      value={userData.country}
                      disabled={true}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Change Password */}
          
          {/* Account Stats */}
         
        </div>
      </DashboardLayout>
    </motion.div>
  );
};

export default Profile;