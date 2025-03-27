"use client";
import Image from "next/image";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BlocksIcon,
  Bot,
  MessageCircle,
  Wallet,
  ArrowRight,
  Cloud,
  FileSpreadsheetIcon,
  WorkflowIcon,
  CoinsIcon,
  RocketIcon,
  LayoutTemplateIcon,
  CompassIcon,
  CpuIcon,
  SwitchCameraIcon,
  MenuIcon,
  ArrowDownIcon,
  GlobeIcon,
  FileJson,
  FileCode2,
  Fingerprint,
  Link2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import HeroSection from "@/components/mini-card/homepage-card/hero-section";
import FeatureCards from "@/components/mini-card/homepage-card/feature-card";
import Framework from "@/components/mini-card/homepage-card/framework";

const MotionCard = motion.create(Card);
const MotionButton = motion.create(Button);

export default function SuikaiDocumentation() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-8xl mx-auto  bg-primary-foreground"
    >
      {/* 导航栏 */}

      {/* <motion.nav
        className="sticky top-0 bg-primary-foreground/70 backdrop-blur-md z-50"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
      >
        <div className="flex  items-center justify-between h-16">
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Image
              src="/suikai.png"
              alt="Suikai Logo"
              width={40}
              height={40}
              className="rounded-2xl"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-green-500 to-indigo-500 bg-clip-text text-transparent">
              Suikai
            </span>
          </motion.div>

          <div className="lg:hidden"> */}
      {/* <Button variant="ghost" size="icon">
              <MenuIcon className="h-6 w-6" />
            </Button> */}
      {/* </div> */}

      {/* 包裹桌面导航项 */}
      {/* <div className="hidden lg:flex space-x-6">
            {["Overview", "Modules", "Framework", "Try"].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button variant="ghost" asChild>
                  <Link
                    href={`#${item.toLowerCase()}`}
                    className="text-sm font-medium"
                  >
                    {item}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.nav> */}

      {/* 首屏内容 */}
      <HeroSection />
      {/* <section className="py-8 lg:py-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-12 min-h-[60vh] lg:min-h-[80vh]">
        <motion.div
          className="flex-1 space-y-6  lg:px-0"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-snug bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
            Blockchain Intelligence,
            <br />
            <span className="leading-snug bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
              Simplified.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Suikai transforms complex blockchain operations into simple,
            automated workflows. Manage investments, analyze markets, and
            optimize portfolios on SUI with
            <span className="font-semibold text-primary">
              {" "}
              zero technical expertise
            </span>
            .
          </p>
          <motion.div className="flex space-x-4" whileHover={{ scale: 1.02 }}>
            <MotionButton
              asChild
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/agent" className="gap-2 px-8 py-6 text-lg">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
            </MotionButton>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex-1 w-full lg:px-0 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {FEATURE_CARDS.map((card, index) => (
            <MotionCard
              key={index}
              className={`rounded-2xl py-1 group h-full backdrop-blur-lg bg-gradient-to-br ${
                index % 2 === 0
                  ? "from-green-500/10 to-blue-500/10"
                  : "from-cyan-500/10 to-purple-500/10"
              } shadow-xl relative overflow-hidden`}
              whileHover={{
                y: -5,
                transition: { type: "spring", stiffness: 300 },
              }}
            >
              <Link href={card.link} className="block h-full">
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${
                    index % 2 === 0
                      ? "from-green-500/20 to-blue-500/20"
                      : "from-cyan-500/20 to-purple-500/20"
                  } opacity-0 group-hover:opacity-100`}
                  transition={{ duration: 0.3 }}
                />

                <CardHeader className="h-full justify-center pb-10">
                  <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                    <div
                      // className={`p-2 rounded-full ${
                      //   index % 2 === 0 ? "bg-green-500/20" : "bg-cyan-500/20"
                      // } group-hover:bg-opacity-50`}
                    >
                      <card.icon
                        className={`h-6 w-6 md:h-8 md:w-8 ${
                          index % 2 === 0 ? "text-green-500" : "text-cyan-500"
                        } group-hover:${
                          index % 2 === 0 ? "text-green-400" : "text-cyan-400"
                        }`}
                      />
                    </div>
                    <h3 className="font-bold group-hover:text-foreground/90">
                      {card.title}
                    </h3>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground/80 group-hover:text-foreground/90 transition-colors duration-300 pt-1">
                    {card.description}
                  </CardDescription>
                </CardHeader>

                <motion.div
                  className={`absolute bottom-0 left-0 right-0 py-2 px-4 ${
                    index % 2 === 0
                      ? "bg-gradient-to-r from-green-400 to-blue-400"
                      : "bg-gradient-to-r from-cyan-400 to-purple-400"
                  } text-white font-medium text-center opacity-0 group-hover:opacity-100 transform translate-y-full group-hover:translate-y-0`}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-center gap-2 font-bold text-base">
                    <span>Discover</span>
                    <motion.span
                      initial={{ x: 0 }}
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 1.5,
                        ease: "easeInOut",
                      }}
                      className="text-lg"
                    >
                      →
                    </motion.span>
                  </div>
                </motion.div>
              </Link>
            </MotionCard>
          ))}
        </motion.div>
      </section> */}
      <div className="mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        {/* 核心价值模块 */}
        <section id="overview" className="pb-0 pt-16 lg:pb-4">
          <FeatureCards />
          {/* <motion.div
          className="space-y-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-start lg:text-center px-2">
            Why Choose Suikai?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {VALUE_PROPS.map((value, index) => (
              <MotionCard
                key={index}
                className="p-4 lg:p-6 bg-gradient-to-b from-background to-muted/20 border-none shadow-xl"
                initial={{ scale: 0.95 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
              >
                <div className="md:h-12 md:w-12 h-10 w-10 mb-2 md:mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <value.icon className="h-5 w-5 md:h-8 md:w-8 text-primary" />
                </div>
                <h3 className="text-lg md:text-2xl font-semibold mb-1 md:mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">
                  {value.description}
                </p>
              </MotionCard>
            ))}
          </div>
        </motion.div> */}
        </section>

        {/* 抽象模型模块 */}
        <section id="modules" className="py-2 lg:py-10">
          <motion.div
            className="py-20 grid lg:grid-cols-2 gap-16 items-center relative"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {/* Floating gradient background elements */}
            {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl opacity-30" />
    <div className="absolute -right-20 bottom-1/3 w-80 h-80 rounded-full bg-gradient-to-r from-emerald-400/20 to-cyan-500/20 blur-3xl opacity-40" />
  </div> */}

            <div className="space-y-2 relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                True Chain Abstraction
              </h3>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                Suikai solves the blockchain complexity problem through
                three-layer abstraction
              </p>
              <motion.ul className="pt-4 md:space-y-8 space-y-4">
                {ABSTRACTION_ITEMS.map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-6 group"
                    initial={{ x: -20 }}
                    whileInView={{ x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-primary/20 group-hover:to-purple-500/20 transition-all duration-300">
                      <item.icon
                        strokeWidth={1.2}
                        className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2 group-hover:text-primary/90 transition-colors duration-300">
                        {item.title}
                      </h4>
                      <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                        {item.description}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </div>

            <motion.div className="relative h-full rounded-3xl p-8 backdrop-blur-sm bg-gradient-to-br from-background/70 via-background/90 to-background border border-muted/30 shadow-2xl">
              {/* Animated gradient background */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl -z-10">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-cyan-500/5 opacity-70"
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear",
                  }}
                />
              </div>

              {/* Dynamic layer structure */}
              <div className="relative h-full flex flex-col justify-between">
                {/* Contract Abstraction Layer */}
                <motion.div
                  className="p-6 bg-gradient-to-br from-background/80 to-background border border-muted/20 rounded-2xl shadow-lg backdrop-blur-sm hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10">
                      <FileJson className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-semibold">Contract Layer</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Unified Protocol Interfaces
                  </p>
                </motion.div>

                {/* Animated connection arrow */}
                <motion.div
                  className="self-center"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <motion.div
                    animate={{
                      y: [0, 5, 0],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ArrowDownIcon className="h-8 w-8 text-primary/60" />
                  </motion.div>
                </motion.div>

                {/* Intent Alignment Layer */}
                <motion.div
                  className="p-6 bg-gradient-to-br from-background/80 to-background border border-muted/20 rounded-2xl shadow-lg mx-4 backdrop-blur-sm hover:shadow-emerald-400/10 hover:border-emerald-400/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-400/10 to-cyan-500/10">
                      <Wallet className="h-5 w-5 text-emerald-400" />
                    </div>
                    <h4 className="font-semibold">Intent Layer</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Goal-Oriented Translation
                  </p>
                </motion.div>

                {/* Animated connection arrow */}
                <motion.div
                  className="self-center"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <motion.div
                    animate={{
                      y: [0, 5, 0],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  >
                    <ArrowDownIcon className="h-8 w-8 text-emerald-400/60" />
                  </motion.div>
                </motion.div>

                {/* Chain Abstraction Layer */}
                <motion.div
                  className="p-6 bg-gradient-to-br from-background/80 to-background border border-muted/20 rounded-2xl shadow-lg mx-8 backdrop-blur-sm hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/10 to-cyan-500/10">
                      <GlobeIcon className="h-5 w-5 text-purple-500" />
                    </div>
                    <h4 className="font-semibold">Chain Layer</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Multi-Chain Orchestration
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* 技术架构模块 */}
        <section id="framework" className="py-8 lg:py-10">
          <Framework />
      
        </section>

        {/* 最后行动号召 */}
        <section id="try" className="relative py-12 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="relative z-10 text-center space-y-12 rounded-[3rem]"
              initial={{ scale: 0.95 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 50 }}
            >
              {/* Background elements */}
              {/* <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-96 h-96  rounded-full blur-3xl" />
            </div> */}

              <div className="space-y-8">
                <motion.h2
                  className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"
                  initial={{ y: 20 }}
                  whileInView={{ y: 0 }}
                >
                  Your Autonomous Web3 Journey Begins
                </motion.h2>

                <motion.div
                  className="mx-auto max-w-3xl space-y-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                >
                  <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed">
                    Like commanding your first autonomous spacecraft, Suikai
                    equips you with:
                  </p>

                  <div className="flex flex-col items-center text-lg">
                    <div className="flex items-center md:text-base text-sm gap-3 px-6 py-2 bg-background/90 shadow-sm hover:shadow-md rounded-full">
                      <Bot className="h-5 w-5 text-primary" />
                      <span>24/7 AI Strategy Engine</span>
                      {/* <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" /> */}
                    </div>

                    <span className="text-muted-foreground">+</span>

                    <div className="flex items-center md:text-base text-sm gap-3 px-6 py-2 bg-background/90 shadow-sm hover:shadow-md rounded-full">
                      <BlocksIcon className="h-5 w-5 text-primary" />
                      <span>Modular DeFi Components</span>
                    </div>

                    <span className="text-muted-foreground">+</span>

                    <div className="flex items-center md:text-base text-sm gap-3 px-6 py-2 bg-background/90 shadow-sm hover:shadow-md  rounded-full">
                      <Wallet className="h-5 w-5 text-primary" />
                      <span>Self-Optimizing Portfolios</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="flex flex-col sm:flex-row items-center justify-center gap-6"
                  initial={{ scale: 0.9 }}
                  whileInView={{ scale: 1 }}
                >
                  <MotionButton
                    asChild
                    className="h-16 px-12 text-lg rounded-2xl gap-3 bg-foreground/95 transition-transform"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href="/agent">
                      <RocketIcon className="h-5 w-5 text-green-600" />
                      <span className="text-base md:text-lg bg-gradient-to-r from-green-500 to-indigo-500 bg-clip-text text-transparent">
                        Activate AI Pilot
                      </span>
                    </Link>
                  </MotionButton>

                  <MotionButton
                    variant="outline"
                    className="h-16 px-12 text-lg rounded-2xl transition-transform "
                    whileHover={{ scale: 1.05 }}
                  >
                    <Link
                      href="/sui-market"
                      className="flex items-center gap-3"
                    >
                      <LayoutTemplateIcon className="h-5 w-5 text-primary" />
                      <span className="text-base md:text-lg">
                        Market Blueprint
                      </span>
                    </Link>
                  </MotionButton>
                </motion.div>

                {/* User Journey Visualization */}
                <motion.div
                  className="mt-12 grid  grid-cols-1 lg:grid-cols-3 gap-8 text-left"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                >
                  {[
                    {
                      icon: CompassIcon,
                      title: "1. Define Objectives",
                      desc: "Describe your financial vision in natural language",
                    },
                    {
                      icon: CpuIcon,
                      title: "2. AI Configuration",
                      desc: "Automated strategy generation tailored to your goals",
                    },
                    {
                      icon: SwitchCameraIcon,
                      title: "3. Autonomous Execution",
                      desc: "Witness real-time on-chain operations",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="p-6 bg-background/90 rounded-2xl hover:shadow-md shadow-sm transition-colors"
                      whileHover={{ y: -5 }}
                    >
                      <item.icon strokeWidth={1.5} className="h-8 w-8 text-primary mb-4" />
                      <h4 className="text-lg font-semibold mb-2">
                        {item.title}
                      </h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Social Proof */}
              <motion.p
                className="text-sm text-muted-foreground/80 mt-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
              >
                Join thousands of crypto portfolios growing autonomously on
                Suikai, processing millions of weekly on-chain operations
              </motion.p>
            </motion.div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}

// 数据配置
const FEATURE_CARDS = [
  {
    icon: Bot,
    title: "Sekai Agent",
    description: "Autonomous onchain operations framework",
    link: "/agent",
  },
  {
    icon: BlocksIcon,
    title: "Sui Analysis",
    description: "Real-time market insights analytics",
    link: "/sui-market",
  },
  {
    icon: Wallet,
    title: "AI Portfolio",
    description: "Intelligent asset allocation and rebalancing",
    link: "/portfolio",
  },
  {
    icon: MessageCircle,
    title: "AI Assistant",
    description: "Natural language interface for all operations",
    link: "/chat",
  },
];



const ABSTRACTION_ITEMS = [
  {
    icon: FileCode2,
    title: "Contract Abstraction",
    description: "Unified interface for interacting with any SUI protocol",
  },
  {
    icon: Fingerprint,
    title: "Intent Alignment",
    description: "Focus on financial goals instead of transaction details",
  },
  {
    icon: Link2,
    title: "Chain Abstraction",
    description: "Single interface for multi-chain operations (coming soon)",
  },
];

