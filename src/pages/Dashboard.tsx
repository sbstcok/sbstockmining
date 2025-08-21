import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  Plus, 
  Minus, 
  TrendingUp, 
  BarChart3,
  Copy,
  Eye,
  EyeOff,
  DollarSign,
  CircleDollarSign
} from "lucide-react";
import { toast } from "sonner";

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