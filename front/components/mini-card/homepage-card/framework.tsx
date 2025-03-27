import { Card } from "@/components/ui/card";
import {
  BlocksIcon,
  Bot,
  MessageCircle,
  Wallet,
  ArrowRight,
  Cloud,
  FileSpreadsheetIcon,
  WorkflowIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Framework () {
  const FRAMEWORK_FEATURES = [
    {
      icon: Cloud,
      title: "Event-Driven Architecture",
      description: "Real-time response to blockchain events and market signals",
    },
    {
      icon: BlocksIcon,
      title: "Self-Healing Workflows",
      description: "Automatic error recovery and transaction optimization",
    },
    {
      icon: Wallet,
      title: "Gas Optimization",
      description: "Intelligent fee management and batch transactions",
    },
  ];

  const MotionCard = motion.create(Card);
  const MotionButton = motion.create(Button);
  return (
    <motion.div
    className="space-y-12 rounded-3xl px-4 py-8 md:p-8 lg:p-12 shadow-2xl relative overflow-hidden"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
  >
    {/* Background elements that adapt to theme */}
    <div className="absolute inset-0 overflow-hidden -z-10">
      <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full dark:bg-gradient-to-r dark:from-teal-600/20 dark:to-cyan-500/20 bg-gradient-to-r from-teal-100/40 to-cyan-100/40 blur-3xl opacity-40 dark:opacity-30" />
      <div className="absolute -right-20 bottom-1/3 w-80 h-80 rounded-full dark:bg-gradient-to-r dark:from-emerald-400/20 dark:to-green-500/20 bg-gradient-to-r from-emerald-100/40 to-green-100/40 blur-3xl opacity-30 dark:opacity-20" />
      <div className="absolute bottom-0 left-1/2 w-full h-32 dark:bg-gradient-to-t dark:from-cyan-500/10 bg-gradient-to-t from-cyan-50/80 to-transparent" />
    </div>
  
    {/* Container styling with theme adaptation */}
    <div 
      className={cn(
        "absolute inset-0 -z-10",
        "dark:bg-gradient-to-br dark:from-[#14141e]/80 dark:to-[#1e1932]/90",
        "bg-gradient-to-br from-white/95 to-gray-50/95"
      )}
    />
    <div 
      className={cn(
        "absolute inset-0 -z-10 border",
        "dark:border-[rgba(95,255,225,0.2)] border-gray-200/80"
      )}
    />
  
    <div className="text-center space-y-6 relative z-10">
      <h2 className={cn(
        "md:text-3xl text-2xl lg:text-4xl font-bold",
        "dark:bg-gradient-to-r dark:from-teal-400 dark:via-cyan-400 dark:to-cyan-500",
        "bg-gradient-to-r from-teal-600 via-cyan-600 to-cyan-700",
        "bg-clip-text text-transparent"
      )}>
        Sekai Agent Framework
      </h2>
      <p className={cn(
        "md:text-lg text-base lg:text-xl max-w-3xl mx-auto",
        "dark:text-muted-foreground text-gray-600"
      )}>
        Asynchronous event-driven framework executing customizable
        autonomous strategies
      </p>
    </div>
  
    <motion.div
      className="grid lg:grid-cols-2 gap-16 items-center relative z-10"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
    >
      {/* Left Column - Core Capabilities */}
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className={cn(
            "text-2xl font-semibold text-center md:text-start",
            "dark:bg-gradient-to-r dark:from-teal-400 dark:to-cyan-400",
            "bg-gradient-to-r from-teal-600 to-cyan-600",
            "bg-clip-text text-transparent"
          )}>
            Core Capabilities
          </h3>
          <div className="space-y-6">
            {FRAMEWORK_FEATURES.map((feature, index) => (
              <MotionCard
                key={index}
                className={cn(
                  "lg:p-6 p-4 rounded-2xl border transition-all",
                  "border-0",
                //   "dark:border-muted/30 dark:hover:border-cyan-400/50",
                //   "border-gray-200 hover:border-cyan-400/50",
                  "dark:hover:bg-[linear-gradient(90deg,rgba(30,50,50,0.7)_0%,rgba(45,70,70,0.5)_100%)]",
                  "hover:bg-[linear-gradient(90deg,rgba(230,255,255,0.7)_0%,rgba(220,255,255,0.5)_100%)]"
                )}
                whileHover={{ x: 10 }}
                style={{
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}
              >
                <h4 className="text-lg font-medium flex items-center gap-3 mb-1 lg:mb-2">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    "dark:bg-gradient-to-br dark:from-teal-400/10 dark:to-cyan-500/10",
                    "bg-gradient-to-br from-teal-100 to-cyan-100"
                  )}>
                    <feature.icon className={cn(
                      "h-5 w-5",
                      "dark:text-cyan-400 text-cyan-600"
                    )} />
                  </div>
                  <span className="dark:text-white/90 text-gray-800">
                    {feature.title}
                  </span>
                </h4>
                <p className={cn(
                  "text-sm lg:text-base",
                  "dark:text-muted-foreground/80 text-gray-600"
                )}>
                  {feature.description}
                </p>
              </MotionCard>
            ))}
          </div>
        </div>
      </div>
  
      {/* Right Column - Active Agent Panel */}
      <motion.div
        className={cn(
          "relative h-full rounded-2xl p-4 md:p-6 lg:p-8 overflow-hidden",
          "dark:bg-[linear-gradient(145deg,rgba(25,50,50,0.7)_0%,rgba(30,70,70,0.9)_100%)]",
          "bg-[linear-gradient(145deg,rgba(245,255,255,0.9)_0%,rgba(240,255,255,0.95)_100%)]",
          "dark:border-[rgba(95,225,255,0.3)] border-gray-200/90",
          "shadow-lg"
        )}
        initial={{ scale: 0.9 }}
        whileInView={{ scale: 1 }}
      >
        {/* Animated grid pattern - theme adapted */}
        <div className="absolute inset-0 opacity-10 [mask-image:linear-gradient(180deg,white,transparent)]">
          <svg
            className="absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid-pattern"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
                patternTransform="scale(1) rotate(0)"
              >
                <rect width="40" height="40" fill="none" />
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  className="dark:stroke-[rgb(120,255,255)] stroke-cyan-300/50"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
  
        {/* Agent status header */}
        <div className="relative flex items-start gap-4 mb-6">
          <div className={cn(
            "h-12 w-12 rounded-2xl flex items-center justify-center",
            "dark:bg-gradient-to-br dark:from-teal-400/20 dark:to-cyan-500/20",
            "bg-gradient-to-br from-teal-100 to-cyan-100"
          )}>
            <Bot 
            strokeWidth={1.5}
            className={cn(
              "h-6 w-6",
              "dark:text-cyan-400 text-cyan-600"
            )} />
          </div>
          <div>
            <h3 className={cn(
              "text-xl font-semibold",
              "dark:text-white/90 text-gray-800"
            )}>
              Active Agent
            </h3>
            <p className={cn(
              "text-xs mt-0.5 md:text-sm",
              "dark:text-muted-foreground text-gray-500"
            )}>
              Connected to SUI Mainnet
            </p>
          </div>
          <div className="ml-auto flex gap-2 items-center">
            <motion.div 
              className={cn(
                "h-3 w-3 rounded-full",
                "dark:bg-gradient-to-r dark:from-green-400 dark:to-emerald-500",
                "bg-gradient-to-r from-green-400 to-emerald-500"
              )}
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(74, 222, 128, 0.7)', 
                  '0 0 0 10px rgba(74, 222, 128, 0)'
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut'
              }}
            />
            <span className={cn(
              "text-sm",
              "dark:text-green-400/90 text-emerald-600"
            )}>
              Online
            </span>
          </div>
        </div>
  
        {/* Strategy overview */}
        <div className="relative space-y-2 mb-6">
          <h4 className={cn(
            "font-semibold text-lg",
            "dark:text-white/90 text-gray-800"
          )}>
            Active Strategies
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              className={cn(
                "p-3 rounded-2xl border transition-colors",
                "border-0",
                // "dark:border-muted/30 dark:hover:border-emerald-400/50",
                // "border-gray-200 hover:border-emerald-400/50",
                "dark:bg-[linear-gradient(135deg,rgba(20,50,40,0.6)_0%,rgba(30,70,50,0.4)_100%)]",
                "bg-[linear-gradient(135deg,rgba(220,255,240,0.8)_0%,rgba(210,255,230,0.6)_100%)]"
              )}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheetIcon className={cn(
                  "h-4 w-4",
                  "dark:text-emerald-400 text-emerald-600"
                )} />
                <span className={cn(
                  "font-medium text-sm md:text-base",
                  "dark:text-white/90 text-gray-800"
                )}>
                  Portfolio Management
                </span>
              </div>
            </motion.div>
            <motion.div 
              className={cn(
                "p-3 rounded-2xl border transition-colors",
                "border-0",
                // "dark:border-muted/30 dark:hover:border-emerald-400/50",
                // "border-gray-200 hover:border-emerald-400/50",
                "dark:bg-[linear-gradient(135deg,rgba(20,40,50,0.6)_0%,rgba(30,50,70,0.4)_100%)]",
                "bg-[linear-gradient(135deg,rgba(220,240,255,0.8)_0%,rgba(210,230,255,0.6)_100%)]"
              )}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center gap-2">
                <WorkflowIcon className={cn(
                  "h-4 w-4",
                  "dark:text-cyan-400 text-cyan-600"
                )} />
                <span className={cn(
                  "font-medium text-sm md:text-base",
                  "dark:text-white/90 text-gray-800"
                )}>
                  DeFi Automation
                </span>
              </div>
            </motion.div>
          </div>
        </div>
  
        {/* Live operations */}
        <div className="relative space-y-2">
          <h4 className={cn(
            "font-semibold text-lg",
            "dark:text-white/90 text-gray-800"
          )}>
            Live Operations
          </h4>
          <div className="space-y-3">
            <motion.div
              className={cn(
                "p-3 rounded-2xl border flex items-center gap-3",
                "border-0",
               
                // "dark:border-muted/30 border-gray-200",
                "dark:bg-[linear-gradient(90deg,rgba(30,50,70,0.5)_0%,rgba(40,60,90,0.3)_100%)]",
                "bg-[linear-gradient(90deg,rgba(230,255,255,0.8)_0%,rgba(220,255,255,0.6)_100%)]"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className={cn(
                "h-8 w-8 rounded-md flex items-center justify-center",
                "dark:bg-gradient-to-br dark:from-teal-400/20 dark:to-cyan-500/20",
                "bg-gradient-to-br from-teal-100 to-cyan-200"
              )}>
                <Wallet className={cn(
                  "h-4 w-4",
                  "dark:text-cyan-400 text-cyan-600"
                )} />
              </div>
              <div>
                <p className={cn(
                  "text-sm font-medium",
                  "dark:text-white/90 text-gray-800"
                )}>
                  Executing DCA Strategy
                </p>
                <p className={cn(
                  "text-xs",
                  "dark:text-muted-foreground text-gray-500"
                )}>
                  Periodic asset accumulation
                </p>
              </div>
            </motion.div>
          </div>
        </div>
  
        {/* Risk management */}
        <div className={cn(
          "relative mt-6 pt-6 border-t",
          "dark:border-muted/30 border-gray-200/80"
        )}>
          <h4 className={cn(
            "font-semibold text-lg mb-4",
            "dark:text-white/90 text-gray-800"
          )}>
            Risk Management
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <motion.div 
              className={cn(
                "p-3 rounded-2xl border transition-colors",
                "border-0",
                // "dark:border-muted/30 dark:hover:border-amber-400/50",
                // "border-gray-200 hover:border-amber-400/50",
                "dark:bg-[linear-gradient(135deg,rgba(50,40,30,0.6)_0%,rgba(70,60,40,0.4)_100%)]",
                "bg-[linear-gradient(135deg,rgba(255,245,230,0.8)_0%,rgba(255,240,220,0.6)_100%)]"
              )}
              whileHover={{ scale: 1.02 }}
            >
              <p className={cn(
                "text-sm",
                "dark:text-amber-400/80 text-amber-600"
              )}>
                Slippage Control
              </p>
              <div className={cn(
                "text-sm font-medium mt-1",
                "dark:text-white/90 text-gray-800"
              )}>
                Auto-adjusted
              </div>
            </motion.div>
            <motion.div 
              className={cn(
                "p-3 rounded-2xl border transition-colors",
                "border-0",
                // "dark:border-muted/30 dark:hover:border-emerald-400/50",
                // "border-gray-200 hover:border-emerald-400/50",
                "dark:bg-[linear-gradient(135deg,rgba(20,50,40,0.6)_0%,rgba(30,70,50,0.4)_100%)]",
                "bg-[linear-gradient(135deg,rgba(220,255,240,0.8)_0%,rgba(210,255,230,0.6)_100%)]"
              )}
              whileHover={{ scale: 1.02 }}
            >
              <p className={cn(
                "text-sm",
                "dark:text-emerald-400/80 text-emerald-600"
              )}>
                Gas Optimization
              </p>
              <div className={cn(
                "text-sm font-medium mt-1",
                "dark:text-white/90 text-gray-800"
              )}>
                Dynamic Pricing
              </div>
            </motion.div>
            <motion.div 
              className={cn(
                "p-3 rounded-2xl border transition-colors",
                "border-0",
                // "dark:border-muted/30 dark:hover:border-red-400/50",
                // "border-gray-200 hover:border-red-400/50",
                "dark:bg-[linear-gradient(135deg,rgba(50,20,20,0.6)_0%,rgba(70,30,30,0.4)_100%)]",
                "bg-[linear-gradient(135deg,rgba(255,230,230,0.8)_0%,rgba(255,220,220,0.6)_100%)]"
              )}
              whileHover={{ scale: 1.02 }}
            >
              <p className={cn(
                "text-sm",
                "dark:text-red-400/80 text-red-600"
              )}>
                Circuit Breakers
              </p>
              <div className={cn(
                "text-sm font-medium mt-1",
                "dark:text-white/90 text-gray-800"
              )}>
                2 Active
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </motion.div>
  
  
  
  );
};

