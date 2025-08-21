import { useState } from "react";
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

const Dashboard = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | 'invest' | null>(null);

  const cryptoData = [
    { name: "Bitcoin", symbol: "BTC", price: 67420.30, change: 2.45, positive: true },
    { name: "Ethereum", symbol: "ETH", price: 3891.20, change: -1.32, positive: false },
    { name: "Solana", symbol: "SOL", price: 189.45, change: 5.67, positive: true },
    { name: "Cardano", symbol: "ADA", price: 1.25, change: 3.21, positive: true },
    { name: "Polygon", symbol: "MATIC", price: 0.87, change: -2.15, positive: false },
    { name: "Chainlink", symbol: "LINK", price: 18.92, change: 1.89, positive: true }
  ];

  const investmentPlans = [
    { name: "Starter Plan", minAmount: 100, roi: 5, duration: "30 days" },
    { name: "Pro Plan", minAmount: 1000, roi: 10, duration: "60 days" },
    { name: "Elite Plan", minAmount: 10000, roi: 20, duration: "90 days" }
  ];

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
                {balanceVisible ? "$5,000.00" : "••••••"}
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
            <span className="text-sm">Market</span>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Investment Plans */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Investment Plans</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {investmentPlans.map((plan, index) => (
                  <div key={index} className="p-4 border border-border/50 rounded-lg hover:shadow-card transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {plan.roi}% ROI
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Min: ${plan.minAmount.toLocaleString()} • Duration: {plan.duration}
                    </p>
                    <Button size="sm" className="w-full">
                      Invest
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

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
                {cryptoData.map((crypto, index) => (
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
                        <span>{Math.abs(crypto.change)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
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

const Dashboard = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [activeWalletTab, setActiveWalletTab] = useState("deposit");

  const cryptoPrices = [
    { name: "Bitcoin", symbol: "BTC", price: 43250.00, change: 2.5, icon: CircleDollarSign },
    { name: "Ethereum", symbol: "ETH", price: 2580.00, change: -1.2, icon: CircleDollarSign },
    { name: "Solana", symbol: "SOL", price: 98.50, change: 5.8, icon: DollarSign },
    { name: "Cardano", symbol: "ADA", price: 0.45, change: -0.8, icon: DollarSign },
  ];

  const investmentPlans = [
    { name: "Starter Plan", min: 100, roi: 5, duration: "30 days" },
    { name: "Pro Plan", min: 1000, roi: 10, duration: "60 days" },
    { name: "Elite Plan", min: 10000, roi: 20, duration: "90 days" },
  ];

  const walletAddresses = {
    BTC: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    ETH: "0x742d35Cc6631C0532925a3b8D4D0A5ED1e2F0Cda",
    USDT: "TYASr6cE1NqRqT8NNqGKSgT4b7DUhQWs3K"
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} address copied!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <DashboardLayout>
        <div className="p-6 space-y-6">
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
            <Card className="bg-gradient-primary text-white shadow-elevated">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white/90">Total Balance</CardTitle>
                  <CardDescription className="text-white/70">
                    Your current portfolio value
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-white hover:bg-white/10"
                >
                  {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">
                  {showBalance ? "$5,000.00" : "••••••"}
                </div>
                <div className="flex space-x-4">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setActiveWalletTab("deposit")}
                    className="bg-white/10 text-white hover:bg-white/20 border-white/20"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Deposit
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setActiveWalletTab("withdraw")}
                    className="bg-white/10 text-white hover:bg-white/20 border-white/20"
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setActiveWalletTab("invest")}
                    className="bg-white/10 text-white hover:bg-white/20 border-white/20"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Invest
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setActiveWalletTab("market")}
                    className="bg-white/10 text-white hover:bg-white/20 border-white/20"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Market
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Wallet Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="h-5 w-5 mr-2" />
                  Wallet Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeWalletTab} onValueChange={setActiveWalletTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="deposit">Deposit</TabsTrigger>
                    <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                    <TabsTrigger value="invest">Invest</TabsTrigger>
                    <TabsTrigger value="market">Market</TabsTrigger>
                  </TabsList>

                  <TabsContent value="deposit" className="space-y-4">
                    <h3 className="text-lg font-semibold">Crypto Wallet Addresses</h3>
                    <div className="space-y-3">
                      {Object.entries(walletAddresses).map(([crypto, address]) => (
                        <div key={crypto} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">{crypto}</p>
                            <p className="text-sm text-muted-foreground font-mono">{address}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(address, crypto)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="withdraw" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {["PayPal", "Cash App", "Bank Transfer", "External Wallet"].map((method) => (
                        <Button key={method} variant="outline" className="h-20 flex-col">
                          <DollarSign className="h-6 w-6 mb-2" />
                          {method}
                        </Button>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label>Amount</Label>
                        <Input placeholder="Enter amount" type="number" />
                      </div>
                      <div>
                        <Label>Address/Account</Label>
                        <Input placeholder="Enter destination" />
                      </div>
                      <div>
                        <Label>Password</Label>
                        <Input type="password" placeholder="Confirm with password" />
                      </div>
                      <Button className="w-full bg-primary">Process Withdrawal</Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="invest" className="space-y-4">
                    <div className="grid gap-4">
                      {investmentPlans.map((plan, index) => (
                        <motion.div
                          key={plan.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold">{plan.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Min: ${plan.min.toLocaleString()} • {plan.roi}% ROI • {plan.duration}
                              </p>
                            </div>
                            <Button size="sm" className="bg-primary">Subscribe</Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="market" className="space-y-4">
                    <div className="space-y-3">
                      {cryptoPrices.map((crypto, index) => (
                        <motion.div
                          key={crypto.symbol}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <crypto.icon className="h-8 w-8 text-primary" />
                            <div>
                              <p className="font-medium">{crypto.name}</p>
                              <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${crypto.price.toLocaleString()}</p>
                            <p className={`text-sm ${crypto.change > 0 ? 'text-success' : 'text-destructive'}`}>
                              {crypto.change > 0 ? '+' : ''}{crypto.change}%
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    </motion.div>
  );
};

export default Dashboard;