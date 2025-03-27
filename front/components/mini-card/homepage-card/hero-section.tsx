"use client";
import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BlocksIcon, Bot, MessageCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTheme } from "next-themes";


const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#fb923c"];
const COLORS_TOP_LIGHT = ["#d1fae5", "#93c5fd", "#e9d5ff", "#e9d5ff"]

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
const MotionCard = motion.create(Card);
const MotionButton = motion.create(Button);

export default function HeroSection() {
    const { resolvedTheme } = useTheme();
    const isLightTheme = resolvedTheme === "light";

    
  return (
    <div className="relative min-h-[80dvh] flex flex-col">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 relative"
      >
        {/* Animated Background Section */}
        <motion.section
          animate={{
            "--color": isLightTheme ? COLORS_TOP_LIGHT : COLORS_TOP,
          }}
          transition={{
            duration: 12,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
          style={{
            backgroundImage: isLightTheme 
              ? "radial-gradient(125% 125% at 50% 0%, #f8fafc 50%, var(--color))"
              : "radial-gradient(125% 125% at 50% 0%, #020617 50%, var(--color))",
          }}
          className="absolute inset-0 overflow-hidden rounded-b-2xl"
        >
          <div className="absolute inset-0 z-0">
            <Canvas>
              <Stars radius={50} count={2000} factor={4} fade speed={2} />
            </Canvas>
          </div>
        </motion.section>
        {/* Navigation */}
        <motion.nav
          className="sticky top-0 backdrop-blur-md z-50 border-0"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          <div className="max-w-8xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
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
              <div className="hidden lg:flex space-x-6">
                {["Overview", "Modules", "Framework", "Try"].map(
                  (item, index) => (
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
                  )
                )}
              </div>
            </div>
          </div>
        </motion.nav>
        {/* Main Content */}
        <section className="flex-1 relative z-10 grid place-content-center max-w-7xl mx-auto">
          <div className=" mx-auto px-4 md:px-6 lg:px-8 py-8 lg:py-10">
            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12 min-h-[60vh] lg:min-h-[70vh]">
              {/* Text Content */}
              <motion.div
                className="flex-1 space-y-6 lg:px-0"
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
                <motion.div
                  className="flex space-x-4"
                  whileHover={{ scale: 1.02 }}
                >
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
              {/* Cards Grid */}
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
                          <card.icon
                            className={`h-6 w-6 md:h-8 md:w-8 ${
                              index % 2 === 0
                                ? "text-green-500"
                                : "text-cyan-500"
                            } group-hover:${
                              index % 2 === 0
                                ? "text-green-400"
                                : "text-cyan-400"
                            }`}
                          />
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
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
