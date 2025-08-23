import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, Wallet, CreditCard, Building2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {auth, db, addDoc, collection, getDoc, doc } from "../../lib/firebase";
interface WalletModalProps {
  type: 'deposit' | 'withdraw' | 'invest';
  onClose: () => void;
}

export const WalletModal = ({ type, onClose }: WalletModalProps) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    amount: '',
    password: ''
  });

  const investmentOptions = [
    {
      id: 'bitcoin-mining',
      name: 'Bitcoin Mining Pool',
      description: 'Join our Bitcoin mining pool and earn daily rewards',
      minAmount: 1000,
      apr: '12%',
      duration: '12 months',
      riskLevel: 'Medium'
    },
    {
      id: 'eth-staking',
      name: 'ETH 2.0 Staking',
      description: 'Stake your ETH and earn staking rewards',
      minAmount: 500,
      apr: '8%',
      duration: '6 months',
      riskLevel: 'Low'
    },
    {
      id: 'defi-yield',
      name: 'DeFi Yield Farming',
      description: 'Earn high yields through automated DeFi strategies',
      minAmount: 2000,
      apr: '15%',
      duration: '3 months',
      riskLevel: 'High'
    },
    {
      id: 'nft-fund',
      name: 'NFT Investment Fund',
      description: 'Diversified portfolio of premium NFT assets',
      minAmount: 5000,
      apr: '20%',
      duration: '9 months',
      riskLevel: 'High'
    }
  ];

  const cryptoAddresses = [
    { 
      name: 'Bitcoin (BTC)', 
      address: 'bc1q27u794x2c5tk3scv9unmx3yswr8yvpkzt5z6wj',
      icon: '₿'
    },
    { 
      name: 'Ethereum (ETH)', 
      address: '0xC4Fbb63647F2fcFd22d8375B0eB87f32d77F42b9',
      icon: 'Ξ'
    },
    { 
      name: 'USDT (TRC20)', 
      address: 'TJqQxsNSfFCpXzRZ8GU9DmTvXU2oCoAXjt',
      icon: '₮'
    },
    { 
      name: 'USD coin BCS (BEP20)', 
      address: '0xC4Fbb63647F2fcFd22d8375B0eB87f32d77F42b9',
      icon: 'Ⓤ'
    },
     { 
      name: 'Binance coin BNB (BEP20) ', 
      address: '0xC4Fbb63647F2fcFd22d8375B0eB87f32d77F42b9',
      icon: 'B'
    },
     { 
      name: 'Tron (TRC20)', 
      address: 'TJqQxsNSfFCpXzRZ8GU9DmTvXU2oCoAXjt',
      icon: 'T'
    }
  ];

  const withdrawOptions = [
    { id: 'paypal', name: 'PayPal', icon: CreditCard },
    { id: 'cashapp', name: 'Cash App', icon: Wallet },
    { id: 'bank', name: 'Bank Transfer', icon: Building2 },
    { id: 'external', name: 'External Wallet', icon: ExternalLink }
  ];

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      toast.success(`${label} address copied!`);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      toast.error('Failed to copy address');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('You must be logged in to perform this action');
        return;
      }

      const amount = parseFloat(formData.amount);
      
      if (type === 'withdraw') {
        // Check if withdrawal amount exceeds balance
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        const currentBalance = userData?.totalInvestments - userData?.totalWithdrawals || 0;
        
        if (amount > currentBalance) {
          toast.error('Insufficient balance for this withdrawal');
          return;
        }
      }

      const data = {
        ...formData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        status: 'pending',
        amount: amount
      };

      if (type === 'withdraw') {
        await addDoc(collection(db, 'withdrawals'), data);
        toast.success('Withdrawal request submitted successfully!');
      } else if (type === 'invest') {
        const selectedInvestmentPlan = investmentOptions.find(o => o.id === selectedPlan);
        await addDoc(collection(db, 'investments'), {
          ...data,
          planDetails: selectedInvestmentPlan,
        });
        toast.success('Investment submitted successfully!');
      } else if (type === 'deposit') {
        await addDoc(collection(db, 'deposits'), data);
        toast.success('Deposit submitted successfully!');
      }
      
      // Show confirmation modal
      toast.info('Your balance will be updated once the transaction is confirmed', {
        duration: 5000,
      });
      
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-2xl shadow-elevated border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold capitalize">
              {type === 'invest' 
                ? !selectedPlan 
                  ? 'Investment Options'
                  : 'Complete Investment'
                : type}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        <div className="p-6">
          {type === 'deposit' && (
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Send your cryptocurrency to any of the addresses below:
              </p>
              <div className="grid gap-4">
                {cryptoAddresses.map((crypto) => (
                  <Card key={crypto.name} className="border border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#094C79] rounded-full flex items-center justify-center text-white font-bold">
                            {crypto.icon}
                          </div>
                          <div>
                            <div className="font-semibold">{crypto.name}</div>
                            <div className="text-sm text-muted-foreground font-mono">
                              {crypto.address.slice(0, 20)}...
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(crypto.address, crypto.name)}
                          className="shrink-0"
                        >
                          {copiedAddress === crypto.address ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {type === 'withdraw' && (
            <div className="space-y-6">
              {!selectedOption ? (
                <div>
                  <p className="text-muted-foreground mb-4">
                    Choose your preferred withdrawal method:
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {withdrawOptions.map((option) => (
                      <Card 
                        key={option.id}
                        className="cursor-pointer hover:shadow-card transition-all border border-border/50 hover:border-primary/30"
                        onClick={() => setSelectedOption(option.id)}
                      >
                        <CardContent className="p-6 text-center">
                          <option.icon className="h-8 w-8 mx-auto mb-3 text-[#094C79]" />
                          <div className="font-semibold">{option.name}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {withdrawOptions.find(o => o.id === selectedOption)?.name} Withdrawal
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedOption(null)}
                    >
                      ← Back
                    </Button>
                  </div>
                  
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">
                      {selectedOption === 'bank' ? 'Account Number' : 
                       selectedOption === 'external' ? 'Wallet Address' : 'Account'}
                    </Label>
                    <Input 
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      required 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input 
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      required 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Confirm Password</Label>
                    <Input 
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required 
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-[#094C79]">
                    Submit Withdrawal Request
                  </Button>
                </form>
              )}
            </div>
          )}

          {type === 'invest' && (
            <div className="space-y-6">
              {!selectedPlan ? (
                // Show investment options first
                <div>
                  <p className="text-muted-foreground mb-4">
                    Choose an investment option to get started:
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    {investmentOptions.map((option) => (
                      <Card 
                        key={option.id}
                        className="cursor-pointer hover:shadow-card transition-all border border-border/50 hover:border-primary/30"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{option.name}</h3>
                              <p className="text-muted-foreground text-sm">{option.description}</p>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className="bg-primary/10 text-[#094C79] border-primary/20"
                            >
                              {option.apr} APR
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Minimum</p>
                              <p className="font-medium">${option.minAmount}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p className="font-medium">{option.duration}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Risk Level</p>
                              <p className="font-medium">{option.riskLevel}</p>
                            </div>
                          </div>
                          <Button 
                            className="w-full bg-[#094C79]"
                            onClick={() => setSelectedPlan(option.id)}
                          >
                            Invest Now
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                // After selecting a plan, show wallet addresses and investment form
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Complete Your Investment
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedPlan(null)}
                    >
                      ← Back
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Send your cryptocurrency to any of the addresses below:
                    </p>
                    <div className="grid gap-4">
                      {cryptoAddresses.map((crypto) => (
                        <Card key={crypto.name} className="border border-border/50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                                  {crypto.icon}
                                </div>
                                <div>
                                  <div className="font-semibold">{crypto.name}</div>
                                  <div className="text-sm text-muted-foreground font-mono">
                                    {crypto.address.slice(0, 20)}...
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(crypto.address, crypto.name)}
                                className="shrink-0"
                              >
                                {copiedAddress === crypto.address ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Card className="border border-border/50 mb-4">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <p className="font-semibold">
                          {investmentOptions.find(o => o.id === selectedPlan)?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {investmentOptions.find(o => o.id === selectedPlan)?.description}
                        </p>
                        <div className="flex items-center space-x-2 text-sm">
                          <Badge variant="secondary" className="bg-primary/10 text-[#094C79] border-primary/20">
                            {investmentOptions.find(o => o.id === selectedPlan)?.apr} APR
                          </Badge>
                          <span className="text-muted-foreground">•</span>
                          <span>{investmentOptions.find(o => o.id === selectedPlan)?.duration}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Investment Amount ($)</Label>
                      <Input 
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        required 
                        min={investmentOptions.find(o => o.id === selectedPlan)?.minAmount}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Minimum: ${investmentOptions.find(o => o.id === selectedPlan)?.minAmount.toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="password">Confirm Password</Label>
                      <Input 
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required 
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Confirm Investment
                    </Button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};