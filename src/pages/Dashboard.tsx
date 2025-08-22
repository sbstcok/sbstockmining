import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { collection, query, where, getDocs, DocumentData } from "firebase/firestore";

const Dashboard = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | 'invest' | null>(null);
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  interface CoinData {
    name: string;
    symbol: string;
    id: string;
  }

  interface CoinMap {
    [key: string]: CoinData;
  }

  interface TransactionData {
    id: string;
    amount: number;
    userId: string;
    createdAt: string;
    status: string;
  }
  
  const [userInvestments, setUserInvestments] = useState<TransactionData[]>([]);
  const [userWithdrawals, setUserWithdrawals] = useState<TransactionData[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);

  // Map of display names to CoinGecko IDs
  const coinMap: CoinMap = useMemo(() => ({
    BTC: { name: "Bitcoin", symbol: "BTC", id: "bitcoin" },
    ETH: { name: "Ethereum", symbol: "ETH", id: "ethereum" },
    SOL: { name: "Solana", symbol: "SOL", id: "solana" },
    ADA: { name: "Cardano", symbol: "ADA", id: "cardano" },
    MATIC: { name: "Polygon", symbol: "MATIC", id: "matic-network" },
    LINK: { name: "Chainlink", symbol: "LINK", id: "chainlink" }
  }), []);

  // Fetch real-time crypto prices
  // Fetch user's investments and withdrawals
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Fetch investments
        const investmentsQuery = query(
          collection(db, "investments"),
          where("userId", "==", user.uid)
        );
        const investmentsSnapshot = await getDocs(investmentsQuery);
        const investments = investmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TransactionData[];
        setUserInvestments(investments);

        // Fetch withdrawals
        const withdrawalsQuery = query(
          collection(db, "withdrawals"),
          where("userId", "==", user.uid)
        );
        const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
        const withdrawals = withdrawalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TransactionData[];
        setUserWithdrawals(withdrawals);

        // Calculate total balance
        const totalInvestments = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
        const totalWithdrawals = withdrawals.reduce((sum, wd) => sum + Number(wd.amount), 0);
        setTotalBalance(totalInvestments - totalWithdrawals);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
      }
    };

    fetchUserData();
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
  }, [coinMap]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold mb-2">Welcome back, John!</h1>
          <p className="text-muted-foreground">Here's your investment overview</p>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-gradient-primary text-white shadow-glow border-0">
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
                {balanceVisible ? `$${totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : "••••••"}
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
            <ArrowDownRight className="h-5 w-5 text-primary" />
            <span className="text-sm">Deposit</span>
          </Button>
          
          <Button 
            onClick={() => setModalType('withdraw')}
            className="h-16 flex flex-col items-center justify-center space-y-1 bg-card hover:bg-card/80 text-foreground border border-border/50 hover:border-primary/30"
            variant="outline"
          >
            <ArrowUpRight className="h-5 w-5 text-primary" />
            <span className="text-sm">Withdraw</span>
          </Button>
          
          <Button 
            onClick={() => setModalType('invest')}
            className="h-16 flex flex-col items-center justify-center space-y-1 bg-card hover:bg-card/80 text-foreground border border-border/50 hover:border-primary/30"
            variant="outline"
          >
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm">Invest</span>
          </Button>
          
          <Button 
            className="h-16 flex flex-col items-center justify-center space-y-1 bg-card hover:bg-card/80 text-foreground border border-border/50 hover:border-primary/30"
            variant="outline"
          >
            <Bitcoin className="h-5 w-5 text-primary" />
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
                  <DollarSign className="h-5 w-5 text-primary" />
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
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
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