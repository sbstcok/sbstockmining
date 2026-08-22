import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Bitcoin,
  Eye,
  EyeOff
} from "lucide-react";
import { WalletModal } from "@/components/WalletModal";
import { auth, db } from "../../lib/firebase";
import { collection, doc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface UserData {
  fullName: string;
  totalInvestments: number;
  totalWithdrawals: number;
}

interface TransactionRecord {
  id: string;
  type: "Deposit" | "Withdrawal" | "Investment";
  amount: number;
  status: string;
  createdAt?: string;
  planName?: string;
}

const Dashboard = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | 'invest' | null>(null);
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState<TransactionRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadTransactionHistory = async () => {
    const user = auth.currentUser;
    if (!user) {
      setHistoryError("You must be logged in to view transaction history.");
      return;
    }

    try {
      setHistoryLoading(true);
      setHistoryError(null);

      const [depositsSnapshot, withdrawalsSnapshot, investmentsSnapshot] = await Promise.all([
        getDocs(query(collection(db, "deposits"), where("userId", "==", user.uid))),
        getDocs(query(collection(db, "withdrawals"), where("userId", "==", user.uid))),
        getDocs(query(collection(db, "investments"), where("userId", "==", user.uid)))
      ]);

      const records: TransactionRecord[] = [
        ...depositsSnapshot.docs.map((transaction) => ({
          id: transaction.id,
          type: "Deposit" as const,
          amount: Number(transaction.data().amount) || 0,
          status: transaction.data().status || "pending",
          createdAt: transaction.data().createdAt
        })),
        ...withdrawalsSnapshot.docs.map((transaction) => ({
          id: transaction.id,
          type: "Withdrawal" as const,
          amount: Number(transaction.data().amount) || 0,
          status: transaction.data().status || "pending",
          createdAt: transaction.data().createdAt
        })),
        ...investmentsSnapshot.docs.map((transaction) => {
          const data = transaction.data();
          return {
            id: transaction.id,
            type: "Investment" as const,
            amount: Number(data.amount) || 0,
            status: data.status || "pending",
            createdAt: data.createdAt,
            planName: data.planName || data.planDetails?.planName || data.planDetails?.name
          };
        })
      ].sort((first, second) => {
        return new Date(second.createdAt || 0).getTime() - new Date(first.createdAt || 0).getTime();
      });

      setTransactionHistory(records);
    } catch (error) {
      console.error("Error loading transaction history:", error);
      setHistoryError("Unable to load transaction history. Please try again.");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Map of display names to CoinGecko IDs
  const coinMap = {
    BTC: { name: "Bitcoin", symbol: "BTC", id: "bitcoin" },
    ETH: { name: "Ethereum", symbol: "ETH", id: "ethereum" },
    SOL: { name: "Solana", symbol: "SOL", id: "solana" },
    ADA: { name: "Cardano", symbol: "ADA", id: "cardano" },
    MATIC: { name: "Polygon", symbol: "MATIC", id: "matic-network" },
    LINK: { name: "Chainlink", symbol: "LINK", id: "chainlink" }
  };

  // Fetch real-time crypto prices
  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeUser?.();
      setUserLoading(true);

      if (!user) {
        setUserData(null);
        setUserLoading(false);
        return;
      }

      unsubscribeUser = onSnapshot(
        doc(db, "users", user.uid),
        (userDoc) => {
          setUserData(userDoc.exists() ? userDoc.data() as UserData : null);
          setUserLoading(false);
        },
        (error) => {
          console.error("Error listening for user updates:", error);
          setUserLoading(false);
        }
      );
    });

    return () => {
      unsubscribeUser?.();
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        setError(null);

        const ids = Object.values(coinMap).map(coin => coin.id).join(",");
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch prices");
        }

        const data = await response.json();

        // Transform API data to match cryptoData format
        const formattedData = Object.keys(coinMap).map(symbol => {
          const coin = coinMap[symbol];
          const price = data[coin.id]?.usd || 0;
          const change = data[coin.id]?.usd_24h_change || 0;
          return {
            name: coin.name,
            symbol: coin.symbol,
            price: parseFloat(price.toFixed(2)),
            change: parseFloat(Math.abs(change).toFixed(2)),
            positive: change >= 0
          };
        });

        setCryptoData(formattedData);
        setLoading(false);
      } catch (err) {
        setError("Unable to fetch real-time prices. Please try again later.");
        setLoading(false);
      }
    };

    fetchPrices();

    // Optional: Poll every 60 seconds for updated prices
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold mb-2">
            {userLoading ? "Welcome..." : `Welcome back, ${userData?.fullName || 'User'}!`}
          </h1>
          <p className="text-muted-foreground">Here's your investment overview</p>
        </motion.div>

        {/* Balance Card */}
        <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.1 }}
