import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { auth, db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, getDoc, query, where, increment } from 'firebase/firestore';
import { toast } from 'sonner';

interface UserData {
  id: string;
  fullName: string;
  email: string;
  totalInvestments: number;
  totalWithdrawals: number;
  country?: string;
  createdAt?: string;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  createdAt?: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newBalance, setNewBalance] = useState('');
  const [adminEditEnabled, setAdminEditEnabled] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [updatingWithdrawalId, setUpdatingWithdrawalId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map((d) => ({
        id: d.id,
        fullName: d.data().fullName || 'Unknown',
        email: d.data().email || 'Unknown',
        totalInvestments: Number(d.data().totalInvestments) || 0,
        totalWithdrawals: Number(d.data().totalWithdrawals) || 0,
        country: d.data().country || undefined,
        createdAt: d.data().createdAt || undefined,
      } as UserData));
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const checkAdminAuth = async () => {
    const adminToken = sessionStorage.getItem('adminToken');
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    const adminAuth = sessionStorage.getItem('adminAuth');
    if (!adminToken || !isAdmin || !adminAuth) {
      sessionStorage.removeItem('adminAuth');
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('isAdmin');
      navigate('/admin/login', { replace: true });
      return;
    }
    await fetchUsers();
  };

  useEffect(() => { checkAdminAuth(); }, [navigate]);

  const handleUpdateBalance = async () => {
    if (!selectedUser || !newBalance) return;
    const amountToAdd = parseFloat(newBalance);
    if (Number.isNaN(amountToAdd)) {
      toast.error('Please enter a valid number');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', selectedUser.id), { totalInvestments: increment(amountToAdd) });
      toast.success('Balance increased successfully');
      await fetchUsers();
      const updatedUserDoc = await getDoc(doc(db, 'users', selectedUser.id));
      if (updatedUserDoc.exists()) {
        const data = updatedUserDoc.data();
        setSelectedUser({
          id: selectedUser.id,
          fullName: data.fullName || 'Unknown',
          email: data.email || 'Unknown',
          totalInvestments: Number(data.totalInvestments) || 0,
          totalWithdrawals: Number(data.totalWithdrawals) || 0,
          country: data.country || undefined,
          createdAt: data.createdAt || undefined,
        });
      }
      setNewBalance('');
    } catch (err) {
      console.error('Error updating balance:', err);
      toast.error('Failed to update balance');
    }
  };

  const handleSelectUser = async (user: UserData) => {
    setSelectedUser(user);
    setWithdrawalsLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'withdrawals'), where('userId', '==', user.id)));
      setWithdrawalRequests(snap.docs.map(d => ({ id: d.id, amount: Number(d.data().amount) || 0, status: d.data().status || 'pending', createdAt: d.data().createdAt } as WithdrawalRequest)));
    } catch (err) {
      console.error('Error fetching withdrawal requests:', err);
      toast.error('Failed to load withdrawal requests');
      setWithdrawalRequests([]);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  const handleUpdateWithdrawal = async (withdrawal: WithdrawalRequest, status: 'completed' | 'rejected') => {
    if (!selectedUser || withdrawal.status !== 'pending') return;
    try {
      setUpdatingWithdrawalId(withdrawal.id);
      await updateDoc(doc(db, 'withdrawals', withdrawal.id), { status, updatedAt: new Date().toISOString() });
      if (status === 'completed') {
        await updateDoc(doc(db, 'users', selectedUser.id), { totalWithdrawals: increment(withdrawal.amount) });
      }
      setWithdrawalRequests(reqs => reqs.map(r => r.id === withdrawal.id ? { ...r, status } : r));
      await fetchUsers();
      toast.success(`Withdrawal ${status === 'completed' ? 'marked as paid' : 'rejected'}`);
    } catch (err) {
      console.error('Error updating withdrawal:', err);
      toast.error('Failed to update withdrawal request');
    } finally {
      setUpdatingWithdrawalId(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={async () => {
            try {
              sessionStorage.removeItem('adminAuth');
              sessionStorage.removeItem('adminToken');
              sessionStorage.removeItem('isAdmin');
              if (auth.currentUser) await auth.signOut();
              toast.success('Logged out successfully');
              navigate('/admin/login', { replace: true });
            } catch (err) {
              console.error('Logout error:', err);
              toast.error('Failed to logout');
            }
          }}>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Users</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="text-center py-4">Loading users...</div> : (
                <div className="grid gap-4">
                  {users.map(user => (
                    <Card key={user.id} className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12"><AvatarFallback className="bg-primary/20">{user.fullName?.split(' ').map(n=>n[0]).join('').toUpperCase() || 'U'}</AvatarFallback></Avatar>
                          <div><h3 className="font-semibold">{user.fullName}</h3><p className="text-sm text-muted-foreground">{user.email}</p></div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2">
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Balance</div>
                            <div className="font-semibold">${(user.totalInvestments - user.totalWithdrawals).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Button onClick={() => setSelectedUser(user)} className="w-full sm:w-auto">View Details</Button>
                            <Button variant="outline" onClick={() => handleSelectUser(user)} className="w-full sm:w-auto">Update Withdrawals</Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedUser && (
            <Card>
              <CardHeader><CardTitle>User Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-12 w-12"><AvatarFallback className="bg-primary/20">{selectedUser.fullName?.split(' ').map(n=>n[0]).join('').toUpperCase() || 'U'}</AvatarFallback></Avatar>
                    <div><h3 className="font-semibold">{selectedUser.fullName}</h3><p className="text-sm text-muted-foreground">{selectedUser.email}</p></div>
                  </div>

                  <div className="space-y-2">
                    <div><span className="text-sm text-muted-foreground">Country:</span><p>{selectedUser.country || 'Not specified'}</p></div>
                    <div><span className="text-sm text-muted-foreground">Total Investments:</span><p>${selectedUser.totalInvestments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
                    <div><span className="text-sm text-muted-foreground">Total Withdrawals:</span><p>${selectedUser.totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
                    <div><span className="text-sm text-muted-foreground">Current Balance:</span><p>${(selectedUser.totalInvestments - selectedUser.totalWithdrawals).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
                    <div><span className="text-sm text-muted-foreground">Member Since:</span><p>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Unknown'}</p></div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between"><h3 className="font-semibold">Withdrawal Requests</h3><Button variant="outline" size="sm" onClick={() => handleSelectUser(selectedUser)}>Refresh</Button></div>
                    {withdrawalsLoading ? <p className="text-sm text-muted-foreground">Loading withdrawal requests...</p> : withdrawalRequests.length === 0 ? <p className="text-sm text-muted-foreground">No withdrawal requests found.</p> : (
                      <div className="space-y-3">{withdrawalRequests.map(w => (
                        <div key={w.id} className="rounded-md border border-border p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div><p className="font-medium">${w.amount.toLocaleString()}</p><p className="text-xs text-muted-foreground">{w.createdAt ? new Date(w.createdAt).toLocaleString() : 'Date unavailable'}</p></div>
                            <span className="text-sm capitalize text-muted-foreground">{w.status}</span>
                          </div>
                          {w.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleUpdateWithdrawal(w, 'completed')} disabled={updatingWithdrawalId === w.id}>{updatingWithdrawalId === w.id ? 'Updating...' : 'Mark as Paid'}</Button>
                              <Button size="sm" variant="outline" onClick={() => handleUpdateWithdrawal(w, 'rejected')} disabled={updatingWithdrawalId === w.id}>Reject</Button>
                            </div>
                          )}
                        </div>
                      ))}</div>
                    )}
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Add To Balance</label>
                      <Button variant={adminEditEnabled ? 'default' : 'outline'} size="sm" onClick={() => setAdminEditEnabled(!adminEditEnabled)}>
                        {adminEditEnabled ? 'Disable Edit' : 'Enable Edit'}
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Input type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} placeholder="Enter amount to add" disabled={!adminEditEnabled} />
                      <Button onClick={handleUpdateBalance} disabled={!adminEditEnabled}>Add Amount</Button>
                    </div>
                    {!adminEditEnabled && <p className="text-xs text-muted-foreground">Enable edit to modify user balances.</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
