// pages/index.tsx
'use client'
import { useRef, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Brain, 
  ArrowRight, 
  Shield, 
  Zap, 
  LineChart, 
  Settings,
  RefreshCcw,
  Lock,
  Rocket,
  BarChart,
  Server,
  Globe,
  Code
} from 'lucide-react';
import ThemedLogo from './themed-logo';

const Button = ({ 
  children, 
  variant = 'primary', 
  href, 
  className = '', 
  ...props 
}: { 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'outline'; 
  href?: string; 
  className?: string; 
  [x: string]: any; 
}) => {
  const baseClasses = "relative inline-flex items-center justify-center px-8 py-3 overflow-hidden text-lg font-medium transition-all duration-300 group rounded-lg";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-lime-600 to-teal-500 text-white hover:from-lime-700 hover:to-teal-600 dark:from-lime-500 dark:to-teal-400 dark:hover:from-lime-600 dark:hover:to-teal-500",
    secondary: "bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-700 hover:to-teal-600 dark:from-emerald-500 dark:to-teal-400",
    outline: "border border-lime-500 text-lime-600 hover:bg-lime-50 dark:text-lime-300 dark:hover:bg-lime-900/20"
  };
  
  return href ? (
    <Link href={href} className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {variant === 'primary' && <ArrowRight className="w-5 h-5" />}
      </span>
    </Link>
  ) : (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {variant === 'primary' && <ArrowRight className="w-5 h-5" />}
      </span>
    </button>
  );
};

const AnimatedSection = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const FeatureCard = ({ title, description, icon: Icon, delay = 0 }) => (
  <AnimatedSection delay={delay}>
    <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-shadow h-full">
      <div className="w-12 h-12 rounded-xl bg-lime-100 dark:bg-lime-900/20 mb-6 flex items-center justify-center">
        <Icon className="w-6 h-6 text-lime-600 dark:text-lime-400" />
      </div>
      <h3 className="text-2xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </AnimatedSection>
);

export default function Home() {
  const [navBg, setNavBg] = useState(false);
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  useEffect(() => {
    const handleScroll = () => {
      setNavBg(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      <Head>
        <title>BSCAI | AI-Powered Blockchain Intelligence</title>
        <meta name="description" content="Enterprise-grade blockchain automation and analytics powered by artificial intelligence" />
      </Head>

      {/* <header className={`relative w-full top-0 z-50 transition-all ${navBg ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800' : ''}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg mb-3 flex items-center justify-center">
                <ThemedLogo />              
              </div>
              <span className="text-xl font-bold">BSCAI</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
                Features
              </Link>
              <Link href="#solutions" className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
                Solutions
              </Link>
              <Link href="#enterprise" className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
                Enterprise
              </Link>
            </nav>
            
            <div className="flex items-center gap-4">
              <Button href="/login" variant="outline" className="hidden sm:inline-flex">
                Sign In
              </Button>
              <Button href="/signup" className="hidden sm:inline-flex">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header> */}

      <main className="pt-32">
        {/* Hero Section */}
        <section ref={heroRef} className="container mx-auto px-6 pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              className="inline-block px-6 py-2 bg-lime-100 dark:bg-lime-900/20 rounded-full mb-8"
            >
              <span className="text-lime-600 dark:text-lime-300 font-medium">
                AI-Powered Blockchain Automation
              </span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              className="leading-relaxed text-5xl md:text-6xl font-bold pb-8 bg-gradient-to-r from-lime-600 to-teal-500 bg-clip-text text-transparent"
            >
              Next-Generation Blockchain Intelligence
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={isHeroInView ? { opacity: 1 } : {}}
              className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto"
            >
              Harness artificial intelligence to optimize your decentralized operations, manage risk, and maximize returns across multiple chains.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isHeroInView ? { opacity: 1 } : {}}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button href="/agent">
                Activate Agent
              </Button>
              <Button href="/bsc-market" variant="outline">
                Market Insights
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Full Automatic Blockchain Solutions
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Comprehensive tools for institutional investors and blockchain professionals
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="Smart Automation"
                description="AI-powered agents execute complex strategies with precision timing"
                icon={Brain}
                delay={0.1}
              />
              <FeatureCard
                title="Risk Management"
                description="Real-time monitoring and automated protection systems"
                icon={Shield}
                delay={0.2}
              />
              <FeatureCard
                title="Cross-Chain Analytics"
                description="Unified dashboard for multi-chain portfolio management"
                icon={Globe}
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="py-20 bg-white dark:bg-black">
          <div className="container mx-auto px-6">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Advanced Blockchain Infrastructure
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Built on cutting-edge technologies for maximum performance and reliability
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Server, title: "Multi-Chain Support", description: "EVM, Cosmos, Solana, and more" },
                { icon: Lock, title: "Security First", description: "Military-grade encryption protocols" },
                { icon: BarChart, title: "Real-time Data", description: "Sub-second market updates" },
                { icon: Code, title: "Developer API", description: "Full-featured REST & WebSocket API" },
              ].map((item, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl text-center">
                    <div className="w-12 h-12 rounded-xl bg-lime-100 dark:bg-lime-900/20 mx-auto mb-6 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-lime-600 dark:text-lime-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-lime-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-6 text-center">
            <AnimatedSection className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Blockchain Strategy?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Join hundreds of institutions already using NEXUS to optimize their blockchain operations
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button href="/agent">
                  Start Now
                </Button>
             
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      {/* <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">NEXUS</h3>
              <p className="text-sm">AI-powered blockchain intelligence platform</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-lime-400">Features</Link></li>
                <li><Link href="/security" className="hover:text-lime-400">Security</Link></li>
                <li><Link href="/pricing" className="hover:text-lime-400">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs" className="hover:text-lime-400">Documentation</Link></li>
                <li><Link href="/blog" className="hover:text-lime-400">Blog</Link></li>
                <li><Link href="/status" className="hover:text-lime-400">System Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-lime-400">About</Link></li>
                <li><Link href="/careers" className="hover:text-lime-400">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-lime-400">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>© 2024 NEXUS. All rights reserved.</p>
          </div>
        </div>
      </footer> */}
    </div>
  );
}
