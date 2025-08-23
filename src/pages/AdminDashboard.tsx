import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { auth, db } from "../../lib/firebase";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { toast } from "sonner";interface UserData {
  id: string;
  fullName: string;
  email: string;
  totalInvestments: number;
  totalWithdrawals: number;
  country?: string; // Optional, as it wasn't shown in the Firestore schema
  createdAt: string;
}const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newBalance, setNewBalance] = useState("");  useEffect(() => {
    const checkAdminAuth = async () => {
      const adminToken = sessionStorage.getItem("adminToken");
      const isAdmin = sessionStorage.getItem("isAdmin") === "true";
      const adminAuth = sessionStorage.getItem("adminAuth");  if (!adminToken || !isAdmin || !adminAuth) {
    sessionStorage.removeItem("adminAuth");
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("isAdmin");
    navigate("/admin/login", { replace: true });
    return;
  }

  await fetchUsers();
};

checkAdminAuth();  }, [navigate]);  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));  const usersData = usersSnapshot.docs.map((doc) => ({
    id: doc.id,
    fullName: doc.data().fullName || "Unknown",
    email: doc.data().email || "Unknown",
    totalInvestments: Number(doc.data().totalInvestments) || 0,
    totalWithdrawals: Number(doc.data().totalWithdrawals) || 0,
    country: doc.data().country || undefined, // Optional field
    createdAt: doc.data().createdAt || new Date().toISOString(),
  } as UserData));



  setUsers(usersData);
} catch (error) {
  console.error("Error fetching users:", error);
  toast.error("Failed to load users");
} finally {
  setLoading(false);
}  };  const handleUpdateBalance = async () => {
    if (!selectedUser || !newBalance) return;try {
  const balance = parseFloat(newBalance);
  if (isNaN(balance)) {
    toast.error("Please enter a valid number");
    return;
  }

  // Calculate new totalInvestments to achieve the desired balance
  const newTotalInvestments = balance + (selectedUser.totalWithdrawals || 0);
  await updateDoc(doc(db, "users", selectedUser.id), {
    totalInvestments: newTotalInvestments
  });

  toast.success("Balance updated successfully");
  await fetchUsers();
  
  const updatedUserDoc = await getDoc(doc(db, "users", selectedUser.id));
  if (updatedUserDoc.exists()) {
    setSelectedUser({
      id: selectedUser.id,
      fullName: updatedUserDoc.data().fullName || "Unknown",
      email: updatedUserDoc.data().email || "Unknown",
      totalInvestments: Number(updatedUserDoc.data().totalInvestments) || 0,
      totalWithdrawals: Number(updatedUserDoc.data().totalWithdrawals) || 0,
      country: updatedUserDoc.data().country || undefined,
      createdAt: updatedUserDoc.data().createdAt || new Date().toISOString(),
    } as UserData);
  }
} catch (error) {
  console.error("Error updating balance:", error);
  toast.error("Failed to update balance");
}  };  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                sessionStorage.removeItem("adminAuth");
                sessionStorage.removeItem("adminToken");
                sessionStorage.removeItem("isAdmin");
                if (auth.currentUser) {
                  await auth.signOut();
                }
                toast.success("Logged out successfully");
                navigate("/admin/login", { replace: true });
              } catch (error) {
                console.error("Logout error:", error);
                toast.error("Failed to logout");
              }
            }}
          >
            Logout
          </Button>
        </div>    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Users List */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : (
            <div className="grid gap-4">
              {users.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/20">
                          {user.fullName?.split(' ').map(name => name[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{user.fullName}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Balance</div>
                        <div className="font-semibold">
                          ${(user.totalInvestments - user.totalWithdrawals).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedUser(user)}
                        className="w-full sm:w-auto"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/20">
                    {selectedUser.fullName?.split(' ').map(name => name[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedUser.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Country:</span>
                  <p>{selectedUser.country || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Total Investments:</span>
                  <p>${selectedUser.totalInvestments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Total Withdrawals:</span>
                  <p>${selectedUser.totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Current Balance:</span>
                  <p>${(selectedUser.totalInvestments - selectedUser.totalWithdrawals).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Member Since:</span>
                  <p>{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label className="text-sm font-medium">Update Balance</label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    placeholder="Enter new balance"
                  />
                  <Button onClick={handleUpdateBalance}>Update</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  </div>
</motion.div>  );
};export default AdminDashboard;

