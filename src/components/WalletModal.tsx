import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Wallet, CreditCard, Building2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface WalletModalProps {
  type: 'deposit' | 'withdraw' | 'invest';
  onClose: () => void;
}

export const WalletModal = ({ type, onClose }: WalletModalProps) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    amount: '',
    password: ''
  });

  const cryptoAddresses = [
    { 
      name: 'Bitcoin (BTC)', 
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      icon: '₿'
    },
    { 
      name: 'Ethereum (ETH)', 
      address: '0x742d35Cc6634C0532925a3b8D465C1F9c5cF4B7F',
      icon: 'Ξ'
    },
    { 
      name: 'USDT (TRC20)', 
      address: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
      icon: '₮'
    },
    { 
      name: 'USDC (ERC20)', 
      address: '0x742d35Cc6634C0532925a3b8D465C1F9c5cF4B7F',
      icon: 'Ⓤ'
    }
  ];

  const withdrawOptions = [
    { id: 'paypal', name: 'PayPal', icon: CreditCard },
    { id: 'cashapp', name: 'Cash App', icon: Wallet },
    { id: 'bank', name: 'Bank Transfer', icon: Building2 },
    { id: 'external', name: 'External Wallet', icon: ExternalLink }
  ];

  const investmentWallets = [
    { id: 'metamask', name: 'MetaMask', address: '0x742d35Cc6634C0532925a3b8D465C1F9c5cF4B7F' },
    { id: 'trustwallet', name: 'Trust Wallet', address: '0x8ba1f109551bD432803012645Hac136c22C' },
    { id: 'coinbase', name: 'Coinbase Wallet', address: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12' },
    { id: 'binance', name: 'Binance Chain', address: 'bnb1xy2kgdygjrsqtzq2n0yrf2493p83kkf' }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`${type} request submitted successfully!`);
    onClose();
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
            <h2 className="text-2xl font-bold capitalize">{type}</h2>
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
                          <option.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
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
                  
                  <Button type="submit" className="w-full">
                    Submit Withdrawal Request
                  </Button>
                </form>
              )}
            </div>
          )}

          {type === 'invest' && (
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Choose a wallet to connect for investing:
              </p>
              <div className="grid gap-4">
                {investmentWallets.map((wallet) => (
                  <Card key={wallet.id} className="border border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                            <Wallet className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold">{wallet.name}</div>
                            <div className="text-sm text-muted-foreground font-mono">
                              {wallet.address.slice(0, 20)}...
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(wallet.address, wallet.name)}
                          className="shrink-0"
                        >
                          {copiedAddress === wallet.address ? (
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
        </div>
      </motion.div>
    </motion.div>
  );
};