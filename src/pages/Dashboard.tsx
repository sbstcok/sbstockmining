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
  EyeOff,
  LogOut
} from "lucide-react";
import { WalletModal } from "@/components/WalletModal";
import { auth, db } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, DocumentData, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | 'invest' | null>(null);
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{ fullName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userInvestments, setUserInvestments] = useState([]);
  const [userWithdrawals, setUserWithdrawals] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const navigate = useNavigate();

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

  // Map of display names to CoinMarketCap IDs
  const coinMap: CoinMap = useMemo(() => ({
    BTC: { name: "Bitcoin", symbol: "BTC", id: "bitcoin" },
    ETH: { name: "Ethereum", symbol: "ETH", id: "ethereum" },
    SOL: { name: "Solana", symbol: "SOL", id: "solana" },
    ADA: { name: "Cardano", symbol: "ADA", id: "cardano" },
    MATIC: { name: "Polygon", symbol: "MATIC", id: "polygon" },
    LINK: { name: "Chainlink", symbol: "LINK", id: "chainlink" }
  }), []);

  // Sample data to use on error
  const sampleData = {
    bitcoin: { usd: 29850, usd_24h_change: 2.5 },
    ethereum: { usd: 1780, usd_24h_change: 1.8 },
    solana: { usd: 21.5, usd_24h_change: 3.2 },
    cardano: { usd: 0.28, usd_24h_change: -1.5 },
    polygon: { usd: 0.58, usd_24h_change: 0.9 },
    chainlink: { usd: 6.2, usd_24h_change: 1.2 }
  };

  // Function to format sample data
  const formatSampleData = () => {
    return Object.keys(coinMap).map(symbol => {
      const coin = coinMap[symbol];
      const price = sampleData[coin.id]?.usd || 0;
      const change = sampleData[coin.id]?.usd_24h_change || 0;
      return {
        name: coin.name,
        symbol: coin.symbol,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(Math.abs(change).toFixed(2)),
        positive: change >= 0
      };
    });
  };

  // Fetch crypto data
  const fetchCryptoData = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

      const ids = Object.values(coinMap).map(coin => coin.id).join(",");
      const response = await fetch(
        `/api/coinmarketcap?slug=${ids}&convert=USD`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (response.status === 429) {
        console.warn("Rate limit exceeded, using sample data");
        return formatSampleData();
      }

      if (!response.ok) {
        console.error(`HTTP error: ${response.status} ${response.statusText}`);
        return formatSampleData();
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Received non-JSON response, likely proxy misconfiguration");
        return formatSampleData();
      }

      const data = await response.json();

      // Transform API data
      return Object.keys(coinMap).map(symbol => {
        const coin = coinMap[symbol];
        const coinData = data.data[coin.id];
        const price = coinData?.quote.USD.price || 0;
        const change = coinData?.quote.USD.percent_change_24h || 0;
        return {
          name: coin.name,
          symbol: coin.symbol,
          price: parseFloat(price.toFixed(2)),
          change: parseFloat(Math.abs(change).toFixed(2)),
          positive: change >= 0
        };
      });
    } catch (error) {
      console.error("FetchCryptoData error:", error.message);
      return formatSampleData();
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      setLoading(true); // Show loading to prevent UI interaction
      await signOut(auth);
      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Logout error:", error.message);
      setError("Failed to log out, please try again");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all data at once
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const user = auth.currentUser;
        let fetchedUserData = null;
        let fetchedInvestments = [];
        let fetchedWithdrawals = [];
        let fetchedCryptoData = formatSampleData(); // Default to sample data

        if (user) {
          // Fetch user data
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            fetchedUserData = userDoc.data();
          }

          // Fetch investments
          const investmentsQuery = query(
            collection(db, "investments"),
            where("userId", "==", user.uid)
          );
          const investmentsSnapshot = await getDocs(investmentsQuery);
          fetchedInvestments = investmentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as TransactionData[];

          // Fetch withdrawals
          const withdrawalsQuery = query(
            collection(db, "withdrawals"),
            where("userId", "==", user.uid)
          );
          const withdrawalsSnapshot = await getDocs(withdrawalsQuery);
          fetchedWithdrawals = withdrawalsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as TransactionData[];
        }

        // Fetch crypto data
        fetchedCryptoData = await fetchCryptoData();

        // Update all state at once
        setUserData(fetchedUserData);
        setUserInvestments(fetchedInvestments);
        setUserWithdrawals(fetchedWithdrawals);
        setCryptoData(fetchedCryptoData);

        // Calculate total balance
        const totalInvestments = fetchedInvestments
          .filter(inv => inv.status === 'approved')
          .reduce((sum, inv) => sum + Number(inv.amount), 0);
        const totalWithdrawals = fetchedWithdrawals
          .filter(wd => wd.status === 'approved')
          .reduce((sum, wd) => sum + Number(wd.amount), 0);
        setTotalBalance(totalInvestments - totalWithdrawals);

        setError(null);
      } catch (err) {
        console.error("Fetch error:", err.message);
        setCryptoData(formatSampleData());
        setError("Failed to load data, using sample data for prices");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [coinMap]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Logout Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center space-x-2 bg-destructive hover:bg-destructive/80"
            variant="destructive"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="text-center text-muted-foreground">Loading dashboard...</div>
        ) : (
          <>
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {userData?.fullName || auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Investor'}!
              </h1>
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
                disabled={loading}
                className="h-16 flex flex-col items-center justify-center space-y-1 bg-card hover:bg-card/80 text-foreground border border-border/50 hover:border-primary/30"
                variant="outline"
              >
                <ArrowDownRight className="h-5 w-5 text-primary" />
                <span className="text-sm">Deposit</span>
              </Button>
              
              <Button 
                onClick={() => setModalType('withdraw')}
                disabled={loading}
                className="h-16 flex flex-col items-center justify-center space-y-1 bg-card hover:bg-card/80 text-foreground border border-border/50 hover:border-primary/30"
                variant="outline"
              >
                <ArrowUpRight className="h-5 w-5 text-primary" />
                <span className="text-sm">Withdraw</span>
              </Button>
              
              <Button 
                onClick={() => setModalType('invest')}
                disabled={loading}
                className="h-16 flex flex-col items-center justify-center space-y-1 bg-card hover:bg-card/80 text-foreground border border-border/50 hover:border-primary/30"
                variant="outline"
              >
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm">Invest</span>
              </Button>
              
              <Button 
                disabled={loading}
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
                    {error && <div className="text-center text-destructive">{error}</div>}
                    {cryptoData.length === 0 ? (
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
          </>
        )}
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