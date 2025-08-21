import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight, TrendingUp, Shield, Zap, DollarSign, Users, BarChart3, Menu, X } from "lucide-react";
import { useState } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">InvestPro</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
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
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="hidden md:flex items-center space-x-3">
              <Button variant="outline" onClick={() => navigate('/onboarding')}>
                Login
              </Button>
              <Button onClick={() => navigate('/onboarding')}>
                Get Started
              </Button>
            </div>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-background border-t border-border"
          >
            <div className="container mx-auto px-6 py-4 space-y-4">
              <button 
                onClick={() => scrollToSection('features')} 
                className="block w-full text-left text-muted-foreground hover:text-primary transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className="block w-full text-left text-muted-foreground hover:text-primary transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('stats')} 
                className="block w-full text-left text-muted-foreground hover:text-primary transition-colors"
              >
                Stats
              </button>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline" onClick={() => navigate('/onboarding')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/onboarding')}>
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Smart Investments Made Simple
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Join thousands of investors building wealth with our intelligent investment platform
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
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg font-semibold rounded-xl shadow-glow transition-all duration-300 hover:shadow-elevated group"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/onboarding')}
                className="px-8 py-4 text-lg font-semibold rounded-xl border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
              >
                Login
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
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

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-card p-8 rounded-2xl shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50"
              >
                <div className="bg-gradient-primary w-14 h-14 rounded-xl flex items-center justify-center mb-6">
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
      <section id="about" className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">About InvestPro</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're revolutionizing the investment landscape with cutting-edge technology, 
              expert insights, and a commitment to making wealth building accessible to everyone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
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
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-card p-8 rounded-2xl shadow-card"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">$2.5B+</div>
                  <div className="text-sm text-muted-foreground">Assets Managed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">4.9★</div>
                  <div className="text-sm text-muted-foreground">User Rating</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 px-6">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Platform Statistics</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See why thousands of investors trust InvestPro with their financial future
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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-card p-8 rounded-2xl shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50 text-center"
              >
                <div className="bg-gradient-primary w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <h3 className="text-lg font-semibold mb-2">{stat.label}</h3>
                <p className="text-muted-foreground text-sm">{stat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Landing;