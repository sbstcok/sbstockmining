import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalletModal } from "@/components/WalletModal";
import { 
  TrendingUp, 
  Shield, 
  Clock, 
  Star,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

const InvestmentPlans = () => {
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedInvestmentPlan, setSelectedInvestmentPlan] = useState<{
    name: string;
    price: number;
    receiveAmount: number;
    duration: string;
  } | null>(null);
  
  const plans = [
    { name: "Plan 1", price: 100, receiveAmount: 500, duration: "24 hours", color: "from-blue-500 to-cyan-500", popular: false },
    { name: "Plan 2", price: 500, receiveAmount: 2500, duration: "1 week", color: "from-cyan-500 to-teal-500", popular: false },
    { name: "Plan 3", price: 1000, receiveAmount: 5000, duration: "2 weeks", color: "from-teal-500 to-green-500", popular: false },
    { name: "Plan 4", price: 5000, receiveAmount: 25000, duration: "1 month", color: "from-green-500 to-lime-500", popular: false },
    { name: "Plan 5", price: 10000, receiveAmount: 50000, duration: "2 months", color: "from-yellow-500 to-orange-500", popular: false },
    { name: "Plan 6", price: 15000, receiveAmount: 75000, duration: "3 months", color: "from-orange-500 to-red-500", popular: false },
    { name: "Plan 7", price: 20000, receiveAmount: 100000, duration: "4 months", color: "from-red-500 to-pink-500", popular: true },
    { name: "Plan 8", price: 30000, receiveAmount: 250000, duration: "5 months", color: "from-pink-500 to-purple-500", popular: false },
    { name: "Plan 9", price: 50000, receiveAmount: 500000, duration: "1 year", color: "from-purple-500 to-indigo-500", popular: false },
    { name: "Plan 10", price: 100000, receiveAmount: 1000000, duration: "2 years", color: "from-indigo-500 to-blue-500", popular: false }
  ];

  const handleSubscribe = (plan: typeof plans[number]) => {
    setSelectedInvestmentPlan(plan);
    setShowInvestModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-4">Investment Plans</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan to grow your wealth with our expert-managed investment strategies
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-primary text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`shadow-elevated hover:shadow-glow transition-all duration-300 ${plan.popular ? 'ring-2 ring-primary/20' : ''}`}>
                  <CardHeader className="text-center pb-8">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-lg">
                      Fixed-term investment plan
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Pricing */}
                    <div className="text-center">
                      <div className="text-3xl font-bold">${plan.price.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Minimum investment</div>
                    </div>

                    {/* Return & Duration */}
                    <div className="flex justify-center space-x-8">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-success">${plan.receiveAmount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">You receive</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center text-lg font-semibold">
                          <Clock className="h-4 w-4 mr-1" />
                          {plan.duration}
                        </div>
                        <div className="text-xs text-muted-foreground">Investment period</div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      <div className="flex items-center text-sm font-medium">
                        <Shield className="h-4 w-4 mr-2 text-[#094C79]" />
                        Features included:
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-start text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-success mt-0.5 flex-shrink-0" />
                          <span>Fixed return of ${plan.receiveAmount.toLocaleString()}</span>
                        </li>
                        <li className="flex items-start text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-success mt-0.5 flex-shrink-0" />
                          <span>Minimum investment of ${plan.price.toLocaleString()}</span>
                        </li>
                      </ul>
                    </div>

                    {/* Subscribe Button */}
                    <Button
                      className={`w-full ${plan.popular 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                      } group`}
                      size="lg"
                      onClick={() => handleSubscribe(plan)}
                    >
                      Subscribe to {plan.name}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center p-8 bg-muted/30 rounded-2xl"
          >
            <h3 className="text-xl font-semibold mb-4">Why Invest With Us?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex flex-col items-center">
                <Shield className="h-8 w-8 text-[#094C79] mb-2" />
                <p className="font-medium">Secure & Regulated</p>
                <p className="text-muted-foreground">SEC registered and FDIC insured</p>
              </div>
              <div className="flex flex-col items-center">
                <TrendingUp className="h-8 w-8 text-success mb-2" />
                <p className="font-medium">Proven Track Record</p>
                <p className="text-muted-foreground">Consistent returns over 5+ years</p>
              </div>
              <div className="flex flex-col items-center">
                <Star className="h-8 w-8 text-secondary mb-2" />
                <p className="font-medium">Expert Management</p>
                <p className="text-muted-foreground">Professional fund managers</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Investment Modal */}
        {showInvestModal && (
          <WalletModal
            type="invest"
            investmentPlan={selectedInvestmentPlan ?? undefined}
            onClose={() => setShowInvestModal(false)}
          />
        )}
      </DashboardLayout>
    </motion.div>
  );
};

export default InvestmentPlans;