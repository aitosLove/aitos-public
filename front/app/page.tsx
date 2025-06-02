import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BlocksIcon,
  Bot,
  Cpu,
  Wallet,
  BarChart2,
  Layers,
  ArrowUpRight,
  Shield,
  Zap,
  RefreshCw,
  Activity,
  Code,
} from "lucide-react";
import Link from "next/link";
import ThemedLogo from "./themed-logo";

export default function AitosAutomation() {
  return (
    <div className="max-w-6xl mx-auto bg-background">
      {/* Hero Section with Grid Pattern */}
      <div className="relative border-b border-border overflow-hidden pt-20">
        <div className="relative z-10 p-12 flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <ThemedLogo />{" "}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary mb-4">
            BLOCKCHAIN INTELLIGENCE, SIMPLIFIED
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            AITOS transforms complex blockchain operations into simple,
            automated workflows. Manage investments, analyze markets, and
            optimize portfolios on Aptos with
            <span className="font-bold"> zero technical expertise</span>.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-6">
            <Link
              href="/agent"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground border-0 px-12 py-4 text-base font-medium hover:bg-primary/90 transition-all"
            >
              Get Started <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center bg-background text-primary border border-border px-12 py-4 text-base font-medium hover:bg-muted transition-all"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 border-b border-border">
        <div className="md:col-span-8 p-12 border-r border-border">
          <h2 className="text-3xl font-bold mb-6 text-primary">
            Autonomous Blockchain Operations
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            AITOS empowers you with AI-driven tools that remove the complexity
            from blockchain interactions. Create sophisticated DeFi strategies,
            monitor markets, and optimize your portfolio—all without writing a
            single line of code.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            <div className="border border-border p-4 hover:border-primary transition-all duration-200">
              <h3 className="text-primary font-medium mb-2 flex items-center">
                <Code className="mr-2 h-5 w-5" />
                No Code Automation
              </h3>
              <p className="text-muted-foreground text-sm">
                Create complex workflows through simple blueprint selection
              </p>
            </div>
            <div className="border border-border p-4 hover:border-primary transition-all duration-200">
              <h3 className="text-primary font-medium mb-2 flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Smart Risk Management
              </h3>
              <p className="text-muted-foreground text-sm">
                AI-powered portfolio optimization with dynamic risk controls
              </p>
            </div>
          </div>
        </div>
        <div className="md:col-span-4 p-12 bg-card/5">
          <h3 className="text-xl font-medium mb-4 text-primary">
            Why Choose AITOS?
          </h3>
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <div className="flex items-center text-primary mb-2">
                <Zap className="h-5 w-5 mr-2" />
                <span className="font-medium">Proactive Agents</span>
              </div>
              <p className="text-sm text-muted-foreground">
                24/7 automated monitoring and execution of your strategies
              </p>
            </div>
            <div className="border-b border-border pb-4">
              <div className="flex items-center text-primary mb-2">
                <Activity className="h-5 w-5 mr-2" />
                <span className="font-medium">True Chain Abstraction</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Focus on financial goals instead of complex transaction details
              </p>
            </div>
            <div className="border-b border-border pb-4">
              <div className="flex items-center text-primary mb-2">
                <RefreshCw className="h-5 w-5 mr-2" />
                <span className="font-medium">Self-Healing Workflows</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatic error recovery and transaction optimization
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="p-12 border-b border-border">
        <div className="flex items-center mb-8">
          <div className="w-8 h-px bg-border mr-4"></div>
          <h2 className="text-2xl font-bold text-primary">CORE CAPABILITIES</h2>
          <div className="w-8 h-px bg-border ml-4"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Link href="/agent" className="block group">
            <Card className="rounded-none shadow-none h-full border border-border hover:border-primary transition-all duration-200 bg-card relative">
              <div className="absolute bottom-0 right-0 w-12 h-12 border-l border-t border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <CardHeader>
                <div className="mb-4 p-4 border border-border flex items-center justify-center group-hover:border-primary transition-all duration-200">
                  <Cpu className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-primary">
                  AITOS Agent
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Autonomous onchain operations framework
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/aptos-market" className="block group">
            <Card className="rounded-none shadow-none h-full border border-border hover:border-primary transition-all duration-200 bg-card relative">
              <div className="absolute bottom-0 right-0 w-12 h-12 border-l border-t border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <CardHeader>
                <div className="mb-4 p-4 border border-border flex items-center justify-center group-hover:border-primary transition-all duration-200">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-primary">
                  Aptos Analysis
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Real-time market insights analytics
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/portfolio" className="block group">
            <Card className="rounded-none shadow-none h-full border border-border hover:border-primary transition-all duration-200 bg-card relative">
              <div className="absolute bottom-0 right-0 w-12 h-12 border-l border-t border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <CardHeader>
                <div className="mb-4 p-4 border border-border flex items-center justify-center group-hover:border-primary transition-all duration-200">
                  <Wallet className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-primary">
                  AI Portfolio
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Intelligent asset allocation and rebalancing
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-border">
        <div className="p-12 border-r border-border">
          <h2 className="text-2xl font-bold mb-6 text-primary">
            True Chain Abstraction
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            AITOS solves the blockchain complexity problem through a three-layer
            abstraction model that simplifies interactions while maintaining
            powerful capabilities.
          </p>

          <div className="space-y-6">
            <div className="border border-border p-6 hover:border-primary transition-all duration-200">
              <h3 className="text-primary font-medium text-lg mb-3 flex items-center">
                <div className="w-6 h-6 border border-border mr-3 flex items-center justify-center text-sm">
                  1
                </div>
                Contract Abstraction
              </h3>
              <p className="text-muted-foreground text-sm">
                Unified interface for interacting with any Aptos protocol
              </p>
            </div>

            <div className="border border-border p-6 hover:border-primary transition-all duration-200">
              <h3 className="text-primary font-medium text-lg mb-3 flex items-center">
                <div className="w-6 h-6 border border-border mr-3 flex items-center justify-center text-sm">
                  2
                </div>
                Intent Alignment
              </h3>
              <p className="text-muted-foreground text-sm">
                Focus on financial goals instead of transaction details
              </p>
            </div>

            <div className="border border-border p-6 hover:border-primary transition-all duration-200">
              <h3 className="text-primary font-medium text-lg mb-3 flex items-center">
                <div className="w-6 h-6 border border-border mr-3 flex items-center justify-center text-sm">
                  3
                </div>
                Chain Abstraction
              </h3>
              <p className="text-muted-foreground text-sm">
                Single interface for multi-chain operations (coming soon)
              </p>
            </div>
          </div>
        </div>

        <div className="p-12 bg-card/5 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-primary">
              ALTO Agent Framework
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our intelligent event-driven system monitors the Aptos blockchain
              24/7, automatically detecting opportunities and executing
              strategies with enterprise-grade reliability and security.
            </p>

            <div className="space-y-6 mt-8 mb-8">
              {/* Card 1 */}
              <div className="border border-border p-6 hover:border-primary transition-all duration-200">
                <div className="flex items-center text-primary mb-3">
                  <div className="p-1 border border-green-500 rounded-full mr-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <span className="font-medium">
                    Active Agent Connected to Aptos Mainnet
                  </span>
                </div>
                <div className="pt-1">
                  <div className="ml-1 flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Self-Optimizing LP Strategies</span>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="border border-border p-6 hover:border-primary transition-all duration-200">
                <div className="flex items-center text-primary mb-3">
                  <div className="p-1 border border-green-500 rounded-full mr-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <span className="font-medium">
                    Intelligent Position Management
                  </span>
                </div>
                <div className="pt-1">
                  <div className="ml-1 flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Intelligent Position Management</span>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="border border-border p-6 hover:border-primary transition-all duration-200">
                <div className="flex items-center text-primary mb-3">
                  <div className="p-1 border border-green-500 rounded-full mr-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <span className="font-medium">
                    Automated Security Monitoring
                  </span>
                </div>
                <div className="pt-1">
                  <div className="ml-1 flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Automated Security Monitoring</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="p-12 grid grid-cols-1 md:grid-cols-12 border-b border-border">
        <div className="md:col-span-8 md:col-start-3 text-center">
          <h2 className="text-3xl font-bold mb-6 text-primary">
            Your Autonomous Web3 Journey Begins
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Like commanding your first autonomous spacecraft, AITOS equips you
            with:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="border-b border-border pb-2 hover:border-primary transition-all duration-200">
              <p className="font-medium text-primary">
                24/7 AI Strategy Engine
              </p>
            </div>
            <div className="border-b border-border pb-2 hover:border-primary transition-all duration-200">
              <p className="font-medium text-primary">
                Modular DeFi Components
              </p>
            </div>
            <div className="border-b border-border pb-2 hover:border-primary transition-all duration-200">
              <p className="font-medium text-primary">
                Self-Optimizing Portfolios
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/agent"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground px-12 py-4 text-base font-medium hover:bg-primary/90 transition-all"
            >
              Activate AI Pilot
            </Link>
            <Link
              href="/aptos-market"
              className="inline-flex items-center justify-center bg-background text-primary border border-border px-12 py-4 text-base font-medium hover:bg-muted transition-all"
            >
              Market Blueprint
            </Link>
          </div>

          <p className="text-sm text-muted-foreground/70 mt-8">
            Join thousands of crypto portfolios growing autonomously on AITOS,
            processing millions of weekly on-chain operations.
          </p>
        </div>
      </div>

      {/* Getting Started Steps */}
      <div className="p-12 border-b border-border">
        <h2 className="text-2xl font-bold mb-8 text-primary text-center">
          Getting Started Is Simple
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border border-border p-6 hover:border-primary transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                1
              </div>
              <h3 className="text-xl font-medium text-primary">
                Define Objectives
              </h3>
            </div>
            <p className="text-muted-foreground">
              Describe your financial vision in natural language
            </p>
          </div>

          <div className="border border-border p-6 hover:border-primary transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                2
              </div>
              <h3 className="text-xl font-medium text-primary">
                AI Configuration
              </h3>
            </div>
            <p className="text-muted-foreground">
              Automated strategy generation tailored to your goals
            </p>
          </div>

          <div className="border border-border p-6 hover:border-primary transition-all duration-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                3
              </div>
              <h3 className="text-xl font-medium text-primary">
                Autonomous Execution
              </h3>
            </div>
            <p className="text-muted-foreground">
              Witness real-time on-chain operations
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 text-start text-sm text-muted-foreground">
        © 2025 AITOS. All rights reserved.
      </div>
    </div>
  );
}