>
  <Card className="bg-[#094C79] text-white shadow-glow border-0">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg font-medium text-white/90">Total Balance</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setBalanceVisible(!balanceVisible)}
          className="text-white/90 hover:text-white hover:bg-white/10"
        >
          {balanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-4xl font-bold mb-4 text-white">
        {balanceVisible 
          ? userLoading 
            ? "Loading..." 
            : `$${((userData?.totalInvestments || 0) - (userData?.totalWithdrawals || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : "••••••"}
      </div>
      <div className="flex items-center space-x-2 text-white/80 mb-6">
        <ArrowUpRight className="h-4 w-4" />
        <span className="text-sm">+12.5% from last month</span>
      </div>
    </CardContent>
  </Card>
</motion.div>
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Button 
            onClick={() => setModalType('deposit')}
            className="h-16 flex flex-col items-center justify-center space-y-1 bg-card hover:bg-card/80 text-foreground border border-border/50 hover:border-primary/30"
            variant="outline"
          >
            <ArrowDownRight className="h-5 w-5 text-[#094C79]" />
            <span className="text-sm hover:text-black">Deposit</span>
          </Button>
          
          <Button 
            onClick={() => setModalType('withdraw')}
            className="h-16 flex flex-col items-center justify-center space-y-1 bg-card hover:bg-card/80 text-foreground border border-border/50 hover:border-primary/30"
            variant="outline"
          >
            <ArrowUpRight className="h-5 w-5 text-[#094C79]" />
            <span className="text-sm hover:text-black">Withdraw</span>
          </Button>
          
          <Button 
            onClick={() => setModalType('invest')}
            className="h-16 flex flex-col items-center justify-center space-y-1 bg-card hover:bg-card/80 text-foreground border border-border/50 hover:border-primary/30"
            variant="outline"
          >
            <TrendingUp className="h-5 w-5 text-[#094C79]" />
            <span className="text-sm hover:text-black">Invest</span>
          </Button>
          
          <Button 
            type="button"
            onClick={() => {
              setShowTransactionHistory(true);
              void loadTransactionHistory();
            }}
            className="h-16 flex flex-col items-center justify-center space-y-1 bg-card hover:bg-card/80 text-foreground border border-border/50 hover:border-primary/30"
            variant="outline"
          >
            <Bitcoin className="h-5 w-5 text-[#094C79]" />
            <span className="text-sm hover:text-black">Market</span>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Market Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-[#094C79]" />
                  <span>Market Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <div className="text-center text-muted-foreground">Loading prices...</div>
                ) : error ? (
                  <div className="text-center text-destructive">{error}</div>
                ) : cryptoData.length === 0 ? (
                  <div className="text-center text-muted-foreground">No price data available</div>
                ) : (
                  cryptoData.map((crypto, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-lg transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#CCAC53] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {crypto.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{crypto.name}</div>
                          <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${crypto.price.toLocaleString()}</div>
                        <div className={`text-sm flex items-center space-x-1 ${
                          crypto.positive ? "text-success" : "text-destructive"
                        }`}>
                          {crypto.positive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span>{crypto.change}%</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {showTransactionHistory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowTransactionHistory(false)}
        >
          <Card
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transaction History</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowTransactionHistory(false)}>
                ×
              </Button>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <p className="py-8 text-center text-muted-foreground">Loading transaction history...</p>
              ) : historyError ? (
                <p className="py-8 text-center text-destructive">{historyError}</p>
              ) : transactionHistory.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No transactions found.</p>
              ) : (
                <div className="space-y-3">
                  {transactionHistory.map((transaction) => (
                    <div
                      key={`${transaction.type}-${transaction.id}`}
                      className="flex flex-col gap-2 rounded-lg border border-border/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold">
                          {transaction.type}
                          {transaction.planName ? ` - ${transaction.planName}` : ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.createdAt
                            ? new Date(transaction.createdAt).toLocaleString()
                            : "Date unavailable"}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-semibold">${transaction.amount.toLocaleString()}</p>
                        <Badge variant="secondary" className="capitalize">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modals */}
      {modalType && (
        <WalletModal
          type={modalType}
          onClose={() => setModalType(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;