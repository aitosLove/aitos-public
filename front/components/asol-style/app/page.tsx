// pages/index.tsx
"use client";
import { useRef, useEffect, useState, FC, ComponentType } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import {
  Bot,
  ArrowRight,
  Shield,
  Wifi,
  Activity,
  Database,
  Clock,
  Key,
  Diamond,
  BarChart3,
  Cloud,
  Network,
  Code,
} from "lucide-react";
import ThemedLogo from "./themed-logo";

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  delay?: number;
}

const Button = ({
  children,
  variant = "primary",
  href,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  href?: string;
  className?: string;
  [x: string]: any;
}) => {
  const baseClasses =
    "relative inline-flex items-center justify-center px-8 py-3 overflow-hidden text-lg font-medium transition-all duration-300 group rounded-lg";

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-indigo-500 to-purple-400 text-white hover:from-indigo-600 hover:to-purple-500 dark:from-indigo-500 dark:to-purple-400 dark:hover:from-indigo-600 dark:hover:to-purple-500",
    secondary:
      "bg-gradient-to-r from-teal-500 to-indigo-400 text-white hover:from-teal-600 hover:to-indigo-500 dark:from-teal-500 dark:to-indigo-400 dark:hover:from-teal-600 dark:hover:to-indigo-500",
    outline:
      "border border-purple-500 text-purple-600 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-900/20",
  };

  return href ? (
    <Link
      href={href}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {variant === "primary" && <ArrowRight className="w-5 h-5" />}
      </span>
    </Link>
  ) : (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {variant === "primary" && <ArrowRight className="w-5 h-5" />}
      </span>
    </button>
  );
};

