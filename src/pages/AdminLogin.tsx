import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, setDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("admin@finpivot.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if an admin account exists in the 'admins' collection
      const adminsSnapshot = await getDocs(collection(db, "admins"));
      const adminExists = !adminsSnapshot.empty;

      if (!adminExists) {
        // No admin account exists, create one with the provided credentials
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          // Store admin credentials in the 'admins' collection
          await setDoc(doc(db, "admins", user.uid), {
            email,
            createdAt: new Date().toISOString(),
            isAdmin: true,
          });

          // Set admin status in sessionStorage
          sessionStorage.setItem("adminAuth", "true");
          toast.success("Admin account created successfully! You are now logged in.");
          const from = location.state?.from?.pathname || "/admin";
          navigate(from);
        } catch (createError) {
          console.error("Error creating admin account:", createError);
          toast.error("Failed to create admin account. Please try again.");
        }
      } else {
        // Admin account exists, attempt to log in
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          // Verify the user is an admin by checking the 'admins' collection
          const adminDoc = await getDoc(doc(db, "admins", user.uid));
          if (adminDoc.exists() && adminDoc.data().isAdmin) {
            sessionStorage.setItem("adminAuth", "true");
            toast.success("Admin login successful!");
            const from = location.state?.from?.pathname || "/admin";
            navigate(from);
          } else {
            await auth.signOut();
            toast.error("You are not authorized to access the admin dashboard");
          }
        } catch (loginError) {
          console.error("Login error:", loginError);
          toast.error("Invalid credentials or an error occurred");
        }
      }
    } catch (error) {
      console.error("Error checking admin existence:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-background p-4"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mb-4"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminLogin;