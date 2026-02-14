import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, TrendingUp, Shield, Zap, DollarSign, Users, BarChart3, Menu, X, ChevronLeft, ChevronRight, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentHero, setCurrentHero] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const heroImages = [
    "https://www.merit.com/wp-content/uploads/2018/11/Singapore-City.jpg",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
    "https://slaylebrity.com/wp-content/uploads/2018/03/IMG_2688.jpg"
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Investor",
      text: "This platform transformed my investment strategy! The returns are consistent and the interface is user-friendly."
    },
    {
      name: "Michael Chen",
      role: "Trader",
      text: "The real-time market data and easy withdrawals make this my go-to investment platform."
    },
    {
      name: "Emma Davis",
      role: "Entrepreneur",
      text: "I doubled my investment in just 60 days with the Pro Plan. Highly recommend!"
    }
  ];

  const investmentPlans = [
    { 
      name: "Starter Plan", 
      minAmount: 100, 
      roi: 5, 
      duration: "30 days",
      description: "Perfect for beginners looking to start their investment journey",
      color: "from-blue-500 to-blue-700"
    },
    { 
      name: "Pro Plan", 
      minAmount: 1000, 
      roi: 10, 
      duration: "60 days",
      description: "Ideal for experienced investors seeking higher returns",
      color: "from-purple-500 to-purple-700"
    },
    { 
      name: "Elite Plan", 
      minAmount: 10000, 
      roi: 20, 
      duration: "90 days",
      description: "Premium plan for high-net-worth individuals",
      color: "from-green-500 to-green-700"
    }
  ];

  const coinMap = {
    BTC: { name: "Bitcoin", symbol: "BTC", id: "bitcoin" },
    ETH: { name: "Ethereum", symbol: "ETH", id: "ethereum" },
    SOL: { name: "Solana", symbol: "SOL", id: "solana" },
    ADA: { name: "Cardano", symbol: "ADA", id: "cardano" },
    MATIC: { name: "Polygon", symbol: "MATIC", id: "matic-network" },
    LINK: { name: "Chainlink", symbol: "LINK", id: "chainlink" }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const heroInterval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(heroInterval);
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
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Hero slide animation
  const heroSlideVariants = {
    initial: { x: '100%' },
    animate: { x: '0%' },
    exit: { x: '-100%' },
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="fixed top-0 left-0 w-full max-w-screen z-50 bg-white border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 py-0 flex items-center justify-between flex-wrap">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="flex items-center space-x-3 h-20 w-20 sm:h-16 sm:w-16">
              <img src="/SBLOGO.png" alt="com logo" className="object-contain max-w-full max-h-full" />
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 flex-shrink">
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('about')} 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('stats')} 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Stats
            </button>
            <button 
              onClick={() => scrollToSection('invest')} 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Invest
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <Button variant="outline" onClick={() => navigate('/onboarding')}>
                Login
              </Button>
              <Button className="bg-[#CCAC53]" onClick={() => navigate('/onboarding')}>
                Get Started
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden bg-[#094C79] text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-[64px] left-0 w-full max-w-full bg-white border-t border-border"
          >
            <div className="container mx-auto px-4 sm:px-6 py-4 space-y-4">
              <button 
                onClick={() => scrollToSection('features')} 
                className="block w-full text-left text-black hover:text-primary transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className="block w-full text-left text-black hover:text-primary transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('stats')} 
                className="block w-full text-left text-black hover:text-primary transition-colors"
              >
                Stats
              </button>
              <button 
                onClick={() => scrollToSection('invest')} 
                className="block w-full text-left text-black hover:text-primary transition-colors"
              >
                Invest
              </button>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline" onClick={() => navigate('/onboarding')}>
                  Login
                </Button>
                <Button className="bg-[#CCAC53]" onClick={() => navigate('/onboarding')}>
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentHero}
            src={heroImages[currentHero]}
            alt="Hero image"
            className="absolute inset-0 w-full h-full object-cover"
            variants={heroSlideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/10 z-[1]" />
        <div className="absolute inset-0 bg-gradient-hero opacity-10 z-[2]" />
        
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-[3]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Crypto Mining & Stock Trading
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-white mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Join the future of digital investment with our state-of-the-art crypto mining and professional stock trading services
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button
                size="lg"
                onClick={() => navigate('/onboarding')}
                className="bg-[#CCAC53] text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg font-semibold rounded-xl shadow-glow transition-all duration-300 hover:shadow-elevated group"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="absolute top-20 left-10 w-16 h-16 bg-primary/10 rounded-full blur-xl"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-32 right-16 w-24 h-24 bg-secondary/10 rounded-full blur-xl"
          animate={{ 
            y: [0, 20, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </section>

      {/* Crypto Prices Marquee */}
      <section className="bg-muted/30 py-4 overflow-hidden">
        <motion.div
          className="container mx-auto px-4 sm:px-6"
        >
          <div className="relative overflow-hidden" aria-live="polite">
            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="flex space-x-4 sm:space-x-8 whitespace-nowrap"
              style={{ minWidth: '200%' }}
            >
              {loading ? (
                <div className="text-center text-muted-foreground w-full">Loading prices...</div>
              ) : error ? (
                <div className="text-center text-destructive w-full">{error}</div>
              ) : cryptoData.length === 0 ? (
                <div className="text-center text-muted-foreground w-full">No price data available</div>
              ) : (
                cryptoData.concat(cryptoData).map((crypto, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 min-w-[160px] sm:min-w-[200px] flex-shrink-0"
                  >
                    <div className="w-8 h-8 bg-[#094C79] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {crypto.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-sm sm:text-base">{crypto.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground flex items-center space-x-1">
                        <span>${crypto.price.toLocaleString()}</span>
                        <span className={crypto.positive ? "text-success" : "text-destructive"}>
                          {crypto.positive ? "+" : "-"}{crypto.change}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Investment Plans Section */}
      <section id="invest" className="py-14">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Investment Opportunities</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan to start your investment journey
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {investmentPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                whileHover={{ scale: 1.05 }}
                className={`p-6 rounded-2xl bg-gradient-to-br ${plan.color} text-white shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50`}
              >
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm mb-4">{plan.description}</p>
                <div className="space-y-2 mb-6">
                  <p className="text-sm">Min. Investment: ${plan.minAmount}</p>
                  <p className="text-sm">ROI: {plan.roi}%</p>
                  <p className="text-sm">Duration: {plan.duration}</p>
                </div>
                <Button
                  asChild
                  className="w-full bg-white text-gray-900 hover:bg-gray-100"
                >
                  <a href="/onboarding">Start Investing</a>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
<section className="py-14 bg-muted/30">
  <div className="container mx-auto px-4 sm:px-6">
    <motion.div
      className="text-center mb-16"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.2 }}
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-6">What Our Investors Say</h2>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Hear from our community of successful investors
      </p>
    </motion.div>
    <div className="relative overflow-hidden" aria-live="polite">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        className="flex space-x-4 whitespace-nowrap"
        style={{ minWidth: '200%' }}
      >
        {testimonials.concat(testimonials).map((testimonial, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-full sm:w-[calc(100%/2)] md:w-[calc(100%/3)] lg:w-[calc(100%/4)] max-w-[400px] min-w-[280px] bg-card p-6 rounded-2xl shadow-card border border-border/50 flex items-start space-x-4"
          >
            <div className="w-10 h-10 bg-[#094C79] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {testimonial.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-muted-foreground mb-4 text-sm line-clamp-3">{testimonial.text}</p>
              <p className="font-semibold text-sm truncate">{testimonial.name}</p>
              <p className="text-xs text-muted-foreground truncate">{testimonial.role}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  </div>
</section>
      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose Our Platform?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of investing with our cutting-edge technology and expert insights
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Smart Analytics",
                description: "AI-powered insights help you make informed investment decisions"
              },
              {
                icon: Shield,
                title: "Secure Platform",
                description: "Bank-level security with multi-factor authentication and encryption"
              },
              {
                icon: Zap,
                title: "Instant Trading",
                description: "Execute trades in milliseconds with our high-speed trading engine"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-card p-8 rounded-2xl shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50"
              >
                <div className="bg-[#CCAC53] w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-14 px-4 sm:px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className=""
            >
              <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
              <p className="text-muted-foreground mb-6">
                To democratize investing by providing powerful tools, real-time insights, 
                and expert guidance that help anyone build long-term wealth regardless of 
                their experience level.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Transparent fees with no hidden costs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>24/7 customer support and guidance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Advanced security and encryption</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              className="bg-gradient-card p-8 rounded-2xl shadow-card"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#094C79] mb-2">50K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#094C79] mb-2">$2.5B+</div>
                  <div className="text-sm text-muted-foreground">Assets Managed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#094C79] mb-2">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#094C79] mb-2">4.9★</div>
                  <div className="text-sm text-muted-foreground">User Rating</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-14">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Platform Statistics</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See why thousands of investors trust SB crypto and stocks mining with their financial future
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: DollarSign,
                value: "$2.5B+",
                label: "Total Assets Under Management",
                description: "Secure and growing portfolio value"
              },
              {
                icon: Users,
                value: "50,000+",
                label: "Active Investors",
                description: "Join our thriving community"
              },
              {
                icon: BarChart3,
                value: "15.7%",
                label: "Average Annual Returns",
                description: "Outperforming market averages"
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-card p-8 rounded-2xl shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50 text-center"
              >
                <div className="bg-[#CCAC53] w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-[#094C79] mb-2">{stat.value}</div>
                <h3 className="text-lg font-semibold mb-2">{stat.label}</h3>
                <p className="text-muted-foreground text-sm">{stat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section id="services" className="py-14">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive solutions for your crypto and stock investment needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Crypto Mining",
                description: "Professional cryptocurrency mining services with state-of-the-art hardware and optimal energy efficiency",
                image: "https://cdn.mos.cms.futurecdn.net/fbS5kjGRT4umPC7ZyhABu5.jpg"
              },
              {
                title: "Stock Trading",
                description: "Expert stock market analysis and trading services with real-time market insights",
                image: "https://th.bing.com/th/id/R.a75f26564e6aa4ea6ea849dcbc472f46?rik=A%2bKLsOyZWdLT4w&pid=ImgRaw&r=0"
              },
              {
                title: "Investment Advisory",
                description: "Personalized investment strategies tailored to your financial goals and risk tolerance",
                image: "https://tse3.mm.bing.net/th/id/OIP.PKA-2b1mqaI4ugoMTty-kAHaE8?rs=1&pid=ImgDetMain&o=7&rm=3"
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                className="bg-card overflow-hidden rounded-2xl shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50"
              >
                <div className="h-48 relative">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <motion.div 
        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Button
          size="lg"
          onClick={() => navigate('/onboarding')}
          className="bg-[#CCAC53] text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg font-semibold rounded-xl shadow-glow transition-all duration-300 hover:shadow-elevated group mb-10"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </motion.div>

      {/* Footer */}
      <footer className="bg-background border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3 h-20 w-20 sm:h-20 sm:w-20">
                  <img src="/SBLOGO.png" alt="com logo" className="object-contain" />
                </div>
              </div>
              <p className="text-muted-foreground">
                Your trusted partner in crypto mining and stock trading
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('features')} className="text-muted-foreground hover:text-primary">Features</button></li>
                <li><button onClick={() => scrollToSection('about')} className="text-muted-foreground hover:text-primary">About</button></li>
                <li><button onClick={() => scrollToSection('services')} className="text-muted-foreground hover:text-primary">Services</button></li>
                <li><button onClick={() => scrollToSection('invest')} className="text-muted-foreground hover:text-primary">Invest</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  
                </li>
                <li></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SB Crypto & Stocks Mining. All rights reserved.</p>
          </div>
        </div>
      </footer>
      {/* commit message  or more*/}
    </motion.div>
  );
};

export default Landing;