const AnimatedSection: FC<AnimatedSectionProps> = ({
  children,
  delay = 0,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const FeatureCard: FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  delay = 0,
}) => (
  <AnimatedSection delay={delay}>
    <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-shadow h-full">
      <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 mb-6 flex items-center justify-center">
        <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-primary">
     

      {/* Header can be uncommented and customized if needed */}
      {/* <header className={`relative w-full top-0 z-50 transition-all ${navBg ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800' : ''}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg mb-3 flex items-center justify-center">
                <ThemedLogo />              
              </div>
              <span className="text-xl font-bold">Quantum Flux</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#capabilities" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Capabilities
              </Link>
              <Link href="#technology" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Technology
              </Link>
              <Link href="#industries" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Industries
              </Link>
            </nav>
            
            <div className="flex items-center gap-4">
              <Button href="/portal" variant="outline" className="hidden sm:inline-flex">
                Portal Access
              </Button>
              <Button href="/demo" className="hidden sm:inline-flex">
                Request Demo
              </Button>
            </div>
          </div>
        </div>
      </header> */}

      <main className="pt-20">
        {/* Hero Section - Completely Changed Layout */}
        <section ref={heroRef} className="container mx-auto px-6 py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
              className="max-w-xl"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                className="flex items-center px-0 py-2  mb-4"
              >
                <ThemedLogo />
                <span className="text-purple-500 dark:text-purple-300 font-medium">
                  Solana Agent Framework
                </span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                className="text-5xl md:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-indigo-600 via-purple-500 to-teal-400 bg-clip-text text-transparent"
              >
                Automated Solana Trading & Alpha Seeking
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={isHeroInView ? { opacity: 1 } : {}}
                className="text-xl text-gray-600 dark:text-gray-300 mb-10"
              >
                Launch intelligent agents that automatically interact with
                Solana's ecosystem, discover high potential opportunities, and
                execute trades with precision timing.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={isHeroInView ? { opacity: 1 } : {}}
                className="flex flex-wrap gap-4 mt-8"
              >
                <Button href="/agent">Launch Agent</Button>
                <Button href="/sol-market" variant="outline">
                  Seek on Market
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
              className="hidden md:block"
            >
              <div className="bg-gradient-to-br from-indigo-600/20 via-purple-500/20 to-teal-500/20 p-1 rounded-3xl shadow-xl overflow-hidden">
                <div className="w-full rounded-3xl bg-white/5 dark:bg-gray-900/50 backdrop-blur-sm p-8 border border-white/10 dark:border-purple-900/30 relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5"></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="text-xs text-indigo-600 font-mono mb-1">
                          // WONDERLAND ENGINE
                        </div>
                        <div className="text-3xl font-bold bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                          Data Analyzer
                        </div>
                      </div>
                      <motion.div
                        className="p-2 rounded-full relative"
                        initial={{ boxShadow: "0 0 0 0 rgba(20, 184, 166, 0)" }}
                        animate={{
                          boxShadow: [
                            "0 0 0 0 rgba(20, 184, 166, 0.7)",
                            "0 0 0 10px rgba(20, 184, 166, 0)",
                            "0 0 0 0 rgba(20, 184, 166, 0)",
                          ],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 3,
                          ease: "easeInOut",
                        }}
                      >
                        <motion.div
                          className="absolute inset-0 rounded-full opacity-70"
                          animate={{
                            backgroundColor: [
                              "rgba(6, 182, 212, 0.3)", // cyan
                              "rgba(20, 184, 166, 0.3)", // teal
                              "rgba(147, 51, 234, 0.3)", // purple
                              "rgba(219, 39, 119, 0.3)", // fuchsia
                              "rgba(6, 182, 212, 0.3)", // back to cyan
                            ],
                            borderColor: [
                              "rgba(6, 182, 212, 0.5)", // cyan
                              "rgba(20, 184, 166, 0.5)", // teal
                              "rgba(147, 51, 234, 0.5)", // purple
                              "rgba(219, 39, 119, 0.5)", // fuchsia
                              "rgba(6, 182, 212, 0.5)", // back to cyan
                            ],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 8,
                            ease: "linear",
                          }}
                          style={{ border: "1px solid" }}
                        />
                        <motion.div
                          className="relative z-10 flex items-center justify-center"
                          animate={{
                            color: [
                              "rgb(6, 182, 212)", // cyan
                              "rgb(20, 184, 166)", // teal
                              "rgb(147, 51, 234)", // purple
                              "rgb(219, 39, 119)", // fuchsia
                              "rgb(6, 182, 212)", // back to cyan
                            ],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 8,
                            ease: "linear",
                          }}
                        >
                          <Bot strokeWidth={1.5} className="w-7 h-7 m-2" />
                        </motion.div>
                      </motion.div>
                    </div>

                    <div className="bg-gradient-to-br from-fuchsia-700/10 to-purple-700/10 p-4 rounded-xl mb-6 border border-fuchsia-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-5 h-5 text-fuchsia-600" />
                        <div className="text-lg font-medium text-primary">
                          Intelligent Features
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Advanced algorithms continuously analyze patterns across
                        multiple data points to deliver actionable insights with
                        unparalleled accuracy.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <motion.div
                        className="bg-gradient-to-r from-indigo-900/10 to-purple-900/10 p-4 rounded-xl border-0 flex items-center gap-4"
                        whileHover={{
                          scale: 1.02,
                          backgroundColor: "rgba(79, 70, 229, 0.2)",
                        }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <div className="p-2 bg-indigo-600/20 rounded-lg">
                          <Diamond className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-medium">Pattern Recognition</div>
                          <div className="text-sm text-muted-foreground">
                            Identifies complex relationships in
                            multi-dimensional datasets
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        className="bg-gradient-to-r from-purple-900/10 to-indigo-900/10 p-4 rounded-xl border-0 b flex items-center gap-4"
                        whileHover={{
                          scale: 1.02,
                          backgroundColor: "rgba(147, 51, 234, 0.2)",
                        }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <div className="p-2 bg-purple-600/20 rounded-lg">
                          <Wifi className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            Real-time Processing
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Analyzes data streams with millisecond response
                            times
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        className="bg-gradient-to-r from-teal-900/10 to-indigo-900/10 p-4 rounded-xl border-0 flex items-center gap-4"
                        whileHover={{
                          scale: 1.02,
                          backgroundColor: "rgba(20, 184, 166, 0.2)",
                        }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <div className="p-2 bg-teal-600/20 rounded-lg">
                          <Shield className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <div className="font-medium">Adaptive Learning</div>
                          <div className="text-sm text-muted-foreground">
                            Continuously improves from historical data and
                            outcomes
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    <style jsx>{`
                      .pulse-glow {
                        animation: pulse 3s infinite;
                        box-shadow: 0 0 0 0 rgba(45, 212, 191, 0.7);
                      }
                      @keyframes pulse {
                        0% {
                          box-shadow: 0 0 0 0 rgba(45, 212, 191, 0.7);
                        }
                        70% {
                          box-shadow: 0 0 0 10px rgba(45, 212, 191, 0);
                        }
                        100% {
                          box-shadow: 0 0 0 0 rgba(45, 212, 191, 0);
                        }
                      }
                      .bg-grid-pattern {
                        background-image: radial-gradient(
                          rgba(255, 255, 255, 0.1) 1px,
                          transparent 1px
                        );
                        background-size: 20px 20px;
                      }
                    `}</style>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="capabilities"
          className="py-24 bg-gradient-to-b from-background to-indigo-50 dark:from-black dark:to-indigo-950/20"
        >
          <div className="container mx-auto px-6">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Advanced Solana Trading Capabilities
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our agent framework offers powerful tools for traders,
                investors, and DeFi enthusiasts
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="Intelligent Market Analysis"
                description="Identify emerging market trends and arbitrage opportunities across Solana DeFi protocols"
                icon={Bot}
                delay={0.1}
              />
              <FeatureCard
                title="Risk-Managed Execution"
                description="Automated position management with configurable risk parameters and stop-loss strategies"
                icon={Shield}
                delay={0.2}
              />
              <FeatureCard
                title="Multi-Protocol Integration"
                description="Seamlessly interact with DEXs, lending platforms, and yield farms across the Solana ecosystem"
                icon={Network}
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* Technology Stack - Completely Different Layout */}
        <section id="technology" className="py-24 bg-white dark:bg-black">
          <div className="container mx-auto px-6">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Future-Proof Technology Framework
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Built with scalability, adaptability, and performance at its
                core
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-12 gap-8">
              <AnimatedSection delay={0.1} className="md:col-span-8">
                <div className="p-8 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-teal-500/10 rounded-2xl h-full">
                  <h3 className="text-2xl font-semibold mb-6">
                    Modular Architecture
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Our platform is built on a modular foundation that allows
                    for seamless integration of new technologies and
                    customization to meet specific business requirements.
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">
                          Adaptive Processing
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Automatically optimizes resources based on workload
                          demands
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                        <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Data Orchestration</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Intelligent data movement and transformation across
                          systems
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2} className="md:col-span-4">
                <div className="p-8 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-teal-500/10 rounded-2xl h-full">
                  <h3 className="text-2xl font-semibold mb-6">
                    System Integrations
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center">
                        <Cloud className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <span>Major cloud providers</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                        <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span>Enterprise data systems</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                        <Code className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span>Open API framework</span>
                    </li>
                  </ul>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Industries Section - New Section */}
        {/* <section
          id="industries"
          className="py-24 bg-indigo-50 dark:bg-indigo-950/20"
        >
          <div className="container mx-auto px-6">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Industry-Specific Solutions
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Tailored implementations for the unique challenges of different
                sectors
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Financial Services",
                  description:
                    "Risk modeling, fraud detection, and high-frequency trading optimization",
                  icon: BarChart3,
                },
                {
                  title: "Healthcare & Life Sciences",
                  description:
                    "Genomic analysis, drug discovery, and patient outcome prediction",
                  icon: Activity,
                },
                {
                  title: "Manufacturing & Logistics",
                  description:
                    "Supply chain optimization, predictive maintenance, and quality control",
                  icon: Clock,
                },
              ].map((item, index) => (
                <AnimatedSection key={index} delay={index * 0.1}>
                  <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-shadow h-full border border-indigo-100 dark:border-indigo-900/30">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-teal-500/10 mb-6 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-4">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section> */}

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 text-white">
          <div className="container mx-auto px-6 text-center">
            <AnimatedSection className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Data Strategy?
              </h2>
              <p className="text-indigo-100 mb-10 text-lg">
                Join leading organizations already leveraging our platform to
                unlock new insights and opportunities
              </p>
              <div className="flex flex-wrap gap-6 justify-center">
                <Button href="/agent">Launch Agent</Button>
                <Button href="/sol-market" variant="secondary">
                  Seek on Market
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      {/* Footer can be uncommented and customized if needed */}
      {/* <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Quantum Flux</h3>
              <p className="text-sm">Next-generation data processing platform</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/solutions" className="hover:text-purple-400">Solutions</Link></li>
                <li><Link href="/security" className="hover:text-purple-400">Security</Link></li>
                <li><Link href="/pricing" className="hover:text-purple-400">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/documentation" className="hover:text-purple-400">Documentation</Link></li>
                <li><Link href="/case-studies" className="hover:text-purple-400">Case Studies</Link></li>
                <li><Link href="/status" className="hover:text-purple-400">System Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-purple-400">About</Link></li>
                <li><Link href="/careers" className="hover:text-purple-400">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-purple-400">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>© 2025 Quantum Flux. All rights reserved.</p>
          </div>
        </div>
      </footer> */}
    </div>
  );
}
